const serverBoostEmbed = require('../embeds/boost.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const erlc = require('../utils/erlcHandler.js');

module.exports = async (client) => {
    try {
        const channel = await client.channels.fetch(process.env.SESSION_CHANNEL).catch(() => null);
        if (!channel) {
            console.warn('⚠️ SESSION_CHANNEL not found or invalid.');
            return;
        }

        const { JoinKey } = await erlc.request('/v1/server');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Join')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://policeroleplay.community/join/${JoinKey}`)
        );

        await channel.send({
            content: `@here <@&${process.env.SESSION_ROLE}>`,
            embeds: [serverBoostEmbed({ client })],
            components: [row]
        });
    } catch (error) {
        console.error('❌ Failed to send Server Boost embed:', error.message);
    }
};