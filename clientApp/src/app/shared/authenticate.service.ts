import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GenericService } from './generic.service';
import { Observable, of } from 'rxjs';
import { TokenService } from './token.service';
import { user } from './auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  loginApi: string = 'api/v1/auth/login';
  
  constructor(private httpClient: HttpClient, private genericService: GenericService, private tokenService: TokenService) { }

  getsomedata(){
    return 'some data';
  }

  userAuthentication(emailInput: string, passwordInput: string): Observable<any> {
    let httpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Access-Control-Allow-Methods': 'HEAD, GET, POST, PUT, PATCH, DELETE',
      'No-Auth': 'True',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    let options = {
      headers: httpHeaders
    };
    let postData = { 'useremail': emailInput, 'userpassword': passwordInput };
    let loginUrl = this.genericService.buildApiUrl(this.loginApi);
    return this.httpClient.post(loginUrl, postData, options);

  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log(message);
  }
  
  getLoggedUser(): user{
    var user = JSON.parse(this.tokenService.getUser('lu'));
    if(user === null || user === undefined){
      return null;
    }
    return user;
    //return `${user.firstname} ${user.lastname}`;

  }
}
