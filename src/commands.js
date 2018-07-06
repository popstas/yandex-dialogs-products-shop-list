'use strict';
const storage = require('./storage');
const Fuse = require('fuse.js');

const STAGE_IDLE = 'STAGE_IDLE';
const STAGE_WAIT_FOR_ANSWER = 'STAGE_WAIT_FOR_ANSWER';

// процесс ответа на вопрос, кажется, это называется fullfillment
// https://github.com/dialogflow/dialogflow-fulfillment-nodejs
const processAnswer = async (ctx, userData) => {
  const q = ctx.messsage.replace(/^запомни/, '').trim();
  const replyMessage = ctx.replyBuilder;

  if (!ctx.state.stage || ctx.state.stage === STAGE_IDLE) {
    ctx.state.answer = '';

    if (q != '') {
      // еще не знаем ни вопрос, ни ответ
      ctx.state.question = q;
      replyMessage.text('Что ' + q + '?');
      ctx.state.stage = STAGE_WAIT_FOR_ANSWER;
    } else {
      replyMessage.text('Что запомнить?');
    }
  } else if (ctx.state.stage === STAGE_WAIT_FOR_ANSWER) {
    // уже знаем вопрос, но не знаем ответ
    ctx.state.answer = q;

    // последний ответ можно удалить отдельной командой
    ctx.state.lastAddedItem = {
      questions: [ctx.state.question],
      answer: ctx.state.answer
    };

    await storage.storeAnswer(userData, ctx.state.question, ctx.state.answer);
    replyMessage.text(ctx.state.question + ' находится ' + ctx.state.answer + ', поняла');
    ctx = await resetState(ctx);
  }

  storage.setState(userData, ctx.state);
  return replyMessage.get();
};

// очищает состояние заполнение ответа на вопрос
const resetState = async ctx => {
  const userData = await storage.getUserData(ctx);
  //ctx.state = await storage.getState(userData);
  ctx.state.stage = STAGE_IDLE;
  ctx.state.question = '';
  ctx.state.answer = '';
  storage.setState(userData, ctx.state);
  return ctx;
};

const cleanQuestion = message => {
  return message
    .replace(/^(а |скажи )?что /, '')
    .replace(/^(а |скажи )?где /, '')
    .replace(/^лежит/, '')
    .replace(/^стоит/, '')
    .replace(/^находится/, '')
    .replace(/^находятся/, '')
    .replace(/^налито/, '')
    .replace(/^насыпано/, '')
    .replace(/^будет/, '');
};

