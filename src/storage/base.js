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

  setState(userData, state) {}
}

module.exports = BaseDriver;
