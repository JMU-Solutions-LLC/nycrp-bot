const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db.js');
const startEmbed = require('../embeds/start.js');
const erlc = require('../utils/erlcHandler.js');

module.exports = {
    customId: 'session_vote',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const voteMessageId = interaction.message.id;
        let votes = await db.get(`session.votes.${voteMessageId}`) || [];
        const threshold = await db.get(`session.threshold.${voteMessageId}`);

        let actionMessage = '';
        if (votes.includes(userId)) {
            votes = votes.filter(id => id !== userId);
            actionMessage = '❌ Your vote has been removed.';
        } else {
            votes.push(userId);
            actionMessage = '✅ Your vote has been recorded. You will be pinged if the session starts!';
        }

        await db.set(`session.votes.${voteMessageId}`, votes);

        const originalRow = interaction.message.components[0];
        const updatedRow = new ActionRowBuilder();

        originalRow.components.forEach(button => {
            if (button.customId === 'session_vote_count') {
                updatedRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(button.customId)
                        .setLabel(`Votes: ${votes.length}/${threshold}`)
                        .setStyle(ButtonStyle.Secondary)
                );
            } else {
                updatedRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(button.customId)
                        .setLabel(button.label)
                        .setStyle(button.style)
                        .setDisabled(button.disabled)
                );
            }
        });

        await interaction.message.edit({
            content: interaction.message.content,
            embeds: interaction.message.embeds,
            components: [updatedRow],
        });

        await interaction.editReply({ content: actionMessage });

        if (votes.length >= threshold) {
            const sessionChannel = interaction.channel;
            await interaction.message.delete().catch(() => null);

            const { Name, OwnerId, JoinKey } = await erlc.request('/v1/server');
            let OwnerUsername;

            try {
                const response = await axios.get(`https://users.roblox.com/v1/users/${OwnerId}`);
                OwnerUsername = response.data.name;
            } catch (err) {
                console.warn(`⚠️ Failed to fetch Roblox username for ID ${OwnerId}:`, err.message);
            }

            const pingContent = `@here <@&${process.env.SESSION_ROLE}> | ${votes.map(id => `<@${id}>`).join(', ')}`;
            const embedToSend = startEmbed(interaction, Name, OwnerUsername, JoinKey);
            await sessionChannel.send({ content: pingContent, embeds: [embedToSend] });

            await db.delete(`session.votes.${voteMessageId}`);
        }
    },
};