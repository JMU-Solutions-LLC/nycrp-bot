const db = require('../utils/db.js');

module.exports = (client) => {
    const checkTempSuspensions = async () => {
        const now = Date.now();
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) return console.warn('⚠️ Guild not found. Check GUILD_ID in your .env.');

        const all = await db.all();
        const suspensionsEntry = all.find(entry => entry.id === 'tempsuspensions');
        if (!suspensionsEntry) return scheduleNextCheck();

        const data = suspensionsEntry.value;

        for (const userId in data) {
            const suspension = data[userId];
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) continue;

            const infractions = await db.get(`infractions.${userId}`) || [];
            const isPermanentlySuspended = infractions.some(i => i.punishment === 'Termination');
            if (isPermanentlySuspended) {
                await db.delete(`tempsuspensions.${userId}`);
                continue;
            }

            if (suspension.expiresAt <= now) {
                const suspensionRole = guild.roles.cache.get(process.env.SUSPENSION_ROLE);
                if (suspensionRole && member.roles.cache.has(suspensionRole.id)) {
                    await member.roles.remove(suspensionRole).catch(() => null);
                }

                for (const roleId of suspension.roles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role) await member.roles.add(role).catch(() => null);
                }

                await db.delete(`tempsuspensions.${userId}`);
                console.log(`✅ Restored roles for ${member.user.tag} after temporary suspension.`);
            }
        }

        scheduleNextCheck();
    };

    const scheduleNextCheck = () => setTimeout(checkTempSuspensions, 60 * 1000);
    checkTempSuspensions();
};