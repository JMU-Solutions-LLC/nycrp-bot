const noblox = require("noblox.js");
const axios = require("axios");

module.exports = async (client) => {
  const currentUser = await noblox.setCookie(process.env.ROBLOX_COOKIE);
  console.log(`✅ Logged in as ${currentUser.name} [${currentUser.id}].`);

  const event = noblox.onJoinRequest(process.env.ROBLOX_GROUP_ID);

  event.on("data", async (data) => {
    try {
      const robloxId = data.userId;

      let bloxlinkData;
      try {
        const res = await axios.get(
          `https://api.blox.link/v4/public/guilds/${process.env.GUILD_ID}/roblox-to-discord/${robloxId}`,
          {
            headers: { Authorization: process.env.BLOXLINK_API_KEY },
          }
        );
        bloxlinkData = res.data;
        console.log(res.data);
      } catch (err) {
        console.error(`❌ Failed to fetch from Bloxlink: ${err.response?.status || err.message}`);
        return;
      }

      const discordIDs = bloxlinkData.discordIDs || [];
      console.log(discordIDS);

      if (!discordIDs.length) {
        console.warn(`⚠️ No linked Discord accounts found for Roblox ID ${robloxId}.`);
        await noblox.handleJoinRequest(process.env.ROBLOX_GROUP_ID, robloxId, false);
        return;
      }

      const guild = client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        console.error("❌ Discord guild not found.");
        return;
      }

      let isStaff = false;
      for (const discordId of discordIDs) {
        const member = await guild.members.fetch(discordId).catch(() => null);
        if (member && member.roles.cache.has(process.env.STAFF_ROLE)) {
          isStaff = true;
          break;
        }
      }

      console.log(isStaff);

      if (isStaff) {
        await noblox.handleJoinRequest(process.env.ROBLOX_GROUP_ID, robloxId, true);
      } else {
        await noblox.handleJoinRequest(process.env.ROBLOX_GROUP_ID, robloxId, false);
      }
    } catch (err) {
      console.error("❌ Error handling join request:", err);
    }
  });

  event.on("error", (err) => {
    console.error("❌ Join Request Event Error:", err);
  });
};