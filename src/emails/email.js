const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { accountVerificationEmailTemplate } = require('./emails-template');

const sendVerificationEmail = (token = '', firsName = '', email) => {
  // Generate SMTP service account from ethereal.email

  // nodemailer.createTestAccount((err, account) => {
  //   if (err) {
  //     console.error('Failed to create a testing account. ' + err.message);
  //     return process.exit(1);
  //   }

  //   console.log('Credentials obtained, sending message...');

  //   // Create a SMTP transporter object
  //   let transporter = nodemailer.createTransport({
  //     host: account.smtp.host,
  //     port: account.smtp.port,
  //     secure: account.smtp.secure,
  //     auth: {
  //       user: account.user,
  //       pass: account.pass
  //     }
  //   });

  //   // Message object
  //   let message = {
  //     from: 'Gauge Iot <gaugeiot@gaugeiot.com>',
  //     to: `${firsName} ${email}`,
  //     subject: 'Account Confirmation',
  //     text: 'Hello to myself!',
  //     html: accountVerificationEmailTemplate(token, firsName)
  //   };

  //   transporter.sendMail(message, (err, info) => {
  //     if (err) {
  //       console.log('Error occurred. ' + err.message);
  //       return process.exit(1);
  //     }

  //     console.log('Message sent: %s', info.messageId);
  //     // Preview only available when sending through an Ethereal account
  //     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  //   });
  // });
  console.log(process.env.SENDGRID_API_KEY);
  const msg = {
    from: 'gaugeiot@gaugeiot.com',
    to: `joseigorcfm@gmail.com`,
    subject: 'Account Confirmation',
    text: 'Hello to myself!',
    html: accountVerificationEmailTemplate(token, firsName)
  };
  sgMail.send(msg).catch(err => console.log(err));
};

module.exports = { sendVerificationEmail };
