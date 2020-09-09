const mysql = require('mysql2');
const logger = require('../logger/logconfig');
const auth = require('../config/authpool');
const pool = require('../config/remoteopendentalpool');
var moment = require('moment');
const commplan = require('../models/commplan')

const appointmentModel = class appointmentModel{
    constructor(){
    }

    static fetchUpcomingAppointmentDetails(daysAhead)
    {
        try {
            var currentDateTime = moment().format('Y-M-D H:m:s');
            //https://popsql.com/learn-sql/mysql/how-to-query-date-and-time-in-mysql/
            var query = mysql.format(appointmentDataQuery, [daysAhead]);
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;
            
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static fetchAppointmentDetailsByDate(apptdate)
    {
        try {
            //https://popsql.com/learn-sql/mysql/how-to-query-date-and-time-in-mysql/
            var query = mysql.format(appointmentDataByDateQuery, [apptdate]);
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static fetchAppointmentDetails(apptId){
        try {
            var query = mysql.format(appointmentDataQueryByAptNum, [apptId]);
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async fetchAppointmentByAptNumber(apptId){
        try {
            var query = mysql.format(appointmentByAptNumberSql, [apptId]);
            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static setSmsReminder(apptNum, apptDateTime, apptReminderRuleNum, IsSmsSent, IsEmailSent){
        try {
            var currentDateTime = moment().format('Y-M-D H:m:s');
            var tsPrior = 0;
            var query = mysql.format(addSmsReminderQuery, [apptNum, new Date(apptDateTime), currentDateTime, tsPrior, apptReminderRuleNum, IsSmsSent, IsEmailSent]);
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;

        } catch (error) {
            throw error;
        }
    }

    static async updateAppointmentConfirmation(apptNum, status){
        try {
            var currentDateTime = moment().format('Y-M-D H:m:s');
            var query = mysql.format(updateAppointmentConfirmationQuery, [status, apptNum]);
            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async setConfirmationRequestForSms(reminderModel)
    {
        try{
            var statusYetToConfirm = 256;
            var apptconfirm = await this.updateAppointmentConfirmation(reminderModel.ApptNum, statusYetToConfirm);
            var query = mysql.format(addSmsDetailToConfirmRequestQuery,
                [
                    1,
                    reminderModel.PatNum,
                    reminderModel.ApptNum,
                    reminderModel.PhonePat,
                    reminderModel.ShortGUID,
                    reminderModel.MsgTextToMobile,
                    reminderModel.DateTimeEntry,
                    reminderModel.GuidMessageToMobile,
                    reminderModel.AptDateTimeOrig,
                    reminderModel.SmsSentOk
                ]
            );
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;

        }
        catch(error){
            logger.error(error);
            throw error;
        }
    }

    static updateConfirmationRequestForSms(receiveSms){
        try {
            var query = mysql.format(updateSmsDetailToConfirmRequestQuery,
                [
                    receiveSms.ReceivedMessage,
                    receiveSms.MessageSid,
                    receiveSms.DateTimeConfirmTransmit,
                    receiveSms.AccountSid,
                    receiveSms.ReceivedFrom
                ]
            );
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }
    static async updateConfirmationRequestByAptnum(aptNum){
        var statusConfirm = 21;
        return await this.updateAppointmentConfirmation(aptNum, statusConfirm);
    }

    static async updateConfirmationRequestByIdForSms(receiveSms){
        var isAppointmentResponse = false;
        try {
            var statusConfirm = 24;
            var confirmationrequest = await this.getRecentConfirmationRequestId(receiveSms.ReceivedFrom);
            
            if(confirmationrequest.length > 0){

                var updateChatMessage = await this.updateChatMessage(receiveSms, confirmationrequest[0][0].PatNum);

                if(receiveSms.ReceivedMessage.toLowerCase() === "confirm" || receiveSms.ReceivedMessage.toLowerCase() === "c"){
                    statusConfirm = 21;
                    isAppointmentResponse = true;
                }
                else if(receiveSms.ReceivedMessage.toLowerCase() === "reschedule" 
                || receiveSms.ReceivedMessage.toLowerCase() === "s"
                || receiveSms.ReceivedMessage.toLowerCase() === "cancel"){
                    var statusConfirm = 24;
                    isAppointmentResponse = true;
                }
                if(isAppointmentResponse){
                    var apptconfirm = await this.updateAppointmentConfirmation(confirmationrequest[0][0].ApptNum, statusConfirm);

                    var query = mysql.format(updateSmsDetailToConfirmRequestByIdQuery, 
                        [
                            receiveSms.ReceivedMessage,
                            receiveSms.MessageSid,
                            receiveSms.DateTimeConfirmTransmit,
                            confirmationrequest[0][0].ConfirmationRequestNum
                        ]
                    );
                    logger.info(query);
                    var queryResult = pool.query(query);
                    return queryResult;
                }
                return "SMS response updated successfully";
            }
            else{
                logger.info(`Unable to find the requestId for phone ${receiveSms.ReceivedFrom}`);
                return 'Failed to update sms confirmation';
            }

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async updateChatMessage(receiveSms, patNum){
        var userId = 1;
        try {
            var result = await commplan.addReceivedMessage(patNum, receiveSms.ReceivedMessage, receiveSms.MessageSid, userId);
            return result;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async getRecentConfirmationRequestId(patientPhone){
        try {
            var query = mysql.format(getRecentConfirmationRequestIdQuery, [patientPhone]);
            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async getAppointmentReminderMessage(apptDetail){
        try {
            var bodyMessage  = process.env.REMINDER_MESSAGE;
            var clinicNumber = process.env.CLINIC_NUMBER;
            bodyMessage += `\n${apptDetail.patient_name} - appointment is on ${apptDetail.aptDateTime}. Please reply as either C or Confirm to confirm. `;
            bodyMessage += `\nIf you have any questions, please call ${clinicNumber}. `;
            bodyMessage += `\n\n` + process.env.STOP_MESSAGE;
            return await bodyMessage;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async getFeedbackReminderMessage(apptDetail) {
        try {
            var bodyMessage = process.env.FEEDBACK_REMINDER_MESSAGE;
            bodyMessage = bodyMessage.replace('{firstName}', apptDetail.firstName)
            bodyMessage = bodyMessage.replace('{clinicName}', 'Brrok Hallow family dentistry');
            bodyMessage += `\n` + process.env.FEEDBACK_REMINDER_URL
            bodyMessage += `\n\n` + process.env.STOP_MESSAGE
            return await bodyMessage;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async updateRescheduleAppt(apptId, reAptDateTime){
        try {
            var query = mysql.format(updateAppointmentRescheduleQuery, [reAptDateTime, apptId]);
            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async rescheduleAppt(apptId, reAptDateTime, aptTimestamp, userId ){
        var apptDetails = {};
        try {
            var apptData = await this.fetchAppointmentByAptNumber(apptId);
            if(apptData !== null && apptData.length > 0){
                if(apptData[0]!= null && apptData[0].length > 0){
                    apptDetails = apptData[0][0];
                }
            }
            if(apptDetails == null) throw `Appointment data does not exist for aptnum ${apptId}`;

            var rescheduleAppointmentStatus = await this.updateRescheduleAppt(apptId, reAptDateTime);

            var query = mysql.format(addRescheduleAppointmentSql, [
                            userId, aptTimestamp, 1, 0, 
                                        apptDetails.AptNum, 
                                        apptDetails.PatNum, 
                                        apptDetails.AptStatus, 
                                        apptDetails.Pattern, 
                                        apptDetails.Confirmed, 
                                        apptDetails.TimeLocked, 
                                        apptDetails.Op, 
                                        apptDetails.Note, 
                                        apptDetails.ProvNum, 
                                        apptDetails.ProvHyg, 
                                        reAptDateTime, 
                                        apptDetails.NextAptNum, 
                                        apptDetails.UnschedStatus, 
                                        apptDetails.IsNewPatient, 
                                        apptDetails.ProcDescript, 
                                        apptDetails.Assistant, 
                                        apptDetails.ClinicNum, 
                                        apptDetails.IsHygiene, 
                                        aptTimestamp, 
                                        apptDetails.DateTimeArrived, 
                                        apptDetails.DateTimeSeated, 
                                        apptDetails.DateTimeDismissed, 
                                        apptDetails.InsPlan1, 
                                        apptDetails.InsPlan2, 
                                        apptDetails.DateTimeAskedToArrive, 
                                        apptDetails.ProcsColored, 
                                        apptDetails.ColorOverride, 
                                        apptDetails.AppointmentTypeNum, 
                                        apptDetails.SecUserNumEntry, 
                                        apptDetails.SecDateEntry, 
                                        apptDetails.Priority, 
                                        ]);
            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }        

    }


    static async getReviewLinkMessage(apptDetail) {
        try {
            var bodyMessage = process.env.REVIEW_LINK_MESSAGE;
            bodyMessage = bodyMessage.replace('{firstName}', apptDetail.firstName)
            bodyMessage = bodyMessage.replace('{clinicName}', 'Brrok Hallow family dentistry');
            bodyMessage += `\n` + process.env.REVIEW_LINK_URL
            bodyMessage += `\n\n` + process.env.STOP_MESSAGE
            return await bodyMessage;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }


}

module.exports = appointmentModel;

//https://murrayhopkins.wordpress.com/2008/10/28/mysql-left-join-on-last-or-first-record-in-the-right-table/
const appointmentDataQueryByAptNum = `select * from  appointment where AptNum = ?`;

const appointmentDataQuery_old = `select 
appointment.AptNum, 
appointment.PatNum as id, 
patient.LName as lastName, 
patient.MiddleI as middleName, 
patient.FName as firstName, 
CONCAT(patient.FName, ' ', IFNULL(CONCAT(patient.MiddleI, ' '),''), patient.LName) as patient_name,
patient.TxtMsgOk as sendtext,
patient.PatStatus, 
CASE
	WHEN patient.PatStatus = 0 then 'Patient'
	WHEN patient.PatStatus = 1 then 'NonPatient'
	WHEN patient.PatStatus = 2 then 'Inactive'
	WHEN patient.PatStatus = 3 then 'Archived'
	WHEN patient.PatStatus = 4 then 'Deleted'
	WHEN patient.PatStatus = 5 then 'Deceased'
	WHEN patient.PatStatus = 6 then 'Prospective'
END as PatientStatus, 
CASE
	When patient.Gender = 0 then 'Male'
	When patient.Gender = 1 then 'Female'
END as 'Gender',
patient.WirelessPhone, 
appointment.AptStatus, 
CASE 
	When appointment.AptStatus = 1 then 'Scheduled'
	When appointment.AptStatus = 2 then 'Complete'
    When appointment.AptStatus = 3 then 'unscheduled'
    When appointment.AptStatus = 5 then 'Broken'
    When appointment.AptStatus = 6 then 'Planned'
    When appointment.AptStatus = 7 then 'PtNote'
    When appointment.AptStatus = 8 then 'PtNote Completed'
END as 'AptStatusText',
appointment.Pattern, 
appointment.Confirmed, 
definition.itemname as 'AptConfirmedStatus',
definition.itemvalue as 'AptConfirmedStatusValue',
appointment.TimeLocked, 
appointment.Op, 
appointment.Note, 
appointment.ProvNum, 
appointment.ProvHyg, 
appointment.AptDateTime, 
appointment.NextAptNum, 
appointment.UnschedStatus, 
appointment.IsNewPatient, 
appointment.ProcDescript, 
appointment.Assistant, 
appointment.ClinicNum, 
appointment.IsHygiene, 
appointment.DateTStamp, 
appointment.DateTimeArrived, 
appointment.DateTimeSeated, 
appointment.DateTimeDismissed, 
appointment.InsPlan1, 
appointment.InsPlan2, 
appointment.DateTimeAskedToArrive, 
appointment.ProcsColored, 
appointment.ColorOverride, 
appointment.AppointmentTypeNum, 
appointment.SecUserNumEntry, 
appointment.SecDateEntry, 
appointment.Priority
,reminder_temp.ApptReminderSentNum
,reminder_temp.DateTimeSent
,reminder_temp.TSPrior
,reminder_temp.IsSmsSent
,CASE
	when reminder_temp.IsSmsSent = 1 then 'Reminder sent'
    when reminder_temp.IsSmsSent = 0 then 'Not sent'
	when reminder_temp.IsSmsSent = null then 'Yet to send'
END as 'SmsSentStatus'
,request_temp.ConfirmationRequestNum
,request_temp.ApptNum
,request_temp.ConfirmCode
,request_temp.DateTimeConfirmTransmit
,request_temp.MsgTextToMobile
,CASE
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) = 0 then 'Today'
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) = 1 then 'Yesterday'
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) > 1 and DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) <= 365 then CONCAT(DATEDIFF(now(), request_temp.DateTimeConfirmTransmit), ' d ago')
End as daysago
from appointment appointment
join definition definition on definition.defnum = appointment.Confirmed
join patient patient on patient.PatNum = appointment.PatNum
left join (select reminder1.* from apptremindersent reminder1 
        left join apptremindersent reminder2
        on reminder1.ApptNum = reminder2.ApptNum
            and reminder1.DateTimeSent < reminder2.DateTimeSent 
        where reminder2.ApptNum IS NULL) as reminder_temp
        ON reminder_temp.ApptNum = appointment.AptNum
left join (
        select request1.* 
        from confirmationrequest request1
        left join confirmationrequest request2
        on request1.ApptNum = request2.ApptNum
        and request1.DateTimeEntry < request2.DateTimeEntry
        where request2.ApptNum is NULL) as request_temp
        ON request_temp.ApptNum = appointment.AptNum
    where DATE(AptDateTime) >= date(date_add(now(), interval ? day))
order by appointment.AptDateTime`;


const appointmentDataQuery = `select 
appointment.aptnum as appointment_sr_no, 
appointment.PatNum as patient_id, 
patient.LName as lastName, 
patient.MiddleI as middleName, 
patient.FName as firstName, 
CONCAT(patient.FName, ' ', IFNULL(CONCAT(patient.MiddleI, ' '),''), patient.LName) as patient_name,
patient.TxtMsgOk as sendtext,
patient.PatStatus as patStatus, 
CASE
	WHEN patient.PatStatus = 0 then 'Patient'
	WHEN patient.PatStatus = 1 then 'NonPatient'
	WHEN patient.PatStatus = 2 then 'Inactive'
	WHEN patient.PatStatus = 3 then 'Archived'
	WHEN patient.PatStatus = 4 then 'Deleted'
	WHEN patient.PatStatus = 5 then 'Deceased'
	WHEN patient.PatStatus = 6 then 'Prospective'
END as patientStatus, 
CASE
	When patient.Gender = 0 then 'Male'
	When patient.Gender = 1 then 'Female'
END as 'gender',
patient.WirelessPhone as cell, 
patient.Email as email, 
DATE_FORMAT(patient.DateFirstVisit, '%m/%d/%Y') as dateFirstVisit,
appointment.AptStatus as aptStatus,
CASE 
	When appointment.AptStatus = 1 then 'Scheduled'
	When appointment.AptStatus = 2 then 'Complete'
    When appointment.AptStatus = 3 then 'unscheduled'
    When appointment.AptStatus = 5 then 'Broken'
    When appointment.AptStatus = 6 then 'Planned'
    When appointment.AptStatus = 7 then 'PtNote'
    When appointment.AptStatus = 8 then 'PtNote Completed'
END as 'status',
appointment.Pattern as pattern, 
appointment.Confirmed as confirmed, 
definition.itemname as 'aptConfirmedStatus',
definition.itemvalue as 'aptConfirmedStatusValue',
appointment.TimeLocked as timeLocked, 
appointment.Op as operatory, 
appointment.Note as note, 
appointment.ProvNum as provNum, 
appointment.ProvHyg as provHyg, 
DATE_FORMAT(appointment.AptDateTime, '%m/%d/%Y') as date,
DATE_FORMAT(appointment.AptDateTime, '%H:%i') as time,
appointment.NextAptNum as nextAptNum, 
appointment.UnschedStatus as unschedStatus, 
appointment.IsNewPatient as isNewPatient, 
appointment.ProcDescript as description, 
appointment.Assistant as assistant, 
appointment.ClinicNum as clinicNum, 
appointment.IsHygiene as isHygiene, 
DATE_FORMAT(appointment.DateTStamp, '%m/%d/%Y %H:%i') as appointment_made_date,
DATE_FORMAT(appointment.DateTimeArrived, '%m/%d/%Y %H:%i') as dateTimeArrived,
DATE_FORMAT(appointment.DateTimeSeated, '%m/%d/%Y %H:%i') as dateTimeSeated,
DATE_FORMAT(appointment.DateTimeDismissed, '%m/%d/%Y %H:%i') as dateTimeDismissed,
appointment.InsPlan1 as insPlan1, 
appointment.InsPlan2 as insPlan2, 
DATE_FORMAT(appointment.DateTimeAskedToArrive, '%m/%d/%Y %H:%i') as dateTimeAskedToArrive,
appointment.ProcsColored as procsColored, 
appointment.ColorOverride as colorOverride, 
appointment.AppointmentTypeNum as appointmentTypeNum, 
appointment.SecUserNumEntry as secUserNumEntry, 
DATE_FORMAT(appointment.SecDateEntry, '%m/%d/%Y %H:%i') as secDateEntry,
appointment.Priority as priority
,reminder_temp.ApptReminderSentNum as apptReminderSentNum
,DATE_FORMAT(reminder_temp.DateTimeSent, '%m/%d/%Y %H:%i') as dateTimeSent
,reminder_temp.TSPrior as tSPrior
,reminder_temp.IsSmsSent as isSmsSent
,CASE
	when reminder_temp.IsSmsSent = 1 then 'Reminder sent'
    when reminder_temp.IsSmsSent = 0 then 'Not sent'
	when reminder_temp.IsSmsSent = null then 'Yet to send'
END as 'smsSentStatus'
,request_temp.ConfirmationRequestNum as confirmationRequestNum
,request_temp.ApptNum as apptNum
,request_temp.ConfirmCode as confirmCode
,DATE_FORMAT(request_temp.DateTimeConfirmTransmit, '%m/%d/%Y %H:%i') as confirmed_on_date
,request_temp.MsgTextToMobile as msgTextToMobile
,CASE
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) = 0 then 'Today'
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) = 1 then 'Yesterday'
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) > 1 and DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) <= 365 then CONCAT(DATEDIFF(now(), request_temp.DateTimeConfirmTransmit), ' d ago')
End as daysago
from appointment appointment
join definition definition on definition.defnum = appointment.Confirmed
join patient patient on patient.PatNum = appointment.PatNum
left join (select reminder1.* from apptremindersent reminder1 
        left join apptremindersent reminder2
        on reminder1.ApptNum = reminder2.ApptNum
            and reminder1.DateTimeSent < reminder2.DateTimeSent 
        where reminder2.ApptNum IS NULL) as reminder_temp
        ON reminder_temp.ApptNum = appointment.AptNum
left join (
        select request1.* 
        from confirmationrequest request1
        left join confirmationrequest request2
        on request1.ApptNum = request2.ApptNum
        and request1.DateTimeEntry < request2.DateTimeEntry
        where request2.ApptNum is NULL) as request_temp
        ON request_temp.ApptNum = appointment.AptNum
where DATE(appointment.AptDateTime) >= date(date_add(now(), interval ? day))
order by appointment.AptDateTime`;


const appointmentDataByDateQuery = `select 
appointment.aptnum as appointment_sr_no, 
appointment.PatNum as patient_id, 
patient.LName as lastName, 
patient.MiddleI as middleName, 
patient.FName as firstName, 
CONCAT(patient.FName, ' ', IFNULL(CONCAT(patient.MiddleI, ' '),''), patient.LName) as patient_name,
patient.TxtMsgOk as sendtext,
patient.PatStatus as patStatus, 
CASE
	WHEN patient.PatStatus = 0 then 'Patient'
	WHEN patient.PatStatus = 1 then 'NonPatient'
	WHEN patient.PatStatus = 2 then 'Inactive'
	WHEN patient.PatStatus = 3 then 'Archived'
	WHEN patient.PatStatus = 4 then 'Deleted'
	WHEN patient.PatStatus = 5 then 'Deceased'
	WHEN patient.PatStatus = 6 then 'Prospective'
END as patientStatus, 
CASE
	When patient.Gender = 0 then 'Male'
	When patient.Gender = 1 then 'Female'
END as 'gender',
patient.WirelessPhone as cell, 
patient.Email as email, 
DATE_FORMAT(patient.DateFirstVisit, '%m/%d/%Y') as dateFirstVisit,
appointment.AptStatus as aptStatus,
CASE 
	When appointment.AptStatus = 1 then 'Scheduled'
	When appointment.AptStatus = 2 then 'Complete'
    When appointment.AptStatus = 3 then 'unscheduled'
    When appointment.AptStatus = 5 then 'Broken'
    When appointment.AptStatus = 6 then 'Planned'
    When appointment.AptStatus = 7 then 'PtNote'
    When appointment.AptStatus = 8 then 'PtNote Completed'
END as 'status',
appointment.Pattern as pattern, 
appointment.Confirmed as confirmed, 
definition.itemname as 'aptConfirmedStatus',
definition.itemvalue as 'aptConfirmedStatusValue',
appointment.TimeLocked as timeLocked, 
appointment.Op as operatory, 
appointment.Note as note, 
appointment.ProvNum as provNum, 
appointment.ProvHyg as provHyg, 
DATE_FORMAT(appointment.AptDateTime, '%m/%d/%Y') as date,
DATE_FORMAT(appointment.AptDateTime, '%H:%i') as time,
appointment.NextAptNum as nextAptNum, 
appointment.UnschedStatus as unschedStatus, 
appointment.IsNewPatient as isNewPatient, 
appointment.ProcDescript as description, 
appointment.Assistant as assistant, 
appointment.ClinicNum as clinicNum, 
appointment.IsHygiene as isHygiene, 
DATE_FORMAT(appointment.DateTStamp, '%m/%d/%Y %H:%i') as appointment_made_date,
DATE_FORMAT(appointment.DateTimeArrived, '%m/%d/%Y %H:%i') as dateTimeArrived,
DATE_FORMAT(appointment.DateTimeSeated, '%m/%d/%Y %H:%i') as dateTimeSeated,
DATE_FORMAT(appointment.DateTimeDismissed, '%m/%d/%Y %H:%i') as dateTimeDismissed,
appointment.InsPlan1 as insPlan1, 
appointment.InsPlan2 as insPlan2, 
DATE_FORMAT(appointment.DateTimeAskedToArrive, '%m/%d/%Y %H:%i') as dateTimeAskedToArrive,
appointment.ProcsColored as procsColored, 
appointment.ColorOverride as colorOverride, 
appointment.AppointmentTypeNum as appointmentTypeNum, 
appointment.SecUserNumEntry as secUserNumEntry, 
DATE_FORMAT(appointment.SecDateEntry, '%m/%d/%Y %H:%i') as secDateEntry,
appointment.Priority as priority
,reminder_temp.ApptReminderSentNum as apptReminderSentNum
,DATE_FORMAT(reminder_temp.DateTimeSent, '%m/%d/%Y %H:%i') as dateTimeSent
,reminder_temp.TSPrior as tSPrior
,reminder_temp.IsSmsSent as isSmsSent
,CASE
	when reminder_temp.IsSmsSent = 1 then 'Reminder sent'
    when reminder_temp.IsSmsSent = 0 then 'Not sent'
	when reminder_temp.IsSmsSent = null then 'Yet to send'
END as 'smsSentStatus'
,request_temp.ConfirmationRequestNum as confirmationRequestNum
,request_temp.ApptNum as apptNum
,request_temp.ConfirmCode as confirmCode
,DATE_FORMAT(request_temp.DateTimeConfirmTransmit, '%m/%d/%Y %H:%i') as confirmed_on_date
,request_temp.MsgTextToMobile as msgTextToMobile
,CASE
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) = 0 then 'Today'
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) = 1 then 'Yesterday'
    when DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) > 1 and DATEDIFF(now(), request_temp.DateTimeConfirmTransmit) <= 365 then CONCAT(DATEDIFF(now(), request_temp.DateTimeConfirmTransmit), ' d ago')
End as daysago
from appointment appointment
join definition definition on definition.defnum = appointment.Confirmed
join patient patient on patient.PatNum = appointment.PatNum
left join (select reminder1.* from apptremindersent reminder1 
        left join apptremindersent reminder2
        on reminder1.ApptNum = reminder2.ApptNum
            and reminder1.DateTimeSent < reminder2.DateTimeSent 
        where reminder2.ApptNum IS NULL) as reminder_temp
        ON reminder_temp.ApptNum = appointment.AptNum
left join (
        select request1.* 
        from confirmationrequest request1
        left join confirmationrequest request2
        on request1.ApptNum = request2.ApptNum
        and request1.DateTimeEntry < request2.DateTimeEntry
        where request2.ApptNum is NULL) as request_temp
        ON request_temp.ApptNum = appointment.AptNum
where DATE_FORMAT(appointment.AptDateTime, '%m/%d/%Y') = ?
order by appointment.AptDateTime`;

//const addTpPaymentData = "insert into payoption (treatplannum, filename, filePath, comments, created_by) values (?, ?, ?, ?, ?)";
const addSmsReminderQuery = `Insert into apptremindersent (ApptNum, ApptDateTime, DateTimeSent, TSPrior, ApptReminderRuleNum, IsSmsSent, IsEmailSent) 
                            values(?, ?, ?, ?, ?, ?, ?)`;

const addSmsDetailToConfirmRequestQuery = `Insert into confirmationrequest (
    ClinicNum,
    IsForEmail,
    IsForSms,
    PatNum,
    ApptNum,
    PhonePat,
    ShortGUID,
    MsgTextToMobile,
    DateTimeEntry,
    GuidMessageToMobile,
    AptDateTimeOrig,
    SmsSentOk,
    SecondsFromEntryToExpire,
    ConfirmCode,
    MsgTextToMobileTemplate,
    EmailSubjTemplate,
    EmailSubj,
    EmailTextTemplate,
    EmailText,
    RSVPStatus,
    ResponseDescript,
    GuidMessageFromMobile,
    ShortGuidEmail,
    TSPrior,
    DoNotResend,
    EmailSentOk

) values (0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '', '',  '', '', '', '',0,  '', '', '',0, 0, 0)`;

const updateSmsDetailToConfirmRequestQuery = `update confirmationrequest set ConfirmCode = ?,
GuidMessageFromMobile = ?,
DateTimeConfirmTransmit = ?
where 
ShortGUID = ? 
and PhonePat = ?
and ConfirmCode = '' or ConfirmCode = null`;

const updateSmsDetailToConfirmRequestByIdQuery = `update confirmationrequest set ConfirmCode = ?,
GuidMessageFromMobile = ?,
DateTimeConfirmTransmit = ?
where 
ConfirmationRequestNum = ?`;

var getRecentConfirmationRequestIdQuery = `select 
                        ConfirmationRequestNum
                        ,ApptNum
                        ,PatNum
                        ,ShortGUID
                        ,DateTimeEntry
                        from confirmationrequest where ConfirmationRequestNum in (
                        select max(ConfirmationRequestNum) as ConfirmationRequestNum from confirmationrequest where PhonePat = ?)
`;
const updateAppointmentConfirmationQuery = `update appointment set Confirmed = ? where AptNum = ?`;
const updateAppointmentRescheduleQuery = `update appointment set AptDateTime = STR_TO_DATE(?, '%c/%e/%Y %H:%i') where AptNum = ?`;
const appointmentByAptNumberSql = `select * from appointment where AptNum = ?`;
const addRescheduleAppointmentSql = `insert into histappointment (
    HistUserNum
    ,HistDateTStamp
    ,HistApptAction
    ,ApptSource
    ,AptNum
    ,PatNum
    ,AptStatus
    ,Pattern
    ,Confirmed
    ,TimeLocked
    ,Op
    ,Note
    ,ProvNum
    ,ProvHyg
    ,AptDateTime
    ,NextAptNum
    ,UnschedStatus
    ,IsNewPatient
    ,ProcDescript
    ,Assistant
    ,ClinicNum
    ,IsHygiene
    ,DateTStamp
    ,DateTimeArrived
    ,DateTimeSeated
    ,DateTimeDismissed
    ,InsPlan1
    ,InsPlan2
    ,DateTimeAskedToArrive
    ,ProcsColored
    ,ColorOverride
    ,AppointmentTypeNum
    ,SecUserNumEntry
    ,SecDateEntry
    ,Priority
) values (
    ?, STR_TO_DATE(?, '%c/%e/%Y %H:%i'), ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, STR_TO_DATE(?, '%c/%e/%Y %H:%i'), ?, ?, ?, ?, ?,
    ?, ?, STR_TO_DATE(?, '%c/%e/%Y %H:%i'), ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?
    )`;