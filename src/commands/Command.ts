import { ExtendedMessage } from '../types/extendedDiscordjs';

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  minArgs?: number;
  usage?: string;
  cooldown?: number;
  guildOnly?: boolean;
  execute: (message: ExtendedMessage, args: string[]) => void;
}
