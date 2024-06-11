const { Sequelize } = require('sequelize');

const {DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT} = process.env

const db = new Sequelize('postgres', DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres'
});

module.exports = db;