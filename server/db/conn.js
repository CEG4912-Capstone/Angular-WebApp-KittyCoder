require('dotenv').config();

//ORM
const Sequelize = require("sequelize");

//set up db connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',

    pool: {
      max: parseInt(process.env.max),
      min: parseInt(process.env.min),
      acquire: process.env.acquire,
      idle: process.env.idle
    }
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//create db tables from models
db.users = require("../Models/user.model")(sequelize, Sequelize);

//export db to server
module.exports = db;
