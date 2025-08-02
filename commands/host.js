const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const trainingEmbed = require('../embeds/training.js');
const db = require('../utils/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('host')
        .setDescription('Host-related commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(sub =>
            sub.setName('training')
                .setDescription('Host a Trial Moderator training session.')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'training') {
            const channel = await interaction.client.channels.fetch(process.env.TRIAL_MOD_TRAIN_CHANNEL).catch(() => null);
            if (!channel || channel.type !== ChannelType.GuildText) {
                return interaction.reply({ content: '⚠️ Training channel not found or invalid.', ephemeral: true });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('training_attend')
                    .setLabel('Attend')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('training_view')
                    .setLabel('View Attendees')
                    .setStyle(ButtonStyle.Secondary)
            );

            const sentMsg = await channel.send({
                content: `<@&${process.env.TRIAL_MOD_ROLE_ID}>`,
                embeds: [trainingEmbed()],
                components: [row]
            });

            await db.set(`training.${sentMsg.id}`, { attendees: [] });

            await interaction.reply({ content: `✅ Training hosted in <#${channel.id}>.`, ephemeral: true });
        }
    }
};