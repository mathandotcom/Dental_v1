const logger = require('../logger/logconfig');
const apptModel = require('../models/appointment');
const querystring = require('querystring');
const httpService = require('../services/httpService');
const moment = require('moment');
var http = new httpService();


exports.getUpcomingAppointmentDetailsApi = async (req, res, next) => {
    const daysTo = 0;
    try{
        var appointmentDetails = await apptModel.fetchUpcomingAppointmentDetails(daysTo);
        
        if(appointmentDetails.length > 0 && appointmentDetails[0].length > 0){
            return res.json({status: 'true', message: '', data: appointmentDetails[0]});
        }
        return res.status(422).json({status: 'false', message:`No upcoming appointment detail available`});

    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        return res.status(401).json({status: 'false', message:"Unable to get appointment detail - " + error.message});
    }
}

exports.getAppointmentDetailsByDateApi = async (req, res, next) => {
    const apptdate = req.body.apptdate;

    try{
        if(apptdate === '' || apptdate === undefined) return res.json({status: 'false', message:`Please provide valid appointment date`});
        var items = await apptModel.fetchAppointmentDetailsByDate(apptdate);
        if(items.length > 0 && items[0].length > 0){
            items[0].forEach(element => {
                if(element.confirmed_on_date === '01/01/0001 00:00' || element.confirmed_on_date === null){
                    element.confirmed_on_date = '';
                }
            });
            return res.json({status: 'true', message: '', data: items[0], user:req.session.user});
        }
        return res.status(200).json({status: 'false', message:`No appointment detail available for ${apptdate}`});

    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        return res.status(422).json({status: 'false', message:"Unable to get appointment detail - " + error.message});
    }
}

exports.getAppointmentDetailsByDateSikkaApi = (req, res, next) => {
    //const apptdate = req.body.apptdate;
    const apptdate = req.query.q;
    try {
        if(apptdate === undefined || apptdate === ''){
            return res.json({ status: 'false', message: 'Please provide date to request appointment details', data: [] });
        }

        logger.info(`v2/appointments with ${apptdate}`);
        http.getFetch('v2/appointments', { 'startdate': apptdate, 'enddate': apptdate }, (response) => {
            logger.info(response);
            if (response.http_code === undefined || response.length > 0) {
                return res.json({ status: 'true', message: '', data: response });
                // patientsByIdSikka_full(response, (responseObj) => {
                //     return res.json({ status: 'true', message: '', data: responseObj });
                // }, (err) => {
                //     logger.error(err);
                //     return res.json({ status: 'false', message: err, data: [] });
                // }); 
                    
            }
            else if (response.http_code !== undefined) {
                return res.json({ status: 'false', message: response.long_message, data: [] });
            }
        }, (err) => {
            logger.error(err);
            return res.json({ status: 'false', message: err, data: [] });
        });
    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        return res.json({ message: "Unable to get appointment detail - " + error.message });
    }
}

exports.setConfirmationRequestByAptnum = async (req, res, next) => {
    const aptNum = req.body.aptNum;
    try {
        if (aptNum !== '' && aptNum !== undefined) {
            var result = await apptModel.updateConfirmationRequestByAptnum(aptNum);
            return res.status(200).json({ status: 'true', message: `Appointment confirmed` });
        }
        else {
            return res.status(200).json({ status: 'false', message: `Please provide appointment number` });
        }
    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        return res.status(422).json({ status: 'false', message: `Unable to update appointment confirmation` });
    }
}

exports.setRescheduleAppointment = async (req, res, next) => {
    const appt_id = req.body.appt_id;
    const createdOn = req.body.createdOn;
    const reschduleTime = req.body.reschduleTime;
    const user_id = req.body.user_id;

    try {
        if (appt_id !== '' && appt_id !== undefined) {
            var result = await apptModel.rescheduleAppt(appt_id, reschduleTime, createdOn, user_id);
            if(result !== null && result.length > 0){
                if(result[0].insertId > 0){
                    return res.status(200).json({ status: 'true', message: '', result: `Appointment is reschduled to ${reschduleTime}` });
                }
                else{
                    return res.status(200).json({ status: 'false', message: '' });
                }
            }
        }
        else {
            return res.status(200).json({ status: 'false', message: `Please provide appointment number` });
        }
    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        return res.status(422).json({ status: 'false', message: `Unable to update appointment confirmation` });
    }

    //rescheduleAppt
}

function patientsByIdSikka_full(responseObj, success, failure) {
    var ctr = 0;
    try {
        responseObj[0].items.forEach(async (element, index, array) => {
            try {
                element.patient = await fillPatientDetailSikka(element.patient.href).catch(e => {
                    console.log('That did not go well.')
                    throw e;
                });
                ctr++;
                if (ctr === array.length) {
                    success(responseObj);
                }
            }
            catch (error) {
                console.log('That did not go well.')
                throw error;
            }
        });
        

    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        failure(`Unable to get appointment detail - ${error.message}`);
    }
}

async function fillPatientDetailSikka (apiUrl){
    try{
        return await new Promise((resolve, reject) => {
            http.getchByUrl(apiUrl, {}, async (response) => {
                if (response.http_code === undefined || response.length > 0) {
                    resolve(response);
                }
                else if (response.http_code !== undefined) {
                    logger.error(`Patient details for ${apiUrl} -  ${response.http_code}`);
                    reject(response);
                }
            }, (err) => {
                logger.error(`Patient details for ${apiUrl} -  ${err}`);
                reject(err);
            });
        });     
    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        element.patient = { 'error': `Unable to get appointment detail - ${error.message}` };
    }
}

exports.appointment_reminder = (req, res, next) => {
    res.render('appt/index', {
        title:'Appointment Remiders', user: req.session.user
    });


};