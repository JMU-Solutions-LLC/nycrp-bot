const { EmbedBuilder } = require('discord.js');

module.exports = (voters) => {
    return new EmbedBuilder()
        .setTitle('Voters')
        .setDescription('The following users have voted for the session:\n\n' + voters)
        .setColor(0x333333)
        .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688ddc41&is=688c8ac1&hm=c77474f84baeffcf97f5e61110774fcf5c6c1a644bab6fe3046e4e21f7ce680a&=&format=webp&quality=lossless');
};