const mysql = require('mysql2');
const logger = require('../logger/logconfig');
const auth = require('../config/authpool');
var moment = require('moment');
const commplan = require('../models/commplan');
const placeHolder = require('../models/placeholder');
const treatmentplan = require('../models/treatmentplan');
const clinicModel = require('../models/clinic');
const mailer = require('../models/email');
const fromId = process.env.SENDGRID_FROM_ID;
const mailCc = process.env.EMAIL_CC_ADDRESS;
const mailBcc = '';

var templateModel = class TemplateModel{

    constructor(categoryId, subCategoryId, mappingId, templateTypeId, id, name, subject, body, createdby, updatedby, triggerEvents, leadTimeNumber, leadTimeInterval, leadTimeMode){
        this.categoryId = categoryId;
        this.subCategoryId = subCategoryId;
        this.mappingId = mappingId;
        this.templateTypeId = templateTypeId;
        this.id = id;
        this.name = name;
        this.subject = subject;
        this.body = body;
        this.createdby = createdby;
        this.updatedby = updatedby;
        this.triggerEvents = triggerEvents;
        this.leadTimeNumber = leadTimeNumber;
        this.leadTimeInterval = leadTimeInterval;
        this.leadTimeMode = leadTimeMode;
    }



    static async getAutoMailContent(patientId, appintmentId, templateId) {
        var content = '';
        var result =  await this.getTemplate(templateId).then(async ([response]) => {
            if (response.length > 0) {
                var templateInfo = response[0];
                console.log(response[0].category_id);
                console.log(response[0].bodycontent);
            }


            var patient = await this.fetchPatientAppointmentById(patientId, appintmentId).then(async ([patientResponse]) => {
                if(patientResponse[0].length > 0){
                    var patientInfo = patientResponse[0][0];
                    console.log(patientInfo.patient_id);
                    var mailPlaceHolder = this.createTemplateObject(patientInfo);
                    var parsedBody = await this.templateParser(response[0].bodycontent, mailPlaceHolder);
                    content = {bodyContent: parsedBody, patient: patientInfo, template: templateInfo };
                    //await this.sendCommunication(parsedBody, patientInfo, templateInfo);
                }
                else{
                    content = {bodyContent: '', patient: null, template: templateInfo };    
                }
            });
        });
        return content;
    }


    static async getTemplate(templateId){
        try {
            var query = mysql.format(retrieveTemplateSql, [templateId]);
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static createTemplateObject(patientInfo){
        var mailPlaceHolder = new placeHolder(patientInfo.firstName, patientInfo.lastName, patientInfo.patient_name, patientInfo.apptdatetime, 
            clinicModel.getClinicName(), clinicModel.getClinicContact(), clinicModel.getClinicAddress(), clinicModel.getDoctorName());
        return mailPlaceHolder;
    }

    static async templateParser(bodyContent, placeHolder){
        for (var prop in placeHolder){
            if(bodyContent.indexOf(prop) >= 0){
                var replacer = new RegExp(`[#${prop}]`, 'g')
                bodyContent = await bodyContent.replace(`[#${prop}]`, placeHolder[prop]);
                if(bodyContent.indexOf(prop) >= 0){
                    bodyContent = await bodyContent.replace(`[#${prop}]`, placeHolder[prop]);
                }
            }
        }
        return await bodyContent;
    }

    static async replaceAll(str, find, replace) {
        return await str.replace(new RegExp(find, 'g'), replace);
      }

    static async sendCommunication(parsedBody, patientResponse, template){
        if(template !== undefined && template !== null){
            if(template.subcategory_name.toLowerCase() === 'text'){
                console.log(template.subcategory_name.toLowerCase());
                await this.sendText(parsedBody, patientResponse, template);
            }

            else if(template.subcategory_name.toLowerCase() === 'email'){
                console.log(template.subcategory_name.toLowerCase());
                await this.sendMail(parsedBody, patientResponse, template);
            }
        }
    }

    static async sendText(parsedBody, patientResponse, template){

    }

    static async sendMail(parsedBody, patientResponse, template){
        
        var mailModel = new mailer(fromId, patientResponse.email, mailCc, mailBcc, template.subject, '', parsedBody);
        mailModel.sendMailAsync().then(([result]) => {
            if(result.statusCode === 202){
                return `Mail has been sent to ${patientResponse.email}`;
            }
            else{
                return `Mail has not been sent`;
            }
        }).catch(err => {
            logger.error(err);
            return `Failed to send a mail`;
        });
    }


    
    static async retrieveEvents(){
        try {

            var query = mysql.format(retrieveEventSql, []) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    static async retrieveTemplateWithEvents(){
        try {

            var query = mysql.format(templateWithEventSql, []) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }        
    }

    static async fetchPatientAppointmentById(patientId, appointmentId){
        try {
            var procPatientAppointment = 'call patientAppointmentById(?, ?)';
            var query = mysql.format(procPatientAppointment, [patientId, appointmentId]) ;
            logger.info(query);
            var queryResult = auth.query(query);
            return await queryResult;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

}

module.exports = templateModel;


const retrieveTemplateSql = `select tmpl.id
                            ,typename.id as typename_id
                            ,typename.name as typename
                            ,tmpl.subject 
                            ,tmpl.templatefor 
                            ,tmpl.bodycontent 
                            ,tmpl.createdby  
                            ,tmpl.updatedby  
                            ,tmpl.createdon  
                            ,tmpl.updatedon  
                            ,tmpl.comments 
                            ,typename.categorymapping_id
                            ,mapping.category_id
                            ,category.name as category_name
                            ,mapping.subcategory_id
                            ,subcategory.name as subcategory_name
                            from templates tmpl
                            left join templatetypename typename on typename.id = tmpl.templatetypename_id
                            left join templatecategorymapping mapping on mapping.id = typename.categorymapping_id
                            left join templatecategory category on category.id = mapping.category_id
                            left join templatesubcategory subcategory on subcategory.id = mapping.subcategory_id
                            where tmpl.id = ?
                            and tmpl.active = 1`;



const retrieveEventSql = `select e.id, e.name, e.category_id, category.name as category_name 
                            from event e 
                            left join templatecategory category on category.id = e.category_id  
                            where e.active = 1 order by category.id, e.name`;                            
const templateWithEventSql = `select * from vw_templatewithevent`;



//AppointmentAction
//Created: 0
//Changed: 1
//Missed: 2
//Cancelled: 3
//Deleted: 4