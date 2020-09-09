import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AppointmentRequest } from './appointment.model';
import { AppointmentService } from './appointment.service';
import { catchError } from 'rxjs/operators';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AppointmentResolverService implements Resolve<any> {
  
  appointmentRequest: AppointmentRequest;
  today: Date = new Date();
  jsToday: string = formatDate(this.today, 'MM/dd/yyyy', 'en-US');
  
  constructor(
    private router: Router, 
    private appintmentService: AppointmentService
    ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    
    let appointmentRequest1 = JSON.stringify({apptdate: formatDate(this.today, "yyyy-MM-dd", "en-US")});
    //let requestdDate = formatDate(this.today, "yyyy-MM-dd", "en-US");
    let requestdDate = {apptdate: formatDate(this.today, "MM/dd/yyyy", "en-US")};
    return this.appintmentService.getAppointments(requestdDate).pipe(
    catchError(error => {
      console.log(error);
      return of({ message : error.toString(), status: 'false'});
    }));
  }
}
