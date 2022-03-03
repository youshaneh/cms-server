require('dotenv').config()

module.exports = function (req, res, next) {
  const authorization = req.get('Authorization')
  if(req.get('Authorization') !== `token ${process.env.ADMIN_TOKEN}`){
    res.sendStatus('404')
  }
  else{
    next()
  }
}