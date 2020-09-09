import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { GenericService } from '../generic.service';
import { Observable } from 'rxjs';
import { EventResponse } from './event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  eventsApi: string    = 'api/v1/template/events';

  constructor(
    private _http: HttpClientService,
    private genericService: GenericService
  ) { }

  getEvents(): Observable<any>{
    let eventUrl = this.genericService.buildApiUrl(this.eventsApi);
    return this._http.get<EventResponse>({url: eventUrl});
  }
}
