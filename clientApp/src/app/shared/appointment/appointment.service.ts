import { Injectable } from '@angular/core';
import { AppointmentResponse, AppointmentModel } from './appointment.model';
import { HttpClientService } from '../http-client.service';
import { GenericService } from '../generic.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  apptSikkaApi: string   = 'api/v1/appt/appointmentbydatesikka';
  apptApi: string        = 'api/v1/appt/appointmentbydate';
  upcomingApptApi: string = 'api/v1/appt/upcomingappointment';
  smsSikkaApi: string    = 'api/v1/comm/remindsmssikka';
  smsApi: string         = 'api/v1/comm/remindsmsaptnum';
  reminderApi: string    = 'api/v1/comm/sendreminder';

  setApmtApi: string     = 'api/v1/appt/updateappointment';
  reviewsApi: string    = 'api/v1/comm/sendreviewslink';
  setRescheduleApmtApi: string     = 'api/v1/appt/rescheduleappointment';

  appointmentResponse: AppointmentResponse;
  appointmentModel: AppointmentModel[];
  
  constructor(
    private _http: HttpClientService, 
    private genericService: GenericService
  ) { }
  
  getAppointments(appointmentRequestDate): Observable<any> {
    let apptUrl = this.genericService.buildApiUrl(this.apptApi);
    //apptUrl = `${apptUrl}?q=${appointmentRequestDate}`;
    return this._http.post<object[]>({url: apptUrl,  cacheMins: 10, body: appointmentRequestDate});
  }

  getUpcomingAppointments(): Observable<any> {
    let apptUrl = this.genericService.buildApiUrl(this.upcomingApptApi);
    //apptUrl = `${apptUrl}?q=${appointmentRequestDate}`;
    return this._http.post<object[]>({url: apptUrl,  cacheMins: 10});
  }

  getAppointmentsSikka(appointmentRequestDate): Observable<any> {
    let apptUrl = this.genericService.buildApiUrl(this.apptApi);
    apptUrl = `${apptUrl}?q=${appointmentRequestDate}`;
    return this._http.get<object[]>({url: apptUrl,  cacheMins: 10});
  }

  sendCommunicationSikka(commDetails): Observable<any> {
    let apptUrl = this.genericService.buildApiUrl(this.smsSikkaApi);
    return this._http.post<object[]>({url: apptUrl,  cacheMins: 10, body:commDetails});
  }

  sendCommunication(commDetails): Observable<any> {
    let apptUrl = this.genericService.buildApiUrl(this.smsApi);
    return this._http.post<object[]>({url: apptUrl,  cacheMins: 10, body:commDetails});
  }

  updateConfirmation(aptNum): Observable<any> {
    let apptUrl = this.genericService.buildApiUrl(this.setApmtApi);
    return this._http.post<object[]>({url: apptUrl,  cacheMins: 10, body:aptNum});
  }

  sendReminder(commDetails): Observable<any> {
    let reminderUrl = this.genericService.buildApiUrl(this.reminderApi);
    return this._http.post<object[]>({url: reminderUrl,  cacheMins: 10, body:commDetails});
  }

  rescheduleAppointment(rescheduleObject): Observable<any> {
    let apptUrl = this.genericService.buildApiUrl(this.setRescheduleApmtApi);
    return this._http.post<object[]>({url: apptUrl,  cacheMins: 10, body:rescheduleObject});
  }

}
