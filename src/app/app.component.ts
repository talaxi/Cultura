import { Component } from '@angular/core';
import { GlobalVariables } from './models/global/global-variables.model';
import { GameLoopService } from './services/game-loop/game-loop.service';
import { GlobalService } from './services/global-service.service';
import { plainToInstance } from 'class-transformer';
import { LookupService } from './services/lookup.service';
declare var LZString: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cultura';
  newGame = true;
  saveTime = 0;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService) {

  }

  ngOnInit() {
    var compressedGameData = localStorage.getItem("gameData");
    if (compressedGameData !== null && compressedGameData !== undefined) {
      this.newGame = false;
      var gameData = LZString.decompressFromBase64(compressedGameData);
      var loadDataJson = <GlobalVariables>JSON.parse(gameData);
      this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
    }

    //PURELY for testing, should be false when deployed
    var overrideNewGame = true;

    if (this.newGame || overrideNewGame)
      this.globalService.initializeGlobalVariables();

    this.gameLoopService.Update();

    var subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      this.gameCheckup(deltaTime); 
      this.saveTime += deltaTime;

      //TODO: This causes frame drops and cannot run frequently when drawing. 
      //set up a global variable to change this to 5 sec or 60 sec depending on if you are racing
      if (this.saveTime >= 60)
      {
        this.saveTime = 0;
        this.saveGame();
      }
    });
  }

  public gameCheckup(deltaTime: number): void {
    //update training time
    if (this.globalService.globalVar.animals === undefined || this.globalService.globalVar.animals === null) {
      return;
    }

    var allTrainingAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable &&
      item.currentTraining !== undefined && item.currentTraining !== null);

    if (allTrainingAnimals.length > 0) {
      allTrainingAnimals.forEach(animal => {
        if (animal.currentTraining !== null && animal.currentTraining !== undefined) {
          animal.currentTraining.timeTrained += deltaTime;

          while (animal.currentTraining.timeTrained >= animal.currentTraining.timeToComplete) {
            animal.increaseStatsFromCurrentTraining();
            this.globalService.calculateAnimalRacingStats(animal);
            var breedGaugeIncrease = this.lookupService.getTrainingBreedGaugeIncrease();            
            this.globalService.IncreaseAnimalBreedGauge(animal, breedGaugeIncrease); 
            
            animal.currentTraining.timeTrained -= animal.currentTraining.timeToComplete;
          }
        }
      });
    }
  }

  public saveGame() {
    var globalData = JSON.stringify(this.globalService.globalVar);
    var compressedData = LZString.compressToBase64(globalData);
    localStorage.setItem("gameData", compressedData);
  }
}
