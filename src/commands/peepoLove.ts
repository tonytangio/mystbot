import Discord, { DiscordAPIError } from 'discord.js';
import fs from 'fs';
import { Canvas, Image, loadImage } from 'canvas';
import { Command } from '../interfaces/Command';

const canvasLength = 512;
const userImageDiameter = 330;
const userImageRadius = userImageDiameter / 2;
const userImageXPos = -210;
const userImageYPos = canvasLength - 241;

const peepoBody = new Image();
const peepoHands = new Image();
peepoBody.src = fs.readFileSync('./resources/images/peepoBody.png');
peepoHands.src = fs.readFileSync('./resources/images/peepoHands.png');

const peepoLove: Command = {
  name: 'peepoLove',
  aliases: ['pepeLove', 'love', 'heart'],
  description: 'Give peepoLove to someone.',
  usage: '`?peepoLove (user)`',
  execute: async (message, args) => {
    const targetUser = message.mentions.members.first().user;
    const userImage = await loadImage(targetUser.avatarURL);

    const canvas = new Canvas(canvasLength, canvasLength);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(peepoBody, 0, 0, canvasLength, canvasLength);
    // User image block
    ctx.save();
    ctx.rotate(-0.4);
    ctx.beginPath();
    ctx.arc(userImageXPos + userImageRadius, userImageYPos + userImageRadius, userImageRadius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(userImage, userImageXPos, userImageYPos, userImageDiameter, userImageDiameter);
    ctx.restore();

    ctx.drawImage(peepoHands, 0, 0);

    message.channel.send(new Discord.Attachment(canvas.toBuffer()));
  }
};

export const command = peepoLove;
