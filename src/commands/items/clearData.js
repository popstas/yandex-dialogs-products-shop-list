const storage = require('../../storage');
const utils = require('../../utils');

module.exports = {
  intent: 'clearDataConfirm',
  matcher: ['забудь всё', 'забудь все', 'удали все', 'забыть все', 'сотри все', 'стереть все'],

  async handler(ctx) {
    return ctx.confirm(
      'Точно?',
      async ctx => {
        ctx.chatbase.setIntent('clearData');
        ctx.logMessage(`> ${ctx.message} (clearData)`);

        ctx.user.state.products = [];
        return ctx.reply('Всё забыла...');
      },
      ctx => ctx.reply('Как хочешь')
    );
  }
};
