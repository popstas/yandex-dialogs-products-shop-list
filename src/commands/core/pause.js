// пауза, пользователь молчит
module.exports = {
  intent: 'pause',
  matcher: 'пауза',

  async handler(ctx) {
    ctx.chatbase.setNotHandled();
    return ctx.reply('...');
  }
};
