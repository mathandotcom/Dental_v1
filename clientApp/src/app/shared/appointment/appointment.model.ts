import { SikkaPatientModel } from '../patient-sikka/patient-sikka.model';
import { Pagination } from '../patient-sikka/treatment.model';
import { user } from '../auth-response';

export interface AppointmentRequest{
    apptdate: string;
}


export interface AppointmentResponse
{
    status: string,
    message: string,
    data?: Data[],
}
export interface AppointmentConfirmationResponse
{
    status: string,
    message: string,
}

export interface Data{
    execution_time: string,
    total_count: string,
    limit: string,
    offset: string,
    items: AppointmentModel[],
    pagination: Pagination
}
export interface AppointmentModel{
    appointment_sr_no: string;
    patient_id: string;
    patient: SikkaPatientModel;
    operatory: string;
    date: string;
    time: string;
    length: string;
    description: string;
    amount: string;
    status: string;
    last_changed_date: string;
    appointment_made_date: string;
    type: string;
    procedure_code1: string;
    procedure_code1_amount: string;
    procedure_code2: string;
    procedure_code2_amount: string;
    procedure_code3: string;
    procedure_code3_amount: string;
    procedure_code4: string;
    procedure_code4_amount: string;
    procedure_code5: string;
    procedure_code5_amount: string;
    procedure_code6: string;
    procedure_code6_amount: string;
    procedure_code7: string;
    procedure_code7_amount: string;
    hygienist: string;
    provider_id: string;
    provider: string;
    practice_id: string;
    practice: string;
    is_companion: string;
    sooner_if_possible: string;
    confirmed_on_date: string;
    note: string;
    firstName: string;
    middleName: string;
    lastName: string;
    patient_name: string;
    cell: string;
    email: string;
    guarantor_id: string;
    guarantor_name: string;
    procedure_code1_time: string;
    procedure_code2_time: string;
    procedure_code3_time: string;
    procedure_code4_time: string;
    procedure_code5_time: string;
    procedure_code6_time: string;
    procedure_code7_time: string;
    tooth_number: string;
    surface_quadrant: string;
    surface_quadrant_type: string;
    schedule: string;
    treatment_class: string;
    cancelled: string;
    procedure_codes: [];
    confirmed: number;
    aptStatus: number;
    aptConfirmedStatus: string;
    aptConfirmedStatusValue: string;
    dateFirstVisit: string;
    confirm_status: string;
    confirm_icon: string;
    confirmed_on_title: string
    reminderSentOn: string;
    task: string;
    displayStatus: string;
    displayStatusColor: string;
    dateTimeSent: string;
    smsSentStatus: string;
    isSmsSent: number;
    smsReminderTitle: string;
    sendtext: number;
}



export interface ReminderSmsResponse{
    status: string,
    message: string
    

}

export interface RescheduleResponse{
    status: string,
    message: string,
    result: string

}