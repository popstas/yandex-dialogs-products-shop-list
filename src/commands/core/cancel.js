// отмена всех текущих процессов сцен
const utils = require('../../utils');

module.exports = {
  intent: 'cancel',
  matcher: /^(стоп)/i,

  async handler(ctx) {
    ctx.chatbase.setNotHandled();
    return ctx.reply('Всё отменено, чтобы выйти, скажите "Хватит"');
  }
};
