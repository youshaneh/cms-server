require('dotenv').config()

const path = require('path');
const util = require('util');
const crypto = require('crypto');
const express = require('express')
const router = express.Router()

const db = require('../db');
const utils = require('../utils');



router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../static/reset_password.html'))
})

router.post('/', function (req, res, next) {
  const dayToLive = 1;
  utils.resetPassword(req.body.email, dayToLive, url => {
    return {
      subject: '重設使用者密碼',
      content: `
      我們收到你的重設密碼申請<br>
      請於 ${dayToLive} 天內使用以下連結重設密碼<br>
      <a href="${url}">${url}<a/>
      <br><br>
      若不需要重設密碼或未送出申請，請忽略此封信即可<br>
      謝謝`
    }
  })
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      res.sendStatus(200);
    })
})

router.put('/', async function (req, res, next) {
  const token = req.body.token;
  const hashedToken = crypto.createHmac('sha256', token).digest('hex');
  db.getInstance().query(`SELECT * FROM reset_password WHERE token = $1 AND expiration > $2`, [
    hashedToken,
    new Date()
  ])
    .then(async (data) => {
      const userId = data[0].user_id

      const salt = (await util.promisify(crypto.randomBytes)(16)).toString('hex');
      let password = req.body.password + salt;
      password = crypto.createHmac('sha256', password).digest('hex');

      return db.getInstance().query(`UPDATE client_user SET password = $1, salt = $2 WHERE id = $3`, [
        password,
        salt,
        userId
      ])
    })
    .then((data) => {
      res.sendStatus(200);
      return db.getInstance().query(`DELETE FROM reset_password WHERE token = $1`, [
        hashedToken
      ])
    })
    .catch((error) => {
      if (!res.writableFinished) res.sendStatus(400);
    })
})

module.exports = router
