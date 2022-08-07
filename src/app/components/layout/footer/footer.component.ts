import { Component, OnInit } from '@angular/core';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

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
  displayingFunFact = false;
  lastDisplayedFunFact = false;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService,
    private componentCommunicationService: ComponentCommunicationService, private utilityService: UtilityService) { }

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

      if (this.totalTime >= this.maxTipTime && this.displayTip) {
        this.totalTime = 0;
        var rng = this.utilityService.getRandomInteger(1, 4);

        if (rng <= 3 || this.lastDisplayedFunFact) {
          this.displayingFunFact = false;
          this.lastDisplayedFunFact = false;
          this.randomTip = this.lookupService.getRandomTip();
        }
        else if (rng === 4) {
          this.displayingFunFact = true;
          this.lastDisplayedFunFact = true;
          this.randomTip = this.lookupService.getRandomFunFact();
        }
      }
    });
  }

  getNewTip() {
    this.totalTime = 0;
    var rng = this.utilityService.getRandomInteger(1, 4);

    if (rng <= 3 || this.lastDisplayedFunFact) {
      this.displayingFunFact = false;
      this.lastDisplayedFunFact = false;
      this.randomTip = this.lookupService.getRandomTip();
    }
    else if (rng === 4) {
      this.displayingFunFact = true;
      this.lastDisplayedFunFact = true;
      this.randomTip = this.lookupService.getRandomFunFact();
    }
  }

  openFAQs() {
    this.componentCommunicationService.setNewView(NavigationEnum.faqs);
  }
}
