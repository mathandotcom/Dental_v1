 
const sgMail = require('@sendgrid/mail');
const logger = require('../logger/logconfig');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var mail = class Mailer {
  constructor(from, to, cc, bcc, subject, body, html) {
    this.from = from;
    this.to = to;
    this.cc = cc;
    this.bcc = bcc;
    this.subject = subject;
    this.body = body;
    this.html = html;
  }

  buildMail() {
    var msg = {
      from: this.from,
      to: this.to,
      cc: this.cc,
      bcc: this.bcc,
      subject: this.subject,
      text: this.body,
      html: this.html,
    };
    return msg;
  }

  sendMail() {
    try {
      const msg = this.buildMail();
      console.log(msg);
      sgMail.send(msg).then(([sent]) => {
        console.log(sent.statusCode, sent.statusMessage);
      }).catch(error => {
        console.log('error:', error.message);
      });
    }
    catch (errorsend) {
      console.log('error send:', errorsend.message);
    }
  }

  sendMail1(msg) {
    console.log(msg);
    sgMail.send(msg).then(([sent]) => {
      console.log(sent.statusCode, sent.statusMessage);
    }).catch(error => {
      console.log('error: ', error.message);
    });
  }

  async sendMailAsync() {
    try {
      const msg = this.buildMail();
      return await sgMail.send(msg);

    } catch (error) {
      logger.error(error.stack);
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
    }
  }
}

module.exports = mail;