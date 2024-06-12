const Sequelize = require('sequelize');
const {db} = require('../database');

const Currency = db.define('Currency', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  time: {
    type: Sequelize.DATE
  },
  asset_id_base: {
    type: Sequelize.STRING
  },
  asset_id_quote: {
    type: Sequelize.STRING
  },
  rate: {
    type: Sequelize.DECIMAL(30, 10)
  }
});

module.exports = Currency;
