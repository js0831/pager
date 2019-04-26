import { User } from './../../user/user.model';

export class Invite{  

    public id:string;
    public user:User;
    public type:string;
    public date:Date = new Date();

    constructor(){
 
    }

    json(){
        return JSON.stringify(this);
    }
}
  