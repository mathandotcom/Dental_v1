import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { CacheService } from './cache.service'
import { Observable, of, throwError } from 'rxjs'
import { switchMap, catchError, retry } from 'rxjs/operators'
import { Verbs, HttpOptions } from './Verbs.model';
import { map } from 'jquery';




@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
//https://dev.to/maurogarcia_19/client-side-caching-with-angular-2i6l
  constructor(
    private http: HttpClient,
    private _cacheService: CacheService
  ) { }


  get<T>(options: HttpOptions): Observable<T> {
    return this.httpCall(Verbs.GET, options)
  }

  getCached<T>(options: HttpOptions): Observable<T> {
    return this.httpCachedCall(Verbs.GET, options)
  }

  delete<T>(options: HttpOptions): Observable<T> {
    return this.httpCall(Verbs.DELETE, options)
  }

  post<T>(options: HttpOptions): Observable<T> {
    return this.httpCall(Verbs.POST, options)
  }

  put<T>(options: HttpOptions): Observable<T> {
    return this.httpCall(Verbs.PUT, options)
  }

  private httpCall<T>(verb: Verbs, options: HttpOptions): Observable<T> {

    // Setup default values
    options.body = options.body || null;
    options.headers = options.headers || null;

    //return this.http.request<T>(verb, options.url, {body: JSON.stringify(options.body), headers:options.headers})
    return this.http.request<T>(verb, options.url, options)
      .pipe(
        switchMap(response => {
          return of<T>(response)
        })
      )
  }

  private httpCachedCall<T>(verb: Verbs, options: HttpOptions): Observable<T> {

    // Setup default values
    options.body = options.body || null
    options.cacheMins = options.cacheMins || 0

    if (options.cacheMins > 0) {
      // Get data from cache
      const data = this._cacheService.load(options.url)
      // Return data from cache
      if (data !== null) {
        return of<T>(data)
      }
    }

    return this.http.request<T>(verb, options.url, {
      body: options.body
    })
      .pipe(
        switchMap(response => {
          if (options.cacheMins > 0) {
            // Data will be cached
            this._cacheService.save({
              key: options.url,
              data: response,
              expirationMins: options.cacheMins
            })
          }
          return of<T>(response)
        })
      )
  }

    // Error handling
    errorHandl(error) {
      let errorMessage = '';
      if(error.error instanceof ErrorEvent) {
        // Get client-side error
        errorMessage = error.error.message;
      } else {
        // Get server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      console.log(errorMessage);
      return throwError(errorMessage);
   }
   

}
