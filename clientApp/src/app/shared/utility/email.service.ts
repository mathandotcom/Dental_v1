import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { GenericService } from '../generic.service';
import { Observable } from 'rxjs';
import { SendMailResponse } from './email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  sendMailApi: string    = 'api/v1/email/sendAsync';

  constructor(
    private _http: HttpClientService,
    private genericService: GenericService
  ) { }


   sendAsync(mailObj): Observable<any>{
    let sendMailUrl = this.genericService.buildApiUrl(this.sendMailApi);
    return this._http.post<SendMailResponse>({url: sendMailUrl, body: mailObj});
   } 

}
