const socketIo = require('socket.io');
const roomService = require('./rooms');
const { logger, RedisCache, getRamdomAnimal } = require('../libs');

const cache = new RedisCache();

const initSocket = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        socket.on('room:create', (msg) => { callEvent('room:create', msg, createRoom, { io, socket }); });
        socket.on('user:signin', (msg) => { callEvent('user:signin', msg, signInRoom, { io, socket }); });
        socket.on('room:change', (msg) => { callEvent('room:change', msg, roomChange, { io, socket }); });
        socket.on('user:change', (msg) => { callEvent('user:change', msg, userChange, { io, socket }); });
        socket.on('user:leave', (msg) => { callEvent('user:leave', msg, userLeave, { io, socket }); });
        socket.on('disconnect', (msg) => { callEvent('user:leave', msg, userLeave, { io, socket }); });
    });
    return io;
}

const callEvent = async (event, data, callbackFn, sti) => {
    logger.initLog('Socket', { event, data });

    // const roomIds = listRooms(sti.io.sockets.adapter.rooms);
    const ret = await callbackFn(sti.io, sti.socket, data);

    // cache.deleteAllWithFilter(roomIds);
    logger.endLog('Socket', { event, ret });
}

const createRoom = async (io, socket, data) => {
    const roomId = (Math.random() + 1).toString(36).substring(7);

    await socket.join(roomId);

    const room = await roomService.create({
        users: [],
        average: 0,
        id: roomId,
        cardTypeId: 1,
        showVotes: false,
        owner: socket.id,
        name: data.roomName,
    });

    socket.emit(`room:created`, room);

    return room;
}

const signInRoom = async (io, socket, data) => {
    let room = await roomService.getById(data.roomId).catch(logger.error);

    if (!room) {
        socket.emit('error:room-not-found');
        return 'error:room-not-found';
    }

    await socket.join(room.id);

    if (!data.user.id) data.user.id = socket.id;
    if (!data.user.name) data.user.name = getRamdomAnimal(room.users.map(u => u.name));

    room = await roomService.addUser(room, data.user).catch(logger.error);

    io.sockets.in(room.id).emit('room:changed', room);

    return room;
}

const roomChange = async (io, socket, data) => {
    const room = await roomService.update(data.roomData).catch(logger.error);
    io.sockets.in(room.id).emit('room:changed', room);
    return room;
}

const listRooms = (roomsMap) => {
    const list = [];
    for (const key of roomsMap)
        if (key[0].length <= 7) list.push(key[0]);
    return list;
}

const userChange = async (io, socket, data) => {
    // const roomId = listRooms(socket.adapter.rooms)[0];
    // if (!roomId) {
    //     socket.emit('error:room-not-found');
    //     return 'error:room-not-found';
    // }

    const room = await roomService.changeUser(roomId, data.userData).catch(logger.error);
    io.sockets.in(room.id).emit('room:changed', room);
    return room;
}

const userLeave = async (io, socket, data) => {
    const roomIds = listRooms(socket.adapter.rooms);
    for (const roomId of roomIds) {
        const room = await roomService.removeUser(roomId, socket.id).catch(logger.error);
        if (room) io.sockets.in(room.id).emit('room:changed', room);
    }
    return 'leave to all rooms';
}

module.exports = {
    initSocket
}