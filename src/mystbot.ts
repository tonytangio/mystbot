import fs from 'fs';
import Discord, { Message } from 'discord.js';

import config, { secret } from '../config';
import { Command } from './interfaces/commands';

const client = new Discord.Client();
const commands = new Discord.Collection<string, Command>();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'));

commandFiles.forEach(async file => {
  const command: Command = (await import(`./commands/${file}`)).default;
  commands.set(command.name, command);
  console.log(`Imported Command: ${JSON.stringify(command)}`);
});

const messageHandler = (message: Message): void => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args: string[] = message.content.slice(config.prefix.length).split(/ +/);
  const commandName: string | undefined = args.shift()?.toLowerCase();
  if (!commandName || !commands.has(commandName)) return;

  const command: Command = commands.get(commandName)!;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command.');
  }
};

client.on('message', messageHandler);

client.once('ready', () => console.log('\nmystbot is ready.'));
client.login(secret.token);
