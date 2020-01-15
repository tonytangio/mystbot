import Discord, { ClientOptions } from 'discord.js';
import fs from 'fs';
import { Command } from './interfaces/Command';
import { messageHandler } from './handlers/messageHandler';
import { secret } from './config';

interface MystBotOptions extends ClientOptions {
  token: string;
}

export type Commands = Discord.Collection<string, Command>;
/** cooldown.name -> (authorId -> cooldownStartTime) */
export type Cooldowns = Discord.Collection<string, Discord.Collection<string, number>>;

export class MystBot extends Discord.Client {
  commands: Commands;
  cooldowns: Cooldowns;

  constructor(options: MystBotOptions) {
    super(options);
    this.commands = new Discord.Collection<string, Command>();
    this.cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

    this.login(options.token);
    this.setHandlers();
    this.loadCommands();
  }

  setHandlers = () => {
    this.once('ready', () => console.log('\nmystbot is ready.'));
    this.on('message', messageHandler);
  };

  loadCommands = () => {
    const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'));
    commandFiles.forEach(async file => {
      const command: Command = (await import(`./commands/${file}`)).default;
      this.commands.set(command.name, command);
      console.log(`Imported Command: ${JSON.stringify(command)}`);
    });
  };
}

new MystBot({ token: secret.token });
