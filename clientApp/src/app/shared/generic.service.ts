import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  apikey: string = "6a5779cd4ec7dd4f27fd68d406381571";

  constructor(private constantService: ConstantService) { }

  buildApiUrl(endpoint: string){
    return `${environment.apiUrl}/${endpoint}`;
  }

  buildApiSikkaUrl(endpoint: string){
    return `${environment.apiSikka}/${endpoint}?request_key=${this.apikey}`;
  }

  buildPath(endpoint: string){
    return `${environment.apiUrl}/${endpoint}`;
  }
}
