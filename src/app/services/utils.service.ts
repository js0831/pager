 import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService{ 

    constructor( 
        
    ) { } 

    getCurrentDate(){   
        const now = new Date();
        const year = now.getFullYear();
        const tempMonth = (now.getMonth()+1);
        const tempDay = now.getDate();

        const month = tempMonth<10?("0"+tempMonth):tempMonth;
        const day = tempDay<10?("0"+tempDay):tempDay;
 
        return year+"-"+month+"-"+day;
    }  

    
}