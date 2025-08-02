const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Manage tickets')
        .addSubcommand(sub =>
            sub.setName('close')
                .setDescription('Close the current ticket')
        )
        .addSubcommand(sub =>
            sub.setName('rename')
                .setDescription('Rename the current ticket')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The new name for the ticket.')
                        .setRequired(true)
                )
        ),
    
    async execute(interaction) {
        const { guild, channel } = interaction;

        const baseRole = guild.roles.cache.get(process.env.IA_BASE);
        if (!baseRole) return interaction.reply({ content: '❌ IA_BASE role not found in server.', ephemeral: true });

        const invokerMember = await interaction.guild.members.fetch(interaction.user.id);
        const hasPermission = invokerMember.roles.cache.some(role => role.position >= requiredRole.position);

        if (!hasPermission) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }

        const ticketData = await db.get(`ticket_channel_${channel.id}`);
        if (!ticketData) {
            return interaction.reply({ content: '❌ This channel is not a ticket.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'close') {
            await interaction.reply({ content: '✅ This ticket will be closed in 5 seconds...', ephemeral: true });

            await db.delete(`ticket_channel_${channel.id}`);
            await db.delete(`ticket_${ticketData.userId}_${ticketData.category}`);

            setTimeout(() => channel.delete().catch(() => {}), 5000);
        }

        if (subcommand === 'rename') {
            const newName = interaction.options.getString('name').toLowerCase().replace(/\s+/g, '-');
            await channel.setName(`ticket-${newName}`);

            await interaction.reply({ content: `✅ Ticket renamed to <#${channel.id}>.`, ephemeral: true });
        }
    }
};