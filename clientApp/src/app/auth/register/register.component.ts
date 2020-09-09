import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { NgForm} from '@angular/forms';
import { RegisterUserService } from 'src/app/shared/user/register-user.service';
import { SignupResponse } from 'src/app/shared/user/signup.model';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @ViewChild('f', { static: false }) signupForm: NgForm;
  @Output() reloadData = new EventEmitter<any>();
  // signupForm : FormGroup;
  signupResponse: SignupResponse;
  pageMode: string = 'n'; //n - normal / p - popup

   submitted = false;
    constructor(
    private registerUserService: RegisterUserService
    ){}

  ngOnInit(): void {}
  onSubmit(){
   
    this.submitted = true;
    console.log(this.signupForm);
    console.log(this.signupForm.value);
    
    
    var userData = {
      id:0,
      useremail: this.signupForm.value.email ,
      userpassword: this.signupForm.value.password,
      firstname:this.signupForm.value.firstname,
      lastname: this.signupForm.value.lastname,
      phone: this.signupForm.value.phoneno,
      roleid: this.signupForm.value.roleid,
      clinicid: this.signupForm.value.clinicid

    };
    this.registerUserService.signupUser(userData).subscribe(response => {
      this.signupResponse = response;
      if(this.signupResponse.status === 'true'){
        this.showResponseMessage(this.signupResponse.result, 's');
        this.onReset();
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

  
  onReset(){
    this.signupForm.reset();
  }



  showResponseMessage(message: string, type: string){
    var messageType = '';
    var title = type === 's' ? `Success`: `Oops!`;
    if(type === 'e'){
      Swal.fire({icon:'error', title: title, text: message, confirmButtonText: 'Close'});
    }
    else{
      Swal.fire({icon:'success', title: title, text: message,
      });
    }
  }
}
