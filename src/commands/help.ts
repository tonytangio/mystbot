import config from '../../config';
import { Command } from '../interfaces/Command';
import { buildEmbed } from '../utils/buildEmbed';

const help: Command = {
  name: 'help',
  aliases: ['commands', 'what'],
  description: 'List all mystbot commands, or info on a specified command.',
  execute: async (message, args) => {
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

      await message.channel.send(embed);
    } else {
      // Given arg: list specified command info.
      // Users can specify normal command names, or aliases.
      // Special logic in the case where given an alias.
      let command, givenAlias: string | undefined;
      const commandOrAliasName = args[0].toLowerCase();
      const nameCommand = commands.get(commandOrAliasName);
      const aliasCommand = commands.find(c => (c.aliases ? c.aliases.includes(commandOrAliasName) : false));
      if (nameCommand) {
        command = nameCommand;
      } else if (aliasCommand) {
        givenAlias = commandOrAliasName;
        command = aliasCommand;
      }

      if (!command) {
        return message.reply("that's not a valid command.");
      }

      const embed = buildEmbed({
        title: `help: ${command.name}`,
        description: `Information about command: \`${command.name}\``
      });

      if (command.aliases) {
        const aliases: string[] = command.aliases.slice();
        // Bold given alias in the alias list for clarity
        if (givenAlias) aliases[aliases.indexOf(givenAlias)] = `**${givenAlias}**`;
        embed.addField('Aliases', aliases.join(', '));
      }
      embed.addField('Description', command.description);

      message.channel.send(embed);
    }
  }
};

export default help;
