const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const infractionEmbed = require('../embeds/infract.js');
const db = require('../utils/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infract')
        .setDescription('Issue an infraction to a staff member')
        .addUserOption(option =>
            option.setName('staff')
                .setDescription('The staff member receiving the infraction')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('punishment')
                .setDescription('Select the punishment')
                .setRequired(true)
                .addChoices(
                    { name: 'Inactivity Notice', value: 'Inactivity' },
                    { name: 'Warning', value: 'Warning' },
                    { name: 'Strike', value: 'Strike' },
                    { name: 'Suspension', value: 'Suspension' }
                ))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the infraction')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const requiredRole = interaction.guild.roles.cache.get(process.env.IA_BASE);

        if (!requiredRole) {
            console.warn(`⚠️ Role with ID ${process.env.IA_BASE} not found in guild ${interaction.guild.name}.`);
            return false;
        }

        const invokerMember = await interaction.guild.members.fetch(interaction.user.id);
        const hasRoleOrHigher = invokerMember.roles.cache.some(role => role.position >= requiredRole.position);

        if (!hasRoleOrHigher) {
            await interaction.editReply({
                content: `⚠️ You need the <@&${requiredRole.id}> role or higher to use this command.`,
                ephemeral: true,
            });
            return false;
        }

        const staffMember = interaction.options.getUser('staff');
        let punishment = interaction.options.getString('punishment');
        const reason = interaction.options.getString('reason');
        const member = await interaction.guild.members.fetch(staffMember.id).catch(() => null);

        if (!member) {
            return interaction.editReply({ content: '⚠️ Could not find that staff member in this server.', ephemeral: true });
        }

        const channel = await interaction.client.channels.fetch(process.env.INFRACTION_CHANNEL).catch(() => null);
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.editReply({ content: '⚠️ The infraction channel is not configured correctly.', ephemeral: true });
        }

        let infractions = await db.get(`infractions.${staffMember.id}`) || [];
        const activeInfractions = infractions.filter(i => !i.expiresAt || i.expiresAt > Date.now());

        let roleId = null;
        let expiresAt = null;

        if (punishment === 'Warning') {
            const warnings = activeInfractions.filter(i => i.punishment === 'Warning').length;
            if (warnings >= 2) {
                punishment = 'Strike';
            }
        }

        if (punishment === 'Strike') {
            const strikes = activeInfractions.filter(i => i.punishment === 'Strike').length;
            if (strikes >= 2) {
                punishment = 'Suspension';
            }
        }

        if (punishment === 'Inactivity') {
            roleId = process.env.INACTIVITY_NOTICE_ROLE;
            expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        }
        else if (punishment === 'Warning') {
            const warnings = activeInfractions.filter(i => i.punishment === 'Warning').length;
            roleId = warnings === 0 ? process.env.WARNING_1_ROLE : process.env.WARNING_2_ROLE;
            expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        }
        else if (punishment === 'Strike') {
            const strikes = activeInfractions.filter(i => i.punishment === 'Strike').length;
            roleId = strikes === 0 ? process.env.STRIKE_1_ROLE : process.env.STRIKE_2_ROLE;
            expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        }
        else if (punishment === 'Suspension') {
            roleId = process.env.SUSPENSION_ROLE;
            expiresAt = null;

            const baseRole = interaction.guild.roles.cache.get(process.env.SUSPENSION_BASE);
            const rolesToRemove = member.roles.cache.filter(r => baseRole && r.position > baseRole.position);
            for (const [id] of rolesToRemove) {
                await member.roles.remove(id).catch(() => null);
            }
        }

        if (roleId) {
            const role = interaction.guild.roles.cache.get(roleId);
            if (role) await member.roles.add(role).catch(() => null);
        }

        infractions.push({
            userId: staffMember.id,
            punishment,
            roleId,
            reason,
            issuedAt: Date.now(),
            expiresAt,
        });

        await db.set(`infractions.${staffMember.id}`, infractions);

        const embedData = infractionEmbed(interaction, staffMember, punishment, reason);
        await channel.send(embedData);

        await interaction.editReply({ content: `⚠️ ${punishment} issued to ${staffMember.tag}.`, ephemeral: true });
    }
};