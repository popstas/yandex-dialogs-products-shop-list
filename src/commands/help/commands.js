module.exports = {
  intent: 'helpCommands',
  matcher: 'команды',

  handler(ctx) {
    const buttons = [
      'список',
      'добавь хлеб',
      'удали хлеб',
      'отмена',
      'забудь всё',
      'забудь последнее',
      'очисти список',
      'что нового',
      'авторизация'
    ];

    return ctx.reply(['Вот примеры разных команд:', buttons.join(',\n')], buttons);
  }
};