// что ...
module.exports.whatIs = async ctx => {
  console.log('> whatis: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  const q = cleanQuestion(ctx.messsage);
  const data = await storage.getData(userData);
  ctx.state = await storage.getState(userData);

  if (data.length == 0) {
    return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  let fuse = new Fuse(data, {
    threshold: 0.3,
    location: 4,
    includeScore: true,
    keys: ['questions']
  });
  let answers = fuse.search(q);
  if (answers.length > 0) {
    const bestScore = answers[0].score;
    const scoreThreshold = 2;
    answers = answers.map(answer => {
      return {
        ...answer.item,
        ...{
          score: answer.score,
          minor: answer.score / bestScore > scoreThreshold
        }
      };
    });

    let msg = answers[0].answer;
    if (answers.filter(answer => !answer.minor).length > 1) {
      msg += ', но это неточно';
    }

    console.log('answer: ', msg);
    ctx.reply(msg);
  } else {
    ctx.reply('Я не знаю');
  }
  return true;
};

// где ...
module.exports.whereIs = async ctx => {
  console.log('> whereis: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  const q = cleanQuestion(ctx.messsage);
  const data = await storage.getData(userData);
  ctx.state = await storage.getState(userData);

  if (data.length == 0) {
    return ctx.reply('Я еще ничего не знаю, сначала расскажите мне, что где находится.');
  }

  let fuse = new Fuse(data, {
    threshold: 0.3,
    location: 4,
    includeScore: true,
    keys: ['answer']
  });
  let answers = fuse.search(q);
  if (answers.length > 0) {
    const bestScore = answers[0].score;
    const scoreThreshold = 2;
    answers = answers.map(answer => {
      return {
        ...answer.item,
        ...{
          score: answer.score,
          minor: answer.score / bestScore > scoreThreshold
        }
      };
    });

    let msg = answers[0].questions[0];
    if (answers.filter(answer => !answer.minor).length > 1) {
      msg += ', но это неточно';
    }

    console.log('answer: ', msg);
    ctx.reply(msg);
  } else {
    ctx.reply('Я не знаю');
  }
  return true;
};

// команда "команды"
module.exports.commands = ctx => {
  console.log('> commands');
  const commands = [
    'запомни в чем-то находится что-то',
    'удали последнее',
    'отмена',
    'забудь всё',
    'запомни',
    'пока'
  ];
  if (process.env.NODE_ENV != 'production') {
    commands.push('демо данные');
  }

  const replyMessage = ctx.replyBuilder;
  commands.map(command => {
    const btn = ctx.buttonBuilder.text(command).get();
    replyMessage.addButton({ ...btn });
  });
  // replyMessage.text('Вот что я умею:')
  return ctx.reply(replyMessage.get());
};

// команда "запомни ${question} находится ${answer}"
module.exports.remember = async ctx => {
  console.log('> full answer: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const question = ctx.body.question.replace(/^что /, '');
  const answer = ctx.body.answer;

  await storage.storeAnswer(userData, question, answer);

  // последний ответ можно удалить отдельной командой
  ctx.state.lastAddedItem = {
    questions: [question],
    answer: answer
  };

  ctx = await resetState(ctx);
  const suffix = ctx.messsage.match(/ находятся /) ? 'находятся' : 'находится';
  return ctx.reply(question + ' ' + suffix + ' ' + answer + ', поняла');
};

// команда "забудь всё"
module.exports.clearData = async ctx => {
  console.log('> clear');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  storage.clearData(userData);
  ctx = await resetState(ctx);
  return ctx.reply('Всё забыла...');
};

// команда "демо данные"
module.exports.demoData = async ctx => {
  console.log('> demo data');
  const userData = await storage.getUserData(ctx);
  await storage.fillDemoData(userData);
  ctx = await resetState(ctx);
  return ctx.reply('Данные сброшены на демонстрационные');
};

// команда по умолчанию (справка)
module.exports.help = async ctx => {
  console.log('> default');
  const userData = await storage.getUserData(ctx);
  const replyMessage = ctx.replyBuilder;
  const helpText = [
    'Я умею запоминать, что где находится и напоминать об этом.',
    'Начните фразу со "что", чтобы получить ответ. Например: "что на дворе".',
    'Начните фразу с "где", чтобы найти место, где это что-то лежит. Например: "где трава".',
    'Скажите "запомни", чтобы добавить новый ответ.',
    'Можно быстро добавить новый ответ так: "запомни ... находится ...".',
    'Можно удалить последний ответ, сказав "удали последнее".',
    'Если надо удалить что-то другое, скажите, например, "удали на дворе".'
  ];

  const data = await storage.getData(userData);
  let questions = data.map(item => item.questions[0]);
  questions = questions.map(question => {
    const btn = ctx.buttonBuilder.text('что ' + question);
    replyMessage.addButton({ ...btn.get() });
  });
  replyMessage.addButton(ctx.buttonBuilder.text('команды').get());

  if (questions.length > 0) {
    helpText.push('');
    helpText.push('У меня есть информация об этих объектах:');
  }
  replyMessage.text(helpText.join('\n'));
  // console.log('reply message: ', replyMessage.get());
  return ctx.reply(replyMessage.get());
};

// команда "отмена"
module.exports.cancel = async ctx => {
  console.log('> cancel');
  ctx = await resetState(ctx);
  return ctx.reply('Всё отменено');
};

// команда "пока"
module.exports.sessionEnd = async ctx => {
  console.log('> end');
  ctx = await resetState(ctx);
  return ctx.reply(
    ctx.replyBuilder
      .text('До свидания!')
      .shouldEndSession(true)
      .get()
  );
};

const processDelete = async (ctx, question) => {
  const userData = await storage.getUserData(ctx);
  const data = await storage.getData(userData);
  ctx = await resetState(ctx);
  storage.setState(userData, ctx.state);

  const found = data.filter(item => {
    return item.questions.indexOf(question) != -1;
  });

  // не нашлось
  if (found.length == 0) {
    return ctx.reply('Я не знаю, что ' + question);
  }
  // нашлось, но много
  if (found.length > 1) {
    console.log(found);
    return ctx.reply('Я не уверена что удалять...');
  }

  const isSuccess = await storage.removeQuestion(userData, question);
  if (!isSuccess) {
    return ctx.reply('При удалении что-то пошло не так...');
  }

  return ctx.reply('Забыла, что ' + question);
};

// команда "удали последнее"
module.exports.deleteLast = async ctx => {
  console.log('> delete last');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  if (!ctx.state.lastAddedItem) {
    return ctx.reply('Я ничего не запоминала в последнее время...');
  }
  const question = ctx.state.lastAddedItem.questions[0];
  return processDelete(ctx, question);
};

// команда "удали ..."
module.exports.deleteQuestion = async ctx => {
  console.log('> delete question');
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const question = ctx.body.question;
  return processDelete(ctx, question);
};

// команда "запомни"
module.exports.inAnswerEnter = async ctx => {
  console.log('> answer begin: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const reply = await processAnswer(ctx, userData);
  return ctx.reply(reply);
};

module.exports.inAnswerProcess = async ctx => {
  console.log('> answer end: ', ctx.messsage);
  const userData = await storage.getUserData(ctx);
  ctx.state = await storage.getState(userData);
  const reply = await processAnswer(ctx, userData);
  if (ctx.state.stage == STAGE_IDLE) {
    ctx.session.setData('currentScene', null);
  }
  return ctx.reply(reply);
};

module.exports.replyRandom = messages => {
  return async ctx => {
    const randomKey = Math.floor(Math.random() * messages.length);
    return ctx.reply(messages[randomKey]);
  };
};
