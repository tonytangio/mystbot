import Discord from 'discord.js';
import { Command } from '../interfaces/Command';

export type Cooldowns = Discord.Collection<string, Discord.Collection<string, number>>;
export type ExtendedClient = Discord.Client & {
  commands: Discord.Collection<string, Command>;
  cooldowns: Cooldowns;
};
export type ExtendedMessage = Discord.Message & { client: ExtendedClient };
