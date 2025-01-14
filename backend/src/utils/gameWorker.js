/* eslint-disable no-underscore-dangle */
const { parentPort } = require('worker_threads');
const globalTime = require('global-time');
const DatabaseConnection = require('../db/database.helper');

const orgId = process.argv[2];
const gameId = process.argv[3];

const gameRepo = new DatabaseConnection('003test_game', orgId);

const timer = setInterval(async () => {
  const game = await gameRepo.fetchOne(gameId);
  if (!game.data) {
    clearInterval(timer);
    return;
  }

  const time = await globalTime();

  if (time - game.data.modifiedAt > 5 * 60 * 1000) {
    await gameRepo.delete(game.data._id, game.data);
    parentPort.postMessage(`${orgId}:${gameId}`);
  }
}, 5 * 60 * 1000);

parentPort.on('message', (data) => {
  if (data.toString() === 'stop') clearInterval(timer);
});
