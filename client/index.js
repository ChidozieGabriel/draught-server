/* eslint-disable import/extensions */
import Message from './MessageClient.js';
import Action from './ActionClient.js';

const { JOIN, NEW_GAME, PLAY } = Action;

console.log('correct !');

const ws = new WebSocket('ws://localhost:8080');
// const ws = new WebSocket('wss://draught-server.herokuapp.com/');
const output = document.getElementById('output');
const join = document.getElementById('join');
const newGame = document.getElementById('new_game');
const play = document.getElementById('play');
const logStr = (eventStr, msg) => `<div>${eventStr}: ${msg}</div>`;
const toServer = (action) => {
  const data = document.getElementById('data').value;
  const message = new Message({ action, data });
  ws.send(message.toJSON());
};
join.addEventListener('click', () => {
  toServer(JOIN);
});
newGame.addEventListener('click', () => {
  toServer(NEW_GAME);
});
play.addEventListener('click', () => {
  toServer(PLAY);
});
ws.onmessage = (e) => {
  console.log(e.data);
  output.innerHTML += logStr('onmessage:Received', e.data);
};
ws.onclose = (e) => {
  output.innerHTML += logStr('Disconnected', `${e.code}-${e.type}`);
};
ws.onerror = (e) => {
  output.innerHTML += logStr('Error', e.data);
};

console.log('correct ! final !!');
