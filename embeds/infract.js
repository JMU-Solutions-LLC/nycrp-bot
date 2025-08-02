const { EmbedBuilder } = require('discord.js');

module.exports = (interaction, staffMember, punishment, reason) => {
    return {
        content: `${staffMember}`,
        embeds: [
            new EmbedBuilder()
                .setAuthor({
                    name: interaction?.user?.username || interaction.client.user.username,
                    iconURL: interaction?.user?.displayAvatarURL({ dynamic: true }) || interaction.client.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle('Staff Infraction')
                .setDescription('> Your recent actions have violated the community guidelines. As a result, you will be receiving a formal infraction. Please review the guidelines to avoid further disciplinary action.')
                .setColor(0x333333)
                .addFields(
                    { name: 'Staff Member:', value: staffMember.toString(), inline: true },
                    { name: 'Punishment:', value: punishment || 'Not specified', inline: true },
                    { name: 'Reason:', value: reason || 'Not specified', inline: true }
                )
                .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688ddc41&is=688c8ac1&hm=c77474f84baeffcf97f5e61110774fcf5c6c1a644bab6fe3046e4e21f7ce680a&=&format=webp&quality=lossless')
        ]
    };
};