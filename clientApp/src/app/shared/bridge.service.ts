import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BridgeService {
  private subject = new Subject<any>();
  constructor() { }
 
 
    sendData(message: string) {
        this.subject.next(message);
    }
 
    clearData() {
        this.subject.next();
    }
 
    receiveData(): Observable<any> {
        return this.subject.asObservable();
    }

    /*----GETTER & SETTER----- */
    data:any = {};
    setdata(value)
    {
        Object.assign(this.data,value);
    }

    getdata()
    {
        return this.data;
    }

    deleteProp(propName)
    {
        delete this.data[propName];
    }
}
