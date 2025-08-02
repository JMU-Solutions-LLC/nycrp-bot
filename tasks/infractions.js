const db = require('../utils/db.js');

module.exports = (client) => {
    const checkInfractions = async () => {
        const now = Date.now();
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) return console.warn('⚠️ Guild not found. Check GUILD_ID in your .env.');

        const all = await db.all();

        for (const entry of all) {
            if (!entry.id.startsWith('infractions.')) continue;

            const userId = entry.id.split('.')[1];
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) continue;

            let infractions = entry.value || [];

            const active = infractions.filter(i => !i.expiresAt || i.expiresAt > now);
            const expired = infractions.filter(i => i.expiresAt && i.expiresAt <= now);

            for (const inf of expired) {
                if (inf.roleId && member.roles.cache.has(inf.roleId)) {
                    await member.roles.remove(inf.roleId).catch(() => null);
                    console.log(`✅ Removed expired role ${inf.roleId} from ${member.user.tag}`);
                }
            }

            await db.set(`infractions.${userId}`, active);
        }

        scheduleNextCheck();
    };

    const scheduleNextCheck = () => setTimeout(checkInfractions, 60 * 60 * 1000);
    checkInfractions();
};