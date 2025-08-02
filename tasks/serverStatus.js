const db = require('../utils/db.js');
const serverStatusEmbed = require('../embeds/serverStatus.js');
const serverFullTask = require('./serverFull.js');
const serverBoostTask = require('./serverBoost.js');
const erlc = require('../utils/erlcHandler.js');

module.exports = (client) => {
    const fetchServerStatus = async () => {
        try {
            const statusChannel = await client.channels.fetch(process.env.STATUS_CHANNEL).catch(() => null);
            if (!statusChannel) {
                console.warn('⚠️ STATUS_CHANNEL not found or invalid.');
                return scheduleNextFetch();
            }

            let statusMessageId = await db.get('status.statusMessageId');
            let fullInvoked = await db.get('status.fullInvoked') || false;
            let boostReady = await db.get('status.boostReady') || false;

            const { CurrentPlayers } = await erlc.request('/v1/server');

            const queueResponse = await erlc.request('/v1/server/queue');
            const queueCount = Array.isArray(queueResponse) && queueResponse.length > 0
                ? queueResponse[0]
                : 0;

            if (queueCount === 0 && fullInvoked) {
                await db.set('status.fullInvoked', false);
                fullInvoked = false;
            }
            if ((queueCount > 0 || CurrentPlayers > 20) && boostReady) {
                await db.set('status.boostReady', false);
                boostReady = false;
            }

            let statusMessage = null;
            if (statusMessageId) {
                statusMessage = await statusChannel.messages.fetch(statusMessageId).catch(() => null);
            }
            if (!statusMessage) {
                const placeholderEmbeds = serverStatusEmbed(`<t:${Math.floor(Date.now() / 1000)}:R>`, 0, 0, 0);
                const newMessage = await statusChannel.send({ embeds: placeholderEmbeds });
                await db.set('status.statusMessageId', newMessage.id);
                statusMessage = newMessage;
            }

            const moderatingCount = (await statusChannel.guild.members.fetch())
                .filter(member => member.roles.cache.has(process.env.MODERATING_ROLE)).size;

            const unixTimestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;
            const embeds = serverStatusEmbed(unixTimestamp, CurrentPlayers, moderatingCount, queueCount);
            await statusMessage.edit({ embeds });

            if (queueCount > 0) {
                if (!fullInvoked) {
                    await serverFullTask(client);
                    await db.set('status.fullInvoked', true);
                    await db.set('status.boostReady', true);
                }
                return scheduleNextFetch();
            }

            if (boostReady && CurrentPlayers <= 20) {
                await serverBoostTask(client);
                await db.set('status.boostReady', false);
            }

        } catch (error) {
            console.error('❌ Failed to fetch or update server status:', error.message);
        }

        scheduleNextFetch();
    };

    const scheduleNextFetch = () => setTimeout(fetchServerStatus, 30000);
    fetchServerStatus();
};