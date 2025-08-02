const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and API response time'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });

        const messagePing = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = interaction.client.ws.ping;

        await interaction.editReply({
            content: `🏓 **Pong!**\n📨 Message Ping: \`${messagePing}ms\`\n🌐 API Ping: \`${apiPing}ms\``
        });
    },
};