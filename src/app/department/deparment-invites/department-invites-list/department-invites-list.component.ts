import { Organization } from './../../../organization/organization.model';
import { OrganizationService } from './../../../organization/organization.service';
import { UserService } from './../../../user/user.service';
import { Invite } from './../invite.model';
import { User } from './../../../user/user.model';
import { Department } from './../../department.model';
import { DepartmentService, ShareData } from './../../department.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-department-invites-list',
  templateUrl: './department-invites-list.component.html',
  styleUrls: ['./department-invites-list.component.css']
})
export class DepartmentInvitesListComponent implements OnInit {

  @Input() department: Department = new Department("", "");
  sortedInvites = {
      request: [],
      invite: []
  };
  currentOrg:Organization = this.organizationService.getCurrentOrganization()

  constructor(
      private departmentService: DepartmentService,
      private userService:UserService,
      private organizationService:OrganizationService
  ) {}

  ngOnInit() {
       
      this.departmentService.getDeparmentInvites(this.department.id).subscribe(
          (res) => {
              //clear
              this.sortedInvites.invite = [];
              this.sortedInvites.request = [];
              
              res.map(
                  (snap) => {
                      const payload = snap.payload.toJSON();
                      const user = new User(snap.key, payload["name"]);
                      user.photo = payload["photo"];
                      user.email = payload["email"];

                      const invite = new Invite();
                      invite.id = user.id;
                      invite.type = payload["type"];
                      invite.date = payload["date"];    
                      invite.user = user;                  

                      this.sortedInvites[invite.type].push(invite);
                  }
              ) //map

              
              //send this on department invites
              const data:ShareData = {
                  type:"invites",
                  data:this.sortedInvites
              }
              this.departmentService.sendData(data);

          } //res
      );

  } //init


  cancelInvite(inviteId:string){
      const sure = confirm("Sure?");
      if(!sure)return;
      
      this.userService.cancelUserInvitation(this.currentOrg.id,this.department.id,inviteId);
  }

  responToRequest(response:string,user:User){
     
    if(response=="accept"){ 
        this.departmentService
        .addDepartmentMember(user,this.department)        
        .then(
            (res)=>{
                this.userService.cancelUserInvitation(this.currentOrg.id,this.department.id,user.id);
                alert("SUCCESS")
            }
        )
        .catch(
            (err)=>{
                alert("ERROR")
            }
        )

    }else if(response=="reject"){
        const sure = confirm("Sure?");
        if(!sure)return; 
        this.userService.cancelUserInvitation(this.currentOrg.id,this.department.id,user.id);
    }

  }
}