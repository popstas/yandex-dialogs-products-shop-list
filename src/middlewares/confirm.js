module.exports = () => (ctx, next) => {
  // сбросить подтверждение, если человек вышел-зашел
  if (ctx.message == '') {
    ctx.session.set('confirm', null);
  }

  // options: { anyCommand: function, optional: false }
  ctx.confirm = async (reply, yesCommand, noCommand, options) => {
    ctx.session.set('confirm', { yesCommand, noCommand, options, reply });
    return await ctx.reply(reply, ['да', 'нет']);
  };

  /* ctx.confirmHandler()

  const confirm = ctx.session.get('confirm');
  if (confirm) return handler(ctx, confirm); */

  return next(ctx);
};
