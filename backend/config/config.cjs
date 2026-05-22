'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function fromEnv() {
  return {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DATABASE || 'house_hunt',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
  };
}

module.exports = {
  local: fromEnv(),
  development: fromEnv(),
  docker: fromEnv(),
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? null,
    database: process.env.DATABASE || 'house_hunt_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
  },
  production: fromEnv(),
};
