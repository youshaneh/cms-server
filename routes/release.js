require('dotenv').config()

const util = require('util');
const express = require('express')
const router = express.Router()

const db = require('../db');

let hangingOptimizeReqs = []
let hangingBuildReqs = []

const CHECK_INTERVAL = 10000
setInterval(() => {
  const timeThreshold = Date.now() - CHECK_INTERVAL

  hangingOptimizeReqs.forEach(req => {if (req.time < timeThreshold) req.res.sendStatus(400)})
  hangingOptimizeReqs = hangingOptimizeReqs.filter(req => req.time > timeThreshold)
  
  hangingBuildReqs.forEach(req => {if (req.time < timeThreshold) req.res.sendStatus(400)})
  hangingBuildReqs = hangingBuildReqs.filter(req => req.time > timeThreshold)
}, CHECK_INTERVAL);

router.post('/:clientId', function (req, res, next) {
  const clientId = req.params.clientId
  db.getInstance().query(`UPDATE client SET release_start = $1, optimize_end = NULL, build_end = NULL WHERE id = $2;`, [
    new Date(),
    clientId
  ])
    .then((data) => {
      res.sendStatus(202);
    })
    .catch((error) => {
      res.status(500);
    })
})

router.put('/:clientId/optimize_end', function (req, res, next) {
  const clientId = req.params.clientId
  const now = new Date()

  hangingOptimizeReqs = hangingOptimizeReqs.filter((req) => {
    if (req.clientId === clientId) {
      req.res.status(200)
      req.res.json({ optimize_end: now.toISOString() })
      return false;
    }
    else {
      return true;
    }
  })

  db.getInstance().query(`UPDATE client SET optimize_end = $1 WHERE id = $2;`, [
    now,
    clientId
  ])
    .then((data) => {
      res.sendStatus(202);
    })
    .catch((error) => {
      res.status(500);
    })
})

router.put('/:clientId/build_end', function (req, res, next) {
  const clientId = req.params.clientId  
  const now = new Date()

  hangingBuildReqs = hangingBuildReqs.filter((req) => {
    if (req.clientId === clientId) {
      req.res.status(200)
      req.res.json({ build_end: now.toISOString() })
      return false;
    }
    else {
      return true;
    }
  })

  db.getInstance().query(`UPDATE client SET build_end = $1 WHERE id = $2;`, [
    now,
    clientId
  ])
    .then((data) => {
      res.sendStatus(202);
    })
    .catch((error) => {
      res.status(500);
    })
})

router.get('/:clientId', function (req, res, next) {
  const clientId = req.params.clientId
  db.getInstance().query(`SELECT release_start, optimize_end, build_end FROM client WHERE id = $1;`, [
    clientId
  ])
    .then((data) => {
      let content = data[0]
      content.time = new Date().toISOString()
      res.status(200);
      res.json(content);
    })
    .catch((error) => {
      res.status(500);
    })
})

router.get('/:clientId/optimize_end', function (req, res, next) {
  const clientId = req.params.clientId
  db.getInstance().query(`SELECT optimize_end FROM client WHERE id = $1;`, [
    clientId
  ])
    .then((data) => {
      const optimize_end = data[0].optimize_end
      if (optimize_end != null) {
        res.status(200);
        res.json(data[0]);
      }
      else {
        hangingOptimizeReqs.push({ clientId, time: Date.now(), res })
      }
    })
    .catch((error) => {
      res.status(500);
    })
})

router.get('/:clientId/build_end', function (req, res, next) {
  const clientId = req.params.clientId
  db.getInstance().query(`SELECT build_end FROM client WHERE id = $1;`, [
    clientId
  ])
    .then((data) => {
      const build_end = data[0].build_end
      if (build_end != null) {
        res.status(200);
        res.json(data[0]);
      }
      else {
        hangingBuildReqs.push({ clientId, time: Date.now(), res })
      }
    })
    .catch((error) => {
      res.status(500);
    })
})

module.exports = router
