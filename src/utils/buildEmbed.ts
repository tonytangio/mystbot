import Discord from 'discord.js';

interface params {
	title: string;
	description: string;
}

export const buildEmbed = ({ title, description }: params): Discord.RichEmbed => {
  return new Discord.RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor('DARK_PURPLE');
};
