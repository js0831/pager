import { UtilsService } from './services/utils.service';
import { MessageService } from './message/message.service';
import { AdminGuard } from './guards/admin-guard.service';
import { BrowserModule } from '@angular/platform-browser'; 
import { NgModule } from '@angular/core';
import { appRoutingModule } from './app.routing.module';
import { FirebaseAuthService } from './auth/firebase-auth.service';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth/auth-guard.service';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { OrganizationService } from './organization/organization.service';
import { UserService } from './user/user.service';
import { ForbiddenComponent } from './forbidden/forbidden.component';

import { DepartmentComponent } from './department/department.component';
import { DepartmentService } from './department/department.service';
import { DeparmentListComponent } from './department/deparment-list/deparment-list.component';
import { DeparmentMembersComponent } from './department/deparment-members/deparment-members.component';
import { DeparmentInvitesComponent } from './department/deparment-invites/deparment-invites.component';
import { DepartmentInvitesListComponent } from './department/deparment-invites/department-invites-list/department-invites-list.component';
import { ProfileComponent } from './profile/profile.component';
import { MessageComponent } from './message/message.component';
import { MonitorComponent } from './monitor/monitor.component';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    DashboardComponent,
    DepartmentComponent,
    ForbiddenComponent,
    DeparmentListComponent,
    DeparmentMembersComponent,
    DeparmentInvitesComponent,
    DepartmentInvitesListComponent,
    ProfileComponent,
    MessageComponent,
    MonitorComponent
  ],
  imports: [
    BrowserModule, 
    AuthModule,
    appRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    //SERVICES
    UtilsService,
    FirebaseAuthService,
    OrganizationService,
    UserService,
    DepartmentService,
    MessageService,
    //GUARDS
    AuthGuard,
    AdminGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
 