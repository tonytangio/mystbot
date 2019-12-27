import Discord, { Message } from 'discord.js';
import config, { secret } from '../config';

const client = new Discord.Client();

client.login(secret.token);

client.once('ready', () => {
  console.log('mystbot is ready.');
});

const messageHandler = (message: Message): void => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args: string[] = message.content
    .slice(config.prefix.length)
    .split(/ +/);
  const command: string | undefined = args.shift()?.toLowerCase();
  if (!command) return;

  message.channel.send(`Command name: ${command}\nArguments: ${args}`);
};

client.on('message', messageHandler);
