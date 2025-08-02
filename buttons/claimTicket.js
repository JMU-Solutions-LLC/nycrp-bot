const { PermissionsBitField } = require('discord.js');
const db = require('../utils/db.js');

module.exports = {
    customId: 'claim-ticket',
    async execute(interaction) {
        const iaBaseRole = interaction.guild.roles.cache.get(process.env.IA_BASE);
        if (!iaBaseRole) {
            return interaction.reply({ content: '⚠️ IA_BASE role not found. Please check your configuration.', ephemeral: true });
        }

        const member = interaction.member;

        if (!member.roles.cache.some(r => r.position >= iaBaseRole.position)) {
            return interaction.reply({ content: '❌ You do not have permission to claim this ticket.', ephemeral: true });
        }

        const channel = interaction.channel;

        const ticketData = await db.get(`ticket_channel_${channel.id}`);
        if (!ticketData || !ticketData.userId) {
            return interaction.reply({ content: '⚠️ Could not find ticket owner in the database.', ephemeral: true });
        }

        const openerId = ticketData.userId;

        const permissions = [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
            {
                id: openerId,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
            {
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
        ];

        interaction.guild.roles.cache
            .filter(r => r.position >= iaBaseRole.position)
            .forEach(role => {
                permissions.push({
                    id: role.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                    deny: [PermissionsBitField.Flags.SendMessages],
                });
            });

        await channel.permissionOverwrites.set(permissions);

        await interaction.reply({
            content: `✅ Ticket claimed by <@${member.id}>.\n- Opener: <@${openerId}>\n- Staff: <@${member.id}>`,
        });

        await db.set(`ticket_channel_${channel.id}`, { ...ticketData, claimedBy: member.id });
    },
};