import Discord from 'discord.js';

import { Command } from '../interfaces/commands';
import config from '../../config';

const debug: Command = {
  name: 'debug',
  description: 'mystbot command debug information',
  execute: (message, args) => {
    const embed = new Discord.RichEmbed()
      .setTitle('debug')
      .setDescription(debug.description)
      .setColor('WHITE')
      .setTimestamp();

    embed
      .addField('Message', message.content)
      .addField('Command', message.content.slice(config.prefix.length).split(/ +/)[0] || '', true)
      .addField('Args', args.toString(), true)
      .addField('Created At', message.createdAt);

    message.channel.send(embed);
  }
};

export default debug;
