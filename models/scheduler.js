const mysql = require('mysql2');
const auth = require('../config/authpool');
const pool = require('../config/remoteopendentalpool');
const logger = require('../logger/logconfig');
var moment = require('moment');

var schedulerModel = class SchedulerModel{
    constructor(){}

    static async retrieveScheduler(){
        try {
            var query = mysql.format(schedulerStatusSql, []) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    static async updateSchedulerStatus(scheduler_status_id, scheduler_id, next_job_frequency, userId){
        var procUpdateScheduler = 'call jdsp_update_schedler_status(?, ?, ?, ?, ?)';
        var currentDateTime = moment().format('Y-M-D H:m:s');

        try {
            var query = mysql.format(procUpdateScheduler, [scheduler_status_id, scheduler_id, currentDateTime, next_job_frequency, userId]) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    
    static async retrieveDeltaData(lastJobRun, deltaType){
        var query = '';
        try {
            if(deltaType === 'appointment'){
                query = mysql.format(appointmentStatusToTriggerSql, [lastJobRun]) ;
            }
            else if(deltaType === 'patient'){
                query = mysql.format(patientStatusToTriggerSql, [lastJobRun]) ;
            }

            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    //retrievePatientsBirthDay

    static async retrievePatientsBirthDay(){
        var query = '';
        var d = moment().format('DD');
        var m = moment().format('MM');
        try {
            query = mysql.format(patientBirthDaySql, [m, d]) ;
            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    //get active campaigns List
    static async retrieveCampaigns(){
        var query = '';

        try {
            var procActiveCampaign = 'call GetActiveCampaignTemplate(?)';

            query = mysql.format(procActiveCampaign, [3]) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    //get active completed appointmentList against email sent list
    static async retrieveCompletedAppointments(leadTime, lt_interval, lt_mode) {
        var query = '';
        try {
            var procCompletedAppts = 'call GetCompletedAppointments(?, ?, ?)';
            query = mysql.format(procCompletedAppts, [lt_interval, lt_mode, leadTime]);
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

        //get active completed appointmentList against email sent list
        static async AddHistCampaignStatus(_histStatus) {
            var query = '';
            try {
                var procCompletedAppts = 'call addHistCampaignStatus(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @result)';
                query = mysql.format(procCompletedAppts, [
                                _histStatus.campaign_schedule_id
                                ,_histStatus.appointment_id
                                ,_histStatus.category_id
                                ,_histStatus.subcategory_id
                                ,_histStatus.template_id
                                ,_histStatus.patient_id
                                ,_histStatus.email_to
                                ,_histStatus.email_cc
                                ,_histStatus.text_to
                                ,_histStatus.message_status
                                ,_histStatus.message_error
                                ,_histStatus.createdon
                                ,_histStatus.createdby
                            ]);
                logger.info(query);
                var queryResult = auth.query(query);
                return await queryResult;
            } catch (error) {
                logger.error(error);
                throw error;
            }
        }

}


module.exports = schedulerModel;

const schedulerStatusSql = `select sch.id as scheduler_id, sch.name as scheduler_name,  
                        sch.frequency, 
                        ss.id as scheduler_status_id, ss.last_job_run, ss.next_job_frequency 
                        from scheduler sch 
                        left join scheduler_status ss on ss.scheduler_id = sch.id
                        where sch.name = 'Regular'`;

const appointmentStatusToTriggerSql = `select 
                                appt.AptNum as appt_number
                                ,appt.AptNum as apptmt_id
                                ,appt.PatNum as patient_id
                                ,appt.HistApptAction as appt_action
                                ,appt.AptStatus as appt_status
                                ,appt.Confirmed as appt_confirmed_status
                                ,appt.AptDateTime as appt_datetime
                                ,appt.ClinicNum as appt_clinic_number
                                ,appt.ProcDescript as appt_Proc_description
                                ,CONCAT(patient.FName, ' ', IFNULL(CONCAT(patient.MiddleI, ' '),''), patient.LName) as patient_name
                                ,patient.WirelessPhone as cell
                                ,patient.Email as email
                                ,patient.TxtMsgOk as sendtext
                                ,DATE_FORMAT(appt.AptDateTime, '%m/%d/%Y %H:%i:%s') as appt_datetime_str
                                ,DATE_FORMAT(appt.DateTStamp, '%m/%d/%Y %H:%i:%s') as update_datetime_str                                
                                from histappointment appt
                                left join patient patient on patient.PatNum = appt.PatNum
                                where appt.AptDateTime = (
                                    SELECT appt2.AptDateTime from histappointment appt2	
                                    where appt.AptNum = appt2.AptNum order by appt2.HistApptNum desc limit 1
                                )
                                and appt.DateTStamp >= STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')`;

const patientStatusToTriggerSql = `select
_patient.PatNum as patient_id
,CONCAT(_patient.FName, ' ', IFNULL(CONCAT(_patient.MiddleI, ' '),''), _patient.LName) as patient_name
,_patient.Birthdate as birthdate
,_patient.PatStatus as patient_status
,_patient.DateTStamp as updatedTime
,_patient.WirelessPhone as cell
,_patient.Email as email
,_patient.TxtMsgOk as sendtext
from patient _patient
where _patient.DateTStamp >= STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')`;


const patientBirthDaySql = `select
                            _patient.PatNum as patient_id
                            ,CONCAT(_patient.FName, ' ', IFNULL(CONCAT(_patient.MiddleI, ' '),''), _patient.LName) as patient_name
                            ,_patient.Birthdate as birthdate
                            ,DATE_FORMAT(_patient.Birthdate, '%m') as birth_month
                            ,DATE_FORMAT(_patient.Birthdate, '%d') as birth_day
                            ,_patient.PatStatus as patient_status
                            ,_patient.DateTStamp as updatedTime
                            ,_patient.WirelessPhone as cell
                            ,_patient.Email as email
                            ,_patient.TxtMsgOk as sendtext
                            from patient _patient
                            where DATE_FORMAT(_patient.Birthdate, '%m') = ? and
                            DATE_FORMAT(_patient.Birthdate, '%d') = ?`;



const insertHistCommunicationStatusSql = `insert into histemailsent (
                                campaign_schedule_id
                                ,appointment_id
                                ,category_id
                                ,subcategory_id
                                ,template_id
                                ,patient_id
                                ,email_to
                                ,email_cc
                                ,text_to
                                ,message_status
                                ,message_error
                                ,createdon
                                ,createdby
                            ) values (
                                _histStatus.campaign_schedule_id
                                ,_histStatus.appointment_id
                                ,_histStatus.category_id
                                ,_histStatus.subcategory_id
                                ,_histStatus.template_id
                                ,_histStatus.patient_id
                                ,_histStatus.email_to
                                ,_histStatus.email_cc
                                ,_histStatus.text_to
                                ,_histStatus.message_status
                                ,_histStatus.message_error
                                ,_histStatus.createdon
                                ,_histStatus.createdby	
                            )
`;


//AppointmentAction
//Created: 0
//Changed: 1
//Missed: 2
//Cancelled: 3
//Deleted: 4