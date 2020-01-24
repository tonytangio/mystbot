import Discord, { RichEmbed, MessageReaction } from 'discord.js';
import { Command } from './Command';
import { buildEmbed } from '../utils/buildEmbed';

const emojis = new Set(['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']);
const indexToEmoji = [...emojis];

type Piece = 1 | 2;
type State = Piece | 0;
type Col = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Row = 0 | 1 | 2 | 3 | 4 | 5;

const isCol = (n: number): n is Col => n >= 0 && n <= 6;
const isRow = (n: number): n is Row => n >= 0 && n <= 5;

enum colDir {
  Right = 1,
  Left = -1
}

enum rowDir {
  Up = 1,
  Down = -1,
}

class ColumnStack {
  private topIndex: Row = 0;
  private container: Piece[] = [];
  constructor(private capacity: number) { }

  drop = (p: Piece): Row => {
    if (this.isFull())
      throw new Error('[connectFour] Invalid drop attempt - full');
    this.container[this.topIndex] = p;
    const droppedRow = this.topIndex;
    ++this.topIndex;
    return droppedRow;
  }

  isFull = (): boolean => this.topIndex === this.capacity;

  at = (index: number): State => (index < this.topIndex) ? this.container[index] : 0;
}

class ConnectFourGame {
  private readonly columnHeight = 6;
  private grid: ColumnStack[] = [
    new ColumnStack(this.columnHeight),
    new ColumnStack(this.columnHeight),
    new ColumnStack(this.columnHeight),
    new ColumnStack(this.columnHeight),
    new ColumnStack(this.columnHeight),
    new ColumnStack(this.columnHeight),
    new ColumnStack(this.columnHeight)
  ];
  private player1: Discord.User;
  private player2: Discord.User;
  private activePlayerPiece: Piece;
  updateGameMessage!: (embed: RichEmbed) => void;
  stopCollector!: (reason?: string) => void;

  constructor(user1: Discord.User, user2: Discord.User) {
    if (Math.random() < 0.5) {
      this.player1 = user1;
      this.player2 = user2;
    } else {
      this.player1 = user2;
      this.player2 = user1;
    }
    this.activePlayerPiece = 1;
    console.log(`[connectFour] Match started - player1: ${this.player1.username}, player2: ${this.player2.username}`);
  }

  drop = (col: Col) => {
    const droppedRow = this.grid[col].drop(this.activePlayerPiece);
    const droppedPiece = this.activePlayerPiece; 
    this.activePlayerPiece = this.activePlayerPiece === 1 ? 2 : 1;
    console.log(`[connectFour] activePlayer is now ${this.getActivePlayer().username}`);

    this.updateGameState(col, droppedRow, droppedPiece);
  }

  moveFilter = (reaction: MessageReaction, user: Discord.User): boolean => {
    const col = indexToEmoji.indexOf(reaction.emoji.name);
    return emojis.has(reaction.emoji.name)
        && this.getActivePlayer() === user 
        && !this.grid[col].isFull();
  }

  private getPlayerByPiece = (piece: Piece): Discord.User => piece === 1 ? this.player1 : this.player2;
  private getActivePlayer = (): Discord.User => this.getPlayerByPiece(this.activePlayerPiece);
  private stateAt = (col: Col, row: Row): State => this.grid[col].at(row);

  private checkDir = (col: number, row: number, piece: Piece, colDelta: colDir | 0, rowDelta: rowDir | 0): number => {
    if(!isCol(col) || !isRow(row) || this.stateAt(col, row) !== piece)
      return 0;
    return 1 + this.checkDir(col + colDelta, row + rowDelta, piece, colDelta, rowDelta);
  }

  private checkHorizontal = (col: Col, row: Row, piece: Piece): boolean => {
    return 1 
           + this.checkDir(col + colDir.Left, row, piece, colDir.Left, 0)
           + this.checkDir(col + colDir.Right, row, piece, colDir.Right, 0) 
        >= 4;
  }

