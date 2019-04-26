import {
    CanActivate,
    CanActivateChild,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
    Router
} from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Injectable } from "@angular/core";
import { FirebaseAuthService } from "./firebase-auth.service"


@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {


    constructor(private firebaseAuthService: FirebaseAuthService, private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable < boolean > | Promise < boolean > | boolean {

        const authenticated = this.firebaseAuthService.isAuthenticated();
        if(!authenticated){
            this.router.navigate(['/login']);
        }else{
            return true;
        }  
    }

    canActivateChild(route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable < boolean > | Promise < boolean > | boolean {

        return this.canActivate(route, state);
    }
}