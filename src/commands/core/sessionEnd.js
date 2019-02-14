// пока
const utils = require('../../utils');

module.exports = {
  intent: 'sessionEnd',
  matcher: /^(спасибо |все |ладно )?(пока |пока$|выйти|выход|до свидания|отбой$|выключи|отбой|всё$|хватит|закрой|закрыть|заканчиваем|закончить|спокойной ночи|домой$)/i,

  async handler(ctx) {
    return ctx.reply('До свидания!', [], { end_session: true });
  }
};
