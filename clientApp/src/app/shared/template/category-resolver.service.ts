import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CategoryService } from './category.service';
import { catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { CategoryResponse } from './category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryResolverService implements Resolve<any>{

  constructor(
    private router: Router,
    private categoryService: CategoryService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CategoryResponse> | Promise<any> | any {
    return this.categoryService.getCategory().pipe(
      catchError(error => {
        console.log(error);
        return of({ message : error.toString(), status: 'false'});
      }));
  }
}
