const erlc = require('../utils/erlcHandler.js');

module.exports = (client) => {
    const fetchJoinCode = async () => {
        try {
            const vcChannel = await client.channels.fetch(process.env.JOIN_CODE_VC).catch(() => null);
            if (!vcChannel) {
                console.warn('⚠️ JOIN_CODE_VC not found or invalid.');
                return scheduleNextFetch();
            }

            const { JoinKey } = await erlc.request('/v1/server');

            await vcChannel.setName(`💻・Code: ${JoinKey}`);

        } catch (error) {
            console.error('❌ Failed to fetch join code:', error.message);
        }

        scheduleNextFetch();
    };

    const scheduleNextFetch = () => {
        setTimeout(fetchJoinCode, 30000);
    };

    fetchJoinCode();
};