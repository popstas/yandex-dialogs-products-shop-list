'use strict';

class BaseDriver {
  constructor() {
    this.db = null;
  }

  connect() {}

  getUserData(ctx) {
    let userId = ctx.userId;
    if (!userId) {
      return ctx.reply('Не указан идентификатор пользователя');
    }
  }

  getState(userData) {}

  clearData(userData) {}

  storeAnswer(userData, question, answer) {}
}

module.exports = BaseDriver;
