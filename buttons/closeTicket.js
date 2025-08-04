const db = require('../utils/db.js');
const discordTranscripts = require('discord-html-transcripts');
const ticketClosedEmbed = require('../embeds/ticketClosed.js');
const path = require('path');
const fs = require('fs');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

        const transcriptHTML = await discordTranscripts.createTranscript(channel, {
            saveImages: true,
            returnType: 'string'
        });

        const transcriptsDir = path.join(__dirname, '../transcripts');
        if (!fs.existsSync(transcriptsDir)) {
            fs.mkdirSync(transcriptsDir, { recursive: true });
        }

        const fileName = `ticket-${ticketData.userId}-${Date.now()}.html`;
        const filePath = path.join(transcriptsDir, fileName);
        fs.writeFileSync(filePath, transcriptHTML, 'utf-8');

        const transcriptURL = `${process.env.BASE_URL}/${fileName}`;
        const embed = ticketClosedEmbed(interaction, ticketData);

        const transcriptChannel = interaction.guild.channels.cache.get(process.env.TRANSCRIPT_CHANNEL);
        if (!transcriptChannel) {
            return interaction.followUp({ content: '⚠️ Transcript channel not found. Please check your configuration.', ephemeral: true });
        }

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('View Transcript')
                .setStyle(ButtonStyle.Link)
                .setURL(transcriptURL)
        );

        await transcriptChannel.send({
            embeds: [embed],
            components: [button],
        });

        await db.delete(`ticket_channel_${channel.id}`);
        await db.delete(`ticket_${ticketData.userId}_${ticketData.category}`);

        setTimeout(() => {
            channel.delete().catch(() => null);
        }, 5000);
    },
};