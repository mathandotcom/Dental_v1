import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { RegisterUserService } from './register-user.service';
import { UserModel } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class ListuserResolverService implements Resolve<any>{
  
 
  constructor(
    private router: Router, 
    private userService : RegisterUserService                     
  ) {
   
   }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<any> | Promise<any> | any {
    return this.userService.listAllUser().pipe(
      catchError(error => {
        console.log(error);
        return of({ message : error.toString(), status: 'false'});
      }));
  }

}
