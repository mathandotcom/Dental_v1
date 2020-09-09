import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericService } from '../generic.service';
import { DoctorResponse } from '../patient/patient.model';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  doctorApi: string     = 'api/v1/patient/doctor';

  doctorResponse: DoctorResponse;
  doctorName: string;
  
  constructor(private genericService: GenericService, private _http: HttpClientService) { }

  getDoctorApi(): Observable<any> {
    let doctorUrl = this.genericService.buildApiUrl(this.doctorApi);
    return this._http.get<DoctorResponse>({url: doctorUrl, cacheMins: 10});
  }
  

  getDoctor(): string {
    this.doctorName = '';
    var patients = this.getDoctorApi()
    .subscribe((response: DoctorResponse) => {
      this.doctorResponse = response;
      if(response.status === 'true'){
        this.doctorName = response.doctor.name;
      }
    },
    (err: HttpErrorResponse) => {
      console.log(err.message);
    });
    return this.doctorName;
  }
}
