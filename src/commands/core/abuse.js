// оскорбление
module.exports = {
  intent: 'abuse',
  matcher: /(тупая|тупой|дура|идиотка|глупенькая|мразь|$иди на|$иди в|ты тормоз|ты курица|ты гонишь|ты глупая)/i,

  handler(ctx) {
    ctx.chatbase.setNotHandled();
    ctx.chatbase.setAsFeedback();

    return ctx.replyRandom([
      'Вот сейчас обидно было...',
      'Я быстро учусь, вернитесь через пару дней и убедитесь...',
      'Я такая тупая...'
    ]);
  }
};
