const Player = require('./Player');

// eslint-disable-next-line no-underscore-dangle
const _player = new Player();

class Players {
  constructor() {
    this.players = [];
  }

  add(player) {
    this.players.push(player);
  }

  remove(player) {
    this.players.pop(player);
  }

  removeById(id) {
    console.log('before: ', this.get());
    this.players = this.players.filter(player => player.id !== id);
    console.log('after: ', this.get());
  }

  get() {
    return Players.toJSON(this.players);
  }

  static ids(players = []) {
    return players.map(player => player.id);
  }

  static toJSON(players = []) {
    return players.map(player => player.get());
  }

  getById(id) {
    return this.players.find(player => player.id === id);
  }

  // getJoined

  // getAvailable() {
  //   const availables = [];
  //   this.players.forEach((player) => {
  //     console.log(player.id, 'is joined: ', player.isJoined());
  //     console.log(player.id, 'is playing: ', player.isPlaying());

  //     if (!player.isJoined() && !player.isPlaying()) {
  //       console.log('so, is available');
  //       availables.push(player);
  //     }
  //   });

  //   return availables;
  // }

  // sendToAvailable(message) {
  //   this.getAvailable().forEach((player) => {
  //     player.sendMessage(message);
  //   });
  // }

  sendMessage(message) {
    Players.sendMessage(this.players, message);
  }

  static sendMessage(players = [], message) {
    players.forEach((player) => {
      player.sendMessage(message);
    });
  }
}

module.exports = Players;
