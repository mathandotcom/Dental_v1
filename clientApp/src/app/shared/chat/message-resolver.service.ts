import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ChatPatientsResponse } from './message.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class MessageResolverService {

  constructor(
    private router: Router,
    private chatPatientService: MessageService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ChatPatientsResponse> | Promise<any> | any {
    return this.chatPatientService.getChatPatients().pipe(
    catchError(error => {
      console.log(error);
      return of({ message : error.toString(), status: 'false'});
    }));
  }
}
