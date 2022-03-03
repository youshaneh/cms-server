require('dotenv').config()

const util = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const db = require('./db');

async function resetPassword(email, dayToLive, getEmailInfo) {
  const expiration = new Date()
  expiration.setDate(expiration.getDate() + dayToLive)
  const token = (await util.promisify(crypto.randomBytes)(32)).toString('hex')
  const hashedToken = crypto.createHmac('sha256', token).digest('hex');
  const user = await db.getInstance().query(`SELECT id FROM client_user WHERE email = $1`, [
    email,
  ])
  const id = user[0].id
  await db.getInstance().query(`INSERT INTO reset_password(expiration, token, user_id) VALUES($1, $2, $3)`, [
    expiration,
    hashedToken,
    id
  ])
  await db.getInstance().query(`DELETE FROM reset_password WHERE expiration < $1 AND user_id = $2`, [
    expiration,
    id
  ])
  const url = `${process.env.HOST}/reset_password?email=${email}&token=${token}`
  const { subject, content } = getEmailInfo(url)
  const result = await sendMail(email, subject, content)
}

function sendMail(email, subject, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject,
    html,
  };

  return new Promise((res, rej) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        rej(error)
      } else {
        res(info)
      }
    });
  })
}

module.exports = {
  resetPassword
};