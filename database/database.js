const { Sequelize } = require('sequelize');

const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD } = process.env

const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres'
});

module.exports = db;