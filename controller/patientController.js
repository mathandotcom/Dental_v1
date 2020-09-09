const fs = require('fs');
const root = require('../config/root');
const odroot = require('../config/odroot');
const path = require('path');
const logger = require('../logger/logconfig');
const treatmentModel = require('../models/treatmentplan');
var https = require('https');
var querystring = require('querystring');
const httpService = require('../services/httpService');
var http = new httpService();

exports.patients =  (req, res, next) => {
    res.render('patients/all-patient.hbs', {
        title:'Patient search', user: req.session.user
    });
};

exports.patientsApi =  (req, res, next) => {
    //var patients = [];
    treatmentModel.fetchAllPatient()
    .then(patientList => {
        console.log('Patients: ', patientList[0]);
        const patients = patientList[0];
        return res.json({status:'true', message:'', patients, user:req.loggedUser});
    })
    .catch(err => {
        return res.status(401).json({message:"Unable to get patient details" + err.message});
    });
};

//https://www.rapiddg.com/article/calling-rest-api-nodejs-script
exports.patientsSikkaApi2 = (req, res, next) => {
    var dataString = JSON.stringify({a:'a'});
    var method = 'GET';
    var headers = {};
    headers = {
        'Content-Type': 'application/json',
        //'Content-Length': dataString.length
      };
      var options = {
        host: 'https://api.sikkasoft.com',
        path: '/v2/patients?request_key=561e3c21a07461f5c575f37beeb786bf',
        method: method,
        headers: headers
      };
      var responseString = '';

    //return res.json({status:'true', message:'', responseString, user:req.loggedUser});

}

exports.patientsSikkaApi = (req, res, next) => {
    http.getFetch('v2/patients', {}, (response) => {
        if(response.http_code === undefined || response.length > 0){
            return res.json({status:'true', message:'', data: response, user:req.loggedUser});
        }
        else if(response.http_code !== undefined){
            return res.json({status:'false', message:response.long_message, data: [], user:req.loggedUser});
        }
    }, (err) => {
        return res.json({status:'false', message:err, data: [], user:req.loggedUser});
    });
}

