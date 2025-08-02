const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempsuspend')
        .setDescription('Temporarily suspend a staff member')
        .addUserOption(option =>
            option.setName('staff')
                .setDescription('The staff member to temporarily suspend')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Suspension duration in days')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the suspension')
                .setRequired(true)),

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

        const staffMember = interaction.options.getUser('staff');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(staffMember.id).catch(() => null);
        if (!member) {
            return interaction.editReply({ content: '⚠️ Could not find that staff member in this server.', ephemeral: true });
        }

        const channel = await interaction.client.channels.fetch(process.env.INFRACTION_CHANNEL).catch(() => null);
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.editReply({ content: '⚠️ The infraction channel is not configured correctly.', ephemeral: true });
        }

        const suspensionRole = interaction.guild.roles.cache.get(process.env.SUSPENSION_ROLE);
        const baseRole = interaction.guild.roles.cache.get(process.env.SUSPENSION_BASE);

        if (!suspensionRole || !baseRole) {
            return interaction.editReply({ content: '⚠️ Suspension roles are not configured correctly.', ephemeral: true });
        }

        const rolesToRemove = member.roles.cache.filter(r => r.position > baseRole.position && r.id !== suspensionRole.id);
        const roleIds = rolesToRemove.map(r => r.id);

        for (const [id] of rolesToRemove) await member.roles.remove(id).catch(() => null);
        await member.roles.add(suspensionRole).catch(() => null);

        const expiresAt = Date.now() + duration * 24 * 60 * 60 * 1000;
        await db.set(`tempsuspensions.${staffMember.id}`, {
            userId: staffMember.id,
            roles: roleIds,
            issuedAt: Date.now(),
            expiresAt,
            reason,
        });

        const embedData = infractionEmbed(interaction, staffMember, "Temporary Suspension", reason);
        await channel.send(embedData);

        await interaction.editReply({
            content: `⚠️ Temporarily suspended <@${staffMember.id}> for ${duration} days.`,
            ephemeral: true,
        });
    },
};