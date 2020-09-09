import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PatientService } from './patient.service';
import { PatientResponse } from './patient.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientResolverService implements Resolve<any> {
  errorMessage: string;
  private patientResponse: PatientResponse;
  constructor(
    private router: Router,
    private patientService: PatientService
  ) { }

  resolve(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<PatientResponse> | Promise<any> | any {
      return this.patientService.getAllPatient().pipe(
      catchError(error => {
        console.log(error);
        return of({ message : error.toString(), status: 'false'});
      }));
    }

}
