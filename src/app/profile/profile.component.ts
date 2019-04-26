import { FirebaseAuthService } from './../auth/firebase-auth.service';
import { UserService } from './../user/user.service';
import { OrganizationService } from './../organization/organization.service';
import { Router } from '@angular/router';
import { Organization } from './../organization/organization.model';
import { User } from './../user/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  currentUser:User = null;
  currentORG:Organization = null;

  constructor(
    private firebaseAuthService:FirebaseAuthService,
    private router:Router,
    private organizationService:OrganizationService,
    private userService:UserService
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.currentORG = this.organizationService.getCurrentOrganization();   
  }

  isAdmin(){
    return this.userService.isAdminUser(this.currentORG.owner.id);
  }

  logout(){    
    this.firebaseAuthService.logout(
      ()=>{ 
        this.router.navigate(['/login',this.currentORG.id]);    
      }
    )
  }

}
