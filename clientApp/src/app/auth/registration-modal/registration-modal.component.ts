import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommunicationService } from '../communication.service';
import { BridgeService } from 'src/app/shared/bridge.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterUserService } from 'src/app/shared/user/register-user.service';
import { SignupResponse } from 'src/app/shared/user/signup.model';
import { NgForm } from '@angular/forms';
import { UserModel } from 'src/app/shared/user/user.model';

@Component({
  selector: 'app-registration-modal',
  templateUrl: './registration-modal.component.html',
  styleUrls: ['./registration-modal.component.css']
})
export class RegistrationModalComponent implements OnInit {
  @ViewChild('f', { static: false }) signupForm: NgForm;
  @Output() reloadData = new EventEmitter<any>();
  message: string = "child";
  parentMessage = "message from parent";
  signupResponse: SignupResponse;
  userObject: UserModel;

  userId: number;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone: string;
  clinicId: number;
  roleId: number;

  usermode: boolean;
  userprofile:boolean;

  id : number;
  id_model : number;
  
  constructor(
    public model: NgbActiveModal,
    private modalService: NgbModal,
    private bridgeService: BridgeService,
    private userService : RegisterUserService,
  ) {}

  sendMessage() {
    console.log(this.message);
    this.reloadData.emit(this.message);
    this.bridgeService.sendData(JSON.stringify({'message':this.message}));

  }

  ngOnInit(): void {
    if(this.userObject === undefined || this.userObject === null){
      this.usermode = true;
      this.userId =  0;  
    }
    else {
      this.usermode = false;
      this.userId =  this.userObject.id;
      this.firstName = this.userObject.firstname;
      this.lastName = this.userObject.lastname;
      this.userEmail = this.userObject.username;
      this.userPhone = this.userObject.phone;
      this.clinicId = this.userObject.clinic_id;
      this.roleId = this.userObject.roleid;

    }
  }

  onSubmit(){

    console.log(this.signupForm.value);
    var userData = {
      id: this.userId,
      useremail: this.signupForm.value.email ,
      userpassword: this.signupForm.value.password,
      firstname:this.signupForm.value.firstname,
      lastname: this.signupForm.value.lastname,
      phone: this.signupForm.value.phoneno,
      roleid: this.signupForm.value.roleid,
      clinicid: this.signupForm.value.clinicid

    };

  if(this.userId === 0){
    this.userService.signupUser(userData).subscribe(response => {
      this.signupResponse = response;
      if(this.signupResponse.status === 'true'){
        this.showResponseMessage(this.signupResponse.result, 's');
        this.bridgeService.sendData(JSON.stringify({'message':this.message}));
       
      }
      else{
        this.showResponseMessage(this.signupResponse.message, 'e');
      }
    },
    (err: HttpErrorResponse) => {
      this.showResponseMessage(err.toString(), 'e');
    });
    this.onReset();
    }
  }
  
onUpdate(){
  var userData = {
    id: this.userId,
    useremail: this.signupForm.value.email ,
    userpassword: this.signupForm.value.password,
    firstname:this.signupForm.value.firstname,
    lastname: this.signupForm.value.lastname,
    phone: this.signupForm.value.phoneno,
    roleid: this.signupForm.value.roleid,
    clinicid: this.signupForm.value.clinicid
  }
 if(this.userId > 0){
    this.userService.updateUser(userData).subscribe(response => {
      this.signupResponse = response;
      if(this.signupResponse.status === 'true'){
        this.showResponseMessage(this.signupResponse.message, 's');
        this.bridgeService.sendData(JSON.stringify({'message':this.message}));   
      }
      else{

        this.showResponseMessage(this.signupResponse.message, 'e');
      }
    },
    (err: HttpErrorResponse) => {
      this.showResponseMessage(err.toString(), 'e');
    });
     }
    }

  onReset() {
    this.signupForm.reset();
  }

  showResponseMessage(message: string, type: string) {
    var messageType = '';
    var title = type === 's' ? `Success` : `Oops!`;
    if (type === 'e') {
      Swal.fire({ icon: 'error', title: title, text: message, confirmButtonText: 'Close' });
    }
    else {
      Swal.fire({
        icon: 'success', title: title, text: message,
      })
        .then((result) => {
          if (result.value) {
            this.modalService.dismissAll();
          }
        });
    }
  }


}
