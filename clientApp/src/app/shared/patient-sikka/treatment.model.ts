export interface TreatmentPlanSikkaResponse {
    status: string;
    message: string;
    data?: Data[];
    payoption: PayOption;
}

export interface Data{
    execution_time: string,
    total_count: string,
    limit: string,
    offset: string,
    items: SikkaTreatmentPlan[],
    pagination: Pagination
}

export interface Pagination {
    current: string,
    first: string,
    last: string,
    next: string,
    previous: string
}


export interface SikkaTreatmentPlan {
    patient_id: number;
    provider_id: string;
    fName: string;
    lName: string;
    heading: string;
    treatPlanAttachNum: number;
    patient: {};
    guarantor_id: string;
    plan_sr_no: string;
    priority: number;
    procStatus: number;
    procedure_date: string;
    procedure_code: string;
    description: string;
    amount: number;
    entry_date: string;
    primary_insurance_estimate: number;
    secondary_insurance_estimate: number;
    insurance_payment: number;
    treatment_plan_status: string;
    practice_id: string;
    patientEst: number;
    practice: {};
    tooth_from: string;
    tooth_to: string;
    surface: string;
    surface_quadrant_type: string;
    created_by: string
    appointment_sr_no: string;

}

export interface PayOption{
    filePath: string;
    filename: string;
    comments: string;
    treatplannum: number;
    id: number;
    created_by: number;
    createdon: string;

}