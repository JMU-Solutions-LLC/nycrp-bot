const { Events, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`❌ No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`❌ Error executing ${interaction.commandName}:`, error);
                const replyOpts = { content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(replyOpts);
                } else {
                    await interaction.reply(replyOpts);
                }
            }
            return;
        }

        if (interaction.isButton()) {
            try {
                const buttonsPath = path.join(__dirname, '../buttons');
                const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

                const button = buttonFiles
                    .map(file => require(path.join(buttonsPath, file)))
                    .find(b => b.customId === interaction.customId);

                if (!button) {
                    console.warn(`⚠️ No button handler found for ID: ${interaction.customId}`);
                    return;
                }

                await button.execute(interaction, client, db);
            } catch (error) {
                console.error(`❌ Error executing button ${interaction.customId}:`, error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'There was an error executing this button.', ephemeral: true });
                }
            }
        }
    },
};