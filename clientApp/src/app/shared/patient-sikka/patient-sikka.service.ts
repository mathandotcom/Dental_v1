import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, throwError } from 'rxjs';
import { GenericService } from '../generic.service';
import { DoctorResponse } from '../patient/patient.model';
import { TreatmentPlanResponse } from '../patient/treatment.model';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TreatmentPlanSikkaResponse } from './treatment.model';
import { PatientSikkaResponse } from './patient-sikka.model';

@Injectable({
  providedIn: 'root'
})
export class PatientSikkaService {
  patientApi: string    = 'api/v1/patient/sikka';
  doctorApi: string     = 'api/v1/patient/doctor';
  treatmentApi: string  = 'api/v1/patient/treamentplansikka'; 
  
  patientResponse: PatientSikkaResponse;
  
  constructor(private _http: HttpClientService, private genericService: GenericService) { }

  getAllPatient(): Observable<any> {
    let patientUrl = this.genericService.buildApiUrl(this.patientApi);
    return this._http.getCached<object[]>({url: patientUrl,  cacheMins: 10});
  }

  getDoctor(): Observable<any> {
    let doctorUrl = this.genericService.buildApiUrl(this.doctorApi);
    return this._http.get<DoctorResponse>({url: doctorUrl, cacheMins: 10});
  }

  getTreatmentPlan(patientId: number){
    let treamentUrl = this.genericService.buildApiUrl(`${this.treatmentApi}/${patientId}`);
    return this._http.get<TreatmentPlanSikkaResponse>({url: treamentUrl});
  }
  
  handleError(error: HttpErrorResponse){
    console.log(`some error: ${error}`);
    return throwError(error);
  }
}
