import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
//import  {asObservable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private messageSource = new Subject();
  message$ = this.messageSource.asObservable();

  constructor() { }

  next(val: string) {
    this.messageSource.next(val);
  }

}
