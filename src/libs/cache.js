const redis = require('redis');

class RedisCache {
    constructor() {
        this.time = 0;
        this.client = null;
        this.interval = null;
    }

    connect() {
        return new Promise((res, rej) => {
            this.time = 0;
            if (!this.client) {
                if (process.env.NODE_ENV == 'dev') this.client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, { db: process.env.REDIS_DB });
                else this.client = redis.createClient(process.env.REDIS_URL);
                this.interval = setInterval(() => this.closeTimeout(), 60000);
            }
            res(this.client);
        });
    };

    get(key) {
        return new Promise(async (res, rej) => {
            await this.connect();
            this.client.get(key, async (err, result) => {
                if (err) rej(err);
                res(result);
            });
        });
    }

    set(key, value, expires = 86000) {
        return new Promise(async (res, rej) => {
            await this.connect();
            this.client.set(key, value, 'EX', expires, async (err, result) => {
                if (err) rej(err);
                res(result);
            });
        })
    }

    delete(key) {
        return new Promise(async (res, rej) => {
            await this.connect();
            this.client.del(key, async (err, result) => {
                if (err) rej(err);
                res(result);
            });
        });
    }

    deleteAllWithFilter(filter) {
        return new Promise(async (res, rej) => {
            await this.connect();
            this.client.keys('*', (err, result) => {
                if (err) rej(err);
                for (const key of result)
                    if (!filter.includes(key)) this.delete(key).catch(rej);
                res(result);
            });
        });
    }

    deleteByFilter(filter) {
        return new Promise(async (res, rej) => {
            await this.connect();
            this.client.keys(filter, (err, result) => {
                if (err) rej(err);
                for (const key of result) this.delete(key).catch(rej);
                res(result);
            });
        });
    }

    closeTimeout() {
        this.time++;
        if (this.time >= process.env.REDIS_TIMEOUT) {
            this.close();
            this.time = 0;
            clearInterval(this.interval);
        }
    }

    close() {
        return new Promise((res, rej) => {
            this.client.end();
            this.client = null;
            res(this.client);
        });
    }
};

module.exports = RedisCache;