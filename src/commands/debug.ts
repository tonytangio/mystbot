import { Command } from '../interfaces/commands';
import config from '../../config';

const debug: Command = {
  name: 'debug',
  description: 'mystbot command debug information',
  execute: (message, args) => {
    message.channel.send(`Message: ${message.content}`);
    message.channel.send(`Command: ${message.content.slice(config.prefix.length).split(/ +/)[0] || ''}`);
    message.channel.send(`Args: ${args.toString()}`);
  }
};

export default debug;
