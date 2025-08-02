const { EmbedBuilder } = require('discord.js');

module.exports = () => {
    const topImageEmbed = new EmbedBuilder()
        .setColor(0x333333)
        .setImage('https://media.discordapp.net/attachments/1400850725533253704/1401272224907923476/Screenshot_2025-08-01_at_4.06.59_AM.png?ex=688fabf4&is=688e5a74&hm=29bedfb888f7467e4987a3f292b95488ddbc13f50915e1e87847feabb95e8bdf&=&format=webp&quality=lossless&width=2844&height=936');

    const assistanceEmbed = new EmbedBuilder()
        .setTitle(':closed_book: Assistance')
        .setDescription(
            '> -# This is the ticket system for New York City Roleplay. Make sure to open tickets in the right category, or you will get your ticket closed. Right below, we\'ll explain what each button is for.\n\n' +
            '<:arrow_white:1400227832940199946> **General Support**\n' +
            '- Do you have a question about rules, applying, or anything else that is a general question? Make sure to open a ticket here, and we\'ll try our best to help you out with your question! This is only for General Inquiries, not for reports or complaints.\n\n' +
            '<:arrow_white:1400227832940199946> **Internal Affairs**\n' +
            '- This is used for staff matters, reports, or other stuff that has to do with Internal Affairs. If you need to report a staff member, use this button to do so, and we\'ll try our best to help you. When reporting a staff member, make sure to have evidence.\n\n' +
            '<:arrow_white:1400227832940199946> **Partnership Inquiries**\n' +
            '- Do you have a question about partnership, or do you want to partner? This is the right button to do so! We do not currently offer Paid ads.'
        )
        .setColor(0x333333)
        .setImage('https://media.discordapp.net/attachments/1255891797868281909/1400411943252131941/Screenshot_2025-07-31_at_3.26.05CAM.png?ex=688ddc41&is=688c8ac1&hm=c77474f84baeffcf97f5e61110774fcf5c6c1a644bab6fe3046e4e21f7ce680a&=&format=webp&quality=lossless');

    return [topImageEmbed, assistanceEmbed];
};