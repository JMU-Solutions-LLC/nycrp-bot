const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const promoteEmbed = require('../embeds/promote.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promote a staff member')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to promote').setRequired(true))
        .addRoleOption(option =>
            option.setName('rank').setDescription('The new rank to assign').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('The reason for the promotion').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const requiredRole = interaction.guild.roles.cache.get(process.env.IA_BASE);

        if (!requiredRole) {
            console.warn(`⚠️ Role with ID ${process.env.IA_BASE} not found in guild ${interaction.guild.name}.`);
            return false;
        }

        const hasRoleOrHigher = member.roles.cache.some(role => role.position >= requiredRole.position);

        if (!hasRoleOrHigher) {
            await interaction.editReply({
                content: `⚠️ You need the <@&${requiredRole.id}> role or higher to use this command.`,
                ephemeral: true,
            });
            return false;
        }

        const promotedUser = interaction.options.getUser('user');
        const newRankRole = interaction.options.getRole('rank');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(promotedUser.id).catch(() => null);
        if (!member) {
            return interaction.editReply({ content: '⚠️ Could not find that member in the server.', ephemeral: true });
        }

        try {
            await member.roles.add(newRankRole);
        } catch (err) {
            console.error(err);
            return interaction.editReply({ content: '❌ Failed to assign the rank. Check my role hierarchy & permissions.', ephemeral: true });
        }

        const channel = interaction.client.channels.cache.get(process.env.PROMOTE_CHANNEL);
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.editReply({ content: '⚠️ The promotion channel is not configured correctly.', ephemeral: true });
        }

        const embedData = promoteEmbed(interaction, promotedUser, newRankRole.name, reason);
        await channel.send(embedData);

        await interaction.editReply({ content: `✅ Promoted <@${promotedUser.id}> to <@&${newRankRole.id}> successfully!`, ephemeral: true });
    }
};