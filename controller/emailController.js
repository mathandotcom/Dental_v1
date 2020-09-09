const mailer = require('../models/email');
const nodeMailer = require('../models/nodemailer');
const logger = require('../logger/logconfig');
const fromId = process.env.SENDGRID_FROM_ID;


exports.sendMailApi1 = (req, res, next) => {
    const mailObject = req.body.mailRequest;
    //var mailModel = new mailer('mohanaveluk@gmail.com', 'mohan.k@bloomfieldx.com', 'some subject', 'body content', '<strong>and easy to do anywhere, even with Node.js</strong>');

    var mailModel = new mailer(fromId, mailObject.to, mailObject.cc, mailObject.bcc, mailObject.subject, mailObject.textbody, mailObject.htmlbody);
    mailModel.sendMailAsync().then(([result]) => {
        logger.info(result);
        if(result.statusCode === 202){
            return res.json({status: 'true', message: '', result:'Mail has been sent'});
        }
        else{
            return res.json({status: 'false', message: result.statusMessage, result:'Mail has not been sent'});
        }
    })
    .catch(err => {
        logger.error(err);
        return res.status(401).json({status: 'false', message:"Failed to send a mail"});
    });
}


exports.sendMailApi = (req, res, next) => {
    const mailObject = req.body.mailRequest;
    //var mailModel = new mailer('mohanaveluk@gmail.com', 'mohan.k@bloomfieldx.com', 'some subject', 'body content', '<strong>and easy to do anywhere, even with Node.js</strong>');

    var mailModel = new nodeMailer(fromId, mailObject.to, mailObject.cc, mailObject.bcc, mailObject.subject, mailObject.textbody, mailObject.htmlbody);
    mailModel.sendMailAsync().then(([result]) => {
        logger.info(result);
        if(result.statusCode === 202){
            return res.json({status: 'true', message: '', result:'Mail has been sent'});
        }
        else{
            return res.json({status: 'false', message: result.statusMessage, result:'Mail has not been sent'});
        }
    })
    .catch(err => {
        logger.error(err);
        return res.status(401).json({status: 'false', message:"Failed to send a mail"});
    });
}


