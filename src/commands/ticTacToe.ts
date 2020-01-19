import Discord, { RichEmbed, MessageReaction } from 'discord.js';
import { Command } from './Command';
import { buildEmbed } from '../utils/buildEmbed';

const emojis = new Set(['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']);
const indexToEmoji = [...emojis];

const boardPosToRow = (boardPos: number): number => Math.floor(boardPos / 3);
const boardPosToCol = (boardPos: number): number => Math.floor(boardPos % 3);

class TicTacToeGame {
  board: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  private activePlayer: Discord.User = this.player1;

  constructor(private player1: Discord.User, private player2: Discord.User) { }

  mark = (boardPos: number) => {
    const row = boardPosToRow(boardPos);
    const col = boardPosToCol(boardPos);

    this.board[row][col] = (this.activePlayer === this.player1) ? 1 : 2;
    this.activePlayer = (this.activePlayer === this.player1) ? this.player2 : this.player1;

    console.log(`[ticTacToe] ${this.activePlayer.username} marked boardPos: ${boardPos} = ${this.board[row][col]}`);
    console.log(`[ticTacToe] activePlayer is now ${this.activePlayer.username}`);
  }

  moveFilter = (reaction: MessageReaction, user: Discord.User): boolean => {
    const boardPos = indexToEmoji.indexOf(reaction.emoji.name);
    const row = boardPosToRow(boardPos);
    const col = boardPosToCol(boardPos);

    return emojis.has(reaction.emoji.name)
      && this.activePlayer === user
      && this.board[row][col] === 0;
  }

  private renderSquareTopOrBot = (rowIndex: number, colIndex: number): string => {
    switch (this.board[rowIndex][colIndex]) {
      case 0: return '⬜⬜⬜'
      case 1: return '⬜⬜⬜'
      case 2: return '⬜⬜⬜'
      default: throw new Error(`[ticTacToe] invalid board state: ${this.board}`);
    }
  }

  private renderSquareMid = (rowIndex: number, colIndex: number): string => {
    switch (this.board[rowIndex][colIndex]) {
      case 0: return `⬜${indexToEmoji[rowIndex * 3 + colIndex]}⬜`
      case 1: return '⬜❌⬜'
      case 2: return '⬜⭕⬜'
      default: throw new Error(`ticTacToe invalid board state: ${this.board}`);
    }
  }

  private renderRowTopOrBot = (row: number[], rowIndex: number): string => {
    return row.reduce((prevCols, _, colIndex) =>
      prevCols +
      (colIndex > 0 ? '⬛' : '') +
      this.renderSquareTopOrBot(rowIndex, colIndex)
      , '');
  }

  private renderRowMid = (row: number[], rowIndex: number): string => {
    return row.reduce((prevCols, _, colIndex) =>
      prevCols +
      (colIndex > 0 ? '⬛' : '') +
      this.renderSquareMid(rowIndex, colIndex)
      , '');
  }

  private renderRow = (row: number[], rowIndex: number): string => {
    const topAndBot = this.renderRowTopOrBot(row, rowIndex);
    const top = topAndBot;
    const mid = this.renderRowMid(row, rowIndex);
    const bot = topAndBot;
    return `${top}\n${mid}\n${bot}`;
  }

  private renderBoard = (): string => {
    return this.board.reduce((prevRows, row, rowIndex) =>
      prevRows + '\n' +
      (rowIndex > 0 ? '⬛⬛⬛⬛⬛⬛⬛⬛⬛' : '') + '\n' +
      this.renderRow(row, rowIndex)
      , '');
  }

  renderEmbed = (): RichEmbed => {
    const embed = buildEmbed({ title: 'Tic-Tac-Toe', description: `❌${this.player1} vs ⭕${this.player2}` });
    embed.addField('Board', this.renderBoard())
    return embed;
  }
}

const ticTacToe: Command = {
  name: 'ticTacToe',
  aliases: ['ttt', 'xo', 'noughtsAndCrosses'],
  description: 'Challenge someone to a game of Tic-Tac-Toe',
  minArgs: 1,
  usage: '`?tictactoe (@user)`',
  cooldown: 30,
  guildOnly: true,
  execute: async (message, args) => {
    const tttGame = new TicTacToeGame(message.author, message.mentions.users.first());
    const gameMessage = await message.channel.send(tttGame.renderEmbed()) as Discord.Message;
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
    const collector = gameMessage.createReactionCollector(tttGame.moveFilter);
    collector.on('collect', (reaction, _) => {
      tttGame.mark(indexToEmoji.indexOf(reaction.emoji.name));
      gameMessage.edit(tttGame.renderEmbed());
    })
  }
};

export const command = ticTacToe;
