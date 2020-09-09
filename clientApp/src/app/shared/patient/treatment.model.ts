export interface TreatmentPlanResponse {
    status: string;
    message: string;
    data: TreatmentPlan[];
    payoption: PayOption;

}



export interface TreatmentPlan {
    patNum: number;
    fName: string;
    lName: string;
    heading: string;
    treatPlanAttachNum: number;
    treatPlanNum: number;
    procNum: number;
    priority: number;
    procStatus: number;
    codeNum: string;
    procCode: string;
    descript: string;
    procFee: number;
    insPayEst: number;
    insPayAmt: number;
    patientEst: number;

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