exports.patientsSikkaApi1 = (req, res, next) => {
    var dataString = JSON.stringify({a:'a'});
    var method = 'GET';
    var headers = {};
    headers = {
        'Content-Type': 'application/json',
        //'Content-Length': dataString.length
      };
      var options = {
        host: 'https://api.sikkasoft.com/v2/patients?request_key=6a5779cd4ec7dd4f27fd68d406381571',
        path: '/v2/patients?request_key=6a5779cd4ec7dd4f27fd68d406381571',
        method: method,
        headers: headers
      };
      var responseString = '';

    var request = https.get('https://api.sikkasoft.com/v2/patients?request_key=6a5779cd4ec7dd4f27fd68d406381571',  (resp) => {
        resp.setEncoding('utf-8');
        resp.on('data', function (data) {
            responseString += data;
        });

        resp.on('end', () => {
            console.log(responseString);
            var responseObject = JSON.parse(responseString);
            //success(responseObject);
            return responseObject;
        });
        request.write(responseString);
        request.end();

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    return res.json({status:'true', message:'', responseString, user:req.loggedUser});

}


exports.doctorApi = (req, res, next) => {
    var doctor = {id: 1, name: process.env.DOCTORNAME}
    return res.json({status:'true', message:'', doctor, user:req.loggedUser});
};

exports.treatmentPlanApi =   (req, res, next) => {
    const id = req.params.id;
    treatmentModel.fetchTreatmentPlanById(id)
    .then(async ([data]) => {
        if(data.length > 0){
            var payOption = await treatmentModel.getPayOption(data[0].treatPlanNum);
            if(payOption !== null && payOption.length > 0 && payOption[0].length > 0){
                return res.status(200).json({status:'true', message:'', data, user:req.session.user, payoption: payOption[0][0]});
            }
            return res.status(200).json({status:'true', message:'', data, user:req.session.user, payoption: null});
        }
        var patient = await treatmentModel.fetchPatientById(id);
        return res.status(200).json({status:'false', data, user:req.session.user, payoption:null, message:`No treatment plan available for ${patient[0][0].lastName + ' ' + patient[0][0].firstName}`, error:''});
    })
    .catch(err => {
        logger.error(err);
        return res.status(401).json({status:'false', message:"Unable to get treatment plan details - ", error: err.message});
    });
};

exports.treatmentPlanSikkaApi = (req, res, next) => {
    const patientId = req.params.id;
    http.getFetch('v2/treatment_plans', {'patient_id': patientId}, async (response) => {
        if(response.http_code === undefined || response.length > 0){
            if(response[0].items !== null && response[0].items.length > 0){
                var guarantor_id = response[0].items[0].guarantor_id;
                var payOption = await treatmentModel.getPayOption(guarantor_id); 
                if(payOption !== null && payOption.length > 0 && payOption[0].length > 0){
                    return res.json({status:'true', message:'', data: response, user:req.loggedUser, payoption: payOption[0][0]});
                }
            }
            return res.json({status:'true', message:'', data: response, user:req.loggedUser, payoption: null});
        }
        else if(response.http_code !== undefined){
            return res.json({status:'false', message:response.long_message, data: [], user:req.loggedUser});
        }
    }, (err) => {
        logger.error(err);
        if(err.message.indexOf('invalid json') >= 0){
            return res.json({status:'false', message:'Unable to get treatment plan', data: [], user:req.loggedUser});
        }
        return res.json({status:'false', message:err.message, data: [], user:req.loggedUser});
    });
}


//    /api/patients/patientInfoApi/1
exports.patientInfoApi = async (req, res, next) =>{
    try {
        const id = req.params.id;
        var patient = await treatmentModel.fetchPatientById(id);
        if(patient.length > 0 && patient[0].length > 0){
            return res.json({data:patient[0], user:req.session.user});
        }
        return res.status(422).json({message:`Unable to get patient detail for '${id}' `});

    } catch (error) {
        return res.status(401).json({message:"Unable to get patient details - " + error.message});
    }
};

// /api/patients/consentsApi/1
exports.consentsApi = async (req, res, next) =>{
    try {
        const id = req.params.id;
        const consentType = req.params.ct;
        var consents = await treatmentModel.fetchConsentById(id, consentType);
        if(consents.length > 0 && consents[0].length > 0){
            return res.json({status:true, message:'', data:consents[0], user:req.session.user});
        }
        return res.json({status:false, message:`No consent document exist`, user:req.session.user});

    } catch (error) {
        return res.status(422).json({status:false, message:"Unable to get treatment plan details - " + err.message});
    }
};

exports.exconsent =  async (req, res, next) => {
    const id = req.params.id;
    const consenttype = req.params.consenttype;
    var title = "";
    var consents = await treatmentModel.fetchConsentById(id, consenttype);
    if(consenttype === "ex"){
        title = "Extraction Consent";
    }else if(consenttype === "de"){
        title = "Complete Denture Prosthetics";
    }else if(consenttype === "cr"){
        title = "Stainless Steel Crown";
    }else if(consenttype === "pp"){
        title = "Patient Photography";
    }else if(consenttype === "cb"){
        title = "Crown/Bridge Informed Consent";
    }else if(consenttype === "pd"){
        title = "Full and partial denture informed consent";
    }else if(consenttype === "di"){ //dentristory informed
        title = "Consentimiento informado para (procedimiento)";
    }else if(consenttype === "dm"){ //dentristory minor
        title = "Consentimiento informado para (procedimiento) de un menor de edad";
    }


    res.render('finance/exconsent.hbs', {
        title:title, 
        patientId:req.params.id,
        consenttype: consenttype,
        user: req.session.user,
        consents:consents
    });
};

exports.consent =  (req, res, next) => {
    const consenttype = req.params.consenttype;
    if(consenttype === "ex"){
        res.render('finance/consent.hbs', {
            title:'Patient Consent', 
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user
        });
    }
    else if(consenttype === "de"){
        res.render('finance/denture.hbs', {
            title:'Patient Consent', 
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user
        });
    }
    else if(consenttype === "cr"){
        res.render('finance/crown.hbs', {
            title:'Patient Consent', 
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user
        });
    }
    else if(consenttype === "pp"){
        res.render('finance/photography.hbs', {
            title:'Patient Photography', 
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user,
            doctorname:process.env.DOCTORNAME
        });
    }
    else if(consenttype === "cb"){
        res.render('finance/crownbridge.hbs', {
            title:'Crown/Bridge Informed Consent', 
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user,
            doctorname:process.env.DOCTORNAME
        });
    }
    else if(consenttype === "pd"){
        res.render('finance/partialdenture.hbs', {
            title:'Full and partial denture informed consent', 
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user,
            doctorname:process.env.DOCTORNAME
        });
    }
    else if(consenttype === "di"){
        res.render('finance/dentistryinformed_sp.hbs', {
            title:'Consentimiento informado para (procedimiento)',
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user,
            doctorname:process.env.DOCTORNAME
        });
    }
    else if(consenttype === "dm"){
        res.render('finance/dentistryminor_sp.hbs', {
            title:'Consentimiento informado para (procedimiento) de un menor de edad',
            patientId:req.params.id,
            consenttype:consenttype,
            user: req.session.user,
            doctorname:process.env.DOCTORNAME
        });
    }
};


exports.payoption =  (req, res, next) => {
    console.log(req.params.id);
    //console.log('Date :', new Date());
    res.render('finance/payOptions.hbs', {
        title:'Payment Options',
        patientId:req.params.id,
        user: req.session.user
    });
};

exports.saveAsImage = async (req, res, next) => {
    var fileName = "";
    let ts = Date.now();
    //let userId = req.session.user.id;
    let userId = req.body.loggedUserId;
    let clinicId = req.body.clinicId;
    let sec = Math.floor(ts/1000);
    var result = null;
    let userName = req.body.userName;
    const imgBase64 = req.body.imgBase64;
    const businessid = req.body.businessid;
    const bType = req.body.bType; //businessType
    const patientId = req.body.patientId;
    const consentType = req.body.consentType;
    
    if(fileName.indexOf('.png') < 0){
        fileName = `${userName}_${sec}.png`;
    }
    else{
        fileName = `${sec}_${userName}`;
    }
    console.log('fileName: ' + fileName);
    var base64DataPng = req.body.imgBase64.replace(/^data:image\/png;base64,/, "");
    //var base64DataJpeg = req.body.imgBase64.replace(/^data:image\/jpeg;base64,/, "");
    //var base64DataSvg = req.body.imgBase64.replace(/^data:image\/svg+xml;base64,/, "");
    console.log(root);
    console.log(odroot);
    var imageFolderPath = getImageFolderPath(root, bType);
    var imageFolderPath_od = getOpenDentalImageFolderPath(odroot, userName, patientId);

    await SaveImageToApplicationPath(businessid, imageFolderPath, fileName, base64DataPng, bType, userId, patientId, consentType, clinicId, res);
    await SaveImageToOpenDentalPath(businessid, imageFolderPath_od, fileName, base64DataPng, bType, userId, patientId, res);

  //console.log(base64DataPng);
  
};


function performRequest(endpoint, method, data, success) {
    var dataString = JSON.stringify(data);
    var headers = {};
    
    if (method == 'GET') {
      endpoint += '?' + querystring.stringify(data);
    }
    else {
      headers = {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      };
    }
    var options = {
      host: host,
      path: endpoint,
      method: method,
      headers: headers
    };
  
    var req = https.request(options, function(res) {
      res.setEncoding('utf-8');
  
      var responseString = '';
  
      res.on('data', function(data) {
        responseString += data;
      });
  
      res.on('end', function() {
        console.log(responseString);
        var responseObject = JSON.parse(responseString);
        success(responseObject);
      });
    });
  
    req.write(dataString);
    req.end();
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

function getOpenDentalImageFolderPath(rootPath, userName, patientId){
    var firstLetter = userName.charAt(0).toUpperCase();
    var imageFolder = path.join(rootPath, firstLetter, userName + patientId);
    if (!fs.existsSync(imageFolder)){
        fs.mkdir(path.resolve(imageFolder), { recursive: true }, err => {
            if (err) throw err;
        });
    }
    return imageFolder;
}

function getShortPath(imageFolder, fileName){
    var splitPath = imageFolder.split('public');
    var shortPath = "";
    if(splitPath.length > 1){
        shortPath = splitPath[1].replace(/\\/g,'/');
    }
    else{
        shortPath = splitPath.replace(/\\/g,'/');
    }

    return `${shortPath}/${fileName}`;
    //return path.join(shortPath, fileName);
}

async function SaveImageToApplicationPath(businessid, imageFolderPath, fileName, base64DataPng, bType, userId, patientId, consentType, clinicId, res){
    fs.writeFile(path.join(imageFolderPath, `${fileName}`), base64DataPng, 'base64', async function (err) {
        if (err) {
            console.log(err);
            return res.json({ error: false, message: err });
        }
        else {
            logger.info(`Payment option has been saved with the filename : '${fileName}`);
            try {
                var imageLocation = getShortPath(imageFolderPath, fileName);
                if(bType === process.env.TREATMENTPLAN){
                    result = await treatmentModel.addPaymentOption(businessid, imageLocation, fileName, userId, clinicId);
                }
                else if (bType === process.env.CONSENTFORM){
                    result = await treatmentModel.addConsent(businessid, imageLocation, fileName, userId, clinicId, patientId);
                }
                
                if(result.length > 0 && result[0].insertId > 0){
                    logger.info(`Data has been been added in table with ${fileName}`);
                    console.log('Data update successful');
                    //return res.json({ error: false, message: process.env.CONFIRMATION_SUCCESS });
                }
                else{
                    logger.info(`${process.env.CONFIRMATION_FAILURE}  ${fileName}`);
                    return  await res.json({ status: 'true', message: process.env.CONFIRMATION_FAILURE });
                }
            } catch (error) {
                logger.info(`${process.env.CONFIRMATION_FAILURE}  ${error.stack}`);
                //throw `${process.env.CONFIRMATION_FAILURE}  ${error}`;
                return await res.status(422).json({ status: 'false', message: process.env.CONFIRMATION_FAILURE });
            }
        }
    });
}

async function SaveImageToOpenDentalPath(businessid, imageFolderPath_od, fileName, base64DataPng, bType, userId, patientId, res){
    var result = null;
    var result1 = null;
    fs.writeFile(path.join(imageFolderPath_od, `${fileName}`), base64DataPng, 'base64', async function (err) {
        if (err) {
            console.log(err);
            return res.json({ error: false, message: err });
        }
        else {
            logger.info(`Payment option has been saved with the filename : '${fileName}`);
            try {
                if(bType === process.env.TREATMENTPLAN){
                    result = await treatmentModel.addScannedDocument(132, patientId, fileName, 2);
                }
                else if (bType === process.env.CONSENTFORM){
                    result = await treatmentModel.addScannedDocument(133, patientId, fileName, 2);
                }
                if(result.length > 0 && result[0].insertId > 0){
                    logger.info(`Data has been been added in table with ${fileName}`);
                    console.log('Data update successful');
                    return res.json({ status: 'true', message: process.env.CONFIRMATION_SUCCESS, imagesource: base64DataPng});
                }
                else{
                    logger.info(`${process.env.CONFIRMATION_FAILURE}  ${fileName}`);
                    return res.json({ status: 'false', message: process.env.CONFIRMATION_FAILURE , imagesource: ''});
                }
            } catch (error) {
                logger.info(`${process.env.CONFIRMATION_FAILURE}  ${error}`);
                if(error.code ==="ECONNREFUSED")
                    return res.status(422).json({ status: 'false', message: `Oops. unable to connect to the datasource. Please check the datasource status` });
                else
                return res.status(422).json({ status: 'false', message: `${process.env.CONFIRMATION_FAILURE}  ${error}` });
            }
        }
    });
}


function performRequest(endpoint, method, data, success) {
    var host = 'https://api.sikkasoft.com';
    var dataString = JSON.stringify(data);
    var headers = {};
    
    if (method == 'GET') {
      endpoint += '?' + querystring.stringify(data);
    }
    else {
      headers = {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      };
    }
    var options = {
      host: host,
      path: endpoint,
      method: method,
      headers: headers
    };
  
    var request = https.get('https://api.sikkasoft.com/v2/patients?request_key=561e3c21a07461f5c575f37beeb786bf',  (resp) => {
        resp.setEncoding('utf-8');
        var responseString = '';

        resp.on('data', function (data) {
            responseString += data;
        });

        resp.on('end', () => {
            console.log(responseString);
            var responseObject = JSON.parse(responseString);
            success(responseObject);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    request.end();

    /*
    var req = https.request(options, function(res) {
      res.setEncoding('utf-8');
  
      var responseString = '';
  
      res.on('data', function(data) {
        responseString += data;
      });
  
      res.on('end', function() {
        console.log(responseString);
        var responseObject = JSON.parse(responseString);
        success(responseObject);
      });
    });
  
    req.write(dataString);
    req.end();
    */

  }