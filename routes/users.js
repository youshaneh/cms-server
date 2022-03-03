require('dotenv').config()

const util = require('util');
const crypto = require('crypto');
const express = require('express')
const router = express.Router()

const db = require('../db');

router.post('/', async function (req, res, next) {
  const salt = (await util.promisify(crypto.randomBytes)(16)).toString('hex');
  let password = req.body.password + salt;
  password = crypto.createHmac('sha256', password).digest('hex');

  db.getInstance().query(`INSERT INTO client_user(email, password, salt, client_id, token) VALUES($1, $2, $3, $4, $5)`, [
    req.body.email,
    password,
    salt,
    req.body.client_id,
    req.body.token
  ])
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      res.status(400);
      res.json({ errMsg: error.message })
    })
})

module.exports = router
