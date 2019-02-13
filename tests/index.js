'use strict';
const { Scenarios } = require('./scenarios');
process.env.DB_DRIVER = 'loki'; // должен быть перед конфигом
const defaultConfig = require('../src/config');
const app = require('../src/app');

// const url = process.env.URL || 'https://whatis.dialogs.popstas.ru';
const port = 28464;
const url = process.env.URL || 'http://localhost:' + port;

const config = {
  ...defaultConfig,
  ...{
    YAMETRIKA_ID: '',
    CHATBASE_KEY: ''
  }
};
const bot = new app(config);
bot.listen(port);

(async () => {
  const scenarios = new Scenarios('./static/scenarios.yml', url);
  setTimeout(async () => {
    // без этого не успевает app.init() отработать
    try {
      const isErrors = await scenarios.run();
      const ok = scenarios.scenarios.length - scenarios.failed.length;
      const failed = scenarios.failed.length;
      console.log(`ok: ${ok}, failed: ${failed}`);
      if (isErrors) {
        console.log(
          'Failed scenarios: ',
          scenarios.failed.map(scenario => scenario.name).join(', ')
        );
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }, 500);
})();
