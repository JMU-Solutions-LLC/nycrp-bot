const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restarts the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.reply(":x: Syncing repository and restarting bot...");
    const message = await interaction.fetchReply();

    fs.writeFileSync(
      path.join(__dirname, "../data/bot_restart.json"),
      JSON.stringify({
        channelId: interaction.channelId,
        messageId: message.id,
      }),
      "utf8"
    );

    exec(
      "cd ~/nycrp-bot && gh repo sync && pm2 restart nycrp-bot",
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) console.error(`stderr: ${stderr}`);
        console.log(`stdout: ${stdout}`);
      }
    );
  },
};