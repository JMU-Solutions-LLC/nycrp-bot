const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const assistanceEmbed = require('../embeds/assistance.js');
const db = require('../utils/db.js');

module.exports = async (client) => {
    const ticketChannel = await client.channels.fetch(process.env.TICKET_CHANNEL);

    if (!ticketChannel) return console.error('❌ TICKET_CHANNEL not found.');

    let ticketMessageId = await db.get('ticketMessageId');
    let ticketMessage;

    try {
        if (ticketMessageId) {
            ticketMessage = await ticketChannel.messages.fetch(ticketMessageId);
        }
    } catch {
        ticketMessage = null;
    }

    if (!ticketMessage) {
        const sentMessage = await ticketChannel.send({
            embeds: assistanceEmbed(),
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ticket_select')
                        .setPlaceholder('🎫 Open a ticket...')
                        .addOptions([
                            { label: 'General Support', value: 'general', description: 'Ask general questions about rules, applying, etc.' },
                            { label: 'Internal Affairs', value: 'internal', description: 'Report staff or staff-related matters.' },
                            { label: 'Partnership Inquiries', value: 'partnership', description: 'Request or inquire about partnerships.' }
                        ])
                )
            ]
        });

        ticketMessageId = sentMessage.id;
        await db.set('ticketMessageId', ticketMessageId);
    }

    setInterval(async () => {
        try {
            await ticketChannel.messages.fetch(ticketMessageId);
        } catch {
            const newMessage = await ticketChannel.send({
                embeds: assistanceEmbed(),
                components: [
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('ticket_select')
                            .setPlaceholder('🎫 Open a ticket...')
                            .addOptions([
                                { label: 'General Support', value: 'general', description: 'Ask general questions about rules, applying, etc.' },
                                { label: 'Internal Affairs', value: 'internal', description: 'Report staff or staff-related matters.' },
                                { label: 'Partnership Inquiries', value: 'partnership', description: 'Request or inquire about partnerships.' }
                            ])
                    )
                ]
            });
            await db.set('ticketMessageId', newMessage.id);
        }
    }, 30_000);
};