const express = require('express')
const router = express.Router()
const crypto = require('crypto');

const db = require('../db');

router.post('/', function (req, res, next) {
  db.getInstance().query(`SELECT u.email, u.password, u.salt, c.token, c.id AS client_id, c.name, c.owner, c.repo, c.release_workflow_id, c.token, c.domain, c.plan_id, c.due_date FROM client_user u
      JOIN client c ON u.client_id = c.id WHERE email = $1`, [
    req.body.email
  ])
    .then((data) => {
      if (data.length === 0) {
        res.status(400);
        res.json({ errMsg: '帳號/密碼錯誤' })
      }
      else {
        data = data[0]
        let password = req.body.password + data.salt;
        password = crypto.createHmac('sha256', password).digest('hex');
        if (password !== data.password) {
          res.status(400);
          res.json({ errMsg: '帳號/密碼錯誤' })
        }
        else {
          const { email, password, salt, owner, repo, release_workflow_id, token, client_id, name, domain, plan_id, due_date } = data
          res.status(200);
          res.json({ email, owner, repo, release_workflow_id, token, client_id, name, domain, plan_id, due_date })
        }
      }
    })
})

module.exports = router
