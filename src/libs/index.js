const logger = require('./logger');
const RedisCache = require('./cache');
const getRamdomAnimal = require('./animals');

module.exports = {
    logger,
    RedisCache,
    getRamdomAnimal,
}