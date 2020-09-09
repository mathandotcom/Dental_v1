const logger = require('../logger/logconfig');
const schedulerModel = require('../models/scheduler');
const templateModel = require('../models/template');
const templateService = require('../services/templateService');
const scheduleService = require('../services/scheduler');

var moment = require('moment');
const { invokeCampaigns } = require('../services/scheduler');
const event_AppointmentScheduled = 'appointment is scheduled';
const event_AppointmentReScheduled = 'reschedule appointment';
const event_AppointmentCancelled = 'cancel appointment';
const event_AppointmentMissed = 'missed appointment';
const event_addpatient = 'add new patient';
const event_updatepatient = 'update patient';


//http://localhost:3000/api/v1/scheduler/kickprocess/0206a31c-e032-44e6-98a1-7ac40abef233
exports.triggerScheduler = async (req, res, next) => {
    var userId = 1;
    logger.info(`Scheduler started to run @ ${new Date()}`);
    
    // get the scheduler status 
    await schedulerModel.retrieveScheduler().then(async([response]) => {
        if (response !== null && response.length > 0) {
            var scheduleResponse = response[0];
            var lastJobRun = scheduleResponse.last_job_run !== null ? scheduleResponse.last_job_run : moment();
            console.log(lastJobRun);

            if ((scheduleResponse.last_job_run === null
                || scheduleResponse.last_job_run === undefined)
                || (isRunProcess(scheduleResponse.last_job_run, scheduleResponse.frequency))) {
                console.log('good');
                
                //run theprocess
                await processUpdateByEvents(moment(lastJobRun).format('Y-MM-DD H:mm:ss'));

                
                // update the scheduler status after all the process is completed
                await schedulerModel.updateSchedulerStatus(
                    scheduleResponse.scheduler_status_id === null ? 0 : scheduleResponse.scheduler_status_id, 
                    scheduleResponse.scheduler_id, 
                    scheduleResponse.frequency, 
                    userId).then(([responseStatus]) => {
                        logger.info(`last job run @ ${new Date()} and frequency is ${scheduleResponse.frequency} `);
                        var status = responseStatus[0][0].temp_status_id;
                        console.log(responseStatus);
                        if(status > 0){
                            return res.json({status:'true', message:'', result: 'success'});
                        }
                        else{
                            return res.json({status:'false', message:'failed'});
                        }
                })
                .catch(err => {
                    logger.error(err.stack);
                    return res.status(401).json({ status: 'false', message: `Unable to get update scheduler status ${err.message}` });
                });
            }
            else{
                logger.info(`Scheduled job did not run because last job ran @ ${scheduleResponse.last_job_run}`);
                return res.json({status:'false', message:`Scheduled job did not run because last job ran @ ${scheduleResponse.last_job_run}`});
            }

        }
    })
    .catch(err => {
        logger.error(err.stack);
        return res.status(401).json({ status: 'false', message: `Unable to get scheduler detail ${err.message}` });
    });
};

exports.triggerCampaign = async (req, res, next) => {
    await scheduleService.invokeCampaigns();
    return res.json({status:'true', message:'', result: 'success'});
}


