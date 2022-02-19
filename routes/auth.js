require('dotenv').config()

var express = require('express')
var router = express.Router()
const pgp = require('pg-promise')()
const db = pgp(`${process.env.DATABASE_URL}?sslmode=require`)

//TODO: salt, hash, and protect against brute-force attack
router.post('/', function (req, res, next) {
  db.query(`SELECT * FROM users WHERE username = $1 AND password = $2`, [
    req.body.username,
    req.body.password,
  ])
    .then((data) => {
      if (data.length > 0) {
        const { name, token } = data[0]
        res.status(200);
        res.json({ name, token })
      }
      else {
        res.status(400);
        res.json({ errMsg: '帳號/密碼錯誤，目前僅支援 SB 堡堡登入' })
      }
    })
    .catch((error) => {
      next(error)
    })
})

module.exports = router
