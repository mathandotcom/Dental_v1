import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TokenService } from '../../shared/token.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { authResponse } from 'src/app/shared/auth-response';
import { AuthenticateService } from 'src/app/shared/authenticate.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('f', { static: false }) loginForm: NgForm;
 
  authResult: authResponse;
  isLoginError: boolean = false;
  loginErrorMessage: string;
  ngDisabled: string;
  isProcessing: boolean = false;

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticateService
  ) { }

  ngOnInit(): void {
  }

  userLogin() {
    this.loginprocess(true,"disabled");
    console.log(this.loginForm);
    console.log(this.authService.getsomedata());
    let emailInput = this.loginForm.value.useremail;
    let passwordInput = this.loginForm.value.userpassword;
    let authRespose = this.authService.userAuthentication(emailInput, passwordInput)
    .subscribe(response => {
      this.authResult = response;
      console.log(this.authResult);
      if (this.authResult && (this.authResult.status)) {
        this.tokenService.setToken('currentUser', this.authResult.token, this.authResult.user.username);
        this.tokenService.setUser('lu', this.authResult.user);
        this.router.navigate(['/app/dashboard'], { relativeTo: this.route });
      } else if ((this.authResult && (!this.authResult.status))) {
        this.isLoginError = true;
        this.loginErrorMessage = this.authResult.message;
        this.loginprocess(false,"");
      } else {
        this.isLoginError = true;
        this.loginErrorMessage = "Invalid request...";
        this.loginprocess(false, "");
      }      
    },
    (err: HttpErrorResponse) => {
      this.isLoginError = true;
      this.loginErrorMessage = err.toString();
      this.loginprocess(false, "");
    });
  }

  loginprocess(processStatus, disabledStatus){
    this.ngDisabled = disabledStatus;
    this.isProcessing = processStatus;
  }
}
