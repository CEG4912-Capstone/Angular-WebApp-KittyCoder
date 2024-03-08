module.exports = (sequelize, Sequelize) => {
  return sequelize.define("user", {
    userName: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    avatar: {
      type: Sequelize.STRING //NTS: randomly generate avatar pic using pixels (go)
    }
  });
};
