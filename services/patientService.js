const httpService = require('../services/httpService');
var http = new httpService();


var patientService = class PatientService{

    patientName(patientId){
        http.getFetch('v2/treatment_plans', {'patient_id': patientId}, (response) => {
            
        });
    }


}

module.exports = patientService;