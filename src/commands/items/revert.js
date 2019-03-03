module.exports = {
  intent: 'revert',
  matcher: /^(верни назад|верни как было|забудь|удали(ть)?|убрать|убери|сотри|стереть|отмени(ть)?|отмена|не то|неправильно|не так) ?(последн(ее|ий|ие|их))? ?(запись|это|его|удаление|очистку|изменени(е|я|й)|добавление)?$/i,

  async handler(ctx) {
    const lastMessageShopAction = ctx.user.state.lastRequest && ctx.user.state.lastRequest.entities.shop.action || '';
    const lastShopAction =
      (ctx.user.state.lastShopAction && ctx.user.state.lastShopAction.action) || '';

    // удалить весь список после того, как его спросили
    if (['list', 'listAny'].includes(lastMessageShopAction)) {
      return ctx.confirm(
        'Вы точно хотите очистить список покупок?',
        async ctx => {
          ctx.entities.shop.action = 'clear';
          ctx.entities.shop.productsRemoved = ctx.user.state.products;
          ctx.user.state.products = [];
          return await ctx.reply('Список покупок очищен');
        },
        ctx => ctx.reply('ОК')
      );
    }

    // удалить добавленное
    if (['add', 'remove', 'clear', 'revert'].includes(lastShopAction)) {
      const added = ctx.user.state.lastShopAction.productsAdded || [];
      const removed = ctx.user.state.lastShopAction.productsRemoved || [];

      ctx.entities.shop.action = 'revert';
      ctx.entities.shop.productsAdded = removed; // это не ошибка, added - бывший removed
      ctx.entities.shop.productsRemoved = added;

      // удалить все продукты, добавленные в прошлый раз
      ctx.user.state.products = ctx.user.state.products.filter(p => added.indexOf(p) == -1);

      // добавить все продукты, удаленные в прошлый раз
      ctx.user.state.products = [...ctx.user.state.products, ...removed];

      let text = [];
      if (added.length > 0) text.push('Удалены ' + ctx.az.andList(added));
      if (removed.length > 0) text.push('Добавлены ' + ctx.az.andList(removed));
      return await ctx.reply(text);
    }

    return ctx.reply('Я ничего не запоминала в последнее время...');
  }
};
