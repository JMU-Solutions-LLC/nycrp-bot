const db = require('../utils/db.js');

module.exports = {
    customId: 'training_view',
    async execute(interaction) {
        const trainingId = interaction.message.id;
        const data = (await db.get(`training.${trainingId}`)) || { attendees: [] };

        if (data.attendees.length === 0) {
            return interaction.reply({ content: '📋 No one has signed up yet.', ephemeral: true });
        }

        const attendeesList = data.attendees.map(id => `<@${id}>`).join('\n');
        return interaction.reply({ content: `📋 **Attendees:**\n\n${attendeesList}`, ephemeral: true });
    }
};