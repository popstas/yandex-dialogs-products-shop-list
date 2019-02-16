'use strict';

const BaseDriver = require('./base');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

class MongoDriver extends BaseDriver {
  constructor(url, name, user, password) {
    super();
    this.url = url;
    this.name = name;
    this.user = user;
    this.password = password;
  }

  connect() {
    return MongoClient.connect(this.url, {
      useNewUrlParser: true,
      auth: {
        user: this.user,
        password: this.password
      }
    });
  }

  getUserData(ctx) {
    super.getUserData(ctx);

    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        try {
          const client = await this.connect();
          this.db = client.db(this.name);
          // console.log('mongo connected');
        } catch (err) {
          reject(err);
        }
      }

      try {
        const sharedCollectionName = 'shared';
        const usersCollectionName = 'users';
        let userId = ctx.userId;

        // shared collection
        let shared = await this.db.collection(sharedCollectionName);
        if (shared === null) {
          shared = await this.db.createCollection(sharedCollectionName);
        }

        // users collection
        let users = await this.db.collection(usersCollectionName);
        if (users === null) {
          users = await this.db.createCollection(usersCollectionName);
        }

        // foreign userId
        const s = await shared.find({ name: 'shared' }).toArray();
        let auth = {};
        if (s.length > 0) auth = s[0].shared.auth;
        if (auth && auth[ctx.userId]) userId = auth[ctx.userId];

        let state = { userId };
        const stateRes = await users.find({ userId: userId }).toArray();
        if (stateRes.length > 0) state = stateRes[0].state;

        resolve({ state, users, shared });
      } catch (err) {
        reject(err);
      }
    });
  }

  async getState(userData) {
    let state = userData.state || {};
    delete state.error;
    return state;
  }

  async getShared(userData) {
    let shared = await userData.shared.find({ name: 'shared' }).toArray();
    let result = shared.length > 0 ? shared[0].shared : {};
    if (Array.isArray(result)) result = {};
    return result;
  }

  async setState(userData, state) {
    const result = await userData.users.updateOne(
      { userId: state.userId },
      { $set: { state } },
      { upsert: true }
    );
  }

  async setShared(userData, shared) {
    const result = await userData.shared.updateOne(
      { name: 'shared' },
      { $set: { shared } },
      { upsert: true }
    );
  }

  async clearState(userData) {
    await userData.state.deleteMany({});
  }
}

module.exports = MongoDriver;
