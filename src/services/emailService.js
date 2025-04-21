const email = require('../../configs/email.json')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: email.SERVICE,
  auth: {
    user: email.USER,
    pass: email.PASS
  }
});

module.exports = {
    email,
    transporter
};