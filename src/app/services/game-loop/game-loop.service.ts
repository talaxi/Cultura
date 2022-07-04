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
  totalTime = 0;
  gameUpdateEvent = new EventEmitter<number>();

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  public Update(): void {
    //console.log("Last timestamp: " + this.globalService.globalVar.lastTimeStamp);
    var dateNow = Date.now();    
    const deltaTime = (dateNow - this.globalService.globalVar.lastTimeStamp) / 1000;
    //console.log(deltaTime);
    //alert(deltaTime);
    this.deltaTime = deltaTime;
    this.totalTime += deltaTime;

    var performanceNow = performance.now();

    if (performanceNow - this.lastPerformanceNow > 70)
      console.log(`Call to doSomething took ${performanceNow - this.lastPerformanceNow} milliseconds at ${this.totalTime}.`);

    this.globalService.globalVar.lastTimeStamp = dateNow;
    this.gameUpdateEvent.emit(deltaTime);
    //console.log("Last timestamp updated: " + this.globalService.globalVar.lastTimeStamp);
    this.lastPerformanceNow = performanceNow;
    
    window.requestAnimationFrame(() => this.Update());    
  } 
}
