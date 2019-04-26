import { Observable } from 'rxjs/Observable';
import { Member } from './deparment-members/member.model';
import { User } from './../user/user.model';
import { Organization } from './../organization/organization.model';

import { Department } from './department.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { OrganizationService } from './../organization/organization.service';
import { Injectable,EventEmitter} from '@angular/core';
import { Subject }    from 'rxjs/Subject';


export interface ShareData{
    type:string;
    data:any
}

@Injectable()
export class DepartmentService{ 
    
    departmentSelected = new EventEmitter<any>(); 
    private subject = new Subject<ShareData>();

    
    sendData(data: ShareData) {
        this.subject.next(data);
    }
    clearMessage() {
        this.subject.next();
    }
    getData(): Observable<ShareData> {
        return this.subject.asObservable();
    }
    
    constructor( 
        private AFDatabase: AngularFireDatabase,
        private organizationService: OrganizationService
    ) { }  

    addDepartmentMember(user:User,department:Department){
        const departmentRef = this.AFDatabase.object(`department-members/${department.id}/${user.id}`);

        //save user department
        this.updateUserDepartments(user,department,false);        

        return departmentRef.update({ 
            email:user.email,
            name:user.name,
            photo:user.photo,
            head:false
        });
    }

    addDepartment(department:Department){
        const departmentReference = this.AFDatabase.list(`departments/${this.currentOrg().id}`);
        return departmentReference.push({
          name:department.name 
        });
    }

    updateDepartment(department:Department){
        const itemRef = this.AFDatabase.object(`departments/${this.currentOrg().id}/${department.id}`);
        return itemRef.update({ name: department.name });
    }

    getOrganizationDepartments(){
        return this.AFDatabase.list(`departments/${this.currentOrg().id}`).snapshotChanges();
    } 

    deleteDepartment(id:string){
        const itemsRef = this.AFDatabase.list(`departments/${this.currentOrg().id}`);
        // to get a key, check the Example app below
        return itemsRef.remove(id);
    }

    getDepartmentMembers(id:string){
        return this.AFDatabase.list(`department-members/${id}`).snapshotChanges();
    }

    monitorDepartment(id:string){
        return this.AFDatabase.list(`messages/${id}`).snapshotChanges();
    }

    removeAsMember(department:Department,user:User){
        const itemsRef = this.AFDatabase.list(`department-members/${department.id}`);

        //delete also user table
        const userRef = this.AFDatabase.object(`users/${this.currentOrg().id}/${user.id}/departments/${department.id}`);
        userRef.remove();

        return itemsRef.remove(user.id);
    }

    private currentOrg() : Organization{
        return this.organizationService.getCurrentOrganization();
    }

    updateMemberRole(department:Department,user:User,head:boolean){
        const itemRef = this.AFDatabase.object(`department-members/${department.id}/${user.id}`);
        
        //update user role
        //save user department
        this.updateUserDepartments(user,department,head);
        
        return itemRef.update({
            name:user.name,
            photo:user.photo,
            head:head
        });
    }

    getDeparmentInvites(departmentId:string){
        return this.AFDatabase.list(`invites/${departmentId}`).snapshotChanges();
    }

    private updateUserDepartments(user:User,department:Department,head:boolean){
        const userRef = this.AFDatabase.object(`users/${this.currentOrg().id}/${user.id}/departments/${department.id}`);
        userRef.update({
            name:department.name,
            head:head
        });
    }
}