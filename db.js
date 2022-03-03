require('dotenv').config()

const pgp = require('pg-promise')()
let _db = pgp(`${process.env.DATABASE_URL}?sslmode=require`)
console.log('connect to db')

module.exports = {
  getInstance: function () {
    return _db;
  }
};