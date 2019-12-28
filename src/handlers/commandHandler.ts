import { ExtendedMessage } from '../types/extendedDiscordjs';
import { Command } from '../interfaces/Command';

export const commandHandler = (command: Command, args: string[], message: ExtendedMessage): void => {
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command.');
  }
};
