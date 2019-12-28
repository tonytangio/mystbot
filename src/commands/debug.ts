import { Command } from '../interfaces/Command';
import { buildEmbed } from '../utils/buildEmbed';

const debug: Command = {
  name: 'debug',
  description: 'mystbot command debug information.',
  execute: (message, args) => {
    const embed = buildEmbed({ title: debug.name, description: debug.description });

    embed
      .addField('Message', message.content)
      .addField('Command', debug.name, true)
      .addField('Args', args.toString() || 'No args supplied.', true)
      .addField('Created At', message.createdAt);

    message.channel.send(embed);
  }
};

export default debug;
