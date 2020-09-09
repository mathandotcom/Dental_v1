import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { DateService } from 'src/app/shared/utility/date.service';
import { AppointmentResponse, AppointmentModel, AppointmentRequest, ReminderSmsResponse, AppointmentConfirmationResponse, RescheduleResponse } from 'src/app/shared/appointment/appointment.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'src/app/shared/appointment/appointment.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { now } from 'jquery';
import { FlatpickrOptions } from 'ng2-flatpickr';
import * as moment from 'moment';
import { user } from 'src/app/shared/auth-response';
import { TokenService } from 'src/app/shared/token.service';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements AfterViewInit, OnDestroy, OnInit  {
  //@ViewChild("aptdatatable") dtElement: DataTableDirective;
  @ViewChild(DataTableDirective, {static: false})  dtElement: DataTableDirective;
  @ViewChild('appDatePicker', { static: false }) appDatePicker;
  @ViewChild('rescheduleDatePicker', { static: false }) rescheduleDatePicker;

  loadDataTable: boolean = false;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  appointmentRequest: AppointmentRequest;
  appointmentConfirmationResponse: AppointmentConfirmationResponse;
  today: Date = new Date();
  appDate: Date = new Date();
  jsToday: string = formatDate(this.today, 'MM/dd/yyyy', 'en-US');
  appointmentDate: string = moment().format('MM/DD/yyyy');
  appointments: AppointmentModel[];
  errorMessage: string;
  alertType: string = 'alert-danger';

  
  reminderSmsResponse: ReminderSmsResponse;
  rescheduleResponse: RescheduleResponse;
  reminderResult: string;
  isByDate: boolean = false;

  modal_patient_name: string;
  modal_patient_id: string;
  modal_current_appointment_date: string;
  modal_current_appointment_time: string;
  modal_scheduled_date: string;
  modal_confirmation_status: string;
  modal_confirm_icon: string;
  modal_confirmed_on_title: string;

  rescheduleDateTime: string;
  reasonReschedule: string;
  rescheduleSelectedAppointment: AppointmentModel;

  loggedUser: user;

  appMinDate: Date = new Date(moment().add(-5,'years').format());
  appDateOption: FlatpickrOptions = {
    mode: 'single',
    dateFormat: 'm/d/Y',
    defaultDate: new Date(this.appointmentDate),
    minDate: this.appMinDate,
    enableTime: false,
  };
  
  rescheduleDateOptions: FlatpickrOptions = {
    mode: 'single',
    dateFormat: 'm/d/Y H:i',
    defaultDate: new Date(Date.now()),
    enableTime: true,
  };
  
  
  constructor(
    private dateService: DateService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private appintmentService: AppointmentService
    ) { 
    //https://stackblitz.com/edit/angular-vjosat?file=src%2Fapp%2Fapp.component.ts
    this.loggedUser = JSON.parse(this.tokenService.getUser('lu'));
  }

  ngOnInit(): void {
    this.dtOptions = {pagingType: 'full_numbers'};
    this.appointments = [];
    //var appointmentResponse = this.route.snapshot.data.appointmentData;
    //this.populateAppointmentDetails(appointmentResponse);
    this.getAllUpcomingAppointment();
  }

  getAppSelected(){
    this.getAppointmentList(this.appointmentDate);
  }

  previousdate(){
    this.navigateDate('l');
  }

  nextdate(){
    this.navigateDate('r');
  }

  navigateDate(direction){
    this.appDate = (direction === 'l') ? this.dateService.navigatedate('l', this.appointmentDate) : this.dateService.navigatedate('r', this.appointmentDate);
    this.appointmentDate = formatDate(this.appDate, 'MM/dd/yyyy', 'en-US');
    this.appDatePicker.flatpickr.setDate(this.appDate, true, 'm/d/Y');
  }
  

  reloadAppointment(){
    this.appointmentDate = formatDate(this.appointmentDate, 'MM/dd/yyyy', 'en-US');
    this.getAppointmentList(this.appDate);
  }

  getAppointmentList(appDate) {
    this.appointments = [];
    console.log('Details for ' + appDate);
    //let requestdDate = formatDate(appDate, "yyyy-MM-dd", "en-US");
    let requestdDate = { apptdate: formatDate(appDate, "MM/dd/yyyy", "en-US") };
    this.appintmentService.getAppointments(requestdDate)
      .subscribe(response => {
        this.populateAppointmentDetails(response);
      }, (err) => {
        this.alertType = 'alert-danger';
        this.errorMessage = err.message;
        this.appointments = [];
        if (this.loadDataTable) this.rerender();
      });
  }

  getAllUpcomingAppointment() {
    this.appointments = [];
    //let requestdDate = formatDate(appDate, "yyyy-MM-dd", "en-US");
    this.appintmentService.getUpcomingAppointments()
      .subscribe(response => {
        this.populateAppointmentDetails(response);
      }, (err) => {
        this.alertType = 'alert-danger';
        this.errorMessage = err.message;
        this.appointments = [];
        if (this.loadDataTable) this.rerender();
      });
  }

  populateAppointmentDetails(appointmentResponse) {
    this.errorMessage = '';
    this.appointments = [];
    if (appointmentResponse.status === 'false') {
      if (appointmentResponse.message !== null && appointmentResponse.message.code === "ENOTFOUND") {
        this.errorMessage = "Unable to connect to api source";
        this.alertType = 'alert-danger';
      }
      else if (appointmentResponse.message !== null || appointmentResponse.message == undefined) {
        if (appointmentResponse.message.type !== '' && appointmentResponse.message.type === "invalid-json") {
          this.errorMessage = `No appointment detail available for ${formatDate(this.appointmentDate, 'MM/dd/yyyy', 'en-US')}`;
          this.alertType = 'alert-warning';
        }
        else {
          this.errorMessage = appointmentResponse.message;
          this.alertType = 'alert-warning';
        }
      }
    }
    else {
      if (appointmentResponse.data != null && appointmentResponse.data.length > 0) {
        this.appointments = appointmentResponse.data; //[0].items;
        this.appointments.forEach(element => {
          element.displayStatus = element.smsReminderTitle ='';
          element.displayStatusColor = 'badge-secondary';
          var app_confirmed_date = element.confirmed_on_date !== '' && element.confirmed_on_date !== null ? element.confirmed_on_date : element.appointment_made_date;

          if ((element.confirmed_on_date !== '' && element.confirmed_on_date !== null) || (element.confirmed === 21)) {
            element.confirm_status = 'Confirmed';
            element.confirmed_on_title = `Confirmed on ${app_confirmed_date}`;
            element.confirm_icon = 'fas fa-check status-green';
          }
          else if ((element.confirmed_on_date === '' || element.confirmed_on_date === null) && (element.isSmsSent === 1)) {
            element.confirmed_on_title = 'Reminder sent to confirm';
            element.confirm_status = '';
            element.confirm_icon = 'fas fa-adjust status-orange';
          }
          else if ((element.confirmed_on_date === '' || element.confirmed_on_date === null) && (element.status === 'Open' || element.status.toLowerCase() === 'unsheduled')) {
            element.confirmed_on_title = 'Pending confirmation';
            element.confirm_status = element.status;
            element.confirm_icon = 'fas fa-circle-notch status-purple';
          }
          else {
            element.confirmed_on_title = 'Confirmed but open';
            element.confirm_status = '';
            element.confirm_icon = 'fas fa-adjust status-orange';
          }

          if((element.aptStatus === 1 || element.aptStatus === 3 || element.aptStatus === 6) && element.isSmsSent === 1){
            element.displayStatus = element.smsSentStatus;
            element.smsReminderTitle = `Last reminder sent on ${element.dateTimeSent}`;
            element.displayStatusColor = 'badge-warning';
          }
          else if(element.isSmsSent === 0 || element.aptStatus === 5){
            element.displayStatus = element.isSmsSent === 0 ? element.smsSentStatus : element.status;
            element.displayStatusColor = 'badge-danger';
          }
          else if((element.aptStatus === 1 && element.isSmsSent !== 1)){
            element.displayStatus = element.status;
            element.displayStatusColor = 'badge-info';
          }
          else{
            element.displayStatus = element.status;
            element.displayStatusColor = 'badge-success';
          }

          if (element.email === '' || element.email === null) {
            element.task = 'Yet to collect email id';
          }

          if (element.cell === '' || element.cell === null) {
            element.task = 'Yet to collect contact number';
          }

        });
      }
    }
    //if (this.loadDataTable) 
    this.rerender();
    this.loadDataTable = true;
  }
  
  sendReminder(appointment: AppointmentModel, messageMode){
    if(appointment.sendtext === 2){
      this.show('Oops! Patient opted to stop sending text', 'i');
      return;
    }
    appointment.isSmsSent = -1;
    appointment.displayStatus = "Sending text...";

    if(messageMode === 'sms'){
      var apptdetail = {
        id: appointment.patient_id,
        aptNum: appointment.appointment_sr_no,
        aptDateTime: `${appointment.date} ${appointment.time} `,
        patient_name: appointment.patient_name,
        cell: appointment.cell,
      }
        var apptdetailObj = {apptdetail: apptdetail};
        var remindSms = this.appintmentService.sendCommunication(apptdetailObj)
        .subscribe(response => {
          this.reminderSmsResponse = response;
          if(response !== null && response !== undefined && response.status === 'true'){
            this.reminderResult = this.reminderSmsResponse.message;
            appointment.isSmsSent = 1;
            appointment.displayStatus = "Reminder sent";
            appointment.smsReminderTitle = "Sent few seconds ago"; //Needs to update time 
          }
          else{
            appointment.isSmsSent = 0;
            appointment.displayStatus = "Not sent";
            this.reminderResult = `Failed to send reminder to ${appointment.patient_name}. Please try again after some time`;
            this.show(this.reminderResult,'e');
          }
        },
        (err: HttpErrorResponse) => {
          appointment.isSmsSent = 0;
          appointment.displayStatus = "Not sent";
        this.reminderResult = err.toString();
        });
    }
    
  }
  confirmAppointment(appointment: AppointmentModel) {

    if (appointment.confirmed == 21 || appointment.confirm_status === 'Confirmed') {
      this.alertType = 'alert-danger';
      this.errorMessage = `Looks like appointment is already confirmed for ${appointment.patient_name}`;
      return false;
    }

    var aptNum = { aptNum: appointment.appointment_sr_no };
    this.appintmentService.updateConfirmation(aptNum).subscribe(response => {
      this.appointmentConfirmationResponse = response;
      if (this.appointmentConfirmationResponse.status === 'true') {
        appointment.confirm_status = 'Confirmed';
        appointment.confirmed = 21;
        appointment.confirmed_on_date = moment().format('MM/DD/YYYY HH:mm'); //formatDate(this.dateService.getDateTime(), 'MM/dd/yyyy', 'en-US');
        appointment.confirmed_on_title = `Confirmed on ${appointment.confirmed_on_date}`;
        appointment.confirm_icon = 'fas fa-check status-green';
        this.alertType = 'alert-secondary';
        this.errorMessage = `${this.appointmentConfirmationResponse.message} for ${appointment.patient_name}`;
      }
      else {
        this.alertType = 'alert-danger';
        this.errorMessage = this.appointmentConfirmationResponse.message;
      }
    }, (err) => {
      this.errorMessage = err.message;
    });
  }

  reschedule(targetModal, appointment: AppointmentModel){

    this.modal_patient_name = appointment.patient_name;
    this.modal_patient_id = appointment.patient_id;
    this.modal_current_appointment_date = appointment.date;
    this.modal_current_appointment_time = appointment.time;
    this.modal_scheduled_date = appointment.appointment_made_date;
    this.modal_confirmation_status = appointment.confirm_status;
    this.modal_confirm_icon = appointment.confirm_icon;
    this.modal_confirmed_on_title = appointment.confirmed_on_title;
    this.rescheduleSelectedAppointment = appointment;

    var rMinDateTime = this.dateService.convertToDateFormat(`${appointment.date} ${appointment.time}`);
    this.rescheduleDateOptions.defaultDate =  rMinDateTime > new Date(Date.now()) ? moment().format("MM/DD/YYYY HH:mm") : moment(rMinDateTime).format("MM/DD/YYYY HH:mm");
    this.rescheduleDateOptions.minDate = rMinDateTime > new Date(Date.now()) ? moment().format("MM/DD/YYYY HH:mm") : moment(rMinDateTime).format("MM/DD/YYYY HH:mm");
    
    this.modalService.open(targetModal, {
      centered: true,
      size: 'xl',
      scrollable: true,
      keyboard: false,
      backdrop: 'static',
      ariaLabelledBy: 'modal-basic-title'
     });

  }

  rescheduleApp() {
    console.log(this.rescheduleDateTime);
    var rescheduleObject = {
      reschduleTime: formatDate(this.rescheduleDateTime, 'MM/dd/yyyy HH:mm', 'en-US'),
      createdOn: formatDate(new Date(), 'MM/dd/yyyy HH:mm', 'en-US'),
      rsReason: this.reasonReschedule,
      patient_id: this.rescheduleSelectedAppointment.patient_id,
      appt_id: this.rescheduleSelectedAppointment.appointment_sr_no,
      user_id: this.loggedUser.id
    };

    var remindSms = this.appintmentService.rescheduleAppointment(rescheduleObject)
      .subscribe(response => {
        this.rescheduleResponse = response;
        if (this.rescheduleResponse !== null && this.rescheduleResponse !== undefined) {
          if (this.rescheduleResponse.status === 'true') {
            this.rescheduleSelectedAppointment.date = formatDate(this.rescheduleDateTime, 'MM/dd/yyyy', 'en-US');
            this.rescheduleSelectedAppointment.time = formatDate(this.rescheduleDateTime, 'HH:mm', 'en-US');
            this.show(this.rescheduleResponse.result, 's');
            this.reminderResult = this.rescheduleResponse.result;
            
            if(this.isByDate)
              this.getAppointmentList(this.appointmentDate);  
            else
              this.getAllUpcomingAppointment();
          }
        }
        else {
          this.show(this.rescheduleResponse.message, 'e');
          this.reminderResult = `Failed to send reminder to `;
        }
      },
        (err: HttpErrorResponse) => {
          this.reminderResult = err.toString();
          this.show(err.toString(), 'e');
        });
  }



  requestFeedback(appointment: AppointmentModel, messageMode) {
    this.reminderResult = '';
    if (messageMode === 'sms') {
      var apptdetailObj = { apptdetail: appointment, messageType: 'feedback' };
      this.callReminderService(apptdetailObj);
      /*
      var remindSms = this.appintmentService.sendReminder(apptdetailObj)
        .subscribe(response => {
          this.reminderSmsResponse = response;
          if (this.reminderSmsResponse.status === 'true') {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-secondary';
          }
          else {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-danger';
          }
        },
          (err: HttpErrorResponse) => {
            this.errorMessage = err.toString();
            this.alertType = 'alert-danger';
          });*/
    }
  }
  
  sendReviewsLink(appointment, messageMode) {
    if (messageMode === 'sms') {
      var apptdetailObj = { apptdetail: appointment, messageType: 'review' };
      this.callReminderService(apptdetailObj);
    }
  }

  callReminderService(apptdetailObj){

    var remindSms = this.appintmentService.sendReminder(apptdetailObj)
        .subscribe(response => {
          this.reminderSmsResponse = response;
          if (this.reminderSmsResponse.status === 'true') {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-secondary';
          }
          else {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-danger';
          }
        },
          (err: HttpErrorResponse) => {
            this.errorMessage = err.toString();
            this.alertType = 'alert-danger';
          });
  }


  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first  
      dtInstance.clear();    
      dtInstance.destroy();
      // Call the dtTrigger to rerender again       
      this.dtTrigger.next();
    });
  }   

  selectUpcoming(){
    this.isByDate = false;
    this.getAllUpcomingAppointment();
  }

  selectByDate(){
    this.isByDate = true;
    this.getAppointmentList(this.appointmentDate);
  }     

  show(message: string, type: string){
    var messageType = '';
    var title = type === 's' ? `Success`: type === 'e' ? `Failed` : 'Information';
    if(type === 'e'){
      Swal.fire({icon:'error', title: title, text: message, confirmButtonText: 'Close'});
    }
    else if(type === 'i'){
      Swal.fire({icon:'info', title: title, text: message, confirmButtonText: 'Close'});
    }
    else{
      Swal.fire({icon:'success', title: title, text: message, confirmButtonText: 'Close'})
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

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }   


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
