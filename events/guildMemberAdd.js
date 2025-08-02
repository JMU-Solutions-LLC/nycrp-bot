const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channel = member.guild.channels.fetch(process.env.WELCOME_CHANNEL);
        if (!channel) return console.warn('⚠️ WELCOME_CHANNEL not found or invalid.');

        const memberCount = member.guild.memberCount;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('member_count')
                .setLabel(`${memberCount}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setLabel('Assistance')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${member.guild.id}/${process.env.TICKET_CHANNEL}`)
        );

        await channel.send({
            content: `:wave: \`-\` **Welcome** <@${member.id}> to <:logo:1400526924404490482> **New York City Roleplay**—we hope you enjoy your stay!`,
            components: [row],
        });
    },
};