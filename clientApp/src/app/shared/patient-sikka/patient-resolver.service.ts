import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PatientSikkaService } from './patient-sikka.service';
import { PatientSikkaResponse } from './patient-sikka.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientSikkaResolverService implements Resolve<any> {
  errorMessage: string;
  private patientResponse: PatientSikkaResponse;
  constructor(
    private router: Router, 
    private patientService: PatientSikkaService
    ) { }

  resolve(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
      return this.patientService.getAllPatient().pipe(
      catchError(error => {
        console.log(error);
        return of({ message : error.toString(), status: 'false'});
      }));
        /*
          .subscribe((response: PatientResponse) => {
            
            if(response.status.toString() === 'true'){
              if(response.patients.length){
                return response;
              }
            }
          },
          (err: HttpErrorResponse) => {
            this.errorMessage = err.toString();
            this.patientResponse = { message : err.toString(), status: 'false'};
            return this.patientResponse;
          });
        return patientsData;
        */
       //return patientsData;
    }

}
