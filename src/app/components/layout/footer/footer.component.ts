import { Component, OnInit } from '@angular/core';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  randomTip: string;
  displayTip: boolean;
  version: string;
  totalTime: number;
  maxTipTime: number;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService) { }

  ngOnInit(): void {
    if (this.globalService.globalVar.settings.get("hideTips")) {
      this.displayTip = false;
    }
    else
      this.displayTip = true;

    this.version = this.globalService.globalVar.currentVersion.toFixed(2);
    this.randomTip = this.lookupService.getRandomTip();
    this.totalTime = 0;
    this.maxTipTime = 60;

    this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      if (this.globalService.globalVar.settings.get("hideTips")) {
        this.displayTip = false;
      }
      else
        this.displayTip = true;
              
      this.totalTime += deltaTime;

      if (this.totalTime >= this.maxTipTime)
      {
        this.totalTime = 0;
        this.randomTip = this.lookupService.getRandomTip();
      }
    });
  }

}
