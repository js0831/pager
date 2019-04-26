import { Router } from '@angular/router';
import { UserDeparment, UserInvite } from './../department.interfaces';
import { OrganizationService } from './../../organization/organization.service';
import { UserService } from './../../user/user.service';
import { DepartmentService } from './../department.service';
import { Department } from './../department.model';
import { Component, OnInit } from '@angular/core';


 
@Component({
  selector: 'app-deparment-list',
  templateUrl: './deparment-list.component.html',
  styleUrls: ['./deparment-list.component.css']
})
export class DeparmentListComponent implements OnInit {

  departments:Department[];
  userDepartments:UserDeparment[] = [];
  userInvites:UserInvite[] = [];
  
  currentOrg = this.orgService.getCurrentOrganization();
  currentUser = this.userService.getCurrentUser();

  constructor(
    private departmentService:DepartmentService,
    private userService:UserService,
    private orgService:OrganizationService,
    private router: Router
  ) {}

  ngOnInit() {    
    this.departmentService.getOrganizationDepartments().subscribe(
      (res)=>{
        this.departments = res.map(
          (snap)=>{
            const dept = new Department(snap.key,snap.payload.toJSON()["name"]);
            return dept;
          }
        )
      }
    );
    
    this.userService.getUserDepartments(this.currentUser.id,this.currentOrg.id)
    .subscribe((res)=>{      
      this.userDepartments = [];
      res.map((res)=>{
        const payload = res.payload.toJSON();        
        const dept = new Department(res.key,payload["name"]);
        const userDepts:UserDeparment = {
          head:payload["head"],
          department:dept
        }
        this.userDepartments.push(userDepts);
        
        localStorage.setItem("USER_DEPARTMENTS",JSON.stringify(this.userDepartments));
      });
    });


    this.userService.getUserInvites(this.currentUser.id,this.currentOrg.id)
    .subscribe((res)=>{
      this.userInvites = [];
      res.map((res)=>{
        const payload = res.payload.toJSON();                 
        const userInvts:UserInvite = {
          type:payload["type"],
          departmentID:res.key
        }
        this.userInvites.push(userInvts);
      }); 
    })

  }

  isPendingInvite(departmentID:string){
    for(var i=0;i<this.userInvites.length;i++){
      if(departmentID==this.userInvites[i].departmentID){
        return this.userInvites[i].type;
      }
    }
    return false;
  }

  isUserMember(departmentID:string){
    for(var i=0;i<this.userDepartments.length;i++){
      if(departmentID==this.userDepartments[i].department.id){
        return true;
      }
    }
  }

  deleteDepartment(id:string){    
    const sure = confirm("Sure?");    
    if(!sure)return;
    this.departmentService.deleteDepartment(id); 
  }

  seletectDepartment(id:number,method:string){ 
    if(method=="monitor"){
      this.router.navigate(['/monitor',this.departments[id].id]);
      return;
    }

    const departmentCloned = Object.assign({}, this.departments[id]);
    this.departmentService.departmentSelected.emit({department:departmentCloned,method:method});
  }
  
  isAdmin(){
    return this.userService.isAdminUser(this.currentOrg.owner.id);
  }

  isHeadOfDepartment(departmentId:string=''){
    for(var i=0;i<this.userDepartments.length;i++){ 
      if(this.userDepartments[i].head==true){
        if(departmentId==null || departmentId.length<1)return true;
        if(this.userDepartments[i].department.id==departmentId){
          return true;
        }        
      }
    }
    return false;
  }

  join(id:string){
    this.userService.invite(this.currentOrg.id,id,this.currentUser.email,"request")
    .then(
      (res)=>{
        if(res){
          alert("Request Sent! Please wait for the Department Head Approval");
        }else{
          alert('ERROR ACCURED');
        }
      }
    )
    .catch(
      (res)=>{
        alert('ERROR ACCURED');
      }
    ); 
  }

  acceptInvitation(department:Department){
    this.departmentService.addDepartmentMember(this.currentUser,department);    
    this.userService.cancelUserInvitation(this.currentOrg.id,department.id,this.currentUser.id);
  }

  
}
