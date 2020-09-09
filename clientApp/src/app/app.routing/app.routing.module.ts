import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeLayoutComponent } from '../_layout/home-layout/home-layout.component';
import { SiteLayoutComponent } from '../_layout/site-layout/site-layout.component';
import { SiteHeaderComponent } from '../_layout/site-header/site-header.component';
import { SiteSidebarComponent } from '../_layout/site-sidebar/site-sidebar.component';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { ReportComponent } from '../dashboard/report/report.component';
import { LoadScriptDirective } from '../shared/load-script.directive';
import { NotfoundComponent } from '../error/notfound/notfound.component';
import { AllPatientsComponent } from '../patient/all-patients/all-patients.component';
import { AppointmentsComponent } from '../appointment/appointments/appointments.component';
import { SiteFooterComponent } from '../_layout/site-footer/site-footer.component';
import { AuthGuard } from '../shared/auth.guard';
import { ExconsentComponent } from '../patient/exconsent/exconsent.component';
import { ConsentLayoutComponent } from '../_layout/consent-layout/consent-layout.component';
import { PatientResolverService } from '../shared/patient/patient-resolver.service';
import { AllPatientsSikkaComponent } from '../patient/all-patients-sikka/all-patients-sikka.component';
import { PatientSikkaResolverService } from '../shared/patient-sikka/patient-resolver.service';
import { AppointmentResolverService } from '../shared/appointment/appointment-resolver.service';
import { ChatComponent } from '../patient/chat/chat.component';
import { MessageResolverService } from '../shared/chat/message-resolver.service';
import { TemplateComponent } from '../utility/template/template.component';
import { CategoryResolverService } from '../shared/template/category-resolver.service';
import { ListuserComponent } from '../auth/listuser/listuser.component';
import { EventResolverService } from '../shared/event/event-resolver.service';
import { ListuserResolverService } from '../shared/user/listuser-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: '', component: LoginComponent, pathMatch: 'full', data: {title: 'Login'} },
      { path: 'login', component: LoginComponent, pathMatch: 'full', data: {title: 'Login'} },
      { path: 'register', component: RegisterComponent, pathMatch: 'full', data: {title: 'Register'} }
    ]
  },
  {
    path: 'app',
    component: SiteLayoutComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: ReportComponent, pathMatch: 'full', data: {title: 'Dashboard'} },
      { path: 'appointments', component: AppointmentsComponent, pathMatch: 'full', data: {title: 'Appointments'}, resolve: {appointmentData: AppointmentResolverService} },
      { path: 'patients', component: AllPatientsComponent, pathMatch: 'full', data: {title: 'Patients'}, resolve: {patientsData: PatientResolverService} },
      { path: 'patientext', component: AllPatientsSikkaComponent, pathMatch: 'full', data: {title: 'Patients'}, resolve: {patientsData: PatientSikkaResolverService} },
      //{ path: 'consent/:id/:ctype', component: ExconsentComponent, pathMatch: 'full', data: {title: 'Consent form'}, resolve: {patientsData: PatientSikkaResolverService} }, //Show all existing consent form
      { path: 'consent/:id/:ctype', component: ExconsentComponent, pathMatch: 'full', data: {title: 'Consent form'}, resolve: {patientsData: PatientResolverService} }, //Show all existing consent form
      { path: 'consent', component: ExconsentComponent, pathMatch: 'full', data: {title: 'Consent'}, resolve: {patientsData: PatientResolverService} }, //Show all existing consent form
      { path: 'chat', component: ChatComponent, pathMatch: 'full', data: {title: 'Send Message'}, resolve: {patientsData: MessageResolverService} }, //Show all existing patient with last sent message 
      { path: 'chat/:id', component: ChatComponent, pathMatch: 'full', data: {title: 'Send Message'}, resolve: {patientsData: MessageResolverService} }, //Show all existing patient with last sent message 
      //{ path: 'template', component: TemplateComponent, pathMatch: 'full', data: {title: 'Templates'}, resolve: {categoryData: CategoryResolverService}}, //Show all existing patient with last sent message 
      { path: 'users', component: ListuserComponent, pathMatch: 'full', data: {title: 'Users'}, resolve: {userModelData: ListuserResolverService}}, //Show all existing patient with last sent message 
      { path: 'template', component: TemplateComponent, pathMatch: 'full', data: {title: 'Templates'}, resolve: {eventData: EventResolverService, categoryData: CategoryResolverService}}, //Show all existing patient with last sent message 
    ]
  },
  {
    path: 'consent',
    component: ConsentLayoutComponent,
    canActivate: [AuthGuard],
    children: [
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full', data: {title: 'Login'} },
  { path: 'not-available', component: NotfoundComponent, pathMatch: 'full', data: {title: 'Page not available'}  },
  { path: '**', redirectTo: '/not-available', data: {title: 'Page not available'} },

];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }


export const RoutingComponents = [
  HomeLayoutComponent,
  SiteLayoutComponent,
  SiteHeaderComponent,
  SiteSidebarComponent,
  ConsentLayoutComponent,
  LoginComponent,
  RegisterComponent,
  ReportComponent,
  LoadScriptDirective,
  NotfoundComponent,
  AllPatientsComponent,
  SiteFooterComponent,
  AppointmentsComponent,
  ExconsentComponent,
  AllPatientsSikkaComponent

];