// пока
const utils = require('../../utils');

module.exports = {
  intent: 'sessionEnd',
  matcher: /^(пока |пока$|все пока$|выйти|выход|спасибо (пока|до свидания)|отбой$|выключи|отбой|всё$|хватит|закрой|закрыть|заканчиваем|закончить|спокойной ночи)/i,

  async handler(ctx) {
    return ctx.reply('До свидания!', [], { end_session: true });
  }
};
