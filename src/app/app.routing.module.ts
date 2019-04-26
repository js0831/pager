import { MonitorComponent } from './monitor/monitor.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { AdminGuard } from './guards/admin-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { Routes,RouterModule ,PreloadAllModules} from '@angular/router';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth-guard.service';
import { DepartmentComponent } from './department/department.component';
import { MessageComponent } from './message/message.component';

const appRoutes: Routes = [     
  { path: 'dashboard', canActivate:[AuthGuard],component: DashboardComponent},
  
  //add guard here for admin only access
  // { path: 'department', canActivate:[AuthGuard,AdminGuard], component: DepartmentComponent},
  { path: 'message', canActivate:[AuthGuard], component: MessageComponent},  
  //{ path: 'message/:departmentid', canActivate:[AuthGuard], component: MessageComponent},
  { path: 'monitor/:departmentid', canActivate:[AuthGuard], component: MonitorComponent},  
  { path: 'page-not-found', component: PageNotFoundComponent},   
  { path: 'forbidden', component: ForbiddenComponent},   
  { path: '**',redirectTo:'page-not-found'},  
]

@NgModule({
  imports:[
    RouterModule.forRoot(appRoutes , { preloadingStrategy: PreloadAllModules,useHash: true } )
  ],
  exports:[
    RouterModule
  ]
})
export class appRoutingModule{

}