import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsentService } from 'src/app/shared/patient-sikka/consent.service';
import { PatientSikkaResponse, SikkaPatientModel } from 'src/app/shared/patient-sikka/patient-sikka.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ConsentReponse, ConsentModel } from 'src/app/shared/patient-sikka/consent.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { user } from 'src/app/shared/auth-response';
import { AuthenticateService } from 'src/app/shared/authenticate.service';
import { PatientResponse, PatientModel } from 'src/app/shared/patient/patient.model';

@Component({
  selector: 'app-exconsent',
  templateUrl: './exconsent.component.html',
  styleUrls: ['./exconsent.component.css']
})
export class ExconsentComponent implements OnInit {
  isLoading: boolean = false;
  patientId: number;
  patientIdSelected: string = '0';
  patientNameSelected: string;
  consentType: number;
  consentTypeSelected: string = '0';
  consentForm: any;
  consentTitle: string;
  errorMessage: string = '';

  sub: any;
  title: string = "Extraction Consent";
  FullName: string
  message: string;
  messageStatus: string;
  inputMessage: string;
  consentTypes = [];
  patientResponse: PatientResponse;
  patients: PatientModel[];
  patientName: string;
  consentReponse: ConsentReponse;
  consentModel: ConsentModel[];
  existingConsentFilePath: string;
  loggedUser: user;
  loggedUserName: string;
  loggedUserId: number;
  loggedUserClinicId: number;
  currentDate: Date = new Date();

  constructor(
    private route: ActivatedRoute, 
    private consentService: ConsentService,
    private modalService: NgbModal,
    private authenticationService: AuthenticateService,
    private zone: NgZone,
    private router: Router
    ) { 
      window['angularComponentReference'] = {
        zone: zone,
        refreshContent: (patientId, consentType) => this.refreshContent(patientId, consentType),
        component: this,
      };
    }

  ngOnInit(): void {
    this.message = '';
    this.messageStatus = 'alert-danger';
    this.consentTypes = this.consentService.consetTypes();
    
    this.patientResponse = this.route.snapshot.data.patientsData;
    if(this.patientResponse.status === 'false'){
      this.patients = [];
      this.errorMessage = this.patientResponse.message;
    }
    else{
      //if(this.patientResponse.data != null && this.patientResponse.data.length > 0){
      //  this.patients = this.patientResponse.data[0].items;
      //}
      if(this.patientResponse.patients !== null && this.patientResponse.patients.length > 0){
        this.patients = this.patientResponse.patients;
      }
    } 

    this.sub = this.route.params.subscribe(params => {
      this.patientId = params['id'] == undefined ? 0: +params['id']; // (+) converts string 'id' to a number
      this.consentType = params['ctype'] == undefined ? 0: +params['ctype'];
      this.consentTypeSelected = params['ctype'];
      this.patientIdSelected = params['id'];
      if(this.patientId > 0 && this.consentType > 0){
        var selected = this.consentTypes.find(x => x.id === this.consentType);
        this.patientNameSelected = this.patients.find(x => x.id === this.patientId).patient_name;
        if(selected !== undefined){
          this.consentTitle = selected.name;
        }
        this.loadExistingConsent(this.patientId, this.consentType);
      }
      else{
        if(this.patientIdSelected === undefined) this.patientIdSelected = '0';
        if(this.consentTypeSelected === undefined) this.consentTypeSelected = '0';
      }
    });
  }

  loadExistingConsent(patientId, consentType){
    this.isLoading = true;
    this.consentModel=[];
    this.message = '';
    var consents = this.consentService.retrive(patientId, consentType)
    .subscribe((response) => {
      this.consentReponse = response;
      if(this.consentReponse.status.toString() === 'true'){
        this.consentModel = this.consentReponse.data;
      }
      else{
        this.messageStatus = 'alert-outline-warning';
        this.message = `${response.message} for ${this.patientNameSelected}`;
      }
      console.log(response);
      this.isLoading = false;
    },
    (err: HttpErrorResponse) => {
      this.isLoading = false;
      this.message = err.toString();
      console.log(err.message);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  openNewConsent(){
    console.log('open modal');
  }

  resetValues(){
    this.consentModel=[];
    this.message = '';
  }

  openExistingConsent(existingModal, consentItem){
    this.existingConsentFilePath = this.consentService.getFilePath(consentItem.filePath);

    this.modalService.open(existingModal, {
      centered: true,
      size: 'xl',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
     });
  }

  openNewConsentModal(newConsentModal){
    this.consentTitle = this.consentTypes.find(x => x.id === +(this.consentType)).name;
    //var patientObj = this.patients.find(x => x.patient_id === this.patientId.toString());
    //this.patientName = `${patientObj.firstname} ${patientObj.lastname}`;
    var patientObj = this.patients.find(x => x.id.toString() === this.patientId.toString());
    this.patientName = `${patientObj.firstName}${patientObj.lastName}`;
    this.loggedUser = this.authenticationService.getLoggedUser();
    this.loggedUserName = `${this.loggedUser.firstname} ${this.loggedUser.lastname}`;
    this.loggedUserId = this.loggedUser.id;
    this.loggedUserClinicId = this.loggedUser.clinic_id !== null ? +(this.loggedUser.clinic_id): 0;

    this.modalService.open(newConsentModal, {
      centered: true,
      size: 'xl',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
     });
  }

  refreshContent(patientId, consentType)
  {
    this.closeModal();  
    this.loadExistingConsent(patientId, consentType);
  }

  searchConsent(){
    this.inputMessage = '';
    if(this.patientIdSelected === '0'){
      this.inputMessage = "Please select patient";
      return false;
    }
    if(this.consentTypeSelected === '0'){
      this.inputMessage = "Please select consent";
      return false;
    }
    this.loadExistingConsent(this.patientIdSelected, this.consentTypeSelected);
  }

  closeModal(){
    this.modalService.dismissAll();
  }

  updateConsentTypeSelected(){
    this.consentType = +(this.consentTypeSelected);
    this.router.navigate([`/app/consent/${this.patientId}/${this.consentType}`]);
    this.inputMessage = '';
    this.message = '';
  }

  updatePatientSelected(){
    this.patientId = +(this.patientIdSelected);
    this.router.navigate([`/app/consent/${this.patientIdSelected}/${this.consentType}`]);
    this.inputMessage = '';
    this.message = '';
  }

  sampleRequest(patientId, consentType){
    this.isLoading = true;
    var consents = this.consentService.retrive(patientId, consentType)
    .subscribe(response => {
      console.log(response);
      this.isLoading = true;
    },
    (err: HttpErrorResponse) => {
      console.log(err.message);
      this.isLoading = true;
    });
  }



}
