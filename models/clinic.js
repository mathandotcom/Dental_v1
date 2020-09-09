const mysql = require('mysql2');
const logger = require('../logger/logconfig');
const justdental = require('../config/authpool');

const clinicModel = class ClinicModel {

    // static ClinicName = '';
    // static DoctorName = '';
    // static ClinicContact = '';
    // static ClinicAddress = '';

    constructor(){}

    static setClinicName(value){
        this.ClinicName = value;
    }

    static getClinicName(){
        return this.ClinicName;
    }

    static setDoctorName(value){
        this.DoctorName = value;
    }

    static getDoctorName(){
        return this.DoctorName;
    }

    static setClinicContact(value){
        this.ClinicContact = value;
    }

    static getClinicContact(){
        return this.ClinicContact;
    }
    static setClinicAddress(value){
        this.ClinicContact = this.ClinicAddress;
    }

    static getClinicAddress(){
        return this.ClinicAddress;
    }

    
    static async getClinic(token, userId){
        try {
            var query = mysql.format(retrieveClinicSql, []);
            var queryResult = justdental.query(query);
            return await queryResult;

        } catch (error) {
            logger.error(error);
            throw error;
        }
    }
}

module.exports = clinicModel;

const retrieveClinicSql = `select cl.id
                            ,cl.name as clinic_name
                            ,cl.groupof
                            ,CONCAT(cl.address1, ' ', IFNULL(CONCAT(cl.address2, ' '),''), IFNULL(CONCAT(cl.city, ' '),''), cl.state, ' ', cl.zip) as clinic_address
                            ,cl.primary_contact
                            ,cl.primary_phone
                            ,cl.secondary_phone
                            ,cl.primary_email
                            from clinic cl`;