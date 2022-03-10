import { EventEmitter, Injectable } from '@angular/core';
import { GlobalService } from '../global-service.service';
import { LookupService } from '../lookup.service';
declare var LZString: any;

@Injectable({
  providedIn: 'root'
})
export class GameLoopService {
  private last_timestamp = Date.now();
  deltaTime: number;
  saveTime = 0;
  gameUpdateEvent = new EventEmitter<number>();

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  public Update(): void {
    const deltaTime = (Date.now() - this.last_timestamp) / 1000;
    this.deltaTime = deltaTime;
    this.gameCheckup(deltaTime);
    this.gameUpdateEvent.emit(deltaTime);
    this.last_timestamp = Date.now();
    //maybe switch this to setInterval if not working when tab isn't focused? setInterval should work fine
    window.requestAnimationFrame(() => this.Update());
    /*setInterval(() => {
      this.Update()
      }, 1000/60);*/

    this.saveTime += deltaTime;

    if (this.saveTime >= 5)
    {
      this.saveTime = 0;
      this.saveGame();
    }
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
