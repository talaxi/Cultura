import { Component, OnInit } from '@angular/core';
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

  constructor(private lookupService: LookupService, private gameLoopService: GameLoopService, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      if (!this.globalService.globalVar.userIsRacing) {
        this.coinCount = this.lookupService.getCoins();
        this.medalCount = this.lookupService.getMedals();
      }
    });
  }

}
