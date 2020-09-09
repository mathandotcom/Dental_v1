// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const fs = require('fs');
const root = require('../config/root');
const path = require('path');
var moment = require('moment');
const logger = require('../logger/logconfig');
const commPlanModel = require('../models/commplan');
const appointmentModel = require('../models/appointment');
const ReminderModel = require('../models/mod_reminder');
const ReceiveSmsModel = require('../models/mod_receivesms');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const messageResponse  = require('twilio').twiml.MessagingResponse;


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
var bodyMessage = process.env.REMINDER_MESSAGE;
const daysAhead = process.env.REMINDER_DAYSAHEAD;
const client = require('twilio')(accountSid, authToken);
const globalUserId = 1;

exports.sendSmsApi = async (req, res) => {
    const countryCode = req.body.countryCode;
    const phoneNumber = req.body.PhoneNumber;
    const bodyMessage = req.body.Message;

    if(phoneNumber === "" || phoneNumber === undefined){
        return  res.status(200).json({status:'false', message:'Phone number is missing'});
    }
    //const toNumber = countryCode + phoneNumber;
    var toNumber = getFormatPhoneNumber(phoneNumber);
    try {
        var fN = fromNumber;//'+12103612222';
        var smsresult = await sendSms(bodyMessage, fromNumber, toNumber);
        if (smsresult) {
            await commPlanModel.addChatMessage(0, bodyMessage, smsresult, globalUserId);
            return res.status(200).json({ status: 'true', message: `Message sent to '${toNumber}` });
        }
        return res.status(200).json({ status: 'false', message: `Message not sent to '${toNumber}` });
    } catch (error) {
        return res.status(error.status).json({ status: 'false', message: error.message });
    }
};

exports.remindSmsApi = async (req, res, next) => {
    //var id = req.params.id;
    var smsSentFailed = 0;
    var id = req.body.id;

    try {
        var results = await commPlanModel.fetchPhoneNumbers(id);
        if(results.length > 0 && results[0].length > 0){

            for(let i = 0; i< results[0].length; i++){
                var patient = results[0][i];
                if(patient !=null && patient.WirelessPhone !== '' && patient.TxtMsgOk !== 2){
                    console.log(patient.WirelessPhone);
                    try {
                        var toNumber = getFormatPhoneNumber(patient.WirelessPhone);
                        var smsresult = await sendSms(bodyMessage, fromNumber, toNumber);
                        //store in to database
                        if(smsresult !== null){
                            await commPlanModel.addChatMessage(id, bodyMessage, smsresult, globalUserId);
                        }

                        logger.info(`SMS sent to '${patient.WirelessPhone}`); 
                    } catch (error) {
                        smsSentFailed++;
                        logger.error(`Unable to send SMS to '${patient.WirelessPhone} - ${error.message}'`); 
                    }
                }
                
            }
            if(smsSentFailed > 0)
                return res.status(200).json({ status: 'false', message: `Reminder sending failed for one or more patients`});
            else
                return res.status(200).json({ status: 'true', message: `Reminder sent` });

        }
        return res.status(422).json({ status: 'false', message: `Unable to get patient detail for '${id}' ` });

    } catch (error) {
        return res.status(401).json({status: 'false', message:"Unable to get patient details - " + error.message});
    }

};

