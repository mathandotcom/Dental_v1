import { Injectable } from '@angular/core';
import { SignupResponse } from './signup.model';
import { UserResponse } from './user.model';
import { HttpClientService } from '../http-client.service';
import { GenericService } from '../generic.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegisterUserService {
  signupApi: string = 'api/v1/auth/signup';
  updateApi: string = 'api/v1/auth/update';
  listUserApi: string = 'api/v1/auth/users';

  constructor(
    private _http: HttpClientService,
    private genericService: GenericService
  ) { }

  signupUser(userData): Observable<any>{
    let signupUrl = this.genericService.buildApiUrl(this.signupApi);
    const headers = new HttpHeaders({'No-Auth':'True'});
    headers.append('Content-Type', 'application/json');
    return this._http.put<SignupResponse>({url: signupUrl, body: userData, headers: headers});
  }

  updateUser(userData): Observable<any>{
    let updateUrl = this.genericService.buildApiUrl(this.updateApi);
    //const headers = new HttpHeaders({'No-Auth':'True'});
    //headers.append('Content-Type', 'application/json');
    return this._http.put<SignupResponse>({url: updateUrl, body: userData});
  }

  listAllUser(): Observable<any>{
    let listUserpUrl = this.genericService.buildApiUrl(this.listUserApi);
    return this._http.get<UserResponse>({url: listUserpUrl});
  }
}

