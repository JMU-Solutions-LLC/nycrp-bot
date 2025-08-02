const { EmbedBuilder } = require('discord.js');

module.exports = (interaction, promotedUser, newRank, reason) => {
    return {
        content: `${promotedUser}`,
        embeds: [
            new EmbedBuilder()
                .setAuthor({
                    name: interaction?.user?.username || interaction.client.user.username,
                    iconURL: interaction?.user?.displayAvatarURL({ dynamic: true }) || interaction.client.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle('Staff Promotion')
                .setDescription(`We wish to congratulate ${promotedUser} for the promotion. We wish to see you progress within our staff team, great job!`)
                .setColor(0x333333)
                .addFields(
                    { name: 'New Rank:', value: newRank || 'Not specified', inline: true },
                    { name: 'Reason:', value: reason || 'Not specified', inline: true }
                )
                .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688ddc41&is=688c8ac1&hm=c77474f84baeffcf97f5e61110774fcf5c6c1a644bab6fe3046e4e21f7ce680a&=&format=webp&quality=lossless')
        ]
    };
};