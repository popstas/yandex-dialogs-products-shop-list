module.exports = () => ctx => {
  return ctx.message.match(
    /^(да$|ну да|ага|угу|конечно$|давай$|валяй|поехали|начинай|пожалуй|продолжай|не помешает|не откажусь|изволь)/i
  );
};
