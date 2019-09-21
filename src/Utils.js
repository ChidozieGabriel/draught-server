const Action = require('./Action');
const Message = require('./Message');

class Utils {
  static sendJoined(players, player) {
    const joined = players.get().filter(each => each.isJoined && !each.isPlaying);
    const playerList = new Message({
      action: Action.PLAYER_LIST,
      data: joined,
    });

    if (player) {
      player.sendMessage(playerList);
    } else {
      players.sendMessage(playerList);
    }
  }
}

module.exports = Utils;
