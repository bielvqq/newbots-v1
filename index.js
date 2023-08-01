require('dotenv').config();

const Client = require('./src/client.js');
const client = new Client();

client.onLoad();

process.on('uncaughtException', err => console.log(err));

process.on('unhandledRejection', err => console.log(err));