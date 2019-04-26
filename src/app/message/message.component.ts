import { element } from 'protractor';
import { Message } from './message.interface';
import { MessageService } from './message.service';
import { UserService } from './../user/user.service';
import { UserDeparment } from './../department/department.interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService } from './../organization/organization.service';
import { Department } from './../department/department.model';
import { DepartmentService } from './../department/department.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl , Validators,FormArray} from '@angular/forms';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  departments:Department[]=[];
  messageForm:FormGroup;
  allToggleValue = false; 
  USER_DEPARTMENTS:UserDeparment[];
 
  

  constructor(
    private departmentService:DepartmentService,
    private orgService:OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private userService:UserService,
    private messageService:MessageService
  ) { }

 
  submitMessageForm(){
    if(!this.hasSelectedDepartment()){
      alert("Please select Department");
      return;
    }
    const form = this.messageForm.value;
    
    const fromDate = new Date(form.dateFrom).getTime();
    const toDate = new Date(form.dateTo).getTime();

    if(fromDate>toDate){
      alert("Invalid Date Range");
      return;
    }

    if(!this.hasSelectedDepartment()){
      alert("Please select Department");
      return;
    }

    

    const message:Message = {
      departments:this.getSelectedDepartmentsKes(form.departments),
      from:form.dateFrom,
      to:form.dateTo,
      time:form.time,
      message:form.message,
      summary:form.summary,
      type:form.type,
      every:form.every,
      dayOfTheMonth:form.dayOfTheMonth,
      sender:this.userService.getCurrentUser()
    }

     

    this.messageService.sendMessage(message);
    this.messageForm.reset();
    alert("Message SENT");
  }

  getSelectedDepartmentsKes(formValues:any){
    let indx = 0;
    let keys:string[] = [];
    formValues.forEach(element => {
      if(element){
        keys.push(this.departments[indx].id);
      }
      indx++;
    });
    return keys;
  }
 
  hasSelectedDepartment(){
    const arr = this.messageForm.value.departments;
    for(var i=0;i<arr.length;i++){
      if(arr[i])return true;
    }
    return false;
  }

  ngOnInit() {
    this.departmentService.getOrganizationDepartments().subscribe(
      (res)=>{        

        //filter allowed to send message
        this.departments = res.filter((dep)=>{
          return this.isAllowedToSend(dep.key);
        }).map(
          (snap)=>{
            const dept = new Department(snap.key,snap.payload.toJSON()["name"]);
            return dept;
          }
        ); 

        this.setUpMessageForm();
        this.setDynamicValidators();
      }
    );

    this.USER_DEPARTMENTS = JSON.parse(localStorage.getItem("USER_DEPARTMENTS"));  
    console.log(this.USER_DEPARTMENTS)  
  }

  isAdminUser(){
    return this.userService.isAdminUser(this.orgService.getCurrentOrganization().owner.id);
  }

  isAllowedToSend(departmentId:string){
    //admin can send to all deparments
    if(this.isAdminUser())return true;
    const arr = this.USER_DEPARTMENTS || [];
    for(var i=0;i<arr.length;i++){
      if(arr[i].head)return true;

      if(departmentId === arr[i].department.id)return true;
    }
    return false;
  }

  setUpMessageForm(){
    this.messageForm = new FormGroup({
      'departments':this.buildDepartmentsFormControl(false),
      'message':new FormControl(null,Validators.compose([Validators.required,Validators.maxLength(200)])),
      'summary':new FormControl(null,Validators.maxLength(50)),      
      'dateFrom':new FormControl(null),
      'dateTo':new FormControl(null), 
      'time':new FormControl(null),
      'dayOfTheMonth':new FormControl(null),
      'type':new FormControl(null,Validators.required),
      'every':new FormControl(null)
    });
  }

  setDynamicValidators(){
    this.messageForm.get("type").valueChanges.subscribe((val)=>{
      const schedValidator = val!='now'?Validators.required:null;
      const everyValidator = val=='every'?Validators.required:null;
             
      this.messageForm.get("dateFrom").setValidators(schedValidator);  
      this.messageForm.get("dateTo").setValidators(schedValidator);    
      this.messageForm.get("time").setValidators(schedValidator);  
      this.messageForm.get("every").setValidators(everyValidator);      
      
      this.messageForm.get("dateFrom").setValue(null);  
      this.messageForm.get("dateTo").setValue(null);   
      this.messageForm.get("time").setValue(null);    
      this.messageForm.get("every").setValue(null);           
    });

    this.messageForm.get("every").valueChanges.subscribe((val)=>{
      const dayOfTheMonthValidator = val=='exotm'?Validators.required:null; 
      this.messageForm.get("dayOfTheMonth").setValidators(dayOfTheMonthValidator);    
      this.messageForm.get("dayOfTheMonth").setValue(null);           
    });

    this.messageForm.get("type").valueChanges.subscribe((val)=>{
      const validator = val!='now'?Validators.required:null;
      this.messageForm.get("dateFrom").setValidators(validator);  
      this.messageForm.get("dateTo").setValidators(validator);    
      this.messageForm.get("time").setValidators(validator);      
      
      this.messageForm.get("dateFrom").setValue(null);  
      this.messageForm.get("dateTo").setValue(null);   
      this.messageForm.get("time").setValue(null);  
    }); 
  }

  buildDepartmentsFormControl(values:boolean){     
      const finalValue = this.departments.length==1?true:values;
      const arr = this.departments.map(dept => {
        return new FormControl(finalValue)
      });
      if(this.departments.length<1){
        alert("Not a member yet!");
        window.history.back();
      }
      return new FormArray(arr);   
  }

  toggleSelectAll(){
    this.messageForm.setControl('departments',this.buildDepartmentsFormControl(!this.allToggleValue));
    this.allToggleValue = !this.allToggleValue;
  }
  
  back(){
    this.router.navigate(['/dashboard']);
  }
}
