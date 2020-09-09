import { Component, OnInit } from '@angular/core';
import { DoctorService } from 'src/app/shared/doctor/doctor.service';

@Component({
  selector: 'app-photography-consent',
  templateUrl: './photography-consent.component.html',
  styleUrls: ['./photography-consent.component.css']
})
export class PhotographyConsentComponent implements OnInit {
  doctorName: string;
  constructor(private doctorService: DoctorService) { }

  ngOnInit(): void {
    this.doctorName = this.doctorService.getDoctor();
  }

  
}
