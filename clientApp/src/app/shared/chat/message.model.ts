export interface ChatPatientsResponse {
    status: string,
    message: string,
    data: ChatPatient[];
}

export interface ChatPatient{
    patientId: number,
    patient_name: string,
    cell: string,
    homephone: string,
    id: number,
    chat_id: number,
    sender_id: number,
    recipient_id: number,
    conversation_id: string,
    conversation_dir: string,
    message: string,
    createdon: string,
    createdby: number,
    user_id: number,
    user_name: string
}

export interface PatientMessageResponse{
    status: string,
    message: string,
    data: PatientMessages[];
}
export interface PatientMessages{
    date: string,
    messages: PatientMessage[];
}

export interface PatientMessage{
    id: number,
    chat_id: number,
    patient_id: number,
    sender_id: number,
    recipient_id: number,
    conversation_id: string,
    message: string,
    createdon: string,
    createdby: number,
    patient_name: string,
    user_name: string
    gender: number,
    received_date: string,
    received_time: string
}

export interface SendMessageResponse {
    status: string,
    message: string
}