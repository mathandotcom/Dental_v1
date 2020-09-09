import { Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
@Output() title: string = "Dashboard";
  constructor() { }

  ngOnInit(): void {
  }

}
