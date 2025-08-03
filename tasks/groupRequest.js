const noblox = require("noblox.js");
const axios = require("axios");
const db = require("../utils/db");

module.exports = async (client) => {
  const currentUser = await noblox.setCookie(process.env.ROBLOX_COOKIE);
  console.log(`✅ Logged in as ${currentUser.name} [${currentUser.id}]`);

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) throw new Error("❌ Discord guild not found.");
  await guild.members.fetch();

  const storedRequests = db.get("processedRequests");
  let processedRequests = new Set(Array.isArray(storedRequests) ? storedRequests : []);

  setInterval(async () => {
    try {
      const requests = await noblox.getJoinRequests({
        group: process.env.ROBLOX_GROUP_ID,
        limit: 100
      });

      console.log(requests);

      for (const request of requests.data) {
        const robloxId = request.requester.userId;
        const username = request.requester.username;

        if (processedRequests.has(robloxId)) continue;

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
          console.warn(`⚠️ No linked Discord account for ${username}.`);
          await noblox.handleJoinRequest(process.env.ROBLOX_GROUP_ID, robloxId, false);
          processedRequests.add(robloxId);
          db.set("processedRequests", Array.from(processedRequests));
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

        processedRequests.add(robloxId);
        db.set("processedRequests", Array.from(processedRequests));

        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error("❌ Error polling join requests:", err);
    }
  }, 15000);
};