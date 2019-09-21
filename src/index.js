const ws = require('ws');
const Message = require('./Message');
const Action = require('./Action');
const Player = require('./Player');
const Players = require('./Players');
const Utils = require('./Utils');

const WebSocketServer = ws.Server;
const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
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
            type: '0',
          };

          const playerDetails = {
            id: opponent.opponent.id,
            name: opponent.opponent.name,
            type: '1',
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
        player.opponent.sendMessage(message);
        break;
      }

      case Action.RESIGN: {
        const resign = new Message({ action: Action.RESIGN });
        if (player.opponent) {
          player.opponent.sendMessage(resign);
        }

        setTimeout(() => {
          player.opponent = null;
          players.remove(player.opponent);
          players.remove(player);
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
    if (player.opponent) {
      const message = new Message({ action: Action.DISCONNECTED });
      player.opponent.sendMessage(message);
    }

    // socket.terminate();
    Utils.sendJoined(players);
    console.log(`Disconnect: ${code} - ${reason}`);
  });
});

// /**
//  * Parameters
//  */
// const webSocketsServerPort = process.env.PORT || 3333;
// // Adapt to the listening port number you want to use
// /**
//  * Global variables
//  */
// // websocket and http servers
// const WebSocketServer = require('websocket').server;
// const express = require('express');

// const server = express();
// /**
//  * HTTP server to implement WebSockets
//  */
// // const server = http.createServer((request, response) => {
// //   // Not important for us. We're writing WebSocket server,
// //   // not HTTP server
// // });
// server.get('/', (req, res) => {
//   res.json({ message: 'Welcome to my Game server' });
// });
// server.listen(webSocketsServerPort, () => {
//   console.log(`${new Date()} Server is listening on port ${webSocketsServerPort}`);
// });

// /**
//  * WebSocket server
//  */
// const wsServer = new WebSocketServer({
//   // WebSocket server is tied to a HTTP server. WebSocket
//   // request is just an enhanced HTTP request. For more info
//   // http://tools.ietf.org/html/rfc6455#page-6
//   httpServer: server,
// });

// // -----------------------------------------------------------
// // List of all players
// // -----------------------------------------------------------
// const Players = [];

// function Player(id, connection) {
//   this.id = id;
//   this.connection = connection;
//   this.name = '';
//   this.opponentIndex = null;
//   this.index = Players.length;
// }

// Player.prototype = {
//   getId() {
//     return { name: this.name, id: this.id };
//   },
//   setOpponent(id) {
//     const self = this;
//     Players.find((player, index) => {
//       if (player.id === id) {
//         self.opponentIndex = index;
//         Players[index].opponentIndex = self.index;
//         return true;
//       }

//       return false;
//     });
//   },
// };

// // ---------------------------------------------------------
// // Routine to broadcast the list of all players to everyone
// // ---------------------------------------------------------
// function BroadcastPlayersList() {
//   const playersList = [];
//   Players.forEach((player) => {
//     if (player.name !== '') {
//       playersList.push(player.getId());
//     }
//   });

//   const message = JSON.stringify({
//     action: 'players_list',
//     data: playersList,
//   });

//   Players.forEach((player) => {
//     player.connection.sendUTF(message);
//   });
// }

// // This callback function is called every time someone
// // tries to connect to the WebSocket server
// wsServer.on('request', (request) => {
//   console.log('New Request', request.key);
//   const connection = request.accept(null, request.origin);

//   //
//   // New Player has connected.  So let's record its socket
//   //
//   const player = new Player(request.key, connection);

//   //
//   // Add the player to the list of all players
//   //
//   Players.push(player);

//   //
//   // We need to return the unique id of that player to the player itself
//   //
//   connection.sendUTF(JSON.stringify({ action: 'connect', data: player.id }));

//   //
//   // Listen to any message sent by that player
//   //
//   connection.on('message', (data) => {
//     //
//     // Process the requested action
//     //
//     const message = JSON.parse(data.utf8Data);
//     switch (message.action) {
//       default:
//         break;
//       //
//       // When the user sends the "join" action, he provides a name.
//       // Let's record it and as the player has a name, let's
//       // broadcast the list of all the players to everyone
//       //
//       case 'join':
//         player.name = message.data;
//         BroadcastPlayersList();
//         break;

//       //
//       // When a player resigns, we need to break the relationship
//       // between the 2 players and notify the other player
//       // that the first one resigned
//       //
//       case 'resign':
//         console.log('resigned');
//         Players[player.opponentIndex].connection.sendUTF(
//           JSON.stringify({ action: 'resigned' }),
//         );

//         setTimeout(() => {
//           Players[player.opponentIndex].opponentIndex = null;
//           player.opponentIndex = null;
//         }, 0);
//         break;

//       //
//       // A player initiates a new game.
//       // Let's create a relationship between the 2 players and
//       // notify the other player that a new game starts
//       //
//       case 'new_game':
//         player.setOpponent(message.data);
//         Players[player.opponentIndex].connection.sendUTF(
//           JSON.stringify({ action: 'new_game', data: player.name }),
//         );
//         break;

//       //
//       // A player sends a move.  Let's forward the move to the other player
//       //
//       case 'play':
//         Players[player.opponentIndex].connection.sendUTF(
//           JSON.stringify({ action: 'play', data: message.data }),
//         );
//         break;
//     }
//   });

//   // user disconnected
//   connection.on('close', (connection) => {
//     // We need to remove the corresponding player
//     // TODO
//   });
// });
