const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db.js');
const votersEmbed = require('../embeds/voters.js');

module.exports = {
    customId: 'session_vote_count',
    async execute(interaction) {
        const voteMessageId = interaction.message.id;

        let votes = await db.get(`session.votes.${voteMessageId}`) || [];

        const voterMentions = votes.length > 0 
            ? votes.map(id => `<@${id}>`).join('\n')
            : '*No votes yet.*';

        const votersEmbedMessage = votersEmbed(voterMentions);
        await interaction.reply({ embeds: [votersEmbedMessage], ephemeral: true });
    },
};