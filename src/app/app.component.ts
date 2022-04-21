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
  saveFrequency = 20; //in seconds
  racingSaveFrequency = 120; // in seconds

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
    var devMode = true;

    if (this.newGame || overrideNewGame)
      this.globalService.initializeGlobalVariables();

    if (devMode) {
      this.globalService.globalVar.tutorialCompleted = true;
      this.globalService.devModeInitialize(10);
    }

    this.gameLoopService.Update();

    var subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      this.gameCheckup(deltaTime);
      this.saveTime += deltaTime;

      var frequency = this.saveFrequency;

      if (this.globalService.globalVar.userIsRacing)
        frequency = this.racingSaveFrequency;

      if (this.saveTime >= frequency) {
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
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        console.log('Data Saved');
        localStorage.setItem("gameData", data);
      };
      worker.postMessage(this.globalService.globalVar);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      const data = this.globalService.globalVar;
      var globalData = JSON.stringify(data);
      var compressedData = LZString.compressToBase64(globalData);
      localStorage.setItem("gameData", compressedData);      
    }
  }
}