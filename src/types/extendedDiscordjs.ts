import { Client, Collection, Message } from 'discord.js';
import { Command } from '../interfaces/commands';

export type ClientWithCommands = Client & { commands: Collection<string, Command> };
export type ExtendedMessage = Message & { client: ClientWithCommands };
