const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
const dialect = process.env.DB_DIALECT ?? "mysql"
module.exports = {
  local: dialect === 'sqlite' ? {
    dialect: 'sqlite',
    storage: process.env.DB_NAME
  } : {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: dialect
  },
  sqlite:{
    dialect:"sqlite",
    storage: process.env.DB_NAME
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql"
  }
}