exports.remindSmsByAptNumApi = async (req, res, next) => {
    //var id = req.params.id;
    var smsSentFailed = 0;
    var apptdetail = req.body.apptdetail;
    var id = apptdetail.id;
    const phone = apptdetail.cell;

    var errorMessage = '';
    try {
            try {
                //get reminder message to send
                bodyMessage = await appointmentModel.getAppointmentReminderMessage(apptdetail);

                var toNumber = getFormatPhoneNumber(phone);
                var smsresult = await sendSms(bodyMessage, fromNumber, toNumber);
                if(smsresult.sid !== ''){
                    await commPlanModel.addChatMessage(id, bodyMessage, smsresult, globalUserId);
                    logger.info(`SMS sent to '${phone}' with messsage as '${bodyMessage}'`); 
                    var reminderModel = setReminderModel(apptdetail, smsresult); //new ReminderModel(0, 0, true, false, apptDetail.PatNum, apptDetail.AptNum);
                    //store in to database
                    var reminder = await appointmentModel.setSmsReminder(apptdetail.aptNum, apptdetail.aptDateTime, 0, 1, 0);
                    logger.info(`Appointment reminder has been stored in apptremindersent table with ApptReminderSentNum as '${reminder[0].insertId}`); 
                    var confirmRequest = await appointmentModel.setConfirmationRequestForSms(reminderModel);
                    logger.info(`Appointment confirm request has been stored in confirmrequest table with ConfirmationRequestNum as '${confirmRequest[0].insertId}`); 

                }
                else{
                    logger.info(`Unable to send SMS to '${phone}'`);
                    smsSentFailed++;
                }

            } catch (error) {
                if(error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT')
                    errorMessage = `Please check your internet connection`;
                smsSentFailed++;
                logger.error(`Unable to send SMS to '${phone} - ${error.message}'`); 
            }
            
            if(smsSentFailed > 0)
                return res.status(200).json({ status: 'false', message: `Reminder sending failed. ${errorMessage!='' ? errorMessage: ''}`});
            else
                return res.status(200).json({ status: 'true', message: `Reminder sent` });

        return res.status(422).json({ status: 'false', message: `Unable to get patient detail for '${id}' ` });

    } catch (error) {
        logger.error(error.stack);
        return res.status(401).json({status: 'false', message:"Unable to get patient details - " + error.message});
    }

};


exports.remindSmsBySikkaApi = async (req, res, next) => {
    //var id = req.params.id;
    var smsSentFailed = 0;
    var apptdetail = req.body.apptdetail;
    var id = apptdetail.id;
    const phone = apptdetail.cell;

    var errorMessage = '';
    try {
            try {
                //get reminder message to send
                bodyMessage = await appointmentModel.getAppointmentReminderMessage(apptdetail);

                var toNumber = getFormatPhoneNumber(phone);
                var smsresult = await sendSms(bodyMessage, fromNumber, toNumber);
                if(smsresult.sid !== ''){
                    logger.info(`SMS sent to '${phone}' with messsage as '${bodyMessage}'`); 
                    //var reminderModel = setReminderModel(apptdetail, smsresult); //new ReminderModel(0, 0, true, false, apptDetail.PatNum, apptDetail.AptNum);
                    //store in to database
                    //var reminder = await appointmentModel.setSmsReminder(apptdetail.AptNum, apptdetail.AptDateTime, 0, 1, 0);
                    //logger.info(`Appointment reminder has been stored in apptremindersent table with ApptReminderSentNum as '${reminder[0].insertId}`); 
                    //var confirmRequest = await appointmentModel.setConfirmationRequestForSms(reminderModel);
                    //logger.info(`Appointment confirm request has been stored in confirmrequest table with ConfirmationRequestNum as '${confirmRequest[0].insertId}`); 

                }
                else{
                    logger.info(`Unable to send SMS to '${phone}'`);
                    smsSentFailed++;
                }

            } catch (error) {
                if(error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT')
                    errorMessage = `Please check your internet connection`;
                smsSentFailed++;
                logger.error(`Unable to send SMS to '${phone} - ${error.message}'`); 
            }
            
            if(smsSentFailed > 0)
                return res.status(200).json({ status: 'false', message: `Reminder sending failed for ${phone}. ${errorMessage!='' ? errorMessage: ''}`});
            else
                return res.status(200).json({ status: 'true', message: `Reminder sent ${phone}` });

    } catch (error) {
        logger.error(error.stack);
        return res.json({status: 'false', message:"Unable to get patient details - " + error.message});
    }

};


exports.smsui = (req, res, next) => {
    res.render('comm/sms', {
        title:'Send SMS', user: req.session.user
    });
};

exports.receiveSmsApi = async (req, res) => {
    const twiml = new messageResponse();

    const receivedMessage = req.body.Body;
    const receivedFrom = req.body.From;
    const accountSid = req.body.AccountSid;
    const messageSid = req.body.MessageSid;
    const smsMessageSid = req.body.SmsMessageSid;
    const smsSid = req.body.SmsSid;
    const smsStatus = req.body.SmsStatus;
    
    var receiveSms = new ReceiveSmsModel(receivedMessage,
            receivedFrom, 
            accountSid,
            messageSid, 
            smsMessageSid, 
            smsStatus, 
            moment().format('Y-M-D H:m:s'));
    //updating appointment confirmation
    var result = await appointmentModel.updateConfirmationRequestByIdForSms(receiveSms);
    // Need to create another function to get the appt number using received phone number

    twiml.message('Thanks for the response');
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
}

// {
//     "id": 1
// }
//http://localhost:3000/api/v1/comm/autoreminder/1

exports.autoReminder = async (req, res, next) => {
    var smsSentFailed = 0;
    var smsSentSuccess = 0;
    //const id = req.body.id;
    const id = req.params.id;

    var daysAhead = process.env.REMIND_DAYSAHEAD_FIRST; //'1' - First Reminder
    try{
        if(id === '2'){ // 'Second Reminder'
            daysAhead = process.env.REMIND_DAYSAHEAD_SECOND;
        }
        var apptDetails = await appointmentModel.fetchUpcomingAppointmentDetails(daysAhead);
        if(apptDetails.length > 0 && apptDetails[0].length > 0){
            for(let i = 0; i< apptDetails[0].length; i++){
                var apptDetail = apptDetails[0][i];
                if(apptDetail.sendtext === 2) continue;
                if(stopSendReminder(apptDetail, id)){
                    logger.info(`Received appointment confirmation from ${apptDetail.WirelessPhone} on ${apptDetail.DateTimeConfirmTransmit}`);
                    continue;
                }

                var toNumber = getFormatPhoneNumber(apptDetail.WirelessPhone);
                bodyMessage = await appointmentModel.getAppointmentReminderMessage(apptDetail);
                var smsresult = await sendSms(bodyMessage, fromNumber, toNumber);
                if(smsresult.sid !== ''){
                    smsSentSuccess++;
                    await commPlanModel.addChatMessage(apptDetail.id, bodyMessage, smsresult, globalUserId);
                    logger.info(`SMS sent to '${apptDetail.WirelessPhone}' with messsage as '${bodyMessage}'`);
                    var reminderModel = setReminderModel(apptDetail, smsresult);
                    //store in to database
                    var reminder = await appointmentModel.setSmsReminder(apptDetail.AptNum, apptDetail.AptDateTime, 0, 1, 0);
                    logger.info(`Appointment reminder has been stored in apptremindersent table with ApptReminderSentNum as '${reminder[0].insertId}`); 
                    var confirmRequest = await appointmentModel.setConfirmationRequestForSms(reminderModel);
                    logger.info(`Appointment confirm request has been stored in confirmrequest table with ConfirmationRequestNum as '${confirmRequest[0].insertId}`); 
                }
                else{
                    logger.info(`Unable to send SMS to '${apptDetail.WirelessPhone}'`);
                    smsSentFailed++;
                }
            }
            if(smsSentSuccess > 0){
                return res.status(200).json({ status: 'true', message: `Reminder sent` });
            }
            else if(smsSentSuccess <= 0){
                logger.info(`No new appointment available to send reminder`);
                return res.status(200).json({ status: 'true', message: `No new appointment available to send reminder` });
            }
            else if(smsSentFailed > 0){
                logger.info(`Reminder sending failed for ${smsSentFailed} patient(s)`);
                return res.status(200).json({ status: 'false', message: `Reminder sending failed for ${smsSentFailed} patient(s)` });
            }
        }
        return res.status(200).json({ status: 'true', message: `No appointment found for '${id === '1' ? 'First reminder' : 'Second reminder'}' ` });
    }
    catch(error){
        logger.error(error);
        return res.status(422).json({status: 'false', message:"Unable to get patient details - " + error.message + ' ' + error.stack});
    }
}

exports.sendReminderApi = async (req, res, next) => {
    const apptdetail = req.body.apptdetail;
    const messageType =  req.body.messageType;
    const phone = apptdetail.cell;
    var smsSentFailed = 0;
    var errorMessage = '';

    try {
        if (apptdetail.confirmed === 21 && apptdetail.aptStatus === 2) {
            //get reminder message to send
            bodyMessage = await getTextMessage(messageType, apptdetail);

            var toNumber = getFormatPhoneNumber(phone);
            var smsresult = await sendSms(bodyMessage, fromNumber, toNumber);
            if (smsresult.sid !== '') {
                await commPlanModel.addChatMessage(apptdetail.patient_id, bodyMessage, smsresult, globalUserId);
            }
            else {
                logger.info(`Unable to send SMS to '${phone}'`);
                smsSentFailed++;
            }
        }
        else {
            return res.status(200).json({ status: 'false', message: `Yet to complete the treatment to send the feedback reminder` });
        }
    } catch (error) {
        if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT')
            errorMessage = `Please check your internet connection`;
        smsSentFailed++;
        logger.error(`Unable to send SMS to '${phone} - ${error.message}'`);
    }

    if (smsSentFailed > 0) {
        return res.status(200).json({ status: 'false', message: `Failed to send ${messageType} link. ${errorMessage != '' ? errorMessage : ''}` });
    } else {
        return res.status(200).json({ status: 'true', message: `Request for ${messageType} message has been sent to ${apptdetail.patient_name}` });
    }
}

exports.getPatientsWithLastMessage = async (req, res, next) => {

    try {
        var patientsWithLastMessage = await commPlanModel.fetchPatientWithLastMessage();
        if(patientsWithLastMessage.length > 0 && patientsWithLastMessage[0].length > 0){
            return res.status(200).json({ status: 'true', message: ``, data: patientsWithLastMessage[0]});
        }
        else{
            return res.status(200).json({ status: 'false', message: `Patient does not exist`, data: null});
        }


    } catch (error) {
        return res.status(401).json({status: 'false', message:"Unable to get patient details - " + error.message});
    }
}

exports.getChatMessages = async (req, res, next) => {
    var patientId = req.body.patientId;

    try{
        var chatMessages = await commPlanModel.fetchChatMessages(patientId);
        if(chatMessages.length > 0 && chatMessages[0].length > 0){
            const uniqueDate = Array.from(new Set(chatMessages[0].map(x => x.received_date)));
            var messages = [];
            uniqueDate.forEach(async element => {
                await messages.push({date: element, messages: chatMessages[0].filter(x => x.received_date === element)});
            });
            
            return await res.status(200).json({ status: 'true', message: ``, data: messages});
            
        }
        else{
            return await res.status(200).json({ status: 'false', message: `Yet to start the conversation`, data: null});
        }        

    } catch (error) {
        return res.status(401).json({status: 'false', message:"Unable to get patient details - " + error.message});
    }
}


exports.getPastMessages = async (req, res, next) => {
    var patient_id = req.body.patient_id;

    try {
        var pastCommunications = await commPlanModel.fetchPatientWithMessage(patient_id);


    } catch (error) {
        return res.status(401).json({status: 'false', message:"Unable to get patient details - " + error.message});
    }
}

exports.sendMessageApi = async (req, res, next) => {
    var chatPatient = req.body.chatpatient
    var message = req.body.message
    var userId = req.body.createdBy;

    if(chatPatient.cell === "" || chatPatient.cell === undefined){
        return  res.status(200).json({status:'false', message:'Phone number is missing'});
    }

    var toNumber = getFormatPhoneNumber(chatPatient.cell);
    try {
        var fN = fromNumber;//'+12103612222';
        var smsresult = await sendSms(message, fromNumber, toNumber);
        if (smsresult) {
            await commPlanModel.addChatMessage(chatPatient.patientId, message, smsresult, userId);
            return res.status(200).json({ status: 'true', message: '', result: `Message sent to '${toNumber}` });
        }
        return res.status(200).json({ status: 'false', message: `Message not sent to '${toNumber}` });
    } catch (error) {
        return res.status(error.status).json({ status: 'false', message: error.message });
    }

}



function sendSms(bodyMessage, fromNumber, toNumber)
{
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

function getFormatPhoneNumber(phone)
{
    const parseNumber = phoneUtil.parseAndKeepRawInput(phone, 'US');
    var toNumber = phoneUtil.format(parseNumber, PNF.E164);
    return toNumber;
}

function setReminderModel(apptDetail, messageResult){
    var reminderModel = new ReminderModel(
            0, 
            0, 
            true, 
            apptDetail.id, //PatNum
            apptDetail.AptNum,
            messageResult.to,
            messageResult.accountSid,
            '',
            '',
            messageResult.body,
            moment().format('Y-M-D H:m:s'),
            '',
            '',
            '',
            '',
            messageResult.sid,
            '',
            new Date(apptDetail.aptDateTime),
            '',
            0,
            1,
        );
    return reminderModel;
}

function stopSendReminder(apptDetail, id){
    if(id === "2" && (apptDetail.ConfirmCode !== '')){ //second reminder //  && apptDetail.ConfirmCode.toLowerCase() === 'c' && apptDetail.ConfirmCode.toLowerCase() === 'confirm'
        return true;
    }
    else if(id === "1" && (apptDetail.IsSmsSent === 1 || apptDetail.IsSmsSent === '1')){ //first reminder
        return true;
    }
    return false;
}

async function getTextMessage(messageType, apptdetail){
    if(messageType === 'feedback'){
        return await appointmentModel.getFeedbackReminderMessage(apptdetail);
    }
    else if(messageType === 'review'){
        return await appointmentModel.getReviewLinkMessage(apptdetail);
    }

}
