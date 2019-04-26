import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';


const authRoutes: Routes = [
    // { path: '', component: LoginComponent},
    { path: 'login/:orgid', component: LoginComponent},  
    { path: 'register/:orgid', component: RegisterComponent}     
];

@NgModule({
    imports: [
       RouterModule.forChild(authRoutes)
    ],
    exports:[RouterModule]
})
export class AuthRoutingModule {

}
