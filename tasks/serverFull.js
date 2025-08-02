const serverFullEmbed = require('../embeds/full.js');

module.exports = async (client) => {
    try {
        const channel = await client.channels.fetch(process.env.SESSION_CHANNEL).catch(() => null);
        if (!channel) {
            console.warn('⚠️ SESSION_CHANNEL not found or invalid.');
            return;
        }

        await channel.send({
            embeds: [serverFullEmbed({ client })]
        });
    } catch (error) {
        console.error('❌ Failed to send Server Full embed:', error.message);
    }
};