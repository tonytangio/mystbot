import Discord from 'discord.js';
import { ExtendedMessage, Cooldowns } from '../types/extendedDiscordjs';
import { Command } from '../interfaces/Command';
import config from '../config';

const checkArgs = (command: Command, args: string[], message: ExtendedMessage): boolean => {
  if (command.minArgs && args.length < command.minArgs) {
    let reply = `\`?${command.name}\` requires ${command.minArgs} or more arguments`;
    reply += ` - you provided ${args.length} argument${args.length === 1 ? '' : 's'}.`;
    if (command.usage) {
      reply += `\nUsage: \`${command.usage}\``;
    }
    message.reply(reply);
    return false;
  }
  return true;
};

const checkGuildOnlyOk = (guildOnly: boolean | undefined, channelType: string, message: ExtendedMessage): boolean => {
  if (guildOnly && channelType !== 'text') {
    message.reply("I can't execute that command inside DMs.");
    return false;
  }
  return true;
};

const checkAndManageCooldown = (
  cooldowns: Cooldowns,
  command: Command,
  authorId: string,
  message: ExtendedMessage
): boolean => {
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection<string, number>());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name)!;
  const cooldownDuration = (command.cooldown || config.cooldownDefault) * 1000;

  if (timestamps.has(authorId)) {
    const expirationTime = timestamps.get(authorId)! + cooldownDuration;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
      );
      return false;
    }
  }
  timestamps.set(authorId, now);
  setTimeout(() => timestamps.delete(authorId), cooldownDuration);
  return true;
};

export const commandHandler = (command: Command, args: string[], message: ExtendedMessage): void => {
  const { client } = message;
  const { cooldowns } = client;

  if (!checkArgs(command, args, message)) return;
  if (!checkGuildOnlyOk(command.guildOnly, message.channel.type, message)) return;
  if (!checkAndManageCooldown(cooldowns, command, message.author.id, message)) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command.');
  }
};
