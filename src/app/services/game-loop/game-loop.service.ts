import { EventEmitter, Injectable } from '@angular/core';
import { GlobalService } from '../global-service.service';
import { LookupService } from '../lookup.service';
declare var LZString: any;

@Injectable({
  providedIn: 'root'
})
export class GameLoopService {
  lastPerformanceNow: number;
  deltaTime: number;
  gameUpdateEvent = new EventEmitter<number>();

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  public Update(): void {
    var dateNow = Date.now();    
    const deltaTime = (dateNow - this.globalService.globalVar.lastTimeStamp) / 1000;
    //console.log(deltaTime);
    //alert(deltaTime);
    this.deltaTime = deltaTime;

    var performanceNow = performance.now();

    //if (performanceNow - this.lastPerformanceNow > 20)
      //console.log(`Call to doSomething took ${performanceNow - this.lastPerformanceNow} milliseconds.`);

    this.gameUpdateEvent.emit(deltaTime);
    this.globalService.globalVar.lastTimeStamp = dateNow;
    this.lastPerformanceNow = performanceNow;
    //maybe switch this to setInterval if not working when tab isn't focused? setInterval should work fine
    window.requestAnimationFrame(() => this.Update());
    /*setInterval(() => {
      this.Update()
      }, 1000/60);*/    
  } 
}
