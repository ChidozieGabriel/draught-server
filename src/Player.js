const uuid = require('uuid/v4');

class Player {
  constructor(connection) {
    this.id = uuid();
    this.connection = connection;
    this.name = null;
    this.opponent = null;
  }

  static valid(name) {
    return typeof name === 'string' && Boolean(name.trim());
  }

  isReady() {
    return this.connection.readyState === 1;
  }

  sendMessage(message) {
    if (this.isReady) {
      this.connection.send(message.toJSON());
    }
  }

  isJoined() {
    return !!this.name;
  }

  isPlaying() {
    return !!this.opponent;
  }

  get() {
    return {
      id: this.id,
      name: this.name,
      isJoined: this.isJoined(),
      isPlaying: this.isPlaying(),
    };
  }

  toJSON() {
    return JSON.stringify(this.get());
  }
}

module.exports = Player;
