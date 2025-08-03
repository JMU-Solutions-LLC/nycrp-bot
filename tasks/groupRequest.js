const noblox = require("noblox.js");
const axios = require("axios");

module.exports = async (client) => {
  const currentUser = await noblox.setCookie(process.env.ROBLOX_COOKIE);
  console.log(`✅ Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) console.error("❌ Discord guild not found.");
  await guild.members.fetch();

  let processedRequests = new Set();

  setInterval(async () => {
    try {
      const requests = await noblox.getJoinRequests(process.env.ROBLOX_GROUP_ID);
      for (const request of requests) {
        const robloxId = request.requester.userId;
        const username = request.requester.username;

        if (processedRequests.has(robloxId)) continue;
        processedRequests.add(robloxId);

        console.log(`📥 New join request detected: ${username} (${robloxId})`);

        let bloxlinkData;
        try {
          const res = await axios.get(
            `https://api.blox.link/v4/public/guilds/${process.env.GUILD_ID}/roblox-to-discord/${robloxId}`,
            { headers: { Authorization: process.env.BLOXLINK_API_KEY } }
          );
          bloxlinkData = res.data;
        } catch (err) {
          console.error(`❌ Bloxlink fetch failed: ${err.response?.status || err.message}`);
          continue;
        }

        const discordIDs = bloxlinkData.discordIDs || [];
        if (!discordIDs.length) {
          await noblox.handleJoinRequest(process.env.ROBLOX_GROUP_ID, robloxId, false);
          continue;
        }

        const isStaff = discordIDs.some(discordId => {
          const member = guild.members.cache.get(discordId);
          return member?.roles.cache.has(process.env.STAFF_ROLE);
        });

        if (isStaff) {
          await noblox.handleJoinRequest(process.env.ROBLOX_GROUP_ID, robloxId, true);
        } else {
          await noblox.handleJoinRequest(process.env.ROBLOX_GROUP_ID, robloxId, false);
        }

        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error("❌ Error polling join requests:", err);
    }
  }, 15000);
};