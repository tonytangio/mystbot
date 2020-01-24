import config from '../config';
import Discord, { Message } from 'discord.js';
import { Command } from '../commands/Command';
import { Cooldowns } from '../mystbot';
import { ExtendedMessage } from '../types/extendedDiscordjs';

const checkArgs = (command: Command, args: string[], message: Message): boolean => {
  if (command.minArgs && args.length < command.minArgs) {
    let reply = `\`?${command.name}\` requires ${command.minArgs} or more arguments`;
    reply += ` - you provided ${args.length} argument${args.length === 1 ? '' : 's'}.`;
    if (command.usage) 
      reply += `\nUsage: \`${command.usage}\``;
		
    message.reply(reply);
    return false;
  }
  return true;
};

const checkGuildOnlyOk = (guildOnly: boolean | undefined, channelType: string, message: Message): boolean => {
  if (guildOnly && channelType !== 'text') {
    message.reply('I can\'t execute that command inside DMs.');
    return false;
  }
  return true;
};

const checkAndManageCooldown = (
  cooldowns: Cooldowns,
  command: Command,
  authorId: string,
  message: Message,
): boolean => {
  if (!cooldowns.has(command.name)) 
    cooldowns.set(command.name, new Discord.Collection<string, number>());
	

  const now = Date.now();
  const authorIdToCooldownStartTime = cooldowns.get(command.name)!;
  const cooldownDuration = (command.cooldown || config.cooldownDefault) * 1000;

  if (authorIdToCooldownStartTime.has(authorId)) {
    const expirationTime = authorIdToCooldownStartTime.get(authorId)! + cooldownDuration;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
      );
      return false;
    }
  }
  authorIdToCooldownStartTime.set(authorId, now);
  setTimeout(() => authorIdToCooldownStartTime.delete(authorId), cooldownDuration);
  return true;
};

export const commandHandler = (command: Command, args: string[], message: ExtendedMessage): void => {
  const { client } = message;

  if (!checkArgs(command, args, message)) return;
  if (!checkGuildOnlyOk(command.guildOnly, message.channel.type, message)) return;
  if (!checkAndManageCooldown(client.cooldowns, command, message.author.id, message)) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command.');
  }
};
