import { Department } from './department.model';

export interface UserDeparment{
    head:boolean;
    department:Department
}

export interface UserInvite{
    type:string;
    departmentID:string
}