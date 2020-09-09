const moment = require('moment');
const logger = require('../logger/logconfig');
const schedulerModel = require('../models/scheduler');
const templateModel = require('../models/template');
const templateService = require('../services/templateService');

const event_AppointmentScheduled = 'appointment is scheduled';
const event_AppointmentReScheduled = 'reschedule appointment';
const event_AppointmentCancelled = 'cancel appointment';
const event_AppointmentMissed = 'missed appointment';
const event_addpatient = 'add new patient';
const event_updatepatient = 'update patient';

var scheduler = class Scheduler {

    static async invokeBirthdayWishes() {
        //birthday schedule
        logger.info(`Birthday campaign started to run @ ${moment()}`);
        await schedulerModel.retrievePatientsBirthDay().then(async ([response]) => {   
            if (response !== null && response.length > 0) {
                var patientResponse = response;
                var templateWithEventList = await templateModel.retrieveTemplateWithEvents();
                logger.info(templateWithEventList);
                if (templateWithEventList !== null && templateWithEventList.length > 0) {
                    var birthdayEvent = templateWithEventList[0].filter(x => x.event_name.toLowerCase().indexOf('birthday') >= 0);
                    if(birthdayEvent.length > 0){
                        await this.processTemplateCommunication(patientResponse, birthdayEvent);
                    }
                }
            }
            else{
                logger.info(`no patient avaialble to send birthday wishes for ${moment()}`);
                return ({ status: 'false', message: `no patient avaialble to send birthday wishes` });
            }
        })
        .catch(err => {
            logger.error(err.stack);
            return ({ status: 'false', message: `Unable to get scheduler detail ${err.message}` });
        });            
    }

    static async invoke() {
        var userId = 1;
        logger.info(`Job started to run @ ${new Date()}`);
        await schedulerModel.retrieveScheduler().then(async ([response]) => {
            if (response !== null && response.length > 0) {
                var scheduleResponse = response[0];
                var lastJobRun = scheduleResponse.last_job_run !== null ? scheduleResponse.last_job_run : moment();
                console.log(lastJobRun);logger.info(lastJobRun);
                try {
                    if ((scheduleResponse.last_job_run === null
                        || scheduleResponse.last_job_run === undefined)
                        || (this.isRunProcess(scheduleResponse.last_job_run, scheduleResponse.frequency))) {
                        logger.info(`Meets ${scheduleResponse.frequency} minutes schedule`);

                        //run theprocess
                        await this.processUpdateByEvents(moment(lastJobRun).format('Y-MM-DD H:mm:ss'));

                        logger.info(`Process completed at @ ${moment().format('Y-MM-DD H:mm:ss')}`);
                        // update the scheduler status after all the process is completed
                        await schedulerModel.updateSchedulerStatus(
                            scheduleResponse.scheduler_status_id === null ? 0 : scheduleResponse.scheduler_status_id,
                            scheduleResponse.scheduler_id,
                            scheduleResponse.frequency,
                            userId).then(([responseStatus]) => {
                                logger.info(`last job run @ ${new Date()} and frequency is ${scheduleResponse.frequency} `);
                                var status = responseStatus[0][0].temp_status_id;
                                logger.info(responseStatus);
                                if (status > 0) {
                                    return ({ status: 'true', message: '', result: 'success' });
                                }
                                else {
                                    return ({ status: 'false', message: 'failed' });
                                }
                            })
                            .catch(err => {
                                logger.error(err.stack);
                                return ({ status: 'false', message: `Unable to get update scheduler status ${err.message}` });
                            });
                    }
                    else {
                        logger.info(`Scheduled job did not run because last job ran @ ${scheduleResponse.last_job_run}`);
                        return ({ status: 'false', message: `Scheduled job did not run because last job ran @ ${scheduleResponse.last_job_run}` });
                    }
                }
                catch (error) {
                    logger.info(error.stack);
                    return ({ status: 'false', message: `Unable to get scheduler detail ${err.message}` });
                }

            }

        })
            .catch(err => {
                logger.error(err.stack);
                return ({ status: 'false', message: `Unable to get scheduler detail ${err.message}` });
            });
    }

    static async invokeCampaigns() {
        logger.info(`Job started to run @ ${new Date()}`);
        await schedulerModel.retrieveCampaigns().then(async ([response]) => {
            if (response !== null && response.length > 0) {
                var campaignResponse = response[0];
                for (var campaign of campaignResponse) {
                    logger.info(`Campaign trigger for template ${campaign.leadtime_number} ${campaign.leadtime_interval} ${campaign.leadtime_mode}`);
                    await schedulerModel.retrieveCompletedAppointments(campaign.leadtime_number, campaign.leadtime_interval, campaign.leadtime_mode).then(async ([appointmentResponse]) => {
                        if (appointmentResponse !== null && appointmentResponse.length > 0) {
                            if(appointmentResponse[0].length > 0){
                                await this.processCampaignTemplate(appointmentResponse[0], campaign);
                            }
                            else{
                                logger.info(`No completed appointment available to send campaign for template ${campaign.template_id} - ${campaign.subject}`);
                            }
                        }
                    })
                        .catch(err => {
                            logger.error(err.stack);
                            return ({ status: 'false', message: `Unable to get campaign detail ${err.message}` });
                        });
                }
                logger.info('Campaign  schedule process completed');
                return ({ status: 'true', message: '', result: 'Process completed' });
            }

        })
            .catch(err => {
                logger.error(err.stack);
                return ({ status: 'false', message: `Unable to get campaign detail ${err.message}` });
            });
    }


    static async processUpdateByEvents(lastJobRun) { //DateTime
        var scheduleEvents = await templateModel.retrieveEvents();
        if (scheduleEvents != null && scheduleEvents.length > 0) {
            var categories = [...new Set(scheduleEvents[0].map(item => item.category_name))];
            if (categories === undefined || categories.length <= 0) { logger.info('No event found to trigger message'); return false; }
            var templateWithEventList = await templateModel.retrieveTemplateWithEvents();
            if (templateWithEventList === undefined || templateWithEventList.length <= 0) return false;

            var deltaAppointments = await schedulerModel.retrieveDeltaData(lastJobRun, 'appointment');
            var hasAppointmentData = (deltaAppointments !== undefined && deltaAppointments[0].length > 0) ? true : false;

            var deltaPatients = await schedulerModel.retrieveDeltaData(lastJobRun, 'patient');
            var hasPatientData = (deltaPatients !== undefined && deltaPatients[0].length > 0) ? true : false;

            for (const category of categories) {
                if (category.toLowerCase() === 'appointment' && hasAppointmentData) {
                    await this.ProcessByCategoryApp(category, scheduleEvents[0], deltaAppointments, templateWithEventList);
                }
                else if (category.toLowerCase() === 'patient' && hasPatientData) {
                    var schedulerEvents = scheduleEvents[0].filter(x => x.category_name.toLowerCase() === category.toLowerCase());
                    await this.ProcessByCategoryPatient(category, schedulerEvents, deltaPatients, templateWithEventList);
                }
                else if (category.toLowerCase() === 'patient' && hasPatientData) {
                    var schedulerEvents = scheduleEvents[0].filter(x => x.category_name.toLowerCase() === category.toLowerCase());
                    await this.ProcessByCategoryPatient(category, schedulerEvents, deltaPatients, templateWithEventList);
                }
            }
        }
    }

    static async ProcessByCategoryPatient(category, schedulerEvents, deltaPatients, templateWithEventList) {
        if (schedulerEvents !== undefined && schedulerEvents.length > 0) {
            for (const scheduleEvent of schedulerEvents) {
                if (scheduleEvent.name.toLowerCase() === event_addpatient) {
                    var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                    if (templates === undefined || templates.length <= 0) continue;
                    var patients = deltaPatients[0];//.filter(x => x.appt_action === 0);
                    if (patients === undefined || patients.length <= 0) continue;
                    await this.processTemplateCommunication(patients, templates);
                }
            }
        }
    }

    static async ProcessByCategoryApp(category, scheduleEvents, deltaAppointments, templateWithEventList) {
        var schedulerEvents = scheduleEvents.filter(x => x.category_name.toLowerCase() === category.toLowerCase());
        if (schedulerEvents !== undefined && schedulerEvents.length > 0) {
            for (const scheduleEvent of schedulerEvents) {
                if (scheduleEvent.name.toLowerCase() === event_AppointmentScheduled) {
                    var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                    if (templates === undefined || templates.length <= 0) continue;
                    var appointments = deltaAppointments[0].filter(x => x.appt_action === 0);
                    if (appointments === undefined || appointments.length <= 0) continue;
                    await this.processTemplateCommunication(appointments, templates);
                }
                else if (scheduleEvent.name.toLowerCase() === event_AppointmentReScheduled) {
                    var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                    if (templates === undefined || templates.length <= 0) continue;
                    var appointments = deltaAppointments[0].filter(x => x.appt_action === 1);
                    if (appointments === undefined || appointments.length <= 0) continue;
                    await this.processTemplateCommunication(appointments, templates);
                }
                else if (scheduleEvent.name.toLowerCase() === event_AppointmentCancelled) {
                    var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                    if (templates === undefined || templates.length <= 0) continue;
                    var appointments = deltaAppointments[0].filter(x => x.appt_action === 3);
                    if (appointments === undefined || appointments.length <= 0) continue;
                    await this.processTemplateCommunication(appointments, templates);
                }
                else if (scheduleEvent.name.toLowerCase() === event_AppointmentMissed) {
                    var templates = templateWithEventList[0].filter(x => x.event_name.toLowerCase() === scheduleEvent.name.toLowerCase());
                    if (templates === undefined || templates.length <= 0) continue;
                    var appointments = deltaAppointments[0].filter(x => x.appt_action === 2);
                    if (appointments === undefined || appointments.length <= 0) continue;
                    await this.processTemplateCommunication(appointments, templates);
                }
            }
        }
    }


    static async processTemplateCommunication(appointments, templates) {
        for (const patient of appointments) {
            for (const templateItem of templates) {
                await templateService.sendCommunication(patient.patient_id, patient.apptmt_id, templateItem.template_id, 1);
            }
        }
    }

    static async processCampaignTemplate(appointments, template) {
        for (const patient of appointments) {
            if(template !== null)
                await templateService.sendCommunication(patient.patient_id, patient.apptmt_id, template.template_id, 1);
        }
    }

    static isRunProcess(lastJobRun, frequency) {
        if (lastJobRun !== null && lastJobRun !== undefined) {
            return new Date(moment()) >= new Date(moment(lastJobRun).add(frequency, 'minute'));
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

}

module.exports = scheduler;