module.exports = {
  intent: 'thankyou',
  matcher: ['спс', 'все спасибо', 'спасибо', 'благодарю'],

  handler(ctx) {
    ctx.chatbase.setAsFeedback();

    return ctx.replyRandom([
      'Всегда пожалуйста',
      'Не за что',
      'Обращайся!',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста',
      'Пожалуйста'
    ]);
  }
};
