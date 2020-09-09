const logger = require('../logger/logconfig');

var placeHolder = class PlaceHolder{
    constructor(FirstName, LastName, FullName, ApptDatetime, ClinicName, ClinicContact, ClinicAddress, DoctorName){
        this.FirstName =        FirstName ===       undefined ? '' : FirstName;
        this.LastName =         LastName  ===       undefined ? '' : LastName;
        this.FullName =         FullName  ===       undefined ? '' : FullName;
        this.ApptDatetime =     ApptDatetime ===    undefined ? '' : ApptDatetime;
        this.ClinicName =       ClinicName ===      undefined ? '' : ClinicName;
        this.ClinicContact =    ClinicContact ===   undefined ? '' : ClinicContact;
        this.ClinicAddress =    ClinicAddress ===   undefined ? '' : ClinicAddress;
        this.DoctorName =       DoctorName ===      undefined ? '' : DoctorName;
    }

}

module.exports = placeHolder;