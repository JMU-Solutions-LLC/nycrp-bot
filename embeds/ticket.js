const { EmbedBuilder } = require('discord.js');

module.exports = () => {
    const topImageEmbed = new EmbedBuilder()
        .setImage('https://media.discordapp.net/attachments/1400850725533253704/1401272224907923476/Screenshot_2025-08-01_at_4.06.59_AM.png?ex=688fabf4&is=688e5a74&hm=29bedfb888f7467e4987a3f292b95488ddbc13f50915e1e87847feabb95e8bdf&=&format=webp&quality=lossless&width=1253&height=413');

    const supportEmbed = new EmbedBuilder()
        .setTitle('New York Support')
        .setDescription('We appreciate you contacting us! You will soon be supported by a member of our support staff. Please be as specific as you can when describing your problem or inquiry.')
        .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688f2dc1&is=688ddc41&hm=cb993330e5278e7f7db381a8b2e2e6a2fc8ab7b3577281006274afd448915c38&=&format=webp&quality=lossless');

    return [topImageEmbed, supportEmbed];
};