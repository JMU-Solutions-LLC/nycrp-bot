const { Events, ActivityType } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Ready! Logged in as ${client.user.tag}.`);
        client.user.setActivity('NYCRP members!', { type: ActivityType.Watching });

        if (fs.existsSync('../data/bot_restart.json')) {
            const { channelId, messageId } = JSON.parse(fs.readFileSync("../data/bot_restart.json", 'utf8'));

            try {
                const channel = await client.channels.fetch(channelId);
                const message = await channel.messages.fetch(messageId);
                if (message) {
                    await message.edit(':white_check_mark: Bot restarted and repository synced successfully!');
                }
            } catch (error) {
                console.error('Failed to update restart message:', error);
            }

            fs.unlinkSync("../data/bot_restart.json");
        }

        require('../tasks/infractions.js')(client);
        require('../tasks/serverStatus.js')(client);
        require('../tasks/playerCount.js')(client);
    }
};