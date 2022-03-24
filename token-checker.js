require('dotenv').config()

const db = require('./db');

function admin(req, res, next) {
  const authorization = req.get('Authorization')
  if (req.get('Authorization') !== `token ${process.env.ADMIN_TOKEN}`) {
    res.sendStatus(404)
  }
  else {
    next()
  }
}

function client(req, res, next) {
  const cliendId = req.params.clientId
  const authorization = req.get('Authorization')
  const token = authorization.match(/token (.+)/)[1]

  if (cliendId == null || token == null) {
    res.sendStatus(400);
    return;
  }

  db.getInstance().query(`SELECT distinct c.id FROM client c JOIN client_user u on c.id = u.client_id WHERE c.token = $1`, [
    token
  ])
    .then((data) => {
      const ids = data.map(data => String(data.id))
      if (ids.includes(cliendId)) {
        next()
      }
      else {
        res.sendStatus(401);
      }
    })
    .catch((error) => {
      res.sendStatus(500);
    })
}

module.exports = { admin, client }