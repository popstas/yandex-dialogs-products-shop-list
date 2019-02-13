const storage = require('../storage');

// прописывает данные в контекст
module.exports = () => async (ctx, next) => {
  try {
    ctx.userData = await storage.getUserData(ctx);
    ctx.user = {
      state: await storage.getState(ctx.userData),
      shared: await storage.getShared(ctx.userData)
    };
  } catch (e) {
    ctx.user = {
      data: {},
      state: { error: 'database' },
      shared: {}
    };
    console.log(e);
  }
  return next(ctx);
};
