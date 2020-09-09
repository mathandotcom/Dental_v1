import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import * as moment from 'moment';
import { DateService } from 'src/app/shared/utility/date.service';
import { PatientService } from 'src/app/shared/patient/patient.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { PatientResponse, PatientModel, DoctorResponse } from 'src/app/shared/patient/patient.model';
import { TreatmentPlanResponse, TreatmentPlan, PayOption } from 'src/app/shared/patient/treatment.model';
import { map, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError, of } from 'rxjs';
import {NgbModal, NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import { TokenService } from 'src/app/shared/token.service';
import { user } from 'src/app/shared/auth-response';
import { GenericService } from 'src/app/shared/generic.service';
import { ConsentService } from 'src/app/shared/patient-sikka/consent.service';
import { EmailComponent } from 'src/app/utility/email/email.component';



//import '../../../assets/assets/js/app';

//declare const initMetisMenu: any;


@Component({
  selector: 'app-all-patients',
  templateUrl: './all-patients.component.html',
  styleUrls: ['./all-patients.component.css']
})
export class AllPatientsComponent implements OnInit {
  isLoadingtp: boolean = false;
  errorMessage: string = '';
  errorMessage_tp: string = '';
  currentDate: string;
  patientResponse: PatientResponse;
  doctorResponse: DoctorResponse;
  treatmentPlanResponse: TreatmentPlanResponse;
  patients: PatientModel[];
  treatmentPlan: TreatmentPlan[];
  consentTypes = [];
  loggedUser: user;
  loggedUserName: string;
  loggedUserId: number;
  loggedUserClinicId: number;
  patUserName: string;

  activeModal: NgbActiveModal;

  //Profile details
  patId: number;
  name: string;
  phone: string;
  homePhone: string;
  workPhone: string;
  address: string;
  doctorName: string;
  firstvisit: string;
  emailaddr: string;
  dateOfBirth: string;

  //treatment plan
  totalFees: number = 0;
  primaryInsurance: number = 0;
  patientCost: number = 0;
  insuranceDiscount: number = 0;
  insurancePayment: number = 0;
  treatmentPlanNumber: number;
  treatmentPlanPaymentConsentOption: PayOption;
  treatmentPlanPaymentConsentImage: string;
  hasTreatmentPlanExist: boolean = false;
  hasTreatmentPlanAvailable: boolean = false;
  MonthlyPay: boolean;

  message: string = "Payment option has been already setup for this treatment plan";
  messageStatus: string = "Oops! ";

  private context: CanvasRenderingContext2D;
    /** Template reference to the canvas element */
    @ViewChild('canvasEl') canvasEl: ElementRef;

  constructor(
    private modalService: NgbModal,
    private dateService: DateService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private genericService: GenericService,
    private consentService: ConsentService,
  ) { }

  ngOnInit(): void {
    this.currentDate = this.dateService.getDate();
    $(document).ready(function () {
      console.log('calling jquery');

    });
    this.getDoctor();
    this.consentTypes = this.consentService.consetTypes();
    this.patientResponse = this.route.snapshot.data.patientsData;
    if(this.patientResponse.status === 'false'){
      this.patients = [];
      this.errorMessage = this.patientResponse.message;
    }
    else{
      this.patients = this.patientResponse.patients;
    }
  }

  getDoctor(){
    var patients = this.patientService.getDoctor()
    .subscribe((response: DoctorResponse) => {
      this.doctorResponse = response;
      if(response.status === 'true'){
        this.doctorName = response.doctor.name;
      }
    },
    (err: HttpErrorResponse) => {
      this.errorMessage = err.toString();
    });
  }

  getTreatmentPlanDetails(patientId: number){
    this.hasTreatmentPlanExist = false;
    this.resetTotal();
    let treatmentPlan = this.patientService.getTreatmentPlan(patientId)
    .subscribe((response: TreatmentPlanResponse) => {
      this.treatmentPlanResponse = response;
      if(this.treatmentPlanResponse.status === 'true'){
        if(this.treatmentPlanResponse.data.length > 0){
          this.hasTreatmentPlanAvailable = true;
          this.treatmentPlan = this.treatmentPlanResponse.data;
          this.treatmentPlanNumber = this.treatmentPlan[0].treatPlanNum;
          this.treatmentPlan.forEach(element => {
            this.totalFees += element.procFee;
            this.primaryInsurance += element.insPayEst;
            this.insurancePayment += element.insPayAmt;
            this.patientCost += element.patientEst;
          });
          if(this.treatmentPlanResponse.payoption !== null && this.treatmentPlanResponse.payoption.filename !== '' ){
            this.treatmentPlanPaymentConsentImage = this.genericService.buildPath(this.treatmentPlanResponse.payoption.filePath);
            this.hasTreatmentPlanExist = true;
          }
          this.isLoadingtp = false;
        }
      }
      else{
        this.errorMessage_tp = this.treatmentPlanResponse.message;
        this.isLoadingtp = false;
      }
    },
    (err: HttpErrorResponse) => {
      this.errorMessage = err.toString();
      this.isLoadingtp = false;
      if(err.toString().indexOf('expired') >= 0){
        location.href = "/login";
      }
    });
  }

  resetTotal(){
    this.totalFees = 0;
    this.primaryInsurance = 0;
    this.insurancePayment = 0;
    this.patientCost = 0;
    this.insuranceDiscount = 0;
    this.errorMessage_tp = '';
    this.treatmentPlan = [];
    this.hasTreatmentPlanExist = false;
    this.treatmentPlanPaymentConsentImage = "";
    this.hasTreatmentPlanAvailable = false;
  }

  loadPatients(){
    var patients = this.patientService.getAllPatient()
    .subscribe((response: PatientResponse) => {
      this.patientResponse = response;
      if(this.patientResponse.status.toString() === 'true'){
        if(this.patientResponse.patients.length){
          this.patients = this.patientResponse.patients;
        }
      }
    },
    (err: HttpErrorResponse) => {
      this.errorMessage = err.toString();
    });

  }

  public ageFromDataOfBirth(dateOfBirth: any): number {
    return moment().diff(dateOfBirth, 'years');
  }

  openProfileModal(targetModal, patient: PatientModel){
    this.modalService.open(targetModal, {
      centered: true,
      size: 'xl',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
     });
     this.name = patient.patient_name;
     this.phone = (patient.cell !== null && patient.cell !== '' && patient.cell !== undefined) ? patient.cell : 'Yet to collect';
     this.homePhone = (patient.homePhone !== null && patient.homePhone !== '' && patient.homePhone !== undefined) ? patient.homePhone : '';
     this.workPhone = (patient.workPhone !== null && patient.workPhone !== '' && patient.workPhone !== undefined) ? patient.workPhone : '';
     this.firstvisit = patient.firstvisit.indexOf('1901') < 0 ?  patient.firstvisit : '';;
     this.dateOfBirth = patient.dob.indexOf('1901') < 0 ?  patient.dob : '';
     this.address = patient.address !== '' ? `${patient.address} ${patient.address2} ${patient.city} ${patient.state} ${patient.zip}` :'Yet to collect';
     this.emailaddr = patient.email;
     //return false;
  }

  openTreatmentPlanModal(targetModal, patient: PatientModel) {
    this.isLoadingtp = true;
     let treatmentPlanDetails = this.getTreatmentPlanDetails(patient.id);
     this.patId = patient.id;
     this.name = patient.firstName + ' ' + patient.lastName;
     this.loggedUser = JSON.parse(this.tokenService.getUser('lu'));
     this.loggedUserName = `${this.loggedUser.firstname} ${this.loggedUser.lastname}`;
     this.loggedUserId = this.loggedUser.id;
     this.loggedUserClinicId = this.loggedUser.clinic_id !== null ? +(this.loggedUser.clinic_id): 0;
     this.patUserName =  `${patient.lastName}${patient.firstName}`;
     this.activeModal =
     this.modalService.open(targetModal, {
       centered: true,
       size: 'xl',
       scrollable: true,
       ariaLabelledBy: 'modal-basic-title'
      });
     return false;
  }

  editProfile(patient){

  }

  sendText(patient){
    this.router.navigate(['/app/chat/', patient.id]); 
  }

  sendMail(emailTemplateModel, patient){
    var modalOptions = {
      centered: true,
      size: 'xl',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
     };
     var modalRef  = this.modalService.open(EmailComponent, modalOptions);
     modalRef.componentInstance.patientEmailId = patient.email;
     modalRef.componentInstance.patientName = patient.patient_name;
  }

  deactivate(patient){
    
  }

  confirmSignature(): boolean{
    let canvas = document.getElementById('signature-pad') as HTMLCanvasElement;
    const canvascontext = canvas.getContext("2d"); 

    return false;
  }

  saveAsImage(){
    if(!this.confirmSignature()){
      console.log('false');
    }


  }

  openConsent(patient_id, consentType){
    console.log(patient_id + ' - ' + consentType);
    this.router.navigate(['app/consent', patient_id, consentType]);
    //this.router.navigate(['app/consent', {'id':patient_id, 'ctype':consentType}]);
  }

  //save popup detail
  //https://stackoverflow.com/questions/51656524/ng-bootstrap-and-angular-6-cant-resolve-all-parameters-for-ngbmodalref
}
