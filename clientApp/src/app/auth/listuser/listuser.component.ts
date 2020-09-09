import { Component, OnInit, Output,EventEmitter, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserModel, UserResponse } from 'src/app/shared/user/user.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationModalComponent } from '../registration-modal/registration-modal.component';

import { RegisterUserService } from 'src/app/shared/user/register-user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BridgeService } from 'src/app/shared/bridge.service';
import { Subscription } from 'rxjs';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';

@Component({
  selector: 'app-listuser',
  templateUrl: './listuser.component.html',
  styleUrls: ['./listuser.component.css']
})
export class ListuserComponent implements OnInit {
  @Input () modelMessage: string; 
  // @Output() reloadData = new EventEmitter<any>();

  userModelResponse: UserResponse;
  userModel: UserModel[];
  warningMessage: string;
  errorMessage: string;
  subscription: Subscription;
  receivedMessage: string;


  firstName: string;
  lastName: string;
  phoneNo: string; 
  email: string;
  clinicname: string;
  roleid: number;

  id_model: number;

  
  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private userService : RegisterUserService,
    private bridgeService:BridgeService,
   ) {
   }

  ngOnInit(): void {
    this.userModel = [];
    this.userModelResponse = this.route.snapshot.data.userModelData;
    if(this.userModelResponse.status === 'true' && this.userModelResponse.users.length > 0){
      this.userModel = this.userModelResponse.users;
    }
    else{
      this.warningMessage =   this.userModelResponse.message;   
    }
    this.watchChildEvent();
  }

  reloadUserData() {
    console.log('reloading');
    var userlist = this.userService.listAllUser().subscribe(response => {
      this.userModelResponse = response;
      if (this.userModelResponse.status === 'true' && this.userModelResponse.users.length > 0) {
        this.userModel = this.userModelResponse.users;
      }
      else {
        this.warningMessage = this.userModelResponse.message;
      }
    },
      (err: HttpErrorResponse) => {
        this.errorMessage = err.toString();
      });
  }

  watchChildEvent() {
    this.subscription = this.bridgeService.receiveData().subscribe(x => { 
      if(JSON.parse(x).message === "child")
      {
        this.reloadUserData();

      }
    });
  }

   editProfile(registrationTemplateModel, user){
      var modalOptions = {
        centered: true,
        size: 'lg',
        scrollable: true,
        ariaLabelledBy: 'modal-basic-title'
      };
      this.id_model = user.id;
      this.firstName = user.firstname;
      this.lastName = user.lastname;
      this.phoneNo = user.phone;
      this.email = user.username;
      this.clinicname = user.clinic_name;
      this.roleid = user.roleid;
      var modalRef  = this.modalService.open(RegistrationModalComponent, modalOptions);
      modalRef.componentInstance.userObject = user;
    } 

    viewProfile(user){
      var modalOptions = {
        centered: true,
        size: 'lg',
        scrollable: true,
        ariaLabelledBy: 'modal-basic-title'
      }; 
      this.id_model = user.id;
      this.firstName = user.firstname;
      this.lastName = user.lastname;
      this.phoneNo = user.phone;
      this.email = user.username;
      this.clinicname = user.clinic_name;
      this.roleid = user.roleid;
      var modalRef  = this.modalService.open(ProfileModalComponent, modalOptions);
      modalRef.componentInstance.userObject = user;
    }
 
  openRegistrationPopup(registrationTemplateModel, user) {
    var modalOptions = {
      centered: true,
      size: 'lg',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
    };
    this.id_model = 0;
    var modalRef = this.modalService.open(RegistrationModalComponent, modalOptions);
    modalRef.componentInstance.patientEmailId = user === null ? '' : user;
  }
}

