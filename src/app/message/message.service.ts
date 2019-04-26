import { UtilsService } from './../services/utils.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Message } from './message.interface';
import { User } from './../user/user.model';
 
import { Injectable } from '@angular/core';




@Injectable()
export class MessageService{ 

    constructor( 
        private AFDatabase: AngularFireDatabase,
        private U: UtilsService
    ) {  
    }  

    sendMessage(message:Message){     
        message.departments.forEach(key => {    
            const departmentReference = this.AFDatabase.list(`messages/${key}`);
            departmentReference.push(this.formatJSONData(message));
        }); 
    }

    deleteMessage(departmentId:string,messageId:string){
        const userRef = this.AFDatabase.object(`messages/${departmentId}/${messageId}`);
        return userRef.remove();
    }

    updateMessage(departmentId:string,messageId:string){
        const msgRef = this.AFDatabase.object(`messages/${departmentId}/${messageId}/updated`); 
        return msgRef.update({ 
            date:this.U.getCurrentDate()
        });
    }

    private formatJSONData(message:Message){
        let data = {
            type:message.type,
            message:message.message,
            summary:message.summary,
            sender:{
                id:message.sender.id,
                name:message.sender.name,
                photo:message.sender.photo,
                email:message.sender.email
            }
        };

        if(message.type != "now"){
            data["time"] = message.time;
            data["from"] = message.from;
            data["to"] = message.to;   

            if(message.type == "every"){
                data["every"] = message.every;                
                if(message.every=="exotm")data["dayOfTheMonth"] = message.dayOfTheMonth;                
            }
        }

        return data;
    }

}