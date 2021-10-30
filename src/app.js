const cors = require('cors');
const express = require('express');

const logger = require('./libs/logger');
const indexRoute = require('./routes');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(logger.initEndpoint);
app.use('/', indexRoute);
app.use(logger.endEndpoint);

module.exports = app;
