
import { Member } from './../deparment-members/member.model';
import { OrganizationService } from './../../organization/organization.service';
import { UserService } from './../../user/user.service';
import { NgForm } from '@angular/forms';
import { Department } from './../department.model';
import { User } from './../../user/user.model';
import { DepartmentService, ShareData } from './../department.service';
import { Component, OnInit,Input,OnDestroy  } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-deparment-invites',
  templateUrl: './deparment-invites.component.html',
  styleUrls: ['./deparment-invites.component.css']
})
export class DeparmentInvitesComponent implements OnInit,OnDestroy  {

  @Input() department:Department = new Department("",""); 
  members:Member[] = [];
  invites:any = {request:[],invite:[]};
  subscription: Subscription;
  showInviteForm:boolean = false;

  constructor(
    private departmentService:DepartmentService,
    private userService:UserService,
    private orgSerivce:OrganizationService
  ) { 

     
    //recieved data from department members component
    this.subscription = this.departmentService
    .getData()
    .subscribe(
      (res:ShareData) => { 
        if(res.type=="members"){
          this.members = res.data;   
        }else if(res.type=="invites"){
          this.invites = res.data;
          console.log("-----------------")         
          console.log(this.invites); 
        }
      }
    ); 

  }

  onShowInviteForm(){
    this.showInviteForm = !this.showInviteForm;
  }

  ngOnDestroy(){ 
    this.subscription.unsubscribe();
  }

  ngOnInit() { 
  
  }//init

  onSubmit(f:NgForm){
    if(f.value.email.length<1)return;
    if(!f.valid){
      alert("Invalid Email!");
      return;
    }

    const valid = this.isEmailAlreadyMemberInvited(f.value.email);
    if(valid.result){
      alert(valid.message);
      return;
    }

    const currentOrg = this.orgSerivce.getCurrentOrganization();
    this.userService.invite(currentOrg.id,this.department.id,f.value.email,"invite")
    .then(
      (res)=>{
        if(!res){
          alert("Email Address does not Exist!");
          return;
        }
        this.onShowInviteForm();
        f.reset();
      }
    )
    .catch(
      (res)=>{
        alert('ERROR ACCURED');
      }
    );
  }

  isEmailAlreadyMemberInvited(email:string){    
    for(var i=0;i<this.members.length;i++){
      if(this.members[i].user.email===email){
        return {
          result:true,
          message:"Email address is already a member"
        };
      }
    }

    //check if already sent request    
    for(var i=0;i<this.invites.request.length;i++){
      if(this.invites.request[i].user.email===email){
        return {
          result:true,
          message:"Email already send a request, Please accept."
        };
      }
    }

    //check if already invited
    for(var i=0;i<this.invites.invite.length;i++){ 
      if(this.invites.invite[i].user.email===email){
        return {
          result:true,
          message:"Email is already invited"
        };
      }
    }
     

    return {
      result:false,
      message:"" 
    };
  }
}
