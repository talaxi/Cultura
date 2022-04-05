import { EventEmitter, Injectable } from '@angular/core';
import { GlobalService } from '../global-service.service';
import { LookupService } from '../lookup.service';
declare var LZString: any;

@Injectable({
  providedIn: 'root'
})
export class GameLoopService {
  private last_timestamp = Date.now();
  lastPerformanceNow: number;
  deltaTime: number;
  gameUpdateEvent = new EventEmitter<number>();

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  public Update(): void {
    const deltaTime = (Date.now() - this.last_timestamp) / 1000;
    this.deltaTime = deltaTime;

    var performanceNow = performance.now();

    //if (performanceNow - this.lastPerformanceNow > 20)
      //console.log(`Call to doSomething took ${performanceNow - this.lastPerformanceNow} milliseconds.`);

    this.gameUpdateEvent.emit(deltaTime);
    this.last_timestamp = Date.now();
    this.lastPerformanceNow = performanceNow;
    //maybe switch this to setInterval if not working when tab isn't focused? setInterval should work fine
    window.requestAnimationFrame(() => this.Update());
    /*setInterval(() => {
      this.Update()
      }, 1000/60);*/    
  } 
}
