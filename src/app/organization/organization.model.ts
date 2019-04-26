import { User } from './../user/user.model';
export class Organization{  
    // constructor(public id:string, public name: string,public logo: string){}

    public id: string;
    public name: string;
    public logo: string;   
    public owner: User; 

    constructor(id:string,name: string, logo: string,owner:User){
        this.id = id;
        this.name = name;
        this.logo = logo;
        this.owner = owner;
    }

    json(){
        return JSON.stringify(this);
    }
}
  