import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TokenService } from '../token.service';
import { GenericService } from '../generic.service';
import { Observable, of, throwError } from 'rxjs';
import { PatientResponse, DoctorResponse } from './patient.model';
import { TreatmentPlanResponse } from './treatment.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  patientApi: string    = 'api/v1/patient/all';
  doctorApi: string     = 'api/v1/patient/doctor';
  treatmentApi: string  = 'api/v1/patient/treamentplan';
  treatmentSikkaApi: string  = 'api/v1/patient/treamentplansikka';

  patientResponse: PatientResponse;

  constructor(
    private httpClient: HttpClient,
    private genericService: GenericService) { }

  getAllPatient(): Observable<any> {
    let patientUrl = this.genericService.buildApiUrl(this.patientApi);
    return this.httpClient.get<PatientResponse>(patientUrl);
    //.pipe(catchError(this.handleError));

    /*
    let patientResult = this.httpClient.get<PatientResponse>(patientUrl)
      .subscribe((response: PatientResponse) => {
              
        if(response.status.toString() === 'true'){
          if(response.patients.length){
            this.patientResponse = response
            return response;
          }
        }
      },
      (err: HttpErrorResponse) => {
        this.patientResponse = { message : err.toString(), status: 'false'};
        return this.patientResponse;
      });
    return of(patientResult);
    */
  }

  getDoctor(): Observable<any> {
    let doctorUrl = this.genericService.buildApiUrl(this.doctorApi);
    return this.httpClient.get<DoctorResponse>(doctorUrl);
  }

  getTreatmentPlan(patientId: number){
    let treamentUrl = this.genericService.buildApiUrl(`${this.treatmentApi}/${patientId}`);
    return this.httpClient.get<TreatmentPlanResponse>(treamentUrl);
  }

  handleError(error: HttpErrorResponse){
    console.log(`some error: ${error}`);
    return throwError(error);
  }
    

}
