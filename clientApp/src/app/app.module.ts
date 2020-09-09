import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { AppComponent } from './app.component';
import { NotfoundComponent } from './error/notfound/notfound.component';
import { RoutingComponents, AppRoutingModule } from './app.routing/app.routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptorServiceService } from './interceptors/auth-interceptor-service';
import { AuthGuard } from './shared/auth.guard';
import { ConstantService } from './shared/constant.service';
import { GenericService } from './shared/generic.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { AuthService } from './shared/auth.service';
import { TokenService } from './shared/token.service';
import { HttpErrorInterceptor } from './interceptors/httpErrorInterceptor';
import { DateService } from './shared/utility/date.service';
import { PatientResolverService } from './shared/patient/patient-resolver.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientSikkaResolverService } from './shared/patient-sikka/patient-resolver.service';
import { CacheService } from './shared/cache.service';
import { HttpClientService } from './shared/http-client.service';
import { TreatmentplanComponent } from './patient/treatmentplan/treatmentplan.component';
import { ExtractionConsentComponent } from './patient/_consentform/extraction-consent/extraction-consent.component';
import { CrownConsentComponent } from './patient/_consentform/crown-consent/crown-consent.component';
import { PhotographyConsentComponent } from './patient/_consentform/photography-consent/photography-consent.component';
import { CrownbridgeConsentComponent } from './patient/_consentform/crownbridge-consent/crownbridge-consent.component';
import { FullpartialDentureConsentComponent } from './patient/_consentform/fullpartial-denture-consent/fullpartial-denture-consent.component';
import { DentistryInformedSpanishConsentComponent } from './patient/_consentform/dentistry-informed-spanish-consent/dentistry-informed-spanish-consent.component';
import { DentistryMinorSpanishConsentComponent } from './patient/_consentform/dentistry-minor-spanish-consent/dentistry-minor-spanish-consent.component';
import { ChatComponent } from './patient/chat/chat.component';
import { EmailComponent } from './utility/email/email.component';
import { TemplateComponent } from './utility/template/template.component';
import { TreeModule } from './utility/tree/tree.module';
import { VMenuComponent } from './utility/v-menu/v-menu.component';
import { ListuserComponent } from './auth/listuser/listuser.component';
import { RegistrationModalComponent } from './auth/registration-modal/registration-modal.component';
import { ProfileModalComponent } from './auth/profile-modal/profile-modal.component';
import { QuillModule } from 'ngx-quill';


@NgModule({
  declarations: [
    AppComponent,
    RoutingComponents,
    TreatmentplanComponent,
    ExtractionConsentComponent,
    CrownConsentComponent,
    PhotographyConsentComponent,
    CrownbridgeConsentComponent,
    FullpartialDentureConsentComponent,
    DentistryInformedSpanishConsentComponent,
    DentistryMinorSpanishConsentComponent,
    ChatComponent,
    EmailComponent,
    TemplateComponent,
    VMenuComponent,
    ListuserComponent,
    RegistrationModalComponent,
    ProfileModalComponent,


   
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    DataTablesModule,
    EditorModule,
    TreeModule.forRoot(),
    Ng2FlatpickrModule,
    NgMultiSelectDropDownModule.forRoot(),
    QuillModule.forRoot(),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorServiceService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    AuthGuard,
    ConstantService,
    GenericService,
    TokenService,
    DateService,
    PatientResolverService,
    PatientSikkaResolverService,
    CacheService,
    HttpClientService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
