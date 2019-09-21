const ws = require('ws');
const http = require('http');
const Message = require('./Message');
const Action = require('./Action');
const Player = require('./Player');
const Players = require('./Players');
const Utils = require('./Utils');

const server = http.createServer();
const WebSocketServer = ws.Server;
const PORT = 8080;
const wss = new WebSocketServer({ server });
server.listen(PORT);
const players = new Players();
console.log('start');

wss.on('connection', (socket) => {
  const player = new Player(socket);
  players.add(player);
  const connect = new Message({ action: Action.CONNECT, data: player.id });
  player.sendMessage(connect);
  Utils.sendJoined(players, player);

  console.log(`Connected! to ${player.id}`);

  socket.on('message', (data) => {
    console.log(`From: ${player.id}`, data);
    const message = Message.fromJSON(data);

    switch (message.action) {
      case Action.JOIN: {
        if (!Player.valid(message.data)) break;
        player.name = message.data;
        Utils.sendJoined(players);
        break;
      }

      case Action.NEW_GAME: {
        if (!Player.valid(player.name)) break;
        const opponent = players.getById(message.data);
        if (opponent) {
          player.opponent = opponent;
          opponent.opponent = player;
          const opponentDetails = {
            id: player.opponent.id,
            name: player.opponent.name,
            isA: false,
          };

          const playerDetails = {
            id: opponent.opponent.id,
            name: opponent.opponent.name,
            isA: true,
          };

          const newGame = new Message({ action: Action.NEW_GAME });
          opponent.sendMessage(newGame.setData(playerDetails));
          player.sendMessage(newGame.setData(opponentDetails));
          Utils.sendJoined(players);
        }

        break;
      }

      case Action.PLAY: {
        if (!player.opponent) break;
        player.sendMessage(message);
        player.opponent.sendMessage(message);
        break;
      }

      case Action.RESIGN: {
        const resign = new Message({ action: Action.RESIGN });
        if (player.opponent) {
          player.opponent.sendMessage(resign);
        }

        setTimeout(() => {
          player.opponent.opponent = null;
          player.opponent = null;
          Utils.sendJoined(players);
        }, 0);
        break;
      }

      default:
        break;
    }
  });

  socket.on('close', (code, reason) => {
    players.removeById(player.id);
    const { opponent } = player;
    if (opponent) {
      const message = new Message({ action: Action.DISCONNECTED });
      opponent.sendMessage(message);
      opponent.opponent = null;
    }

    Utils.sendJoined(players);
    console.log(`Disconnect: ${code} - ${reason}`);
  });
});
