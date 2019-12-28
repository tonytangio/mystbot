import { Message } from 'discord.js';
import { ExtendedMessage } from '../types/extendedDiscordjs';

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  execute: (message: ExtendedMessage, args: string[]) => void;

  minArgs?: number;
  usage?: string;
  cooldown?: number;
  guildOnly?: boolean;
}
