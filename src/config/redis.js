const { createClient } = require('redis');
const config = require('./config');

const redisClient = createClient({
  url: config.redisUrl
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

redisClient.connect();

module.exports = redisClient;
