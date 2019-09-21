class Action {
  constructor() {
    this.CONNECT = 'connect';
    this.JOIN = 'join';
    this.RESIGN = 'resign';
    this.NEW_GAME = 'new_game';
    this.PLAY = 'play';
    this.PLAYER_LIST = 'player_list';
    this.DISCONNECTED = 'disconnected';
  }
}

module.exports = new Action();
