const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ticketEmbed = require('../embeds/ticket.js');
const db = require('../utils/db.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_select') return;

        const { guild, user, values } = interaction;
        const choice = values[0];

        const categoryMap = {
            general: { name: 'General Support', id: process.env.GENERAL_CATEGORY },
            internal: { name: 'Internal Affairs', id: process.env.IA_CATEGORY },
            partnership: { name: 'Partnership Inquiries', id: process.env.PARTNERSHIP_CATEGORY }
        };

        const selectedCategory = categoryMap[choice];
        if (!selectedCategory) 
            return interaction.reply({ content: '❌ Invalid category.', ephemeral: true });

        const existingTicket = await db.get(`ticket_${user.id}_${choice}`);
        if (existingTicket) {
            const existingChannel = guild.channels.cache.get(existingTicket.channelId);
            if (existingChannel) {
                return interaction.reply({ 
                    content: `❌ You already have a ticket in ${selectedCategory.name}: <#${existingChannel.id}>.`, 
                    ephemeral: true 
                });
            } else {
                await db.delete(`ticket_${user.id}_${choice}`);
            }
        }

        const baseRole = guild.roles.cache.get(process.env.IA_BASE);
        if (!baseRole) return interaction.reply({ content: '❌ IA_BASE role not found.', ephemeral: true });

        const allowedRoles = guild.roles.cache
            .filter(role => role.position >= baseRole.position)
            .map(role => ({
                id: role.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
            }));

        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            parent: selectedCategory.id,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...allowedRoles
            ]
        });

        await db.set(`ticket_${user.id}_${choice}`, { 
            channelId: ticketChannel.id, 
            userId: user.id, 
            category: choice 
        });
        await db.set(`ticket_channel_${ticketChannel.id}`, { 
            channelId: ticketChannel.id, 
            userId: user.id, 
            category: choice 
        });

        await ticketChannel.send({ 
            content: `<@${user.id}> @here`, 
            embeds: ticketEmbed(),
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close-ticket')
                        .setLabel('Close')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('claim-ticket')
                        .setLabel('Claim')
                        .setStyle(ButtonStyle.Success)
                )
            ]
        });
        
        await interaction.reply({ content: `✅ Ticket created in **${selectedCategory.name}**: ${ticketChannel}`, ephemeral: true });
    }
};