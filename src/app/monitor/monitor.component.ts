import { UtilsService } from './../services/utils.service';
import { MessageService } from './../message/message.service';
import { Subscription } from 'rxjs/Subscription';
import { User } from './../user/user.model';
import { Message } from './../message/message.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from './../department/department.service';
import { Component, OnInit, OnDestroy,ElementRef,ViewChild } from '@angular/core';


interface TextToSpeech{
  key:string;
  message:Message,
  time?:string
}

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit,OnDestroy {

  @ViewChild('audioOption') audioPlayerRef: ElementRef;

  textToSpeech:any;
  messagesTextToSpeech:TextToSpeech[]=[];
  scheduledMessagesTextToSpeech:TextToSpeech[]=[];  
  messageIndex=0;
  subscription: Subscription;
  departmentId:string;
  speechOnProgress = false;
  messageIdsToUpdate:string[] = [];

  scheduledMessageInterval:any;

  summary:string;
  sender:User;
  interval:any;

  now:any;

  constructor(
    private departmentService:DepartmentService,
    private route: ActivatedRoute,
    private messageService:MessageService,
    private router: Router,
    private U: UtilsService
  ) { }

  ngOnInit() {
    
    this.initTextToSpeech(); 

    this.departmentId = this.route.snapshot.params['departmentid'];
    this.watchMessages(); 
    

    this.scheduledMessageInterval = setInterval(()=>{
      this.isScheduledThisTime();
    },500);


    this.now = new Date();  
    this.interval = setInterval(()=>{
      this.now = new Date();      
    },1000);
  }//init 
  
  watchMessages(){
    this.subscription = this.departmentService.monitorDepartment(this.departmentId).subscribe((res)=>{      
      this.messagesTextToSpeech = [];
      this.scheduledMessagesTextToSpeech = [];
      this.messageIndex=0;

      res.map((res)=>{
        const payload = res.payload.toJSON();
        const type = payload["type"];

        const messageData = this.formatTextToSpeechData(res.key,payload);

        if(type=="now"){           
          this.messagesTextToSpeech.push(messageData);
        }else{ 
          console.log(this.isScheduledToday(payload));
          if(this.isScheduledToday(payload)){
            messageData.time = payload["time"]; 
            this.scheduledMessagesTextToSpeech.push(messageData);
          }

        }

      });//map
      if(this.messagesTextToSpeech.length>0)this.playPageSound();
    });//monitory
  }

  isScheduledThisTime(){
    if(this.speechOnProgress)return;

    if(this.scheduledMessagesTextToSpeech.length<1)return; 
    this.scheduledMessagesTextToSpeech.forEach(item => { 
      if(this.itsTime(item.time)){       
        this.messagesTextToSpeech.push(item);
      }
    });

    if(this.messagesTextToSpeech.length>0){ 
      this.playPageSound();
      this.speechOnProgress = true;
    }

  }

  isScheduledToday(payload:any){
    const now = new Date();
    const _from = new Date(payload["from"]).getTime();
    const _to = new Date(payload["to"]).getTime();
    const updated = payload["updated"] ? payload["updated"].date : "";
    const currentDate = this.U.getCurrentDate();
    const every = this.scheduledEvery(payload);
    const getTimeDateOnly = new Date(currentDate).getTime(); 
    return (getTimeDateOnly >= _from && getTimeDateOnly <= _to) && every && updated!=currentDate;
  }  

  scheduledEvery(payload:any){
    if(payload["type"]!="every")return true;
    const every = payload["every"];
    const now = new Date();

    if(every=="monday" && now.getDay()==1)return true;
    if(every=="tuesday" && now.getDay()==2)return true;
    if(every=="wednesday" && now.getDay()==3)return true;
    if(every=="thursday" && now.getDay()==4)return true;            
    if(every=="friday" && now.getDay()==5)return true;            
    if(every=="saturday" && now.getDay()==6)return true;            
    if(every=="sunday" && now.getDay()==7)return true;
    if(every=="everyday")return true;
    if(every=="weekdays" && now.getDay()<=5)return true;
    if(every=="weekdends" && now.getDay()>=6)return true;    
    if(every=="fdotm" && now.getDate()==1)return true;   

    var lastDayOfTheMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if(every=="ldotm" && now.getDate()==lastDayOfTheMonth)return true;    
    if(every=='exotm' && payload["dayOfTheMonth"]==now.getDate())return true;
    
    return false;
  }

  formatTextToSpeechData(key:string,payload:any):TextToSpeech{
    const sender = new User(payload["sender"].id,payload["sender"].name);
    sender.photo = payload["sender"].photo;
    sender.email = payload["sender"].email;

    const msg:Message = {
      message:payload["message"],
      type:payload["type"],
      summary:payload["summary"],
      sender:sender
    }

    if(msg.type!='now'){
      msg.from = payload["from"]
      msg.to = payload["to"]
      msg.time = payload["time"];

      if(msg.type=='every'){
        msg.every = payload["every"];
        if(msg.every=="exotm")msg.dayOfTheMonth = payload["dayOfTheMonth"];   
      }
    }

    return {
      key:key,
      message:msg
    }
  }


  playPageSound(){
    this.audioPlayerRef.nativeElement.play();
  }

  playMessages(){
    this.loopSpeakMessages(()=>{
      
      setTimeout(()=>{

        console.log('DONE');
        this.summary = "";
        this.sender = null;
  
        this.messagesTextToSpeech.forEach((item)=>{
          if(item.message.type=="now"){
            this.messageService.deleteMessage(this.departmentId,item.key);  
          }else{
            this.messageService.updateMessage(this.departmentId,item.key);                       
          }
        });
  
        this.messagesTextToSpeech = [];
        this.speechOnProgress = false;

      },2000);

    })
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
    clearInterval(this.scheduledMessageInterval);
    clearInterval(this.interval);
  }

  loopSpeakMessages(callback: () => void){
    console.log(this.messagesTextToSpeech.length);
    if(this.messagesTextToSpeech.length<1)return; 

    const currentMessageOnLoop = this.messagesTextToSpeech[this.messageIndex].message;
    
    this.summary = currentMessageOnLoop.summary;
    this.sender = currentMessageOnLoop.sender;
     

    this.speak(currentMessageOnLoop.message).then((time)=>{
      if(this.messageIndex+1 >= this.messagesTextToSpeech.length){
        callback();//loop done
        return;
      };
      this.messageIndex++;
      setTimeout(()=>{        
        this.loopSpeakMessages(callback);
      },2000);
    });

  }

  private initTextToSpeech(){
    this.textToSpeech = new SpeechSynthesisUtterance();
    this.textToSpeech.lang = 'en-US';
    const voicesInterval = setInterval(()=>{
      var voices = window.speechSynthesis.getVoices();
      var speaker = this.setSpeaker(voices,'Google US English');
      this.textToSpeech.voice = voices.length>0?speaker[0]:null;
      if(voices.length>0){
        clearInterval(voicesInterval);
      }
    },500);
  }

  private setSpeaker(voices:any[],voice){
    if(voices.length<1)return null;
    return voices.filter((item)=>{ 
      return item.name==voice;
    })
  }

  private speak(msg:string){
    const promise = new Promise<number>(
      (resolve,reject) => { 
        this.textToSpeech.text = msg;
        speechSynthesis.speak(this.textToSpeech);
        this.textToSpeech.onend = function(e) {
          resolve(e.elapsedTime)
        };
      }
    );
    return promise;
  }

  private itsTime(time:string){
    const now = new Date();
    const t1 = parseFloat(time.replace(":","."));
    //add 0 if < 10
    const min = now.getMinutes()<10?"0"+now.getMinutes():now.getMinutes();
    const currentTime = parseFloat(now.getHours()+"."+min); 
    return currentTime==t1;
  }

  back(){
    this.router.navigate(['/dashboard']);
  }
}
