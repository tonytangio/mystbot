import Discord, { RichEmbed } from 'discord.js';
import { Command } from './Command';
import { buildEmbed } from '../utils/buildEmbed';

class TicTacToeGame {
  board: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  constructor(private player1: Discord.User, private player2: Discord.User) { }

  renderCell(value: number): string {
    return `
⬜⬜⬜
⬜⬜⬜
⬜⬜⬜`.trim();
  }

  renderBoard = (): string => {
    return this.board.reduce((prevRows, row, rowIndex) =>
      prevRows +
      (rowIndex > 0 ? '⬛⬛⬛⬛⬛⬛⬛⬛⬛' : '') + '\n' +
      '⬜⬜⬜⬛⬜⬜⬜⬛⬜⬜⬜' + '\n' +
      row.reduce((prevCells, cell, cellIndex) =>
        prevCells +
        (cellIndex > 0 ? '⬛' : '') +
        '⬜' + '1️⃣' + '⬜', ''
      ) + '\n' +
      '⬜⬜⬜⬛⬜⬜⬜⬛⬜⬜⬜' + '\n'
      , '');
  }

  renderEmbed = (): RichEmbed => {
    const embed = buildEmbed({ title: 'Tic-Tac-Toe', description: `${this.player1} vs ${this.player2}` });
    embed.addField('Board', this.renderBoard())
    return embed;
  }
}

const ticTacToe: Command = {
  name: 'ticTacToe',
  aliases: ['ttt', 'xo', 'noughtsAndCrosses'],
  description: 'Challenge someone to a game of Tic-Tac-Toe',
  minArgs: 1,
  usage: '`? tictactoe(@user)`',
  cooldown: 30,
  guildOnly: true,
  execute: async (message, args) => {
    const tttGame = new TicTacToeGame(message.author, message.mentions.users.first());
    const gameMessage: Discord.Message = await message.channel.send(tttGame.renderEmbed()) as Discord.Message;
    gameMessage.react('1️⃣')
      .then(() => gameMessage.react('2️⃣'))
      .then(() => gameMessage.react('3️⃣'))
      .then(() => gameMessage.react('4️⃣'))
      .then(() => gameMessage.react('5️⃣'))
      .then(() => gameMessage.react('6️⃣'))
      .then(() => gameMessage.react('7️⃣'))
      .then(() => gameMessage.react('8️⃣'))
      .then(() => gameMessage.react('9️⃣'))
      .catch((error) => console.error(`Emoji failed to react in ${gameMessage}: ${error} `));
  }
};

export const command = ticTacToe;
