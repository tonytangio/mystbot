import Discord from 'discord.js';
import { MystBot } from '../mystbot';

export type ExtendedMessage = Discord.Message & { client: MystBot };
