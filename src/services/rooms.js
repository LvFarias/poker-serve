const { logger, RedisCache } = require('../libs');

const cache = new RedisCache();

const getById = async (roomId) => {
    return new Promise(async (res, rej) => {
        cache.get(roomId).then(room => res(JSON.parse(room))).catch(rej);
    });
}

const create = async (roomData) => {
    return new Promise(async (res, rej) => {
        cache.set(roomData.id, JSON.stringify(roomData)).then(() => res(roomData)).catch(rej);
    });
}

const addUser = async (room, user) => {
    return new Promise(async (res, rej) => {
        if (!room.users.find(u => u.id == user.id)) room.users.push(user);
        cache.set(room.id, JSON.stringify(room)).then(() => res(room)).catch(rej);
    });
}

const removeUser = async (roomId, userId) => {
    return new Promise(async (res, rej) => {
        const room = await getById(roomId).catch(rej);
        room.users = room.users.filter(u => u.id != userId);

        if (room.users.length > 0) {
            if (room.owner == userId) room.owner = room.users[0].id;
        }
        cache.set(room.id, JSON.stringify(room)).then(() => res(room)).catch(rej);
    });
}

const update = async (room) => {
    return new Promise(async (res, rej) => {
        cache.set(room.id, JSON.stringify(room)).then(() => res(room)).catch(rej);
    });
}

const changeUser = async (roomId, user) => {
    return new Promise(async (res, rej) => {
        const room = await getById(roomId).catch(rej);
        let sum = 0;
        room.users = room.users.map(u => {
            if (u.id == user.id) u = user;
            sum += u.vote || 0;
            return u;
        });
        room.average = Math.round(sum / room.users.length);
        cache.set(room.id, JSON.stringify(room)).then(() => res(room)).catch(rej);
    });
}

module.exports = {
    update,
    create,
    getById,
    addUser,
    removeUser,
    changeUser,
}