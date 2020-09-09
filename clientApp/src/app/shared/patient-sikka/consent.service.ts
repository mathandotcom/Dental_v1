import { Injectable } from '@angular/core';
import { GenericService } from '../generic.service';
import { HttpClientService } from '../http-client.service';
import { ConsentReponse } from './consent.model';

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  consentApi: string = 'api/v1/patient/consents';
  consentTypes = [];

  constructor(
    private _http: HttpClientService,
    private genericService: GenericService
  ) { }

  retrive(patientId, consentType){
    let consentApiUrl = this.genericService.buildApiUrl(this.consentApi);
    consentApiUrl = `${consentApiUrl}/${consentType}/${patientId}`;
    return this._http.get<ConsentReponse>({url: consentApiUrl,  cacheMins: 10});
  }

  getFilePath(fileName){
    return this.genericService.buildPath(fileName);
  }


  consetTypes(){
    return this.consentTypes = [
      {id: 1, name: 'Extraction Consent'},
      {id: 2, name: 'Crown'},
      {id: 3, name: 'Photography'},
      {id: 4, name: 'Crown & Bridge'},
      {id: 5, name: 'Full & Partial Denture'},
      {id: 6, name: 'Dentistry Informed spanish'},
      {id: 7, name: 'Dentistry Minor spanish'}
    ];
  }


}
