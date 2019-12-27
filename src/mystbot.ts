import Discord from 'discord.js';
import config, { secret } from '../config';

const client = new Discord.Client();

client.once('ready', () => {
  console.log('mystbot is ready.');
});

client.login(secret.token);
