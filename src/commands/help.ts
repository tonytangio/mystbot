import config from '../config';
import { Command } from '../interfaces/Command';
import { buildEmbed } from '../utils/buildEmbed';

const help: Command = {
  name: 'help',
  aliases: ['commands', 'what'],
  description: 'List all mystbot commands, or info on a specified command.',
  usage: '`?help [commandName]`',
  execute: (message, args) => {
    const { commands } = message.client;
    if (!args.length) {
      // No args: list all commands.
      const embed = buildEmbed({ title: help.name, description: help.description });
      embed
        .addField('Commands', commands.map(command => command.name).join(', '))
        .addField(
          'Want command specific info?',
          `\nYou can send \`${config.prefix}help [commandName]\` to get info on that specific command.`
        );

      message.channel.send(embed);
    } else {
      // Given arg: list specified command info.
      // Users can specify normal command names, or aliases.
      // Special logic in the case where given an alias.
      let command;
      let givenAlias: string | undefined;
      const commandOrAliasName = args[0].toLowerCase();

      command = commands.get(commandOrAliasName);
      if (!command) {
        // Cannot find named command -> check all aliases.
        command = commands.find(c => (c.aliases ? c.aliases.includes(commandOrAliasName) : false));
        if (!command) {
          // No matching aliases either. Invalid command.
          message.reply("that's not a valid command.");
          return;
        }
        givenAlias = commandOrAliasName;
      }

      const embed = buildEmbed({
        title: `help (command: ${command.name})`,
        description: `Information about command: \`${command.name}\``
      });

      if (command.aliases) {
        const aliases: string[] = command.aliases.slice();
        // Bold given alias in the alias list for clarity
        if (givenAlias) aliases[aliases.indexOf(givenAlias)] = `**${givenAlias}**`;
        embed.addField('Aliases', aliases.join(', '));
      }
      embed.addField('Description', command.description);
      if (command.usage) embed.addField('Usage', command.usage, true);
      if (command.minArgs) embed.addField('Minimum Arguments', command.minArgs, true);
      embed.addField('Cooldown', command.cooldown || config.cooldownDefault);
      if (command.guildOnly) embed.addField('Server Only', 'true');

      message.channel.send(embed);
    }
  }
};

export default help;
