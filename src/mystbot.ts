import fs from 'fs';
import Discord from 'discord.js';

import { secret } from './config';
import { Command } from './interfaces/Command';
import { ClientWithCommands } from './types/extendedDiscordjs';
import { messageHandler } from './handlers/messageHandler';

const client = new Discord.Client() as ClientWithCommands;
client.commands = new Discord.Collection<string, Command>();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'));
commandFiles.forEach(async file => {
  const command: Command = (await import(`./commands/${file}`)).default;
  client.commands.set(command.name, command);
  console.log(`Imported Command: ${JSON.stringify(command)}`);
});

client.on('message', messageHandler);

client.once('ready', () => console.log('\nmystbot is ready.'));
client.login(secret.token);
