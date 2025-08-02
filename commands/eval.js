const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Execute JavaScript code (DEVELOPER ONLY)')
        .addStringOption(option => 
            option.setName('code')
                .setDescription('The JavaScript code to evaluate')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            const code = interaction.options.getString('code');
            let result = await eval(code);
            if (typeof result !== 'string') result = require('util').inspect(result);
            interaction.reply(`\`\`\`${result}\`\`\``);
        } catch (error) {
            interaction.reply(`Error: \`\`\`${error}\`\`\``);
        }
    }
};