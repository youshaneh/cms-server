require('dotenv').config()

const util = require('util');
const express = require('express')
const router = express.Router()

const db = require('../db');

router.post('/', function (req, res, next) {
  db.getInstance().query(`INSERT INTO client(name, contact_person, phone_number, plan_id, due_date) VALUES($1, $2, $3, $4, $5)`, [
    req.body.name,
    req.body.contact_person,
    req.body.phone_number,
    req.body.plan_id,
    req.body.due_date,
  ])
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      res.status(400);
      res.json({ errMsg: error.message })
    })
})

router.patch('/:clientId', function (req, res, next) {
  const fields = ['name', 'contact_person', 'phone_number', 'domain', 'domain_expiration', 'plan_id', 'due_date']
  let idx = 1;
  let query = 'UPDATE client SET id = id';
  let values = [];
  fields.forEach(field => {
    if (req.body[field] != null) {
      query += `, ${field} = $${idx++}`
      values.push(req.body[field])
    }
  })
  query += ` WHERE id = $${idx}`
  values.push(req.params.clientId)

  db.getInstance().query(query, values)
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      res.status(400);
      res.json({ errMsg: error.message })
    })
})

module.exports = router
