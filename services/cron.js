var schedule = require('node-schedule');
const moment = require('moment');
const logger = require('../logger/logconfig');
const scheduler = require('./scheduler');
const clinicService = require('./clinic');


var cronSchedule = class CronSchedule {

    constructor() {
        CronSchedule = true;
    }
    
    
    
    static async startCronJob(){
        await this.startJob();
        await this.startBirthdayJob();
        await this.startCampaignJob();
    }


    static async startJob() {
        var jobCount = 0;
        /* This runs at the 1 mintue of every hour. */
        logger.info('starting Cron job');
        var clinicInfo = await clinicService.getClinic();
        schedule.scheduleJob('*/1 * * * *', (async function () {
            try {
                jobCount += 1;
                console.log(`This runs at the 1 mintue of every hour. ${jobCount} - ${moment()}`);
                logger.info(`This runs at the 1 mintue of every hour. ${jobCount} - ${moment()}`);
                await scheduler.invoke();
            }
            catch (error) {
                console.log(error);
            }
        }));
    }

    static async startBirthdayJob() {
        var jobCount = 0;
        /* This runs at the 1 mintue of every hour. */
        logger.info('starting Birthday Cron job');
        schedule.scheduleJob('0 5 * * *', (async function () {
            try {
                jobCount += 1;
                logger.info(`This runs at the 1 mintue of every hour. ${jobCount} - ${moment()}`);
                await scheduler.invokeBirthdayWishes();
            }
            catch (error) {
                console.log(error);
            }
        }));
    }

    static async startCampaignJob() {
        var jobCount = 0;
        /* This runs at the 1 mintue of every hour. */
        logger.info('starting Campaign Cron job');
        await scheduler.invokeCampaigns();
        schedule.scheduleJob('0 0/1 * * *', (async function () {
            try {
                jobCount += 1;
                logger.info(`This runs at the 1 mintue of every hour. ${jobCount} - ${moment()}`);
                await scheduler.invokeCampaigns();
            }
            catch (error) {
                console.log(error);
            }
        }));
    }
}

module.exports = cronSchedule;
