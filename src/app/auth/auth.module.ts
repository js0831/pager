import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
    declarations:[
        RegisterComponent,
        LoginComponent
    ],
    imports:[
        FormsModule,
        AuthRoutingModule,
        CommonModule
    ]
})
export class AuthModule{

}