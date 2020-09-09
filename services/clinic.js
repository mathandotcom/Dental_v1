const logger = require('../logger/logconfig');
const clinicModel = require('../models/clinic');

const clinicService = class ClinicService {

    constructor(){}

    static async getClinic(){
        var clinicInfo = await clinicModel.getClinic();
        if(clinicInfo !== undefined && clinicInfo.length > 0){
            if(clinicInfo[0] !== undefined && clinicInfo[0].length > 0){
                clinicModel.setClinicName(clinicInfo[0][0].clinic_name);
                clinicModel.setClinicContact(clinicInfo[0][0].primary_phone);
                clinicModel.setClinicAddress(clinicInfo[0][0].clinic_address);
                clinicModel.setDoctorName(clinicInfo[0][0].primary_contact);
            }
        }
    }
}

module.exports = clinicService;
