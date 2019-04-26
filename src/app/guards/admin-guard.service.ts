import { UserService } from './../user/user.service';
import { OrganizationService } from './../organization/organization.service';
import {
    CanActivate,
    CanActivateChild,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
    Router
} from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Injectable } from "@angular/core";
 


@Injectable()
export class AdminGuard implements CanActivate, CanActivateChild {


    constructor(
        private router: Router,
        private organizationService:OrganizationService,
        private userService:UserService
    ) {

    }

    canActivate(route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable < boolean > | Promise < boolean > | boolean {
        const authorized = this.userService.getCurrentUser().id == this.organizationService.getCurrentOrganization().owner.id;
        if(!authorized){
            this.router.navigate(['/forbidden']);
        }else{
            return true;
        }  
    }

    canActivateChild(route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable < boolean > | Promise < boolean > | boolean {

        return this.canActivate(route, state);
    }
}