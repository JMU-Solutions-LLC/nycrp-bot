const { EmbedBuilder } = require('discord.js');

module.exports = () => {
    return new EmbedBuilder()
        .setTitle('📗 | Training being hosted!')
        .setDescription(
            `A training for Trial Moderators is about to take place soon. If you are willing to attend, you have 15 minutes to join after this message was sent before we start. Trainings are not hosted at a fixed schedule, the next one may take place in 24 hours.\n\n<@&${process.env.TRIAL_MOD_ROLE_ID}>`
        )
        .setColor(0x333333)
        .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688f2dc1&is=688ddc41&hm=cb993330e5278e7f7db381a8b2e2e6a2fc8ab7b3577281006274afd448915c38&=&format=webp&quality=lossless&width=1253&height=56');
};