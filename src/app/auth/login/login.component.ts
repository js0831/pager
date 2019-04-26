import { UserService } from './../../user/user.service';
import { User } from './../../user/user.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { OrganizationService } from './../../organization/organization.service';
import { Organization } from './../../organization/organization.model';
import { NgForm } from '@angular/forms';
import { FirebaseAuthService } from './../firebase-auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  organization: Organization = null;
  orgid: string = null;

  constructor(
      private firebaseAuthService: FirebaseAuthService,
      private router: Router,
      private route: ActivatedRoute,
      private organizationService: OrganizationService,
      private AFDatabase: AngularFireDatabase,
      private userService: UserService
  ) {}

  ngOnInit() {
      this.orgid = this.route.snapshot.params['orgid'];
      const currentORG = this.organizationService.getCurrentOrganization();
       
      if(currentORG){ 
        this.organization = currentORG;
        return;
      }

      this.organizationService.getOrganizationByID(this.orgid)
        .then(
            (org: Organization) => {
                this.organization = org;
                this.organizationService.saveOnLocalStorage(org);
            }
        ).catch(
            (err) => {
                this.router.navigate(['not-found']);
            }
        ); 
  }


  googleSignin() {
      this.firebaseAuthService.googleLogin(
          (response) => {

              if (response.result == "failed") {
                  alert(response.response.code + "\n" + response.response.message);
              } else {
                  const user = new User(response.response.uid,response.response.displayName);
                  user.photo = response.response.photoURL;
                  user.email = response.response.email;
                  
                  this.userService.saveOnLocalStorage(user);

                  if (response.isNewUser) {
                      this.userService.addNewUser(user, response.response.uid, this.orgid)
                          .then(
                              () => {                                  

                                  alert("Login Successful");
                                  this.router.navigate(['/dashboard']);
                              }
                          ).catch(
                              (err) => {
                                  alert("Registration FAILED");
                              }
                          );

                  } else {
                      alert("Login Successful");
                      this.router.navigate(['/dashboard']);
                  }
              }

          }
      );
  }

  onLogin(form: NgForm) {
      const email = form.value.email;
      const password = form.value.password;
      this.firebaseAuthService.login(email, password, (response) => {
          if (response.result == "failed") {
              alert(response.response.code + "\n" + response.response.message);
          } else {
              form.reset();
              
              this.userService.getUserBy(this.orgid,response.response.uid)
              .then(
                  (user:User)=>{
                    this.userService.saveOnLocalStorage(user);                    
                    alert("Login Successful");
                    this.router.navigate(['/dashboard']);
                  }
              )
              .catch(
                  (err)=>{
                      alert("Login FAILED");
                  }
              )

          }
      });
  }

  gotoRegister(){
    this.router.navigate(['/register',this.organization.id]);
  }

}