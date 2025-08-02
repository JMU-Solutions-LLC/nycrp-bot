const erlc = require('../utils/erlcHandler.js');

module.exports = (client) => {
    const fetchPlayerCount = async () => {
        try {
            const vcChannel = await client.channels.fetch(process.env.PLAYER_COUNT_VC).catch(() => null);
            if (!vcChannel) {
                console.warn('⚠️ PLAYER_COUNT_VC not found or invalid.');
                return scheduleNextFetch();
            }

            const { CurrentPlayers, MaxPlayers } = await erlc.request('/v1/server');

            await vcChannel.setName(`Players: ${CurrentPlayers}/${MaxPlayers}`);

        } catch (error) {
            console.error('❌ Failed to fetch player count:', error.message);
        }

        scheduleNextFetch();
    };

    const scheduleNextFetch = () => {
        setTimeout(fetchPlayerCount, 30000);
    };

    fetchPlayerCount();
};