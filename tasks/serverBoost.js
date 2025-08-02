const serverBoostEmbed = require('../embeds/boost.js');

module.exports = async (client) => {
    try {
        const channel = await client.channels.fetch(process.env.SESSION_CHANNEL).catch(() => null);
        if (!channel) {
            console.warn('⚠️ SESSION_CHANNEL not found or invalid.');
            return;
        }

        await channel.send({
            content: `@here <@&${process.env.SESSION_ROLE}>`,
            embeds: [serverBoostEmbed({ client })]
        });
    } catch (error) {
        console.error('❌ Failed to send Server Boost embed:', error.message);
    }
};