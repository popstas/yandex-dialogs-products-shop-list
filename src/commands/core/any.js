// сюда попадает всё нераспознанное

module.exports = {
  intent: '',
  matcher: null,

  async handler(ctx) {
    if (ctx.message != 'ping') ctx.logMessage(`> ${ctx.message} (any)`);

    ctx.chatbase.setNotHandled();
    return ctx.replyRandom(
      [
        'Не поняла',
        'О чём вы?',
        'Может вам нужна помощь? Скажите "помощь"',
        'Похоже, мы друг друга не понимаем, скажите "примеры"',
        '[behind_the_wall]Плохо вас слышу!',
        '[megaphone]Говорите громче!',
        '[hamster]что вы хотите? Я не понимаю'
      ],
      ['помощь', 'примеры']
    );
  }
};
