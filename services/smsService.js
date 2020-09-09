const dotenv = require('dotenv');
dotenv.config();
const messageResponse  = require('twilio').twiml.MessagingResponse;
const commPlanModel = require('../models/commplan');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const client = require('twilio')(accountSid, authToken);
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const globalUserId = 1;

const logger = require('../logger/logconfig');


var smsService = class SMSService{
    
    constructor(){ }

    static async sendMessage(patientId, patientCell, message, userId) {
        if (patientCell === "" || patientCell === undefined) {
            return `Phone number is missing`;
        }
        try {
            var toNumber = await this.getFormatPhoneNumber(patientCell);

            var smsresult = await this.send(message, fromNumber, toNumber);

            if (smsresult) {
                await commPlanModel.addChatMessage(patientId, message, smsresult, userId);
                return { status: 'true', message: '', result: `Message sent to '${toNumber}`};
            }
            return { status: 'false', message: '', result: `Message failed to send message to '${toNumber}` };
        }
        catch (error) {
            logger.error(`Send sms failure: ${error.stack}`);
            throw error;
        }
    }

    static send(bodyMessage, fromNumber, toNumber) {
        return new Promise(function (resolve, reject) {
            client.messages
                .create({
                    body: bodyMessage,
                    from: fromNumber,
                    to: toNumber
                })
                .then(message => {
                    logger.info(`SID '${message.sid}' - SMS Sent to '${toNumber}' with the message of '${bodyMessage}'`);
                    console.log(message.sid);
                    resolve(message);

                })
                .catch(error => {
                    logger.error(`Failure to send SMS to '${toNumber}' with the message of '${error.message}'`);
                    reject(error);
                });
        })
    }


    static getFormatPhoneNumber(phone)
    {
        const parseNumber = phoneUtil.parseAndKeepRawInput(phone, 'US');
        var toNumber = phoneUtil.format(parseNumber, PNF.E164);
        return toNumber;
    }

}

module.exports = smsService;