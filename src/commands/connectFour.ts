import Discord, { RichEmbed, MessageReaction } from 'discord.js';
import { Command } from './Command';
import { buildEmbed } from '../utils/buildEmbed';

const emojis = new Set(['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']);
const indexToEmoji = [...emojis];

type Piece = 1 | 2;
type State = Piece | 0;
type Row = 0 | 1 | 2 | 3 | 4 | 5;

class ColumnStack {
  private topIndex: Row = 0;
  private container: Piece[] = [];
  constructor(private capacity: number) { }

  drop = (p: Piece) => {
    if (this.isFull())
      throw new Error('[connectFour] Invalid drop attempt - full');
    this.container[this.topIndex] = p;
    ++this.topIndex;
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
  private activePlayer: Discord.User;
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
    this.activePlayer = this.player1;
    console.log(`[connectFour] Match started - player1: ${this.player1.username}, player2: ${this.player2.username}`);
  }

  drop = (col: number) => {
    this.grid[col].drop(this.activePlayer === this.player1 ? 1 : 2);
    this.activePlayer = (this.activePlayer === this.player1) ? this.player2 : this.player1;
    console.log(`[connectFour] activePlayer is now ${this.activePlayer.username}`);

    this.updateGameState();
  }

  moveFilter = (reaction: MessageReaction, user: Discord.User): boolean => {
    const col = indexToEmoji.indexOf(reaction.emoji.name);
    return emojis.has(reaction.emoji.name)
        && this.activePlayer === user 
        && !this.grid[col].isFull();
  }

  private getPlayerByMark = (mark: number): Discord.User => mark === 1 ? this.player1 : this.player2;

  private updateGameState = () => {
    /* Check for game ending completions */

    // Game continues
    this.updateGameMessage(this.renderEmbed());
  }

  private endGame = (winner?: Discord.User) => {
    const embed = buildEmbed({ title: 'Tic-Tac-Toe', description: `❌${this.player1} vs ⭕${this.player2}` });
    embed.addField('Board', this.renderGrid());
    embed.addField('Result', winner ? 'Winner: ' + winner : 'Draw');
    this.updateGameMessage(embed);
    this.stopCollector('[ticTacToe] ended.');
  }

  private renderGrid = (): string => {
    let render = '';
    render += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
    render += '⬛⬛⬛⬛⬛⬛⬛\n';
    for (let row = this.columnHeight - 1 as Row; row >= 0; --row) {
      render += this.grid.reduce((prevCol, col) =>
        prevCol
          + (col.at(row) === 1 ? '🔴'
            : col.at(row) === 2 ? '🔵'
              : '⏹️')
      , '') + '\n';
    }
    return render;
  }

  renderEmbed = (): RichEmbed => {
    const embed = buildEmbed({ title: 'Connect Four', description: `🔴${this.player1} vs 🔵${this.player2}` });
    embed.addField('Board', this.renderGrid());
    embed.addField('To Move', `${this.activePlayer}'s turn`);
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
      c4Game.drop(indexToEmoji.indexOf(reaction.emoji.name));
    });
    c4Game.stopCollector = (reason?: string) => collector.stop(reason);
  }
};

export const command = connectFour;
