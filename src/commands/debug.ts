import { buildEmbed } from '../utils/buildEmbed';
import { Command } from './Command';

const debug: Command = {
	name: 'debug',
	aliases: ['d'],
	description: 'mystbot command debug information.',
	usage: '`?debug [args...]`',
	execute: (message, args) => {
		const embed = buildEmbed({ title: debug.name, description: debug.description });

		embed
			.addField('Message', message.content)
			.addField('Command', message.content.split(/ +/)[0].slice(1), true)
			.addField('Args', args.toString() || 'No args supplied.', true)
			.addField('Created At', message.createdAt);

		message.channel.send(embed);
	},
};

export const command = debug;
