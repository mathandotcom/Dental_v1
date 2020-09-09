const mysql = require('mysql2');
const logger = require('../logger/logconfig');
const auth = require('../config/authpool');
const pool = require('../config/remoteopendentalpool');

var moment = require('moment');

const treatModel = class TreatmentPlan{
    
    constructor(){

    }

    static fetchAllPatient(){
        logger.info(mysql.format(sqlQueryPatient));
        return pool.query(sqlQueryPatient);
    }

    static fetchTreatmentPlanById(id){
        logger.info(mysql.format(sqlQueryTreatmentPlan, [id]));
        return pool.query(sqlQueryTreatmentPlan, [id]);
    }
    
    static async fetchPatientById(id){
        try {
            var query = mysql.format(sqlQueryPatientById, [id]);
            logger.info(query);
            var queryResult = pool.query(query);
            return await queryResult;
        } 
        catch (error) {
            throw error;
        }
    }

    //businessid is treatment plan id
    static addPaymentOption(tpid, root, fileName, userid, clinicId){
        try {
            var query = mysql.format(addTpPaymentData, [tpid, fileName, root, '', userid, clinicId]);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    //businessid is consent type
    static addConsent(businessId, root, fileName, userid, clinicId, patientId){
        try {
            var query = mysql.format(addConsentData, [patientId, fileName, root, businessId, '', userid, clinicId]);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static getPayOption(treatmentPlanId)
    {
        try {
            var query = mysql.format(getPayOptionQuery, [treatmentPlanId]);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static fetchConsentById(patientId, consentType)
    {
        try {
            var query = mysql.format(getConsentQuery, [patientId, consentType]);
            logger.info(query);
            var queryResult = auth.query(query);
            return queryResult;
            
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static  addScannedDocument(docCategory, patientId, fileName, imageType){
        try {
            var currentDateTime = moment().format('Y-M-D H:m:s');
            var query = mysql.format(insertScannedDocument, [currentDateTime, docCategory, patientId, fileName, imageType]);
            logger.info(query);
            var queryResult = pool.query(query);
            return queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

}

// Queries
const sqlQueryPatient = `select  pat.PatNum as id
                        ,pat.FName as firstName
                        ,pat.LName as lastName
                        ,CONCAT(pat.FName, ' ', IFNULL(CONCAT(pat.MiddleI, ' '),''), pat.LName) as patient_name
                        ,pat.PatStatus as patstatus
                        ,pat.Gender as gender
                        ,CASE 
                            WHEN pat.gender = 0 then 'male'
                            WHEN pat.gender = 1 then 'female'
                            WHEN pat.gender = 2 then 'unknown'
                        END as 'gendertext'
                        ,pat.Position as position
                        ,pat.Birthdate as dob
                        ,pat.Address as address
                        ,pat.Address2 as address2
                        ,pat.City as city
                        ,pat.State as state
                        ,pat.wirelessphone as cell
                        ,pat.HmPhone as homephone
                        ,pat.WkPhone as workphone
                        ,pat.Email as email
                        ,pat.PatNum
                        ,pat.DateFirstVisit as firstvisit
                        ,pat.Zip as zip
                        ,appt.AptDateTime as lastvisit
                        ,ImageFolder as imagefolder
                        ,TxtMsgOk as sendtext
                        from patient pat
                        left join appointment appt on pat.PatNum = appt.PatNum and appt.AptStatus = 2 
                        and appt.AptDateTime = (select max(appt2.AptDateTime) from  appointment appt2 where appt2.PatNum = pat.PatNum)`;


const sqlQueryPatientById = `select  
                                pat.PatNum as patient_id
                                ,pat.FName as firstName
                                ,pat.LName as lastName
                                ,CONCAT(pat.FName, ' ', IFNULL(CONCAT(pat.MiddleI, ' '),''), pat.LName) as patient_name
                                ,pat.PatStatus as patstatus
                                ,pat.Gender as gender
                                ,pat.Position, position
                                ,pat.Birthdate as dob
                                ,pat.Address as address
                                ,pat.Address2 as address2
                                ,pat.City as city
                                ,pat.State as state
                                ,pat.wirelessphone as cell
                                ,pat.HmPhone as homephone
                                ,pat.WkPhone as workphone
                                ,pat.Email as email
                                ,TxtMsgOk as sendtext
                                ,pat.DateFirstVisit as firstvisit
                                ,pat.Zip as zip
                                ,appt.AptNum as appointment_id
                                ,appt.AptStatus as appointment_status
                                ,DATE_FORMAT(appt.AptDateTime, '%m/%d/%Y %h:%i %p')  as apptdatetime
                                ,ImageFolder as imagefolder
                                from opendental.patient pat 
                                left join opendental.appointment appt on pat.PatNum = appt.PatNum and  appt.AptStatus = 1 
                                    and appt.AptDateTime = (select max(appt2.AptDateTime) from  opendental.appointment appt2 where appt2.PatNum = pat.PatNum) 
                                where pat.PatNum = ?`;


let sqlQueryTreatmentPlan = `SELECT tpa.TreatPlanAttachNum as treatPlanAttachNum, 
tpa.TreatPlanNum as treatPlanNum, 
tpa.ProcNum as procNum, 
tpa.Priority as priority,
pl.PatNum as patNum,
pl.ProcFee as procFee,
pl.ProcStatus as procStatus,
p.FName as fName,
p.LName as lName,
CONCAT(p.FName, ' ', IFNULL(CONCAT(p.MiddleI, ' '),''), p.LName) as patient_name,
tp.Heading as heading,
pl.CodeNum as codeNum,
pc.ProcCode as procCode,
pc.Descript as descript,
cp.InsPayEst as insPayEst,
cp.InsPayAmt as insPayAmt,
(pl.ProcFee-cp.InsPayEst) as 'patientEst'
FROM treatplanattach tpa 
inner join procedurelog pl on pl.ProcNum = tpa.ProcNum
inner join patient p on p.PatNum = pl.PatNum
inner join treatplan tp on tp.TreatPlanNum = tpa.TreatPlanNum
inner join procedurecode pc on pc.CodeNum = pl.CodeNum
inner join claimproc cp on cp.ProcNum = tpa.ProcNum
WHERE  tp.TPStatus = 1
        and p.PatNum = ?`;

const addTpPaymentData = "insert into payoption (treatplannum, filename, filePath, comments, created_by, clinic_id) values (?, ?, ?, ?, ?, ?)";
const addConsentData = "insert into consent (patientid, filename, filePath, doctype, comments, created_by, clinic_id) values (?, ?, ?, ?, ?, ?, ?)";

const getPayOptionQuery = "select * from payoption where treatplannum = ?";
const getConsentQuery = `select cnst.* , u.firstname, u.lastname, CONCAT(u.firstname, ' ', IFNULL(CONCAT(u.lastname, ' '),'')) as createdby_name
                        from consent cnst
                        inner join user u on u.id = cnst.created_by
                        where cnst.patientid = ?  and docType = ?
                        order by cnst.createdon desc`;

const insertScannedDocument = `insert into document 
                                (DateCreated, DocCategory, PatNum, FileName, ImgType) 
                                values (?, ?, ?, ?, ?)`;

/*
with left join for sqlQueryTreatmentPlan
select 
tpa.TreatPlanAttachNum as treatPlanAttachNum, 
tpa.TreatPlanNum as treatPlanNum, 
tpa.ProcNum as procNum, 
tpa.Priority as priority,
pl.PatNum as patNum,
pl.ProcFee as procFee,
pl.ProcStatus as procStatus,
p.FName as fName,
p.LName as lName,
tp.Heading as heading,
pl.CodeNum as codeNum,
pc.ProcCode as procCode,
pc.Descript as descript,
cp.InsPayEst as insPayEst,
cp.InsPayAmt as insPayAmt,
(pl.ProcFee-cp.InsPayEst) as 'patientEst'
from patient p 
left join procedurelog pl on p.PatNum = pl.PatNum
left join treatplanattach tpa  on pl.ProcNum = tpa.ProcNum
left join treatplan tp on  tp.TreatPlanNum = tpa.TreatPlanNum
left join procedurecode pc on pc.CodeNum = pl.CodeNum
left join claimproc cp on cp.ProcNum = tpa.ProcNum
WHERE  tp.TPStatus = 1 and p.PatNum = 2
*/
module.exports = treatModel;