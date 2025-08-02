const { EmbedBuilder } = require('discord.js');

module.exports = (unixTimestamp, playerCount, moderatingCount, queueCount) => {
    const sessionsEmbed = new EmbedBuilder()
        .setTitle(':video_game: Sessions')
        .setColor(0x333333)
        .setDescription(
            `Our session times are listed below. Please note that these times are subject to change based on staff availability, and sessions may not always be held as scheduled.\n\n` +
            `:clock4: **Weekdays:** <t:1754078400:t>\n` +
            `:clock1: **Weekends:** <t:1754067600:t>\n\n` +
            `Make sure you have the <@&${process.env.SESSION_ROLE}> role to be notified when a server startup occurs.\n`
        );

    const serverStatusEmbed = new EmbedBuilder()
        .setTitle(':information_source: Server Status')
        .setDescription(`**Last Updated:** ${unixTimestamp}`)
        .setColor(0x333333)
        .addFields(
            { name: 'Player Count', value: `\`\`\`\n${playerCount}\n\`\`\``, inline: true },
            { name: 'Moderating', value: `\`\`\`\n${moderatingCount}\n\`\`\``, inline: true },
            { name: 'In Queue', value: `\`\`\`\n${queueCount}\n\`\`\``, inline: true }
        )
        .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688ddc41&is=688c8ac1&hm=c77474f84baeffcf97f5e61110774fcf5c6c1a644bab6fe3046e4e21f7ce680a&=&format=webp&quality=lossless');

    return [sessionsEmbed, serverStatusEmbed];
};