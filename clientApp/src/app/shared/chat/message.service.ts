import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericService } from '../generic.service';
import { Observable } from 'rxjs';
import { ChatPatientsResponse, PatientMessageResponse, SendMessageResponse } from './message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  patientApi: string    = 'api/v1/comm/chatpatients';
  messageApi: string    = 'api/v1/comm/chatmessage';
  sendSMSApi: string    = 'api/v1/comm/sendmessage';

  constructor(
    private httpClient: HttpClient,
    private genericService: GenericService) { }


    getChatPatients(): Observable<any> {
      let patientUrl = this.genericService.buildApiUrl(this.patientApi);
      return this.httpClient.get<ChatPatientsResponse>(patientUrl);
    }
    
    getChatMessages(patientIdObj): Observable<any> {
      let messageUrl = this.genericService.buildApiUrl(this.messageApi);
      return this.httpClient.post<PatientMessageResponse>(messageUrl,patientIdObj);
    }

    sendMessage(mObject): Observable<any> {
      let messageUrl = this.genericService.buildApiUrl(this.sendSMSApi);
      return this.httpClient.post<SendMessageResponse>(messageUrl,mObject);
    }

}