  private checkVertical = (col: Col, row: Row, piece: Piece): boolean => {
    return 1 
           + this.checkDir(col, row + rowDir.Up, piece, 0, rowDir.Up)
           + this.checkDir(col, row + rowDir.Down, piece, 0, rowDir.Down) 
        >= 4;
  }

  private checkDiagonals = (col: Col, row: Row, piece: Piece): boolean => {
    return (1 
            + this.checkDir(col + colDir.Right, row + rowDir.Up, piece, colDir.Right, rowDir.Up)
            + this.checkDir(col + colDir.Left, row + rowDir.Down, piece, colDir.Left, rowDir.Down) 
         >= 4) 
        || (1 
            + this.checkDir(col + colDir.Right, row + rowDir.Down, piece, colDir.Right, rowDir.Down)
            + this.checkDir(col + colDir.Left, row + rowDir.Up, piece, colDir.Left, rowDir.Up) 
         >= 4);
  }

  private updateGameState = (col: Col, row: Row, piece: Piece) => {
    /* Check for game ending completions */
    if (this.checkHorizontal(col, row, piece)
     || this.checkVertical(col, row, piece)
     || this.checkDiagonals(col, row, piece))
      return this.endGame(this.getPlayerByPiece(piece));

    // Game continues
    this.updateGameMessage(this.renderEmbed());
  }

  private endGame = (winner?: Discord.User) => {
    const embed = buildEmbed({ title: 'Connect Four', description: `🔴${this.player1} vs 🔵${this.player2}` });
    embed.addField('Board', this.renderGrid());
    embed.addField('Result', winner ? 'Winner: ' + winner : 'Draw');
    this.updateGameMessage(embed);
    this.stopCollector('[connectFour] ended.');
  }

  private renderGrid = (): string => {
    let render = '';
    for (let row = this.columnHeight - 1 as Row; row >= 0; --row) {
      render += this.grid.reduce((prevCol, col) =>
        prevCol
          + (col.at(row) === 1 ? '🔴'
            : col.at(row) === 2 ? '🔵'
              : '⏹️')
      , '') + '\n';
    }
    render += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
    return render;
  }

  renderEmbed = (): RichEmbed => {
    const embed = buildEmbed({ title: 'Connect Four', description: `🔴${this.player1} vs 🔵${this.player2}` });
    embed.addField('Board', this.renderGrid());
    embed.addField('To Move', `${this.activePlayerPiece === 1 ? '🔴' : '🔵'}${this.getActivePlayer()}'s turn`);
    return embed;
  }
}

const connectFour: Command = {
  name: 'connectFour',
  aliases: ['c4', 'con4', 'conn4', 'connect4'],
  description: 'Challenge someone to a game of Connect Four.',
  minArgs: 1,
  usage: '`?connect4 (@user)`',
  cooldown: 30,
  guildOnly: true,
  execute: async (message, args) => {
    if (!message.mentions.users.first())
      throw new Error(`[connectFour] invalid mentioned user argument: ${message.mentions.users}`);

    const c4Game = new ConnectFourGame(message.author, message.mentions.users.first());

    const gameMessage = await message.channel.send(c4Game.renderEmbed()) as Discord.Message;
    gameMessage.react('1️⃣')
      .then(() => gameMessage.react('2️⃣'))
      .then(() => gameMessage.react('3️⃣'))
      .then(() => gameMessage.react('4️⃣'))
      .then(() => gameMessage.react('5️⃣'))
      .then(() => gameMessage.react('6️⃣'))
      .then(() => gameMessage.react('7️⃣'))
      .catch((error) => console.error(`[connectFour] Emoji failed to react in ${gameMessage}: ${error} `));
    c4Game.updateGameMessage = (embed: RichEmbed) => gameMessage.edit(embed);

    const collector = gameMessage.createReactionCollector(c4Game.moveFilter);
    collector.on('collect', (reaction, _) => {
      c4Game.drop(indexToEmoji.indexOf(reaction.emoji.name) as Col);
    });
    c4Game.stopCollector = (reason?: string) => collector.stop(reason);
  }
};

export const command = connectFour;
