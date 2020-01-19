import Discord from 'discord.js';
import fs from 'fs';
import { Canvas, Image, loadImage } from 'canvas';
import { Command } from './Command';

const canvasLength = 512;
const imageToLoveDiameter = 330;
const imageToLoveRadius = imageToLoveDiameter / 2;
const imageToLoveXPos = -210;
const imageToLoveYPos = canvasLength - 241;

const peepoBody = new Image();
const peepoHands = new Image();
peepoBody.src = fs.readFileSync('./resources/images/peepoBody.png');
peepoHands.src = fs.readFileSync('./resources/images/peepoHands.png');

const peepoLove: Command = {
  name: 'peepoLove',
  aliases: ['pepeLove', 'love', 'heart'],
  description: 'Give peepoLove to someone.',
  usage: '`?peepolove (image|@user)`',
  execute: async (message, args) => {
    let imageToLove;
    const attachedImage = message.attachments.first()?.url;
    const targetUser = message.mentions.members.first()?.user;
    if (attachedImage) {
      imageToLove = await loadImage(attachedImage);
    } else if (targetUser) {
      imageToLove = await loadImage(targetUser.avatarURL);
    } else {
      // TODO: Send original peepoLove image if no specified imageToLove
      message.reply(`\`peepoLove\` requires an attached image or a mentioned user to be loved.`);
      return;
    }

    const canvas = new Canvas(canvasLength, canvasLength);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(peepoBody, 0, 0, canvasLength, canvasLength);

    ctx.save();
    ctx.rotate(-0.4);
    ctx.beginPath();
    ctx.arc(imageToLoveXPos + imageToLoveRadius, imageToLoveYPos + imageToLoveRadius, imageToLoveRadius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(imageToLove, imageToLoveXPos, imageToLoveYPos, imageToLoveDiameter, imageToLoveDiameter);
    ctx.restore();

    ctx.drawImage(peepoHands, 0, 0);

    message.channel.send(new Discord.Attachment(canvas.toBuffer()));
  }
};

export const command = peepoLove;
