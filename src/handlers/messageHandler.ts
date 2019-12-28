import config from '../config';
import { ExtendedMessage } from '../types/extendedDiscordjs';
import { Command } from '../interfaces/Command';

export const messageHandler = (message: ExtendedMessage): void => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args: string[] = message.content.slice(config.prefix.length).split(/ +/);
  const commandName: string | undefined = args.shift()?.toLowerCase();
  if (!commandName || !message.client.commands.has(commandName)) return;

  const command: Command = message.client.commands.get(commandName)!;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command.');
  }
};
