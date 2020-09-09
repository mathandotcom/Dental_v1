import { user } from '../auth-response';

export interface PatientResponse{
    status: string,
    message: string,
    patients?: PatientModel[],
    user?: user
}

export interface PatientModel {
    id : number
    ,firstName : string
    ,lastName : string
    ,middleName : string
    ,patient_name: string
    ,PatStatus : string
    ,gender : string
    ,gendertext: string
    ,position : string
    ,dob : string
    ,address : string
    ,address2 : string
    ,city : string
    ,state : string
    ,cell : string
    ,homePhone : string
    ,workPhone : string
    ,email : string  
    ,zip: string
    ,Age : number
    ,patstatus: number
    ,lastvisit: string
    ,firstvisit: string
    ,imagefolder: string
    ,sendtext: number
}

export interface DoctorResponse {
    status: string,
    message: string,
    doctor: DoctorModel
}

export interface DoctorModel {
    id: string,
    name: string
}
  
