import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from 'src/app/shared/token.service';
import { GenericService } from 'src/app/shared/generic.service';
import { PatientSikkaService } from 'src/app/shared/patient-sikka/patient-sikka.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DateService } from 'src/app/shared/utility/date.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DoctorResponse } from 'src/app/shared/patient/patient.model';
import { TreatmentPlanResponse, TreatmentPlan, PayOption} from 'src/app/shared/patient/treatment.model';
import { SikkaPatientModel, PatientSikkaResponse } from 'src/app/shared/patient-sikka/patient-sikka.model';
import { user } from 'src/app/shared/auth-response';
import { TreatmentPlanSikkaResponse, SikkaTreatmentPlan } from 'src/app/shared/patient-sikka/treatment.model';
import { ConsentService } from 'src/app/shared/patient-sikka/consent.service';

@Component({
  selector: 'app-all-patients-sikka',
  templateUrl: './all-patients-sikka.component.html',
  styleUrls: ['./all-patients-sikka.component.css']
})
export class AllPatientsSikkaComponent implements OnInit {
  isLoadingtp: boolean = false;
  errorMessage: string = '';
  errorMessage_tp: string = '';
  currentDate: string;
  patientResponse;
  doctorResponse: DoctorResponse;
  treatmentPlanResponse: TreatmentPlanSikkaResponse;
  patients: SikkaPatientModel[];
  treatmentPlan: SikkaTreatmentPlan[];
  consentTypes = [];
  loggedUser: user;
  loggedUserName: string;
  loggedUserId: number;
  patUserName: string;

  activeModal: NgbActiveModal;

  //Profile details
  patId: string;
  name: string;
  phone: string;
  address: string;
  doctorName: string;
  firstvisit: string;
  emailaddr: string;

  //treatment plan
  totalFees: number = 0;
  primaryInsurance: number = 0;
  patientCost: number = 0;
  insuranceDiscount: number = 0;
  insurancePayment: number = 0;
  treatmentPlanNumber: string;
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
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private genericService: GenericService,
    private patientService: PatientSikkaService,
    private consentService: ConsentService
  ) { }

  ngOnInit(): void {
    this.currentDate = this.dateService.getDate();
    this.getDoctor();
    this.consentTypes = this.consentService.consetTypes();
    this.patientResponse = this.route.snapshot.data.patientsData;
    if(this.patientResponse.status === 'false'){
      this.patients = [];
      if(this.patientResponse.message !== null && this.patientResponse.message.code === "ENOTFOUND"){
        this.errorMessage = "Unable to connect to api source";
      }
      else if(this.patientResponse.message !== null || this.patientResponse.message == undefined){
        this.errorMessage  = this.patientResponse.message;
      }
    }
    else{
      if(this.patientResponse.data != null && this.patientResponse.data.length > 0){
        this.patients = this.patientResponse.data[0].items;
      }
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
    .subscribe((response: TreatmentPlanSikkaResponse) => {
      this.treatmentPlanResponse = response;
      if(this.treatmentPlanResponse.status === 'true'){
        if(this.treatmentPlanResponse.data !== null && this.treatmentPlanResponse.data.length > 0){
          this.hasTreatmentPlanAvailable = true;
          this.treatmentPlan = this.treatmentPlanResponse.data[0].items;
          this.treatmentPlanNumber = this.treatmentPlan[0].guarantor_id;
          this.treatmentPlan.forEach(element => {
            this.totalFees += parseInt(element.amount.toString());
            this.primaryInsurance += parseInt(element.primary_insurance_estimate.toString());
            this.insurancePayment += parseInt(element.insurance_payment.toString());
            this.patientCost += parseInt(element.amount.toString()) - parseInt(element.insurance_payment.toString());
            element.patientEst = element.amount - parseInt(element.insurance_payment.toString());
          });
          if(this.treatmentPlanResponse.payoption !== null && this.treatmentPlanResponse.payoption.filename !== '' ){
            this.treatmentPlanPaymentConsentImage = this.genericService.buildPath(this.treatmentPlanResponse.payoption.filePath);
            this.hasTreatmentPlanExist = true;
          }
          this.isLoadingtp = false;
        }
      }
      else{
        this.errorMessage_tp = `${this.treatmentPlanResponse.message} for ${this.name}`;
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
    .subscribe((response: PatientSikkaResponse) => {
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

  openProfileModal(targetModal, patient: SikkaPatientModel){
    this.modalService.open(targetModal, {
      centered: true,
      size: 'xl',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
     });
     this.name = patient.firstname + ' ' + patient.lastname;
     this.phone = patient.cell;
     this.firstvisit = patient.first_visit !== '' ? patient.first_visit : 'Yet to update';
     this.address = patient.address_line1 !== '' ? `${patient.address_line1} ${patient.address_line2} ${patient.city} ${patient.state} ${patient.zipcode}` :'Yet to collect';
     this.emailaddr = patient.email;
     //return false;
  }

  openTreatmentPlanModal(targetModal, patient: SikkaPatientModel) {
    this.isLoadingtp = true;
     let treatmentPlanDetails = this.getTreatmentPlanDetails(parseInt(patient.patient_id));
     this.patId = patient.patient_id;
     this.name = patient.firstname + ' ' + patient.lastname;
     this.loggedUser = JSON.parse(this.tokenService.getUser('lu'));
     this.loggedUserName = `${this.loggedUser.firstname} ${this.loggedUser.lastname}`;
     this.loggedUserId = this.loggedUser.id;
     this.patUserName =  `${patient.lastname}${patient.firstname}`;
     this.activeModal =
     this.modalService.open(targetModal, {
       centered: true,
       size: 'xl',
       scrollable: true,
       ariaLabelledBy: 'modal-basic-title'
      });
     return false;
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
}
