import config from '../config';
import { Command } from '../commands/Command';
import { commandHandler } from './commandHandler';
import { ExtendedMessage } from '../types/extendedDiscordjs';

const messageHandler = (message: ExtendedMessage): void => {
  if (!message.content.startsWith(config.prefix)
    || message.author.bot
    || message.content.length === config.prefix.length) 
    return;
    

  const args: string[] = message.content.slice(config.prefix.length).split(/ +/);
  const commandName: string = args.shift()?.toLowerCase()!;

  const command: Command
    = message.client.commands.get(commandName)
    || message.client.commands.find((c) => (c.aliases ? c.aliases.includes(commandName) : false));

  if (!command) return;
  commandHandler(command, args, message);
};

export default messageHandler;