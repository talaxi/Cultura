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
import { RaceLogicService } from './services/race-logic/race-logic.service';
import { DeploymentService } from './services/utility/deployment.service';
import { environment } from 'src/environments/environment';
import { VersionControlService } from './services/version-control.service';
import { ResourceValue } from './models/resources/resource-value.model';
import { ShopItemTypeEnum } from './models/shop-item-type-enum.model';
import { GrandPrixData } from './models/races/event-race-data.model';
import { RaceCourseTypeEnum } from './models/race-course-type-enum.model';
import { UtilityService } from './services/utility/utility.service';
import { Animal } from './models/animals/animal.model';
import { GrandPrixLogicService } from './services/race-logic/grand-prix-logic.service';
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
  racingSaveFrequency = 60; // in seconds

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService,
    private specializationService: SpecializationService, private themeService: ThemeService, private raceLogicService: RaceLogicService,
    private deploymentService: DeploymentService, private versionControlService: VersionControlService, private utilityService: UtilityService,
    private grandPrixLogicService: GrandPrixLogicService) {
  }

  ngOnInit() {
    var compressedGameData = localStorage.getItem("culturaIdleGameData");

    if (compressedGameData === null || compressedGameData === undefined || compressedGameData.length === 0) {
      compressedGameData = localStorage.getItem("gameData");
    }

    if (compressedGameData !== null && compressedGameData !== undefined) {
      var gameData = LZString.decompressFromBase64(compressedGameData);
      var loadDataJson = <GlobalVariables>JSON.parse(gameData);
      if (loadDataJson !== null && loadDataJson !== undefined) {
        this.newGame = false;
        this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
        this.loadStartup();
      }
    }

    if (environment.devEnvironment)
      this.deploymentService.setDevMode();
    else
      this.deploymentService.setProductionMode();

    var overrideNewGame = this.deploymentService.forceStartNewGame;
    var devMode = this.deploymentService.devModeActive;

    if (this.newGame || overrideNewGame)
      this.globalService.initializeGlobalVariables();

    if (devMode) {
      this.globalService.globalVar.tutorials.tutorialCompleted = true;
      this.globalService.devModeInitialize(80, 4);
    }

    this.versionControlService.updatePlayerVersion();

    var lastPerformanceNow = 0;
    var subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      //if (deltaTime > 1)
      //  console.log("GameCheckup: " + deltaTime);
      this.gameCheckup(deltaTime);
      this.saveTime += deltaTime;

      var frequency = this.saveFrequency;

      if (this.globalService.globalVar.userIsRacing)
        frequency = this.racingSaveFrequency;

      if (this.saveTime >= frequency) {
        this.saveTime = 0;
        this.saveGame();
      }

      var performanceNow = performance.now();

      //if (performanceNow - lastPerformanceNow > 70)
      //  console.log(`Call to Checkup took ${performanceNow - lastPerformanceNow} milliseconds.`);

      lastPerformanceNow = performanceNow;
    });

    this.gameLoopService.Update();
  }

  public gameCheckup(deltaTime: number): void {
    //update training time
    if (this.globalService.globalVar.animals === undefined || this.globalService.globalVar.animals === null) {
      return;
    }

    this.globalService.globalVar.animals.filter(item => item.isAvailable).forEach(animal => {
      animal.canTrain = this.lookupService.canAnimalTrain(animal);
    });

    var allTrainingAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable &&
      item.currentTraining !== undefined && item.currentTraining !== null && item.canTrain);

    if (allTrainingAnimals.length > 0) {
      allTrainingAnimals.forEach(animal => {
        if (animal.currentTraining !== null && animal.currentTraining !== undefined && animal.canTrain) {
          animal.currentTraining.timeTrained += deltaTime;
          this.specializationService.handleAttractionRevenue(deltaTime, animal);
          this.specializationService.handleTrainingFacilityImprovementsIncreases(deltaTime, animal);

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
            var breedGaugeIncrease = this.lookupService.getTrainingBreedGaugeIncrease(breedingGroundsSpecializationLevel, animal);
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

    this.handleScrimmageTimer(deltaTime);
    this.handleFreeRaceTimer(deltaTime);
    this.grandPrixLogicService.handleGrandPrix(deltaTime);
  }

  handleScrimmageTimer(deltaTime: number) {
    this.globalService.globalVar.animals.forEach(animal => {
      if (animal.scrimmageEnergyTimer > 0)
        animal.scrimmageEnergyTimer -= deltaTime;
    });
  }
  
  handleFreeRaceTimer(deltaTime: number) {
    this.globalService.globalVar.freeRaceTimePeriodCounter += deltaTime;

    //delay if user is racing to prevent lag
    //TODO: ignore this delay if you're at cap time and still in this situation?
    if (!this.globalService.globalVar.userIsRacing) {
      var freeRaceTimePeriod = 5 * 60;
      var freeRaceTimePeriodPair = this.globalService.globalVar.modifiers.find(item => item.text === "freeRacesTimePeriodModifier");
      if (freeRaceTimePeriodPair !== undefined)
        freeRaceTimePeriod = freeRaceTimePeriodPair.value;

      var autofreeRaceMaxIdleTimePeriod = 1 * 60 * 60;
      var autofreeRaceMaxIdleTimePeriodPair = this.globalService.globalVar.modifiers.find(item => item.text === "autoFreeRacesMaxIdleTimePeriodModifier");
      if (autofreeRaceMaxIdleTimePeriodPair !== undefined)
        autofreeRaceMaxIdleTimePeriod = autofreeRaceMaxIdleTimePeriodPair.value;

      while (this.globalService.globalVar.freeRaceTimePeriodCounter >= freeRaceTimePeriod &&
        autofreeRaceMaxIdleTimePeriod > 0) {
        //console.log("Free Race Time Period Counter: " + this.globalService.globalVar.freeRaceTimePeriodCounter);
        if (this.globalService.globalVar.freeRaceTimePeriodCounter > autofreeRaceMaxIdleTimePeriod)
          this.globalService.globalVar.freeRaceTimePeriodCounter = autofreeRaceMaxIdleTimePeriod;

        this.globalService.globalVar.freeRaceTimePeriodCounter -= freeRaceTimePeriod;
        autofreeRaceMaxIdleTimePeriod -= freeRaceTimePeriod;
        this.globalService.globalVar.freeRaceCounter = 0;
        this.globalService.globalVar.autoFreeRaceCounter = 0;

        this.handleAutoFreeRace(deltaTime);
      }
    }
  }

  handleAutoFreeRace(deltaTime: number) {
    var teamManager = this.lookupService.getResourceByName("Team Manager");
    if (teamManager === undefined || teamManager === null)
      teamManager = 0;

    if (teamManager === 0 || !this.globalService.globalVar.animalDecks.some(item => item.autoRunFreeRace)) {
      return;
    }

    var autoRunDeck = this.globalService.globalVar.animalDecks.find(item => item.autoRunFreeRace);
    if (autoRunDeck === undefined || autoRunDeck === null) {
      return;
    }

    var remainingFreeRuns = teamManager - this.globalService.globalVar.autoFreeRaceCounter;

    var freeRacePerTimePeriod = this.lookupService.getTotalFreeRacesPerPeriod();

    for (var i = 0; i < remainingFreeRuns; i++) {
      if (this.globalService.globalVar.freeRaceCounter >= freeRacePerTimePeriod) {
        return;
      }
      this.globalService.globalVar.autoFreeRaceCounter += 1;
      this.globalService.globalVar.freeRaceCounter += 1;

      var freeRace = this.globalService.generateFreeRace();

      var canRun = true;
      freeRace.raceLegs.forEach(leg => {
        if (!autoRunDeck?.selectedAnimals.some(animal => animal.raceCourseType === leg.courseType))
          canRun = false;
      });

      if (!canRun) {
        continue;
      }

      var raceResult = this.raceLogicService.runRace(freeRace, true);
    }
  }

  /*public grandPrixWorker(deltaTime: number) {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        //localStorage.setItem("culturaIdleGameData", data);
        worker.terminate();
      };
            
      this.grandPrixLogicService.deltaTime = deltaTime;
      var message = { type: "Grand Prix" , data: null};
      worker.postMessage(message);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      this.grandPrixLogicService.handleGrandPrix(deltaTime);
    }
  }*/

  public saveGame() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        localStorage.setItem("culturaIdleGameData", data);
        worker.terminate();
      };
      worker.postMessage(this.globalService.globalVar);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      const data = this.globalService.globalVar;
      var globalData = JSON.stringify(data);
      var compressedData = LZString.compressToBase64(globalData);
      localStorage.setItem("culturaIdleGameData", compressedData);
    }
  }

  loadStartup() {
    var selectedTheme = this.globalService.globalVar.settings.get("theme");
    if (selectedTheme !== null && selectedTheme !== undefined)
      this.themeService.setActiveTheme(selectedTheme);
  }
}