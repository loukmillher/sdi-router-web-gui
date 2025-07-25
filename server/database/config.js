const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'data', 'database.sqlite'),
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'data', 'database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
};