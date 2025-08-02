const { EmbedBuilder } = require('discord.js');

module.exports = (interaction, member, status, reason = null) => {
    const imageUrl = "https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688ddc41&is=688c8ac1&hm=c77474f84baeffcf97f5e61110774fcf5c6c1a644bab6fe3046e4e21f7ce680a&=&format=webp&quality=lossless";
    
    if (status === 'pass') {
        return new EmbedBuilder()
            .setImage(imageUrl)
            .setTitle('Application Approved')
            .setColor(0x00FF00)
            .setDescription(`<@${member.id}>'s application has been accepted for moderator.\n\nCongratulations, please [request a training here](https://discord.com/channels/${interaction.guild.id}/${process.env.TRAINING_CHANNEL}).`)
            .setTimestamp()
            .setFooter({ text: `Application reviewed by ${interaction.user.tag}` });
    } 
    
    if (status === 'fail') {
        return new EmbedBuilder()
            .setImage(imageUrl)
            .setTitle('Application Denied')
            .setColor(0xFF0000)
            .setDescription(`<@${member.id}>'s application has been denied for moderator.\n\nYou may re-apply in 24 hours. Good luck on future applications!\n\n**Reason:** ${reason || 'No reason provided.'}`)
            .setTimestamp()
            .setFooter({ text: `Application reviewed by ${interaction.user.tag}` });
    }
};