async function processUpdateByEvents(lastJobRun) { //DateTime
    var scheduleEvents = await templateModel.retrieveEvents();
    if (scheduleEvents != null && scheduleEvents.length > 0) {
        var categories = [...new Set(scheduleEvents[0].map(item => item.category_name))];
        if(categories === undefined || categories.length <= 0){logger.info('No event found to trigger message'); return false;}
        var templateWithEventList = await templateModel.retrieveTemplateWithEvents();
        if(templateWithEventList === undefined || templateWithEventList.length <= 0) return false;

        var deltaAppointments =     await schedulerModel.retrieveDeltaData(lastJobRun, 'appointment');
        var hasAppointmentData = (deltaAppointments !== undefined && deltaAppointments[0].length > 0) ? true : false;

        var deltaPatients =     await schedulerModel.retrieveDeltaData(lastJobRun, 'patient');
        var hasPatientData = (deltaPatients !== undefined && deltaPatients[0].length > 0) ? true : false;

        for(const category of categories){
            if (category.toLowerCase() === 'appointment' && hasAppointmentData) {
                await ProcessByCategoryApp(category, scheduleEvents[0], deltaAppointments, templateWithEventList);
                /*
                var schedulerEvents = scheduleEvents[0].filter(x => x.category_name.toLowerCase() === category.toLowerCase());
                if(schedulerEvents !== undefined && schedulerEvents.length > 0){
                    for (const scheduleEvent of schedulerEvents) {
                        if (scheduleEvent.name.toLowerCase() === 'appointment is scheduled') {
                            if(deltaAppointments !== null && deltaAppointments.length > 0){
                                for(const patient of deltaAppointments[0]){
                                    if(patient.appt_action === 0){
                                        var template = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                                        var templateId = (template !== undefined && template.length > 0) ? template.template_id : 0;
                                        
                                    }
                                }
                            }
                        }
                    }
                }
                */
            }
            else if (category.toLowerCase() === 'patient' && hasPatientData) {
                var schedulerEvents = scheduleEvents[0].filter(x => x.category_name.toLowerCase() === category.toLowerCase());
                await ProcessByCategoryPatient(category, schedulerEvents, deltaPatients, templateWithEventList);
            }
            else if (category.toLowerCase() === 'patient' && hasPatientData) {
                var schedulerEvents = scheduleEvents[0].filter(x => x.category_name.toLowerCase() === category.toLowerCase());
                await ProcessByCategoryPatient(category, schedulerEvents, deltaPatients, templateWithEventList);
            }
        }
    }
}

async function ProcessByCategoryPatient(category, schedulerEvents, deltaPatients, templateWithEventList){
    if(schedulerEvents !== undefined && schedulerEvents.length > 0){
        for (const scheduleEvent of schedulerEvents) {
            if (scheduleEvent.name.toLowerCase() === event_addpatient) {
                var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                if(templates === undefined || templates.length <= 0) continue;
                var patients = deltaPatients[0];//.filter(x => x.appt_action === 0);
                if(patients === undefined || patients.length <= 0) continue;
                await processTemplateCommunication(patients, templates);
            }
        }
    }
}

async function ProcessByCategoryApp(category, scheduleEvents, deltaAppointments, templateWithEventList){
    var schedulerEvents = scheduleEvents.filter(x => x.category_name.toLowerCase() === category.toLowerCase());
    if(schedulerEvents !== undefined && schedulerEvents.length > 0){
        for (const scheduleEvent of schedulerEvents) {
            if (scheduleEvent.name.toLowerCase() === event_AppointmentScheduled) {
                var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                if(templates === undefined || templates.length <= 0) continue;
                var appointments = deltaAppointments[0].filter(x => x.appt_action === 0);
                if(appointments === undefined || appointments.length <= 0) continue;
                await processTemplateCommunication(appointments, templates);
            }
            else if (scheduleEvent.name.toLowerCase() === event_AppointmentReScheduled) {
                var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                if(templates === undefined || templates.length <= 0) continue;
                var appointments = deltaAppointments[0].filter(x => x.appt_action === 1);
                if(appointments === undefined || appointments.length <= 0) continue;
                await processTemplateCommunication(appointments, templates);
            }
            else if (scheduleEvent.name.toLowerCase() === event_AppointmentCancelled) {
                var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                if(templates === undefined || templates.length <= 0) continue;
                var appointments = deltaAppointments[0].filter(x => x.appt_action === 3);
                if(appointments === undefined || appointments.length <= 0) continue;
                await processTemplateCommunication(appointments, templates);
            }
            else if (scheduleEvent.name.toLowerCase() === event_AppointmentMissed) {
                var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                if(templates === undefined || templates.length <= 0) continue;
                var appointments = deltaAppointments[0].filter(x => x.appt_action === 2);
                if(appointments === undefined || appointments.length <= 0) continue;
                await processTemplateCommunication(appointments, templates);
            }            
        }
    }    
}

async function processTemplateCommunication(appointments, templates) {
    for (const patient of appointments) {
        for (const templateItem of templates) {
            await templateService.sendCommunication(patient.patient_id, templateItem.template_id, 1);
        }
    }
}

function isRunProcess(lastJobRun, frequency){
    if(lastJobRun !== null && lastJobRun !== undefined){
        return  new Date(moment()) >= new Date(moment(lastJobRun).add(frequency, 'minute'));
    }
    return false;
}
/*
Enum:HistAppointmentAction .
Created: 0
Changed: 1
Missed: 2
Cancelled: 3
Deleted: 4
*/