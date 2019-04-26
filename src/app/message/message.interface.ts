import { User } from './../user/user.model';
export interface Message{
    departments?:string[];
    from?:string;
    to?:string;
    time?:string;
    message:string;
    summary?:string;
    type:string;
    sender:User;
    every?:string;
    dayOfTheMonth?:number;
}