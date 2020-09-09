import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantService {
  API_DOMAIN :String;
  CONSUMER_KEY : String;

  constructor() { 
    this.API_DOMAIN = 'http://localhost:3000/';
    this.CONSUMER_KEY = 'someReallyStupidTextWhichWeHumansCantRead'
  }
}
