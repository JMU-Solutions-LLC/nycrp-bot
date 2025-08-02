const db = require('../utils/db.js');

module.exports = {
    customId: 'close-ticket',
    async execute(interaction) {
        const iaBaseRole = interaction.guild.roles.cache.get(process.env.IA_BASE);
        if (!iaBaseRole) {
            return interaction.reply({ content: '⚠️ IA_BASE role not found. Please check your configuration.', ephemeral: true });
        }

        const member = interaction.member;

        if (!member.roles.cache.some(r => r.position >= iaBaseRole.position)) {
            return interaction.reply({ content: '❌ You do not have permission to use this button.', ephemeral: true });
        }

        const channel = interaction.channel;

        const ticketData = await db.get(`ticket_channel_${channel.id}`);
        if (!ticketData) {
            return interaction.reply({ content: '❌ This channel is not a ticket.', ephemeral: true });
        }

        await interaction.reply({
            content: "✅ This ticket will be closed in 5 seconds...",
        });

        await db.delete(`ticket_channel_${channel.id}`);
        await db.delete(`ticket_${ticketData.userId}_${ticketData.category}`);

        setTimeout(() => {
            channel.delete().catch(() => null);
        }, 5000);
    },
};