import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';
import { TokenService } from '../shared/token.service';
import { ConstantService } from '../shared/constant.service';

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptorServiceService implements HttpInterceptor {

    constructor(private router: Router, private tokenService: TokenService, private constantService: ConstantService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.headers.get('No-Auth') === "True") {
            return next.handle(req.clone());
        }
        var token = this.tokenService.getToken('currentUser');
        if (token !== null) {
            const clonedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token.replace(/"/g, "")}`)
            });

            return next.handle(clonedReq)
            .pipe(
                tap(data => { 
                    console.log(data);
                }), 
                catchError((err: HttpErrorResponse) => {
                    if (err instanceof HttpErrorResponse) {
                        console.log(err);
                        console.log('req url :: ' + req.url);
                        if (err.status === 401) {
                            this.router.navigate(['/login']);
                        }
                    }                    
                    return throwError(err);
                })
                
            );
        }else{
            this.router.navigateByUrl('/login');
        }
    }
}

