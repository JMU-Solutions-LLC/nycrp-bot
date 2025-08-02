const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/db.js');

module.exports = {
    customId: 'training_attend',
    async execute(interaction) {
        const trainingId = interaction.message.id;
        const userId = interaction.user.id;
        const member = await interaction.guild.members.fetch(userId);

        if (!member.roles.cache.has(process.env.TRIAL_MOD_ROLE_ID)) {
            return interaction.reply({ content: '❌ You do not have permission to attend this training.', ephemeral: true });
        }

        const data = (await db.get(`training.${trainingId}`)) || { attendees: [] };

        let responseMessage;

        if (data.attendees.includes(userId)) {
            data.attendees = data.attendees.filter(id => id !== userId);
            responseMessage = '❌ You have been removed from the attendee list.';
        } else {
            data.attendees.push(userId);
            responseMessage = '✅ You have been marked as attending this training!';
        }

        await db.set(`training.${trainingId}`, data);

        const updatedRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('training_attend')
                .setLabel(`Attend (${data.attendees.length})`)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('training_view')
                .setLabel('View Attendees')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.message.edit({ components: [updatedRow] });

        return interaction.reply({ content: responseMessage, ephemeral: true });
    }
};