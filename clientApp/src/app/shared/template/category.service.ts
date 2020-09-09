import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { GenericService } from '../generic.service';
import { CategoryResponse } from './category.model';
import { TemplateTypeResponse, TemplateModel } from './templatetypes.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  categoryApi: string    = 'api/v1/category/all';
  templateTypesApi: string    = 'api/v1/category/templatetypes';
  addTemplateApi: string    = 'api/v1/template/add';
  getTemplateApi: string    = 'api/v1/template/retrieve';
  transformImageApi: string    = 'api/v1/template/transformimage';

  constructor(
    private _http: HttpClientService,
    private genericService: GenericService
  ) { }

  getCategory(): Observable<any>{
    let categoryUrl = this.genericService.buildApiUrl(this.categoryApi);
    return this._http.get<CategoryResponse>({url: categoryUrl});
  }

  getTemplateTypes(paramObject): Observable<any>{
    let templateTypesUrl = this.genericService.buildApiUrl(this.templateTypesApi);
    return this._http.post<TemplateTypeResponse>({url: templateTypesUrl, body: paramObject});
  }

  addTemplate(templateModel): Observable<any>{
    let addTemplateUrl = this.genericService.buildApiUrl(this.addTemplateApi);
    return this._http.put({url: addTemplateUrl, body: templateModel})
  }

  retrieveTemplate(templateTypeId): Observable<any>{
    let getTemplateUrl = this.genericService.buildApiUrl(this.getTemplateApi);
    return this._http.post({url: getTemplateUrl, body: templateTypeId})
  }

  transformimage(templateBase64Image): Observable<any>{
    let transformImageUrl = this.genericService.buildApiUrl(this.transformImageApi);
    return this._http.post({url: transformImageUrl, body: templateBase64Image})
  }

}
