import { Component } from '@angular/core';
import { GlobalVariables } from './models/global/global-variables.model';
import { GameLoopService } from './services/game-loop/game-loop.service';
import { GlobalService } from './services/global-service.service';
import { plainToInstance } from 'class-transformer';
declare var LZString: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cultura';
  newGame = true;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService) {

  }

  ngOnInit() {
    var compressedGameData = localStorage.getItem("gameData");
    if (compressedGameData !== null && compressedGameData !== undefined) {
      this.newGame = false;
      var gameData = LZString.decompressFromBase64(compressedGameData);
      var loadDataJson = <GlobalVariables>JSON.parse(gameData);
      this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
    }

    if (this.newGame)
      this.globalService.initializeGlobalVariables();
      
    this.gameLoopService.Update();
  }
}
