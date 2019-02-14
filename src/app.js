'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Alice, Stage, Scene, Reply } = require('yandex-dialogs-sdk');
const middlewares = require('./middlewares');
const packageJson = require('../package.json');
const defaultConfig = require('./config');
const commands = require('./commands');
const entities = require('./entities');
const utils = require('./utils');

const useCommand = commands.utils.useCommand;

const alice = new Alice();
class YandexDialogsWhatis {
  constructor(config = defaultConfig) {
    this.config = config;
    this.init();
  }

  async init() {
    // добавляют функции в ctx
    alice.use(middlewares.reply());
    alice.use(middlewares.replyRandom());
    alice.use(middlewares.az());
    alice.use(middlewares.logMessage());
    alice.use(middlewares.yametrika(this.config.YAMETRIKA_ID));
    alice.use(middlewares.chatbase(this.config.CHATBASE_KEY, packageJson.version));

    // изменяют ctx во время запроса
    alice.use(middlewares.store());
    alice.use(middlewares.cleaner());
    alice.use(middlewares.counter());

    alice.use(middlewares.confirm());

    alice.use(entities.shop());

    await utils.initMorph();

    // подключение всех команд
    commands.utils.useCommands(alice, commands.core);
    commands.utils.useCommands(alice, commands.items);
    commands.utils.useCommands(alice, commands.help);

    alice.any(commands.core.any.handler);
  }

  // returns express instance
  handlerExpress() {
    const app = express();
    app.use(bodyParser.json());
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
    app.use(express.static('static'));
    app.post(this.config.API_ENDPOINT, async (req, res) => {
      const jsonAnswer = await alice.handleRequest(req.body);
      res.json(jsonAnswer);
    });
    return app;
  }

  listen(port) {
    const app = this.handlerExpress();
    app.listen(port);
    console.log('listen ' + port);
  }
}

module.exports = YandexDialogsWhatis;
