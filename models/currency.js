const Sequelize = require('sequelize');
const {db} = require('../database');

const Currency = db.define('Currency', {
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
