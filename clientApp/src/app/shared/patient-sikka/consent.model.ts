import { user } from '../auth-response';
import { Timestamp } from 'rxjs/internal/operators/timestamp';

export interface ConsentReponse{
    status: string;
    message: string;
    data?: ConsentModel[];
    user?: user
}

export interface ConsentModel{
    patientid: string;
    createdon: Date;
    filename: string;
    filePath: string;
    doctype: string;
    comments: string;
    created_by: string;
    firstname: string;
    lastname: string;
}