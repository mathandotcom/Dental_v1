const logger = require('../logger/logconfig');
const mailer = require('../models/email');
const nodeMailer = require('../models/nodemailer');
const scheduler = require('../models/scheduler');

var moment = require('moment');

const fromId = process.env.SENDGRID_FROM_ID;
const mailCc = process.env.EMAIL_CC_ADDRESS;
const mailBcc = '';

var emailService = class EmailService{
    
    constructor(){ }

    static async sendMail1(patientInfo, templateInfo, parsedBody) {
        try {
            var mailModel = new mailer(fromId, patientInfo.email, mailCc, mailBcc, templateInfo.subject, parsedBody, parsedBody);
            return await mailModel.sendMailAsync().then(([result]) => {
                logger.info(result);
                try {
                    if (result.statusCode === 202) {
                        return { status: 'true', message: '', result: `Mail has been sent to ${patientInfo.email}` };
                    }
                    else {
                        return { status: 'false', message: result.statusMessage, result: `Failed to send mail to ${patientInfo.email}` };
                    }
                }
                catch (error) {
                    logger.error(`Send mail failure: ${error.stack}`);
                    throw error;
                }
            });
        }
        catch (error) {
            logger.error(`Send mail failure: ${error.stack}`);
            throw error;
        }
    }


    static async sendMail(patientInfo, templateInfo, parsedBody) {
        try {
            //if(parsedBody.indexOf('data:image')) parsedBody = await this.convertBase64Image(parsedBody);
            var mailModel = new nodeMailer(fromId, patientInfo.email, mailCc, mailBcc, templateInfo.subject, parsedBody, parsedBody);
            var sendResult = await mailModel.sendMailAsync();
            logger.info(sendResult);

            if(sendResult.status === 'true'){
                this.updateEmailHistory(patientInfo, templateInfo, sendResult, '')
                return { status: 'true', message: '', result: `Mail has been sent to ${patientInfo.email}` };
            }
            else{
                this.updateEmailHistory(patientInfo, templateInfo, sendResult, `Failed to send mail to ${patientInfo.email} - ${sendResult.message}`);
                return { status: 'false', message: result.statusMessage, result: `Failed to send mail to ${patientInfo.email}` };
            }
        }
        catch (error) {
            logger.error(`Send mail failure: ${error.stack}`);
            throw error;
        }
    }

    static async updateEmailHistory(patientInfo, templateInfo, sendResult, errorMessage){

        var _histSendMessage = {campaign_schedule_id: 1, 
            appointment_id: patientInfo.appointment_id,
            category_id: templateInfo.category_id,
            subcategory_id: templateInfo.subcategory_id,
            template_id: templateInfo.id,
            patient_id: patientInfo.patient_id,
            email_to: patientInfo.email,
            email_cc: mailCc,
            text_to: '',
            message_status: sendResult.status === 'true' ? 1 : 0,
            message_error: errorMessage,
            createdon: moment().format('Y-M-D H:m:s'),
            createdby: 1
        }
        var status = await scheduler.AddHistCampaignStatus(_histSendMessage);
    }

    static async convertBase64Image(parsedBody){

        let base64 = parsedBody.split('base64,')[1];
        let hex = [...atob(base64)].map(c => c.charCodeAt(0).toString(16).padStart(2, 0));
        let img = 'data:image/png,%' + hex.join('%');
        return img;
    }

}

module.exports = emailService;