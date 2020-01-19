import Discord, { RichEmbed, MessageReaction } from 'discord.js';
import { Command } from './Command';
import { buildEmbed } from '../utils/buildEmbed';

const emojis = new Set(['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']);
const indexToEmoji = [...emojis];

const boardPosToRow = (boardPos: number): number => Math.floor(boardPos / 3);
const boardPosToCol = (boardPos: number): number => boardPos % 3;

class TicTacToeGame {
  private board: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  private player1: Discord.User;
  private player2: Discord.User;
  private activePlayer: Discord.User;
  private gameMessage!: Discord.Message;
  private collector!: Discord.ReactionCollector;

  constructor(user1: Discord.User, user2: Discord.User, channel: Discord.TextChannel) {
    if (Math.random() < 0.5) {
      this.player1 = user1;
      this.player2 = user2;
    } else {
      this.player1 = user2;
      this.player2 = user1;
    }
    this.activePlayer = this.player1;
    this.initGameMessage(channel);
    console.log(`[ticTacToe] Match started - player1: ${this.player1.username}, player2: ${this.player2.username}`);
  }

  private initGameMessage = async (channel: Discord.TextChannel) => {
    this.gameMessage = await channel.send(this.renderEmbed()) as Discord.Message;
    this.gameMessage.react('1️⃣')
      .then(() => this.gameMessage.react('2️⃣'))
      .then(() => this.gameMessage.react('3️⃣'))
      .then(() => this.gameMessage.react('4️⃣'))
      .then(() => this.gameMessage.react('5️⃣'))
      .then(() => this.gameMessage.react('6️⃣'))
      .then(() => this.gameMessage.react('7️⃣'))
      .then(() => this.gameMessage.react('8️⃣'))
      .then(() => this.gameMessage.react('9️⃣'))
      .catch((error) => console.error(`[ticTacToe] Emoji failed to react in ${this.gameMessage}: ${error} `));

    this.collector = this.gameMessage.createReactionCollector(this.moveFilter);
    this.collector.on('collect', (reaction, _) => {
      this.mark(indexToEmoji.indexOf(reaction.emoji.name));
    });
  }

  private mark = (boardPos: number) => {
    const row = boardPosToRow(boardPos);
    const col = boardPosToCol(boardPos);

    this.board[row][col] = (this.activePlayer === this.player1) ? 1 : 2;
    console.log(`[ticTacToe] ${this.activePlayer.username} marked boardPos: ${boardPos} = ${this.board[row][col]}`);

    this.activePlayer = (this.activePlayer === this.player1) ? this.player2 : this.player1;
    console.log(`[ticTacToe] activePlayer is now ${this.activePlayer.username}`);

    this.updateGameState();
  }

  private moveFilter = (reaction: MessageReaction, user: Discord.User): boolean => {
    const boardPos = indexToEmoji.indexOf(reaction.emoji.name);
    const row = boardPosToRow(boardPos);
    const col = boardPosToCol(boardPos);

    return emojis.has(reaction.emoji.name)
      && this.activePlayer === user
      && this.board[row][col] === 0;
  }

  private getPlayerByMark = (mark: number): Discord.User => mark === 1 ? this.player1 : this.player2;

  private updateGameState = () => {
    /* Check for game ending completions */
    // Horizontal completions
    for (let row = 0; row < 3; ++row) {
      if (this.board[row][0] !== 0
        && this.board[row][0] === this.board[row][1]
        && this.board[row][1] === this.board[row][2]) {
        return this.endGame(this.getPlayerByMark(this.board[row][0]));
      }
    }

    // Vertical completions
    for (let col = 0; col < 3; ++col) {
      if (this.board[0][col] !== 0
        && this.board[0][col] === this.board[1][col]
        && this.board[1][col] === this.board[2][col]) {
        return this.endGame(this.getPlayerByMark(this.board[0][col]));
      }
    }

    // Diagonal completions
    if (this.board[1][1] !== 0
      && this.board[0][0] === this.board[1][1]
      && this.board[1][1] === this.board[2][2]) {
      return this.endGame(this.getPlayerByMark(this.board[1][1]));
    }
    if (this.board[1][1] !== 0
      && this.board[0][2] === this.board[1][1]
      && this.board[1][1] === this.board[2][0]) {
      return this.endGame(this.getPlayerByMark(this.board[1][1]));
    }

    // No available moves remaining
    let hasAvailableMove: boolean = false;
    for (let pos = 0; pos < 9; ++pos) {
      if (this.board[boardPosToRow(pos)][boardPosToCol(pos)] == 0) {
        hasAvailableMove = true;
        break;
      }
    }
    if (!hasAvailableMove) {
      return this.endGame()
    }

    // Game continues
    this.gameMessage.edit(this.renderEmbed());
  }

  private endGame = (winner?: Discord.User) => {
    const embed = buildEmbed({ title: 'Tic-Tac-Toe', description: `❌${this.player1} vs ⭕${this.player2}` });
    embed.addField('Board', this.renderBoard());
    embed.addField('Result', `${winner ? 'Winner: ' + winner : 'Draw'}`)
    this.gameMessage.edit(embed);
    this.collector.stop('[ticTacToe] ended.');
  }

  private renderSquareTopOrBot = (rowIndex: number, colIndex: number): string => {
    switch (this.board[rowIndex][colIndex]) {
      case 0: return '⬜⬜⬜'
      case 1: return '⬜⬜⬜'
      case 2: return '⬜⬜⬜'
      default: throw new Error(`[ticTacToe] Invalid board state: ${this.board}`);
    }
  }

  private renderSquareMid = (rowIndex: number, colIndex: number): string => {
    switch (this.board[rowIndex][colIndex]) {
      case 0: return `⬜${indexToEmoji[rowIndex * 3 + colIndex]}⬜`
      case 1: return '⬜❌⬜'
      case 2: return '⬜⭕⬜'
      default: throw new Error(`[ticTacToe] Invalid board state: ${this.board}`);
    }
  }

  private renderRowInnerRow = (row: number[], rowIndex: number, isMid: boolean): string => {
    return row.reduce((prevCols, _, colIndex) =>
      prevCols +
      (colIndex > 0 ? '⬛' : '') +
      (isMid
        ? this.renderSquareMid(rowIndex, colIndex)
        : this.renderSquareTopOrBot(rowIndex, colIndex))
      , '');
  }

  private renderRow = (row: number[], rowIndex: number): string => {
    // Top and Bot rows are identical
    const top = this.renderRowInnerRow(row, rowIndex, false);
    const mid = this.renderRowInnerRow(row, rowIndex, true);
    const bot = top;
    return `${top}\n${mid}\n${bot}`;
  }

  private renderBoard = (): string => {
    return this.board.reduce((prevRows, row, rowIndex) =>
      prevRows + '\n' +
      (rowIndex > 0 ? '⬛⬛⬛⬛⬛⬛⬛⬛⬛' : '') + '\n' +
      this.renderRow(row, rowIndex)
      , '');
  }

  private renderEmbed = (): RichEmbed => {
    const embed = buildEmbed({ title: 'Tic-Tac-Toe', description: `❌${this.player1} vs ⭕${this.player2}` });
    embed.addField('Board', this.renderBoard());
    embed.addField('To Move', `${this.activePlayer}'s turn`);
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
    if (!message.mentions.users.first()) {
      throw new Error(`[ticTacToe] invalid mentioned user argument: ${message.mentions.users}`);
    }
    new TicTacToeGame(
      message.author,
      message.mentions.users.first(),
      message.channel as Discord.TextChannel
    );
  }
};

export const command = ticTacToe;
