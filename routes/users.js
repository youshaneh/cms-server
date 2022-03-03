require('dotenv').config()

const util = require('util');
const crypto = require('crypto');
const express = require('express')
const router = express.Router()

const db = require('../db');
const utils = require('../utils');

router.post('/', async function (req, res, next) {
  const { email, client_id, token } = req.body;
  if (!(email && client_id && token)) {
    res.status(400);
    res.json({
      errMsg: "some of the required parameters are of falsy value(s)",
      params: { email, client_id, token }
    })
    return
  }

  const clients = await db.getInstance().query(`SELECT * FROM client WHERE id = $1`, [
    client_id
  ])

  if (clients.length === 0) {
    res.status(400);
    res.json({
      errMsg: "client doesn't exist"
    })
    return
  }
  const client = clients[0]

  const salt = (await util.promisify(crypto.randomBytes)(16)).toString('hex');
  let password = (await util.promisify(crypto.randomBytes)(32)).toString('hex')
  password = password + salt;
  password = crypto.createHmac('sha256', password).digest('hex');

  db.getInstance().query(`INSERT INTO client_user(email, password, salt, client_id, token) VALUES($1, $2, $3, $4, $5)`, [
    email,
    password,
    salt,
    client_id,
    token
  ])
    .then((data) => {
      const dayToLive = 180;
      utils.resetPassword(email, dayToLive, url => {
        return {
          subject: '設定使用者密碼',
          content: `
          你已經被邀請共同編輯 <a href="http://${client.domain}/cms">${client.name}<a/><br>
          請於 ${dayToLive} 天內使用以下連結設定登入密碼<br>
          <a href="${url}">${url}<a/>
          <br><br>
          謝謝`
        }
      })
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      res.status(400);
      res.json({ errMsg: error.message })
    })
})

module.exports = router
