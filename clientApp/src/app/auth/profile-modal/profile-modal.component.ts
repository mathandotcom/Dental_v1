import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BridgeService } from 'src/app/shared/bridge.service';
import { RegisterUserService } from 'src/app/shared/user/register-user.service';
import { UserModel } from 'src/app/shared/user/user.model';
 

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent implements OnInit {
  message: string = "child";
  @Output() reloadData = new EventEmitter<any>();

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

  constructor(
    public model: NgbActiveModal,
    private modalService: NgbModal,
    private bridgeService: BridgeService,
     private userService : RegisterUserService
  ) {}

  sendMessage() {
    console.log(this.message);
    this.reloadData.emit(this.message);
    this.bridgeService.sendData(JSON.stringify({'message':this.message}));

  }

  ngOnInit(): void {
   
      this.userId =  this.userObject.id;
      this.firstName = this.userObject.firstname;
      this.lastName = this.userObject.lastname;
      this.userEmail = this.userObject.username;
      this.userPhone = this.userObject.phone;
      this.clinicId = this.userObject.clinic_id;
      this.roleId = this.userObject.roleid;
    }
    
  }


