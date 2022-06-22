import { Component, OnInit } from '@angular/core';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  coinCount: number;
  medalCount: number;
  version: string;

  constructor(private lookupService: LookupService, private gameLoopService: GameLoopService, private globalService: GlobalService,
    private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.version = this.globalService.globalVar.currentVersion.toFixed(2);
    
    this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      if (!this.globalService.globalVar.userIsRacing) {
        this.coinCount = this.lookupService.getCoins();
        this.medalCount = this.lookupService.getMedals();
      }
    });
  }

  changeView(newView: NavigationEnum) {    
    this.componentCommunicationService.setNewView(newView);
  }
}
