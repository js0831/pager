import { Department } from './../department/department.model';
import { Invite } from './../department/deparment-invites/invite.model';

import { User } from './user.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';

@Injectable()
export class UserService{ 

    constructor( 
        private AFDatabase: AngularFireDatabase
    ) { } 

    addNewUser(user:User,userId:string,orgId:string){   
        const newUser = {
            email:user.email,
            name:user.name,
            photo:user.photo
        }
        return this.AFDatabase
        .object('/users/'+orgId+'/'+userId)
        .update(newUser); 
    }  

    getUserBy(orgId:string,userId:string) : Promise<User>{
        const promise = new Promise<User>(
            (resolve,reject) => { 
                this.AFDatabase.object(`users/${orgId}/${userId}`).snapshotChanges().subscribe(
                    (res)=>{                        
                        if(!res.key){
                            reject(true);   
                            return;
                        }
                        const y = res.payload.toJSON();
                        const user = new User(res.key,y["name"]);
                        user.photo = y["photo"];
                        user.email = y["email"]; 
 
                        if(y["departments"]){
                            const departmentKeys = Object.keys(y["departments"]);
                            
                            departmentKeys.forEach(key => {
                                const dept = new Department(key,y["departments"][key].name);
                                user.departments.push(dept);
                            });
                        } 
                        
                        resolve(user);
                    }
                );
            }
        );
        return promise;
    }

    getUserDepartments(userId:string,orgId:string){
        return this.AFDatabase.list(`users/${orgId}/${userId}/departments`).snapshotChanges()
    }
    
    getUserInvites(userId:string,orgId:string){
        return this.AFDatabase.list(`users/${orgId}/${userId}/invites`).snapshotChanges()
    }

    saveOnLocalStorage(user:User){
        localStorage.setItem("USER",user.json());
    }

    getCurrentUser() : User{
        const USER = JSON.parse(localStorage.getItem("USER"));
        const user = new User(USER.id,USER.name);
        user.email = USER.email;
        user.photo = USER.photo;
        user.departments = USER.departments;
        return USER?user:null;
    }

    invite(orgId:string,departmentId:string,email:string,type:string){         
        const promise = new Promise<boolean>(
             (resolve,reject)=>{
                const subs = this.getUserByEmail(email,orgId).subscribe(
                    (res)=>{
                        if(res.length<1){
                            resolve(false);
                            return;
                        }

                        const payload = res[0].payload.toJSON();
                        const user = new User(res[0].key,payload["name"]);
                        user.email = payload["email"];
                        user.photo = payload["photo"];                        

                        
                        const invite = new Invite();
                        invite.id = user.id;
                        invite.user = user;
                        invite.type = type;
                        
                        this.saveUserInvite(orgId,departmentId,invite)
                        .then(
                            ()=>{
                                subs.unsubscribe();
                                resolve(true);
                            }
                        )
                        .catch(
                            ()=>{
                                subs.unsubscribe();
                                resolve(false);
                            }
                        )
                        
                    }
                )
             }
        )        
        return promise;
    }

    cancelUserInvitation(orgId:string,departmentId:string,userId:string){
        const itemsRef = this.AFDatabase.object(`invites/${departmentId}/${userId}`);


        //delete also on user table
        const userRef = this.AFDatabase.object(`users/${orgId}/${userId}/invites/${departmentId}`);
        userRef.remove();

        return itemsRef.remove();
    }

    isAdminUser(orgId:string){
        return this.getCurrentUser().id == orgId;
    }

    private saveUserInvite(orgId:string,departmentId:string,invite:Invite){
        const newUser = {
            email:invite.user.email,
            name:invite.user.name,
            photo:invite.user.photo,
            type:invite.type,
            date:invite.date
        } 
        
        this.saveInvitesOnUserTable(orgId,invite.user.id,departmentId,invite.type);

        return this.AFDatabase
        .object(`/invites/${departmentId}/${invite.id}`)
        .update(newUser);
    }

    private saveInvitesOnUserTable(orgId,userId,departmentId,type){
        const userRef = this.AFDatabase.object(`users/${orgId}/${userId}/invites/${departmentId}`);
        userRef.update({
            type:type
        });
    }

    private getUserByEmail(email:string,orgId:string){
            return this.AFDatabase.list(`users/${orgId}`, ref => ref.orderByChild('email')
                .equalTo(email))
                .snapshotChanges();            
    }
}