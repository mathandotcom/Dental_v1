import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventResolverService implements Resolve<any>{

  constructor(
    private eventService: EventService
  ) { }
  //https://stackoverflow.com/questions/48146996/angular-4-how-to-return-multiple-observables-in-resolver
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.eventService.getEvents().pipe(
      catchError(error => {
        console.log(error);
        return of({ message : error.toString(), status: 'false'});
      }));
  }
}
