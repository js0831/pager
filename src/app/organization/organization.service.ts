import { User } from './../user/user.model';

import { Organization } from './organization.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';

@Injectable()
export class OrganizationService{
    
    constructor( 
        private AFDatabase: AngularFireDatabase
    ) { }

    getOrganizationByID(id:string){   
        const promise = new Promise<Organization>(
            (resolve,reject) => { 
                this.AFDatabase.object("organization/"+id).snapshotChanges().subscribe(
                    (res)=>{

                    if(!res.key){
                        reject(true);   
                        return;
                    }

                    const y = res.payload.toJSON();
                    y['id'] = res.key;   
                    const owner = new User(y['owner']['id'],y['owner']['name']);
                    owner.photo = y['owner']['photo'];

                    const org = new Organization(res.key,y['name'],y['logo'],owner);                                            
                    resolve(org);     
                    }
                );      
            }
        );


        return promise;
    }

    getCurrentOrganization() : Organization{
        const ORG = JSON.parse(localStorage.getItem("ORG"));
        if(!ORG)return null;
        const owner = new User(ORG.owner.id,ORG.owner.name);
        owner.photo = owner.photo;
        return new Organization(ORG.id,ORG.name,ORG.logo,owner);
    }

    saveOnLocalStorage(org:Organization){
        localStorage.setItem("ORG",org.json());
    }
}