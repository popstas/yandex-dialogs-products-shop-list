const Az = require('az');
const storage = require('./storage');
const { Stage } = require('yandex-dialogs-sdk');
// здесь мелкие обработки текста

module.exports.initMorph = async () => {
  await new Promise(resolve => Az.Morph.init(resolve));
};

// возвращает массив частей речи фразы
const getMsgPosts = msg => {
  if (msg === '' || !msg) return [];
  const words = msg.split(' ');

  // части речи
  const posts = words.map(word => {
    const morph = Az.Morph(word);
    if (morph.length === 0) return '?';
    return morph[0].tag.POST.replace('INFN', 'VERB') // инфинитив
      .replace('PRTS', 'VERB'); // причастие
    // .replace('PRED', 'VERB') // предикатив (надо)
  });
  return posts;
};
module.exports.getMsgPosts = getMsgPosts;
