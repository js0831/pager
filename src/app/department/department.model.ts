export class Department{  
    // constructor(public id:string, public name: string,public logo: string){}

    public id:string;
    public name: string;

    constructor(id:string,name: string){
        this.id = id;
        this.name = name;
    }

    json(){
        return JSON.stringify(this);
    }
}
