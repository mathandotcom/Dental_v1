import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/shared/chat/message.service';
import { ChatPatientsResponse, ChatPatient, PatientMessageResponse, PatientMessage, SendMessageResponse, PatientMessages } from 'src/app/shared/chat/message.model';
import { TokenService } from 'src/app/shared/token.service';
import { response } from 'express';
import { HttpErrorResponse } from '@angular/common/http';
import { GenericService } from 'src/app/shared/generic.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  chatPatientsResponse: ChatPatientsResponse;
  patientMessageResponse: PatientMessageResponse;
  sendMessageResponse: SendMessageResponse;
  chatPatients: ChatPatient[];
  tempChatPatients: ChatPatient[];
  selectedChat: ChatPatient;
  patientMessages: PatientMessages[];
  selectedPatient: string;
  lastMessageReceived: string;
  errorMessage: string;
  inputMessage: string;
  patientName: string;

  sub: any;
  patientId: number;

  messageSubscription: Subscription

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private tokenService: TokenService


  ) { }
  //https://www.youtube.com/watch?v=DvnzeCfYg0s - auto refresh
  ngOnInit(): void {
    this.chatPatients = [];
    this.sub = this.route.params.subscribe(params => {
      this.patientId = params['id'] == undefined ? 0 : +params['id']; // (+) converts string 'id' to a number
    });

    this.chatPatientsResponse = this.route.snapshot.data.patientsData;
    if (this.chatPatientsResponse.status === 'true') {
      this.chatPatients = this.tempChatPatients = this.chatPatientsResponse.data;
      this.chatPatients.forEach(element => {
        if (element.message !== null && element.message.length > 35) {
          element.message = `${element.message.substr(0, 35)}...`;
        }
      });
      if (this.patientId > 0) {
        var patient = this.chatPatients.find(x => x.patientId === this.patientId);
        if (patient !== undefined) {
          this.getChatMessages(patient);
        }
      }
      else {
        this.getChatMessages(this.chatPatients[0]);
      }
    }
    else {
      this.errorMessage = this.chatPatientsResponse.message;
    }
  }

  getChatMessages(chatPatient){
    this.stopAutoRefresh();
    this.selectedChat = chatPatient;
    this.errorMessage='';
    this.patientMessages = [];
    this.patientId = chatPatient.patientId;
    this.selectedPatient = chatPatient.patient_name;
    this.lastMessageReceived = chatPatient.createdon;

    this.getMessages(chatPatient.patientId);
  }


  sendMessage(event){
    if(this.inputMessage === undefined || this.inputMessage === ''){return false;}
    this.stopAutoRefresh();
    console.log(this.inputMessage);
    var phone = this.selectedChat.cell;
    var loggedUser = JSON.parse(this.tokenService.getUser('lu'));
    var mObject = {chatpatient: this.selectedChat, message: this.inputMessage, createdBy: loggedUser.id};
    this.messageService.sendMessage(mObject)
    .subscribe(response => {
      this.sendMessageResponse = response;
      if(this.sendMessageResponse!== null && this.sendMessageResponse.status === "true"){
        this.getMessages(this.selectedChat.patientId);
        this.inputMessage = '';    
      }
      else if(this.sendMessageResponse.status === "false"){
        this.errorMessage = this.sendMessageResponse.message;
      }
    }, 
      (err: HttpErrorResponse)=>{
        this.errorMessage = err.toString();
    });
  }


  getMessages(patientId){
    this.stopAutoRefresh();
    var paramObj = {patientId: patientId};
    this.messageService.getChatMessages(paramObj)
    .subscribe(response => {
      this.patientMessageResponse = response;
      if(this.patientMessageResponse!=null && this.patientMessageResponse.status === "true"){
        this.patientMessages = this.patientMessageResponse.data;
      }
      else{
        this.errorMessage = this.patientMessageResponse.message;
      }
      //this.startAutoRefresh();
    }, 
      (err: HttpErrorResponse)=>{
        this.errorMessage = err.toString();
    });    
  }

  searchChatPatient() {
    console.log(this.patientName);
    if (this.patientName === undefined || this.patientName === '') {this.chatPatients = this.tempChatPatients; return;}
    this.chatPatients = this.tempChatPatients.filter(x => x.patient_name.toLowerCase().indexOf(this.patientName.toLowerCase()) >= 0);
  }

  startAutoRefresh(){
    const startRefresh = timer(5000, 2000);
    this.messageSubscription = startRefresh.subscribe(res => {
      this.getMessages(this.patientId);
    });
  }

  stopAutoRefresh(){
    if(this.messageSubscription!== null && this.messageSubscription !== undefined){
      this.messageSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    if(this.messageSubscription === undefined) return;
    this.messageSubscription.unsubscribe();
  }
}
