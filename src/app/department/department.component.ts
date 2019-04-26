import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './../user/user.service';
import { Observable } from 'rxjs/Observable';
import { Department } from './department.model';
import { DepartmentService } from './department.service';
import { Organization } from './../organization/organization.model';
import { OrganizationService } from './../organization/organization.service';
import { Component, OnInit, Output,EventEmitter} from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  
  department:Department = new Department("","");
  method:string = "list";
  showDepartmentForm = false;
  @Output() viewChanged = new EventEmitter<{data:string}>();


  constructor(
    private departmentService:DepartmentService,
    private organizationService:OrganizationService,
    private userService:UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() { 
    //listen to department component list
    this.departmentService.departmentSelected.subscribe( (data:any) => {

      if(data.method=="edit")this.showDepartmentForm = true;

      this.department = data.department;
      this.method = data.method; 
      this.viewChanged.emit({data:this.method});
    });    
  }

  isAdmin(){
    return this.userService.isAdminUser(this.organizationService.getCurrentOrganization().owner.id);
  }

  onSubmit(){
    if(this.department.name.length<1)return;
    
    const dept = new Department(this.department.id,this.department.name);

    if(this.department.id!=""){
      this.updateDepartment();
      return;
    }
    this.addDepartment();
  }

  addDepartment(){
    this.departmentService.addDepartment(this.department).then(
      ()=>{ 
        //clear form
        this.cancelEdit();
      }
    );
  }

  closeDepartmentForm(){
    this.showDepartmentForm = false;
    this.cancelEdit();
  }

  updateDepartment(){
    this.departmentService.updateDepartment(this.department).then(
      (res)=>{
        //clear form
        this.cancelEdit();
      }
    );
  }

  cancelEdit(){
    this.department = new Department("","");
    this.showDepartmentForm = false;
  }

  backToList(){
    this.method = "list";
    this.viewChanged.emit({data:this.method});
    this.cancelEdit();//clear department;
  }

  sendMessage(){
    this.router.navigate(['/message']);
  }
}
