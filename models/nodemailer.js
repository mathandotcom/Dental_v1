const nodemailer = require('nodemailer');
const logger = require('../logger/logconfig');

const smtpHost = process.env.SMTPHOST;
const smtpPort = process.env.SMTPPORT;
const smtpUserId = process.env.SMTPUSER;
const smtpPassword = process.env.SMTPPASSWORD;

var mail = class Mailer {
    constructor(from, to, cc, bcc, subject, body, html) {
        this.from = from;
        this.to = to;
        this.cc = cc;
        this.bcc = bcc;
        this.subject = subject;
        this.body = body;
        this.html = html;
        this.transport = this.createTransport();
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

      createTransport(){
        var transport = nodemailer.createTransport({
            host: "smtp.ionos.com",
            port: 25,
            auth: {
              user: "m101946616-146165318", 
              pass: "Justdental@1" 
            }
          });
          return transport;
      }

      async sendMailAsync() {
        try {
          const msg = this.buildMail();
          //this.transport.sendMailAsync()
          return new Promise((resolve, reject)=>{
            this.transport.sendMail(msg, (error, info) => {
              if (error) {
                  console.log(error);
                  reject({status: 'true', message: `${error.status}`});
              }
              console.log('Message sent: %s', info.messageId);
              resolve({status: 'true', result: `${info.messageId}`});
            });
          });
    
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