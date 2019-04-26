import { Department } from './../department/department.model';
export class User{  
    // constructor(public id:string, public name: string,public logo: string){}

    public id:string;
    public name: string;
    public email:string="";    
    public photo: string="";    
    public departments:Department[];

    constructor(id:string,name: string){
        this.id = id;
        this.name = name;

        this.departments = [];
    }

    json(){
        return JSON.stringify(this);
    }
}
  