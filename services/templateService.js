const logger = require('../logger/logconfig');
const templateModel = require('../models/template');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');

const util = require('util');
const fs = require('fs');
const path = require('path');
const root = require('../config/root');
const { cloudinary } = require('../config/cloudinary');


var templateService = class TemplateService{

    static async sendCommunication(patientId, appintmentId, templateId, userId){
        try {
            var messageConfig = await templateModel.getAutoMailContent(patientId, appintmentId, templateId);
    
            if (messageConfig !== undefined && messageConfig !== null) {
                try {
                    if (messageConfig.template.subcategory_name.toLowerCase() === 'text') {
                        console.log(`Category: ${messageConfig.template.subcategory_name.toLowerCase()}`); //text
                        if(messageConfig.patient.sendtext === 2 ){
                            logger.info(`Text message did not send to ${messageConfig.patient.patient_name} (${messageConfig.patient.cell}) as patient opted to stop sending text`);
                            return { status: 'false', message: `Text message did not send to ${messageConfig.patient.patient_name} (${messageConfig.patient.cell}) as patient opted to stop sending text` };
                        }
                        var result = await smsService.sendMessage(patientId, messageConfig.patient.cell, messageConfig.bodyContent, userId);
                        var result = {status: 'true'};
                        if (result.status === 'true') {
                            return { status: 'true', message: '', result: result.result };
                        }
                        else{
                            return { status: 'false', message: result.result, result: result.result };
                        }
                    }
                    else if (messageConfig.template.subcategory_name.toLowerCase() === 'email') {
                        console.log(`Category: ${messageConfig.template.subcategory_name.toLowerCase()}`); //email
                        if(messageConfig.patient.email === undefined || messageConfig.patient.email === '') {
                            logger.info(`Email id is missing for patient ${messageConfig.patient.patient_name} (${messageConfig.patient.patient_id})`);
                            return { status: 'false', message: `Email id is missing for patient ${messageConfig.patient.patient_name} (${messageConfig.patient.patient_id})`};
                        }
                        var result = await emailService.sendMail(messageConfig.patient, messageConfig.template, messageConfig.bodyContent);
                        if (result.status === 'true') {
                            return { status: 'true', message: '', result: result.result };
                        }
                        else {
                            return { status: 'false', message: result.message, result: result.result };
                        }
                    }
                }
                catch (error) {
                    logger.error(error.stack);
                    return { status: 'false', message: `${error.message}` };
                }
            }
            return { status: 'false', message: `Unable to parge message template for template id ${templateId}` };
        }
        catch (error) {
            logger.info(`error:  ${error.stack}`);
            return { status: 'false', message: `error: ${error.message}` };
        }
    }

    static async transformTemplateBodyMessage(message){
        var BASE64_MARKER = ';base64,';
        var mime = message.split(BASE64_MARKER)[0].split(':')[1];
        var filename = 'justdental-' + (new Date()).getTime() + '.' + mime.split('/')[1];
        var messageImageUri = message.split(BASE64_MARKER)[1];
        var bodyImageUri = messageImageUri.split('">')[0];
        var bodyMessage = message.split('data:image');

    }

    static async transformTemplateImage1(imageBase64) {
        const bType = 'template';
        var BASE64_MARKER = ';base64,';
        try {
            var mime = imageBase64.split(BASE64_MARKER)[0].split(':')[1];
            var filename = 'justdental-' + (Math.floor((Date.now()) / 1000)) + '.' + mime.split('/')[1];

            var base64DataPng = imageBase64.replace(/^data:image\/png;base64,/, "");
            var imageFolderPath = getImageFolderPath(root, bType);
            await fs.writeFile(path.join(imageFolderPath, `${filename}`), base64DataPng, {encoding: 'base64'}, async function (err) {
                if (err) {
                    console.log(err);
                    return err;
                }
                return `imageFolderPath/${filename}`;
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    static async transformTemplateImage(imageBase64, index){
        const bType = 'template';
        var BASE64_MARKER = ';base64,';
        try{
            var mime = imageBase64.split(BASE64_MARKER)[0].split(':')[1];
            var filename = 'justdental-' + (Math.floor((Date.now()) / 1000)) + `_${index}.` + mime.split('/')[1];
            var base64DataPng = imageBase64.replace(/^data:image\/png;base64,/, "");
            var imageFolderPath = templateService.getImageFolderPath(root, bType);
            var imagePath = path.join(imageFolderPath, filename);

            var cloudinaryFilename = await this.uploadImageToCloud(imageBase64, filename);
            return cloudinaryFilename;

            const fs_writeFile = util.promisify(fs.writeFile);
            
            return new Promise(function(resolve, reject) {
    
            fs_writeFile(imagePath, base64DataPng, 'base64')
                .then(() => {
                    console.log(imagePath);
                    resolve(filename);
                })
                .catch((error) => {
                    console.log(error);
                    reject('error: ' + error.message);
                });
            });

        }
        catch (err) {
            console.error(err);
        }
    }

    static async uploadImageToCloud(imageBase64, filename){
        try{
            const fileStr = imageBase64;
            const uploadResponse = await cloudinary.uploader
            .upload(fileStr, {
                upload_preset: 'ml_default',
            });
            console.log(uploadResponse);
            logger.info('Image upload response: ' + uploadResponse);
            return uploadResponse.url;
        }
        catch(error){
            console.log(error);
            return 'failed to upload';
        }

    }


    static getImageFolderPath(rootPath, bType){
        var imageFolder = path.join(rootPath, bType);
        if (!fs.existsSync(imageFolder)){
            fs.mkdir(path.resolve(imageFolder), { recursive: true }, err => {
                if (err) throw err;
            });
        }
        return imageFolder;
    }
}

function getImageFolderPath(rootPath, bType){
    var imageFolder = path.join(rootPath, bType);
    if (!fs.existsSync(imageFolder)){
        fs.mkdir(path.resolve(imageFolder), { recursive: true }, err => {
            if (err) throw err;
        });
    }
    return imageFolder;
}

module.exports = templateService;


