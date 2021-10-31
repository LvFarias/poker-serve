const debugLib = require('debug');

const dbLog = debugLib('Poker-API:db');
const db = (query, ...args) => {
    dbLog(query);
};
const info = debugLib('Poker-API:info');
const file = debugLib('Poker-API:file');
const debug = debugLib('Poker-API:debug');
const error = debugLib('Poker-API:error');
const server = debugLib('Poker-API:server');

const initEndpoint = (req, res, next) => {
    initLog(`${req.method}: ${req.url}`);
    req.returnObj = {
        data: {},
        error: '',
        message: '',
        status: 200,
    };

    req.success = (data = {}) => {
        req.returnObj.data = data;
        req.returnObj.status = 200;
        next();
    };

    req.error = (error, message = '', status = 400) => {
        req.returnObj.error = error;
        req.returnObj.status = status;
        req.returnObj.message = message;
        next();
    };

    next();
}

const endEndpoint = (req, res) => {
    const status = req.returnObj.status;
    delete req.returnObj.status;
    if (!req.returnObj.error) delete req.returnObj.error;
    if (!req.returnObj.message) delete req.returnObj.message;
    if (!Object.keys(req.returnObj.data).length) delete req.returnObj.data;
    endLog(`${req.method}: ${req.url}`, { status: res.statusCode, origin: res.req.headers.origin });
    return res.status(status).json(req.returnObj);
}

const initLog = (event, data = {}) => {
    let msg = `INIT --> ${event}`;
    for (const key in data) {
        const value = data[key];
        msg += ` - ${key.toUpperCase()}: ${JSON.stringify(value)}`;
    }
    server(msg);
}

const endLog = (event, data = {}) => {
    let msg = `END --> ${event}`;
    for (const key in data) {
        const value = data[key];
        msg += ` - ${key.toUpperCase()}: ${JSON.stringify(value)}`;
    }
    server(msg);
}

module.exports = {
    db,
    info,
    file,
    debug,
    error,
    server,
    endLog,
    initLog,
    endEndpoint,
    initEndpoint,
};
