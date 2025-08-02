const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const buildModAppEmbed = require('../embeds/modapp.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mod')
        .setDescription('Manage moderator applications')
        .addSubcommand(subcommand =>
            subcommand
                .setName('pass')
                .setDescription('Approve a moderator application')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose application is approved')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('fail')
                .setDescription('Deny a moderator application')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose application is denied')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for denial')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const requiredRoles = ['1398970152607027210', '1400770917575036938', '1398969735630159894'];

        if (!interaction.member.roles.cache.has(process.env.IA_TEAM_ROLE)) {
            return interaction.reply({ content: `⚠️ You need the <@&${process.env.IA_TEAM_ROLE}> role to use this command.`, ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || null;

        const channel = interaction.guild.channels.cache.get(process.env.APPLICATION_CHANNEL);
        if (!channel) return interaction.reply({ content: ':x: Application channel not found.', ephemeral: true });

        if (subcommand === 'pass') {
            try {
                await member.roles.add(requiredRoles);
            } catch (err) {
                console.error(err);
                return interaction.reply({ content: ':x: Failed to assign roles.', ephemeral: true });
            }

            const embed = buildModAppEmbed(interaction, member, 'pass');
            await channel.send({ content: `<@${user.id}>`, embeds: [embed] });
            await interaction.reply({ content: `✅ Approved <@${user.id}> and sent to <#${process.env.APPLICATION_CHANNEL}>.`, ephemeral: true });
        }

        if (subcommand === 'fail') {
            const embed = buildModAppEmbed(interaction, member, 'fail', reason);
            await channel.send({ content: `<@${user.id}>`, embeds: [embed] });
            await interaction.reply({ content: `✅ Denied <@${user.id}> and sent to <#${process.env.APPLICATION_CHANNEL}>.`, ephemeral: true });
        }
    }
};