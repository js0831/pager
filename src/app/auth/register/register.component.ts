import { UserService } from './../../user/user.service';
import { User } from './../../user/user.model';
import { OrganizationService } from './../../organization/organization.service';
import { Organization } from './../../organization/organization.model';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FirebaseAuthService } from '../firebase-auth.service';
import { ActivatedRoute } from '@angular/router';

import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
 
  organization:Organization = null;
  orgid:string=null;

  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private router:Router,
    private AFDatabase: AngularFireDatabase,
    private route: ActivatedRoute,
    private organizationService:OrganizationService,
    private userService:UserService
  ) { }

  ngOnInit() {
    this.orgid = this.route.snapshot.params['orgid'];

    const currentORG = this.organizationService.getCurrentOrganization();
    if(currentORG){
      this.organization = currentORG;
      return;
    }

    this.organizationService.getOrganizationByID(this.orgid)
    .then(
      (org:Organization)=>{
        this.organization = org;
        this.organizationService.saveOnLocalStorage(org);
      }
    ).catch(
      (err)=>{
        this.router.navigate(['not-found']);
      }
    ); 

    

    // get list
    //const organizationREFFENCE = this.AFDatabase.list("organization");
    // organizationREFFENCE.snapshotChanges().subscribe(
    //   (a)=>{
    //     a.forEach(el =>{
          
    //       const y = el.payload.toJSON();
    //       y['$key'] = el.key

    //       console.log(y)

    //     })
    //   }
    // )

    // save data on list
    // organizationREFFENCE.push({
    //   name:"ESSPI",
    //   logo:"test.png"
    // })



    //get single object
    // this.AFDatabase.object("organization/0").snapshotChanges().subscribe(
    //   (a)=>{
    //       const y = a.payload.toJSON();
    //       y['$key'] = a.key
    //     console.log(y);
    //   }
    // )

    //save single object
    // var organizationREFFENCE = this.AFDatabase.object("organization");
    // organizationREFFENCE.set({
    //   name:"a",
    //   logo:"b"
    // })

  }


  onSubmit(form : NgForm){
    const email = form.value.email;
    const password = form.value.password;
    const confirmPassword = form.value.confirmPassword;
    const name = form.value.name;

    if(password!=confirmPassword){
      alert("Password Not matched!");
      return;
    }

    this.firebaseAuthService.register(email,password)
    .then(
      response => {
        form.reset();
        const user = new User(response.uid,name);
        user.email = email;
        this.userService.addNewUser(user,response.uid,this.orgid)
        .then(
          ()=>{
            alert("Registration Successful");  
          } 
        ).catch(
          (err)=>{
            alert("Registration FAILED"); 
          } 
        ); 

      }
    )
    .catch(
      error => {
        alert(error.code+"\n"+error.message)
      }
    )
  }


  registerUser(){

  }

  cancelRegistration(){
    this.router.navigate(['/login',this.organization.id]);
  }
}


