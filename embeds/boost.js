const { EmbedBuilder } = require('discord.js');

module.exports = (interaction) => {
    return new EmbedBuilder()
        .setAuthor({
            name: interaction?.user?.username || interaction.client.user.username,
            iconURL: interaction?.user?.displayAvatarURL({ dynamic: true }) || interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle('Server Boost')
        .setDescription('We are running low on members! Join up, the session is still going!')
        .setColor(0x333333)
        .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688ddc41&is=688c8ac1&hm=c77474f84baeffcf97f5e61110774fcf5c6c1a644bab6fe3046e4e21f7ce680a&=&format=webp&quality=lossless');
};