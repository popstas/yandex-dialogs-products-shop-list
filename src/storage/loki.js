'use strict';

const BaseDriver = require('./base');
const loki = require('lokijs');

class LokiDriver extends BaseDriver {
  constructor(path) {
    super();
    this.path = path;
  }

  connect() {
    return new Promise((resolv, reject) => {
      this.db = new loki(this.path, {
        autoload: true,
        autoloadCallback: () => resolv(this.db),
        autosave: true,
        autosaveInterval: 4000
      });
    });
  }

  async getUserData(ctx) {
    // TODO: break when super validation failed
    super.getUserData(ctx);

    if (!this.db) {
      try {
        this.db = await this.connect();
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const sharedCollectionName = 'shared';
      const usersCollectionName = 'users';
      let userId = ctx.userId;

      // shared collection
      let shared = this.db.getCollection(sharedCollectionName);
      if (shared === null) {
        shared = this.db.addCollection(sharedCollectionName);
      }

      // users collection
      let users = this.db.getCollection(usersCollectionName);
      if (users === null) {
        users = this.db.addCollection(usersCollectionName);
      }

      // foreign userId
      const s = shared.data;
      let auth = {};
      if (s.length > 0) auth = s[0].auth;
      if (auth && auth[ctx.userId]) userId = auth[ctx.userId];

      let state = { userId };
      const stateRes = users.find({ userId: userId });
      if (stateRes.length > 0) state = stateRes[0];
      return { users, state, shared };
    } catch (err) {
      console.error(err);
    }
  }

  getState(userData) {
    return userData.state || {};
  }

  getShared(userData) {
    return userData.shared.data[0] || {};
  }

  setState(userData, state) {
    const found = userData.users.find({ userId: state.userId });
    if (found.length > 0) {
      userData.users.update(state);
    } else {
      userData.users.insert(state);
    }
  }

  setShared(userData, shared) {
    if (userData.shared.data.length == 0) {
      userData.shared.insert(shared);
    } else {
      userData.shared.update(shared);
    }
  }

  clearState(userData) {
    userData.state.clear();
  }

}

module.exports = LokiDriver;
