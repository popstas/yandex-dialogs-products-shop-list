const storage = require('../../storage');
const utils = require('../../utils');

module.exports = {
  intent: 'clearDataAllConfirm',
  matcher: 'забудь все вообще',

  async handler(ctx) {
    return ctx.confirm('Точно?', clearDataAll, ctx => ctx.reply('Как хочешь'));
  }
};

const clearDataAll = async ctx => {
  ctx.chatbase.setIntent('clearDataAll');
  ctx.logMessage(`> ${ctx.message} (clearDataAll)`);

  [
    'answer',
    'deleteFails',
    'lastAddedItem',
    'lastRequest',
    'lastWelcome',
    'products',
    'question',
    'referer',
    'stage',
    'tourStep',
    'visit',
    'visitor',
    'webhooks'
  ].forEach(name => {
    delete ctx.user.state[name];
  });
  return ctx.reply('Вообще всё забыла...');
};
