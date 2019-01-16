const Az = require('az');

// задает ctx.entities.shop.add и remove
const plusMinusParse = ctx => {
  const replaceMap = {
    плюс: 'add',
    минус: 'remove'
  };

  // 'плюс один минус два товар плюс три' ->
  // '|add один |remove два товар |add три' ->
  // ['add один', 'remove два товар', 'add три']
  const pairs = ctx.message
    .split(' ')
    .map(word => {
      if (replaceMap[word]) {
        word = '|' + replaceMap[word];
      }
      return word;
    })
    .join(' ')
    .replace(/^\|/, '')
    .split('|');

  const actions = [];
  pairs.forEach(pair => {
    const words = pair.trim().split(' ');
    const action = words.splice(0, 1)[0];
    const products = words.join(' ');
    if (!products) return;
    actions.push({ action, products });
  });

  return actions;
};

// распознает список покупок
module.exports = () => (ctx, next) => {
  ctx.entities = ctx.entities || {};

  const words = ctx.message.split(' ');
  const posts = words.map(word => {
    const morph = Az.Morph(word);
    if (morph.length === 0) return '?';
    return morph[0].tag.POST;
  });

  // слова в начальных формах
  const inf = words.map(word => {
    const morph = Az.Morph(word);
    if (morph.length === 0) return '?';
    return morph[0].normalize().word;
  });

  if (!ctx.entities.shop) {
    ctx.entities.shop = {
      actions: [], // plusMinus only
      action: '',
      products: []
    };
  }

  // плюс-минус, как в https://dialogs.yandex.ru/store/skills/19170605-golosovoj-spisok-plyus-minus
  // главнее других
  const plusMinusWords = ['плюс', 'минус'];
  if (plusMinusWords.includes(inf[0])) {
    const actions = plusMinusParse(ctx);
    if (actions.length > 0) {
      ctx.entities.shop.action = 'plusMinus';
      ctx.entities.shop.actions = actions;
      return next(ctx);
    } else {
      ctx.entities.shop.action = 'listAny';
      return next(ctx);
    }
  }

  // пересечение массивов на магазинные слова
  const shopWords = ['магазин', 'купить', 'покупка', 'заказать', 'список', 'добавить'];
  if (shopWords.filter(word => inf.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'list';
  }

  if (!ctx.entities.shop.action) return next(ctx);

  const addActionWords = ['добавить', 'купить', 'запомнить'];
  if (
    !ctx.message.match(/^что /) &&
    addActionWords.filter(word => inf.indexOf(word) != -1).length > 0
  ) {
    ctx.entities.shop.action = 'add';
  }

  const removeActionWords = ['удаль', 'удалить', 'убрать', 'стереть', 'вычеркнуть'];
  if (removeActionWords.filter(word => inf.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'remove';
  }

  const clearActionWords = ['очистить'];
  if (clearActionWords.filter(word => inf.indexOf(word) != -1).length > 0) {
    ctx.entities.shop.action = 'clear';
  }

  if (ctx.entities.shop.action) {
    const trashWords = [
      ...shopWords,
      ...addActionWords,
      ...removeActionWords,
      ...clearActionWords,
      ...['надо', 'добавить', 'список', 'покупка', 'еще', 'ещё', 'в', 'и', 'из']
    ];
    const products = inf.filter(word => trashWords.indexOf(word) == -1);
    ctx.entities.shop.products = products.filter(Boolean);
    if (ctx.entities.shop.products.length == 0 && ctx.entities.shop.action != 'clear') {
      ctx.entities.shop.action = 'listAny'; // если не нашлось продуктов
    }
  }

  // console.log('ctx.entities: ', ctx.entities);
  return next(ctx);
};