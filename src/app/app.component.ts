import { Component } from '@angular/core';
import { GlobalVariables } from './models/global/global-variables.model';
import { GameLoopService } from './services/game-loop/game-loop.service';
import { GlobalService } from './services/global-service.service';
import { plainToInstance } from 'class-transformer';
import { LookupService } from './services/lookup.service';
import { AnimalStats } from './models/animals/animal-stats.model';
import { BarnSpecializationEnum } from './models/barn-specialization-enum.model';
import { SpecializationService } from './services/specialization.service';
import { ThemeService } from './theme/theme.service';
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

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService,
    private specializationService: SpecializationService, private themeService: ThemeService) {

  }

  ngOnInit() {
    var compressedGameData = localStorage.getItem("gameData");
    if (compressedGameData !== null && compressedGameData !== undefined) {
      this.newGame = false;
      var gameData = LZString.decompressFromBase64(compressedGameData);
      var loadDataJson = <GlobalVariables>JSON.parse(gameData);
      this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
      this.loadStartup();
    }

    //PURELY for testing, should be false when deployed
    //TODO: set this up so that it won't overwrite a user's save if you forget to turn this off
    var overrideNewGame = false;
    var devMode = false;

    if (this.newGame || overrideNewGame)
      this.globalService.initializeGlobalVariables();

    if (devMode) {
      this.globalService.globalVar.tutorialCompleted = true;
      this.globalService.devModeInitialize(29);
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
          this.specializationService.handleAttractionRevenue(deltaTime);

          while (animal.currentTraining !== null && animal.currentTraining.timeTrained >= animal.currentTraining.timeToComplete) {            
            var associatedBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === animal.associatedBarnNumber);
            var breedingGroundsSpecializationLevel = 0;

            if (associatedBarn !== undefined && associatedBarn !== null && associatedBarn.barnUpgrades.specialization === BarnSpecializationEnum.BreedingGrounds)
              breedingGroundsSpecializationLevel = associatedBarn.barnUpgrades.specializationLevel;

            //split stat gain for Research Center
            if (associatedBarn !== undefined && associatedBarn !== null && associatedBarn.barnUpgrades.specialization === BarnSpecializationEnum.ResearchCenter) {
              this.specializationService.handleResearchCenterStatIncrease(animal, associatedBarn);
            }
            else
              animal.increaseStatsFromCurrentTraining();
            this.globalService.calculateAnimalRacingStats(animal);
            var breedGaugeIncrease = this.lookupService.getTrainingBreedGaugeIncrease(breedingGroundsSpecializationLevel);
            this.globalService.IncreaseAnimalBreedGauge(animal, breedGaugeIncrease);
            
            animal.currentTraining.timeTrained -= animal.currentTraining.timeToComplete;
            animal.currentTraining.trainingTimeRemaining -= animal.currentTraining.timeToComplete;

            if (animal.currentTraining.trainingTimeRemaining <= 0)                                   
              animal.currentTraining = null;            

            if (animal.queuedTraining !== undefined && animal.queuedTraining !== null) {              
              if (animal.currentTraining !== null && animal.currentTraining.trainingTimeRemaining > 0)
                animal.queuedTraining.timeTrained += animal.currentTraining?.timeTrained;
                
              animal.currentTraining = animal.queuedTraining;
              animal.queuedTraining = null;
            }
          }
        }        
      });
    }

    var incubator = this.globalService.globalVar.incubator;
    if (incubator !== undefined && incubator !== null &&
      incubator.assignedAnimal !== undefined && incubator.assignedAnimal !== null &&
      incubator.assignedTrait !== undefined && incubator.assignedTrait !== null) {
      incubator.timeTrained += deltaTime;

      if (incubator.timeTrained >= incubator.timeToComplete) {
        incubator.assignedAnimal.trait = incubator.assignedTrait;
        this.globalService.calculateAnimalRacingStats(incubator.assignedAnimal);
        incubator.assignedAnimal.canTrain = true;

        incubator.timeTrained = 0;
        incubator.assignedAnimal = null;
        incubator.assignedTrait = null;        
      }
    }
  }

  public saveGame() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        console.log('Data Saved');
        localStorage.setItem("gameData", data);
        worker.terminate();
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

  loadStartup() {
    var selectedTheme = this.globalService.globalVar.settings.get("theme");
    if (selectedTheme !== null && selectedTheme !== undefined)
      this.themeService.setActiveTheme(selectedTheme);
  }
}