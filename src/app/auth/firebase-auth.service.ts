//import { AngularFireAuth } from 'angularfire2/auth'
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { Injectable } from '@angular/core';


@Injectable()
export class FirebaseAuthService {
    token: string;
 
    constructor(
        private FBA:AngularFireAuth
    ){}

    register(email: string, password: string) { 
        return this.FBA.auth.createUserWithEmailAndPassword(email, password);
    }

    googleLogin(callback: (any) => void){
        this.FBA.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(
            (response) => {
                
                this.FBA.auth.currentUser.getIdToken()
                .then(
                    (token:string)=>{

                        this.token = token;
                        localStorage.setItem("DATA", JSON.stringify(response.user));                        
 
                        callback({
                            result: "success",
                            response: response.user,
                            token: token,
                            isNewUser:response.additionalUserInfo.isNewUser
                        });

                    }
                );

            }
        ).catch(
            (err)=>{
                err => {
                    callback({
                        result: "failed",
                        response: err
                    })
                }
            }
        )      
    }


    login(email: string, password: string, callback: (any) => void) {
        this.FBA.auth.signInWithEmailAndPassword(email, password)
            .then(
                (response) => { 
                    this.FBA.auth.currentUser.getIdToken()
                    .then(
                        (token:string)=>{
                            this.token = token;
                            localStorage.setItem("DATA", JSON.stringify(response));
                            callback({
                                result: "success",
                                response: response,
                                token: token
                            }); 
                        }
                    ); 
                }
            ).catch(
                err => { 
                    callback({
                        result: "failed",
                        response: err
                    })
                }
            )
    }

    getToken() {
        try {                        
            this.FBA.auth.currentUser.getIdToken().then(
                (token: string) => {
                    this.token = token;
                }
            );
        } catch (error) {
            console.log(error);
        }
        return this.token || this.tokenOnLocalStorage();
    }

    isAuthenticated() {
        var userLocalData = this.userData();
        return userLocalData != null;
    }

    logout(callback:()=>void) {
        localStorage.clear();
        this.FBA.auth.signOut();
        this.token = null;
        callback();
    }

    checkIfEmailExist(email:string){
        const promise = new Promise<boolean>(
            (resolve,reject) => { 
                this.FBA.auth.fetchProvidersForEmail(email)
                .then(
                    (res)=>{
                      resolve(res.length>0);
                    }
                )
                .catch(
                    (res)=>{
                        resolve(false);
                    }
                )
            }
        );
        return promise;
    }

    private userData() {
        return JSON.parse(localStorage.getItem("DATA"));
    }
    private tokenOnLocalStorage() {
        return this.userData() ? this.userData().stsTokenManager.accessToken : null;
    } 
}