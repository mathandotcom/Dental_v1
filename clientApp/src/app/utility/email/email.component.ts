import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { EmailService } from 'src/app/shared/utility/email.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SendMailResponse } from 'src/app/shared/utility/email.model';
import Swal from 'sweetalert2'; 

//import  tinymce from '../../../../node_modules/tinymce/tinymce.min.js';
//declare var tinymce: any;

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})
export class EmailComponent implements OnInit {
@ViewChild('f', { static: false }) emailForm: NgForm;

@Input() patientEmailId: string;
@Input() patientName: string;
errorMessage: string = '';
isLoadingtp: boolean = false;
toMailAddress: string;

mailResponse: SendMailResponse;
showCcMail: boolean = false;
showBccMail: boolean = false;
emailbody: string;
  constructor(
    public model: NgbActiveModal,
    private modalService: NgbModal,
    private _mail: EmailService
    ) { }

  ngOnInit(): void {
    console.log(this.patientEmailId);
    // tinymce.remove();
    // tinymce.init(
    //   {
    //       selector: "#emailbody",
    //       height: 400,
    //       menubar: true,
    //       plugins: [
    //         'advlist autolink lists link image charmap print preview anchor',
    //         'searchreplace visualblocks code fullscreen',
    //         'insertdatetime media table paste code help wordcount'
    //       ],
    //   });

    if(this.patientEmailId !== ''){
      //this.errorMessage = `Email id is missing for ${this.patientName}`;
      this.toMailAddress = this.patientEmailId;
    }
  }

  sendMail(f){
    let ccAddress = f.value.ccaddress === undefined ? '' : f.value.ccaddress;
    let bccAddress = f.value.bccaddress === undefined ? '' : f.value.bccaddress;

    var mailObject = {"mailRequest": {to:f.value.toaddress, cc:ccAddress, bcc: bccAddress, subject: f.value.mailsubject, htmlbody: f.value.emailbody}};
    this._mail.sendAsync(mailObject).subscribe(response => {
      this.mailResponse = response;
      if(this.mailResponse !== undefined && this.mailResponse.status === 'true'){
        this.showResponseMessage(this.mailResponse.result, 's');
      }
      else{
        this.showResponseMessage(this.mailResponse.message, 'e');
      }
    },
    (err: HttpErrorResponse) => {
      this.errorMessage = err.toString();
      this.isLoadingtp = false;
    });
        console.log(this.emailbody);


  }

  showResponseMessage(message: string, type: string){
    var messageType = '';
    var title = type === 's' ? `Mail has been sent`: `Failed to send a mail`;
    if(type === 'e'){
      Swal.fire({icon:'error', title: title, confirmButtonText: 'Close'})
    }
    else{
      Swal.fire({icon:'success', title: title,
      showCancelButton: true, confirmButtonText: 'Ok', cancelButtonText: 'Close' })
         .then((result) => {
           if (result.value) {
            this.modalService.dismissAll();
           }
           else{
             this.modalService.dismissAll();
           }
         });
    }
  }

}
