import { UserService } from './../../user/user.service';
import { Member } from './member.model';
import { User } from './../../user/user.model';
import { Department } from './../department.model';
import { DepartmentService, ShareData } from './../department.service';
import { Component, OnInit, Input} from '@angular/core';


@Component({
  selector: 'app-deparment-members',
  templateUrl: './deparment-members.component.html',
  styleUrls: ['./deparment-members.component.css']
})
export class DeparmentMembersComponent implements OnInit {

  
  @Input() department:Department = new Department("","");
  members: Member[];

  constructor(
    private departmentService:DepartmentService,
    private userService:UserService
  ) {}

  ngOnInit() { 
    
    this.departmentService.getDepartmentMembers(this.department.id).subscribe(
      (res) => {
        this.members = res.map(
          (snap)=>{
            const payload = snap.payload.toJSON();
            const usr = new User(snap.key,payload["name"]); 
            usr.photo = payload["photo"];  
            usr.email = payload["email"];  

            const member:Member = {
              head : payload["head"],
              user : usr
            }
            return member;
          }
        );


        //pass this data on department invites
        const data:ShareData = {
            type:"members",
            data:this.members
        }
        this.departmentService.sendData(data);
      }
    );//subscribe


    

  }//init

  isCurrentUser(userId:string){
    return this.userService.getCurrentUser().id == userId;
  }

  action(action:string,user:User){
    if(action=="remove"){      
      const sure = confirm("Sure?");
      if(!sure)return;
      this.departmentService.removeAsMember(this.department,user);
    }else if(action=="setHead" || action=="unsetHead"){
      this.departmentService.updateMemberRole(this.department,user,(action=="setHead"));
    }
  }

   


}
