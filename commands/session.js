const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const voteEmbed = require('../embeds/vote.js');
const startEmbed = require('../embeds/start.js');
const fullEmbed = require('../embeds/full.js');
const shutdownEmbed = require('../embeds/shutdown.js');
const boostEmbed = require('../embeds/boost.js');
const db = require('../utils/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('session')
        .setDescription('Manage session announcements')
        .addSubcommand(cmd =>
            cmd.setName('vote')
                .setDescription('Send a voting embed')
                .addIntegerOption(option =>
                    option.setName('votes')
                        .setDescription('Number of votes required to start the session automatically')
                        .setRequired(true)
                )
        )
        .addSubcommand(cmd => cmd.setName('start').setDescription('Send a session start embed'))
        .addSubcommand(cmd => cmd.setName('full').setDescription('Send a session full embed'))
        .addSubcommand(cmd => cmd.setName('shutdown').setDescription('Send a session shutdown embed'))
        .addSubcommand(cmd => cmd.setName('boost').setDescription('Send a session boost embed')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const requiredRole = interaction.guild.roles.cache.get(process.env.SESSION_ROLE);
        if (!requiredRole) {
            return interaction.editReply({ content: '⚠️ The required session role is not configured.' });
        }

        const invokerMember = await interaction.guild.members.fetch(interaction.user.id);
        const hasRoleOrHigher = invokerMember.roles.cache.some(role => role.position >= requiredRole.position);

        if (!hasRoleOrHigher) {
            return interaction.reply({ content: `⚠️ You need the <@&${requiredRole.id}> role or higher to use this command.`, ephemeral: true });
        }

        const sessionChannel = interaction.client.channels.cache.get(process.env.SESSION_CHANNEL);
        if (!sessionChannel || sessionChannel.type !== ChannelType.GuildText) {
            return interaction.editReply({ content: '⚠️ The session channel is not configured correctly.' });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'start') {
            const voteMessageId = await db.get('session.voteMessageId');
            let votes = [];
            if (voteMessageId) {
                votes = await db.get(`session.votes.${voteMessageId}`) || [];
            }

            let pingContent = `@here <@&${process.env.SESSION_ROLE}>`;
            if (votes.length > 0) {
                const votedUsers = votes.map(id => `<@${id}>`);
                pingContent = `@here <@&${process.env.SESSION_ROLE}> | ${votedUsers.join(', ')}`;
            }

            await db.delete(`session.votes.${voteMessageId}`);
            await db.delete('session.voteMessageId');

            const startMsg = startEmbed(interaction, votes.length);
            await sessionChannel.send({ 
                content: pingContent,
                embeds: [startMsg],
                components: [
                    new ButtonBuilder()
                        .setLabel('Join')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://policeroleplay.community/join/NYCND')
                ]
            });

            await db.set('status.boostReady', false);

            return interaction.editReply({ content: `✅ Session started. Please check <#${sessionChannel.id}> for details.` });
        }

        if (subcommand === 'shutdown') {
            const statusMessageId = await db.get('status.statusMessageId');

            const messages = await sessionChannel.messages.fetch({ limit: 100 });

            const deletableMessages = messages.filter(msg => msg.id !== statusMessageId);

            const bulkDeletable = deletableMessages.filter(msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
            if (bulkDeletable.size > 0) {
                await sessionChannel.bulkDelete(bulkDeletable, true).catch(() => null);
            }

            const olderMessages = deletableMessages.filter(msg => !bulkDeletable.has(msg.id));
            if (olderMessages.size > 0) {
                await Promise.all(olderMessages.map(msg => msg.delete().catch(() => null)));
            }

            const shutdownMsg = shutdownEmbed(interaction);
            await sessionChannel.send({ embeds: [shutdownMsg] });

            await db.set('status.boostReady', false);

            return interaction.editReply({ content: `✅ Session shutdown.` });
        }

        const embeds = {
            vote: () => voteEmbed(interaction),
            full: () => fullEmbed(interaction),
            boost: () => boostEmbed(interaction),
        };

        const embedToSend = embeds[subcommand]?.();
        if (!embedToSend) {
            return interaction.editReply({ content: `⚠️ The ${subcommand} embed is not implemented yet.` });
        }

        let messageContent = subcommand === 'vote' ? `@here <@&${process.env.SESSION_ROLE}>` : '';

        if (subcommand === 'vote') {
            const customThreshold = interaction.options.getInteger('votes') || parseInt(process.env.VOTE_THRESHOLD, 10);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('session_vote')
                    .setLabel('✅ Vote to Join')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('session_vote_count')
                    .setLabel(`Votes: 0/${customThreshold}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

            const sentMsg = await sessionChannel.send({
                content: messageContent || null,
                embeds: [embedToSend],
                components: [row],
            });

            await db.set(`session.votes.${sentMsg.id}`, []);
            await db.set(`session.threshold.${sentMsg.id}`, customThreshold);
            await db.set('session.voteMessageId', sentMsg.id);
        } else if (subcommand === 'boost') {
            await sessionChannel.send({
                content: messageContent || null,
                embeds: [embedToSend],
                components: [
                    new ButtonBuilder()
                        .setLabel('Join')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://policeroleplay.community/join/NYCND')
                ]
            });
        } else {
            await sessionChannel.send({ content: messageContent || null, embeds: [embedToSend] });
        }

        await interaction.editReply({ content: `✅ Sent the ${subcommand} embed to ${sessionChannel}.` });
    }
};