require('@dotenvx/dotenvx').config()

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');

const rootCommandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of rootCommandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const subfolders = fs.readdirSync(commandsPath).filter(f => fs.lstatSync(path.join(commandsPath, f)).isDirectory());
for (const folder of subfolders) {
    const folderPath = path.join(commandsPath, folder);
    const folderFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of folderFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

app.use('/', express.static(path.join(__dirname, 'transcripts')));

client.login(process.env.TOKEN);

app.listen(process.env.PORT, () => {
  console.log(`✅ Transcript server listening on port ${process.env.PORT}.`);
})