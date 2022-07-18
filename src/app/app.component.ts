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
    private specializationService: SpecializationService, private themeService: ThemeService, private raceLogicService: RaceLogicService,
    private deploymentService: DeploymentService, private versionControlService: VersionControlService) {
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
      this.globalService.devModeInitialize(55);
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
      item.currentTraining !== undefined && item.currentTraining !== null);

    if (allTrainingAnimals.length > 0) {
      allTrainingAnimals.forEach(animal => {
        if (animal.currentTraining !== null && animal.currentTraining !== undefined && animal.canTrain) {
          animal.currentTraining.timeTrained += deltaTime;
          this.specializationService.handleAttractionRevenue(deltaTime, animal);

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

    this.handleFreeRaceTimer(deltaTime);
    this.handleGrandPrix(deltaTime);
  }

  handleGrandPrix(deltaTime: number) {
    if (this.globalService.getTimeToEventRace() > 0 && this.globalService.globalVar.eventRaceData.bonusTime === 0) {
      if (this.globalService.globalVar.eventRaceData.initialSetupComplete) {
        //reset race
        this.globalService.globalVar.eventRaceData = new GrandPrixData();
      }

      this.globalService.globalVar.eventRaceData.initialSetupComplete = false;
      return;
    }

    if (!this.globalService.globalVar.eventRaceData.initialSetupComplete) //wasn't within event and now you are
    {
      //do initial set up
      this.globalService.initialGrandPrixSetup();
      this.globalService.globalVar.eventRaceData.initialSetupComplete = true;
    }

    if (this.globalService.globalVar.eventRaceData.isRunning) {
      var eventDeck = this.globalService.globalVar.animalDecks.find(item => item.isEventDeck);
      if (eventDeck === null || eventDeck === undefined)
        return;

      this.globalService.globalVar.eventRaceData.segmentTimeCounter += deltaTime;
      this.globalService.globalVar.eventRaceData.overallTimeCounter += deltaTime;
      if (this.globalService.getTimeToEventRace() > 0 && this.globalService.globalVar.eventRaceData.bonusTime > 0) {
        this.globalService.globalVar.eventRaceData.bonusTime -= deltaTime;

        if (this.globalService.globalVar.eventRaceData.bonusTime <= 0)
          this.globalService.globalVar.eventRaceData.bonusTime = 0;
      }

      var timeToComplete = this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed / 60; //framemodifier =

      //console.log(this.globalService.globalVar.eventRaceData.segmentTimeCounter);
      if (this.globalService.globalVar.eventRaceData.segmentTimeCounter >= timeToComplete) {
        this.globalService.globalVar.eventRaceData.previousRaceSegment = this.globalService.globalVar.eventRaceData.currentRaceSegment.makeCopy(this.globalService.globalVar.eventRaceData.currentRaceSegment);
        this.globalService.globalVar.eventRaceData.previousRaceSegment.reduceExportSize();

        this.checkForEventRelayAnimal();
        var racingAnimal = this.globalService.getGrandPrixRacingAnimal();
        this.globalService.globalVar.eventRaceData.currentRaceSegment = this.globalService.globalVar.eventRaceData.nextRaceSegment.makeCopy(this.globalService.globalVar.eventRaceData.nextRaceSegment);
        this.globalService.globalVar.eventRaceData.currentRaceSegmentResult = this.raceLogicService.runRace(this.globalService.globalVar.eventRaceData.currentRaceSegment);
        this.globalService.globalVar.eventRaceData.currentRaceSegmentCount += 1;
        this.globalService.globalVar.eventRaceData.segmentTimeCounter -= timeToComplete;
        this.globalService.globalVar.eventRaceData.distanceCovered += this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.distanceCovered;


        this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(racingAnimal);
      }

      this.checkForGrandPrixRewards();
    }

    this.updateExhaustionAndMorale(deltaTime);
    this.updateWeatherCluster(deltaTime);
  }

  updateExhaustionAndMorale(deltaTime: number) {
    this.globalService.globalVar.eventRaceData.exhaustionMoraleUpdateCounter += deltaTime;

    var timerCap = 5 * 60;
    var timerCapPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionGainTimerCapGrandPrixModifier");
    if (timerCapPair !== null && timerCapPair !== undefined)
      timerCap = timerCapPair.value;

    var exhaustionGain = .02;
    var exhaustionGainPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionGainGrandPrixModifier");
    if (exhaustionGainPair !== null && exhaustionGainPair !== undefined)
      exhaustionGain = exhaustionGainPair.value;

    if (this.globalService.globalVar.eventRaceData.exhaustionMoraleUpdateCounter > timerCap) {
      this.globalService.globalVar.eventRaceData.animalData.forEach(item => {
        item.exhaustionStatReduction += exhaustionGain;
        if (item.exhaustionStatReduction >= 1)
          item.exhaustionStatReduction = 1;

        if (item.morale < 1)
          item.morale += exhaustionGain;
      });

      this.globalService.globalVar.eventRaceData.exhaustionMoraleUpdateCounter -= timerCap;
    }
  }

  updateWeatherCluster(deltaTime: number) {
    this.globalService.globalVar.eventRaceData.weatherClusterUpdateCounter += deltaTime;

    var timerCap = 2 * 60 * 60;
    var timerCapPair = this.globalService.globalVar.modifiers.find(item => item.text === "weatherClusterTimerCapGrandPrixModifier");
    if (timerCapPair !== null && timerCapPair !== undefined)
      timerCap = timerCapPair.value;

    if (this.globalService.globalVar.eventRaceData.weatherClusterUpdateCounter > timerCap) {
      this.globalService.globalVar.eventRaceData.weatherCluster = this.globalService.getRandomGrandPrixWeatherCluster(undefined, this.globalService.globalVar.eventRaceData.weatherCluster);
      this.globalService.globalVar.eventRaceData.weatherClusterUpdateCounter -= timerCap;
    }
  }

  checkForEventRelayAnimal() {
    if (this.globalService.globalVar.eventRaceData.animalData.some(animal => animal.isSetToRelay)) {
      this.globalService.globalVar.eventRaceData.animalData.forEach(data => {
        data.isCurrentlyRacing = false;
        if (data.isSetToRelay) {
          data.isCurrentlyRacing = true;
          data.isSetToRelay = false;
          this.globalService.globalVar.eventRaceData.animalAlreadyPrepped = false;

          if (this.lookupService.getCourseTypeFromAnimalType(data.associatedAnimalType) === RaceCourseTypeEnum.Mountain) {
            this.globalService.globalVar.eventRaceData.mountainEndingY = 0;
          }
        }
      });
    }
    else {
      var racingAnimal = this.globalService.getGrandPrixRacingAnimal();
      var exhaustionOfRacingAnimal = this.globalService.getExhaustionOfAnimal(racingAnimal.type);
      var requiredBreedLevel = this.lookupService.getBreedLevelRequiredForGrandPrix();
      if (exhaustionOfRacingAnimal !== undefined && exhaustionOfRacingAnimal < .5) {
        var eventDeck = this.globalService.globalVar.animalDecks.find(item => item.isEventDeck);

        if (eventDeck !== undefined && eventDeck !== null) {
          var animalsCapableOfRacing = eventDeck?.selectedAnimals.filter(item => item.breedLevel >= requiredBreedLevel);
          animalsCapableOfRacing = animalsCapableOfRacing.filter(item => {
            var associatedData = this.globalService.globalVar.eventRaceData.animalData.find(data => data.associatedAnimalType === item.type);
            
            if (associatedData !== undefined && associatedData !== null) {
              return associatedData.exhaustionStatReduction >= .5 || associatedData.associatedAnimalType === racingAnimal.type;
            }

            return false;
          });

          if (animalsCapableOfRacing.length > 1) {
            var indexInEventDeck = 0;
            var animalFound = false;
            animalsCapableOfRacing.forEach(animal => {
              if (animal.type === racingAnimal.type)
                animalFound = true;

              if (!animalFound)
                indexInEventDeck += 1;
            });

            if (!animalFound)
              indexInEventDeck = -1;

            this.globalService.globalVar.eventRaceData.animalData.forEach(data => {
              data.isCurrentlyRacing = false;
            });

            if (indexInEventDeck > -1) {
              var nextIndex = indexInEventDeck + 1;
              if (nextIndex === animalsCapableOfRacing.length)
                nextIndex = 0;

              this.globalService.globalVar.eventRaceData.animalData.forEach(data => {
                if (data.associatedAnimalType === animalsCapableOfRacing[nextIndex].type) {
                  data.isCurrentlyRacing = true;
                  if (this.lookupService.getCourseTypeFromAnimalType(data.associatedAnimalType) === RaceCourseTypeEnum.Mountain) {
                    this.globalService.globalVar.eventRaceData.mountainEndingY = 0;
                  }
                  this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(animalsCapableOfRacing[nextIndex]);
                }
              });
            }
            else {
              this.globalService.globalVar.eventRaceData.animalData.forEach(data => {
                if (data.associatedAnimalType === animalsCapableOfRacing[0].type) {
                  data.isCurrentlyRacing = true;
                  if (this.lookupService.getCourseTypeFromAnimalType(data.associatedAnimalType) === RaceCourseTypeEnum.Mountain) {
                    this.globalService.globalVar.eventRaceData.mountainEndingY = 0;
                  }
                  this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(animalsCapableOfRacing[0]);
                }
              });
            }

            this.globalService.globalVar.eventRaceData.animalAlreadyPrepped = false;
          }
          else {            
            //no capable racers in event deck
            this.globalService.globalVar.eventRaceData.animalData.forEach(item => {              
              item.isCurrentlyRacing = false;
            });

            this.globalService.globalVar.eventRaceData.animalAlreadyPrepped = false;
            this.globalService.globalVar.eventRaceData.isRunning = false;
            this.globalService.globalVar.eventRaceData.overallTimeCounter -= this.globalService.globalVar.eventRaceData.segmentTimeCounter;
            this.globalService.globalVar.eventRaceData.segmentTimeCounter = 0;
            this.globalService.globalVar.eventRaceData.currentRaceSegment.reduceExportSize();
          }
        }
      }
    }
  }

  checkForGrandPrixRewards() {
    var distanceCovered = this.globalService.globalVar.eventRaceData.distanceCovered;

    var coinRewardAmount = 100;
    var coinRewardAmountValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixCoinRewardModifier");
    if (coinRewardAmountValuePair !== null && coinRewardAmountValuePair !== undefined)
      coinRewardAmount = coinRewardAmountValuePair.value;

    var renownRewardAmount = 5;
    var renownRewardAmountValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixRenownRewardModifier");
    if (renownRewardAmountValuePair !== null && renownRewardAmountValuePair !== undefined)
      renownRewardAmount = renownRewardAmountValuePair.value;

    var metersPerCoinRewardValue = 5000000;
    var metersPerCoinRewardValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "metersPerCoinsGrandPrixModifier");
    if (metersPerCoinRewardValuePair !== null && metersPerCoinRewardValuePair !== undefined)
      metersPerCoinRewardValue = metersPerCoinRewardValuePair.value;

    var metersPerRenownRewardValue = 20000000;
    var metersPerRenownRewardValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "metersPerRenownGrandPrixModifier");
    if (metersPerRenownRewardValuePair !== null && metersPerRenownRewardValuePair !== undefined)
      metersPerRenownRewardValue = metersPerRenownRewardValuePair.value;

    var token1MeterCount = 50000000;
    var token1MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken1MeterModifier");
    if (token1MeterCountPair !== null && token1MeterCountPair !== undefined)
      token1MeterCount = token1MeterCountPair.value;

    var token2MeterCount = 50000000;
    var token2MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken2MeterModifier");
    if (token2MeterCountPair !== null && token2MeterCountPair !== undefined)
      token2MeterCount = token2MeterCountPair.value;

    var token3MeterCount = 50000000;
    var token3MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken3MeterModifier");
    if (token3MeterCountPair !== null && token3MeterCountPair !== undefined)
      token3MeterCount = token3MeterCountPair.value;

    var token4MeterCount = 50000000;
    var token4MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken4MeterModifier");
    if (token4MeterCountPair !== null && token4MeterCountPair !== undefined)
      token4MeterCount = token4MeterCountPair.value;

    var totalCoinRewards = this.globalService.globalVar.eventRaceData.totalDistance / metersPerCoinRewardValue;
    var totalRenownRewards = this.globalService.globalVar.eventRaceData.totalDistance / metersPerRenownRewardValue;
    var totalTokenRewards = 4;

    if (distanceCovered > metersPerCoinRewardValue * (this.globalService.globalVar.eventRaceData.coinRewardsObtained + 1) &&
      this.globalService.globalVar.eventRaceData.coinRewardsObtained < totalCoinRewards) {
      this.globalService.globalVar.eventRaceData.coinRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Coins");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += coinRewardAmount;
    }

    if (distanceCovered > metersPerRenownRewardValue * (this.globalService.globalVar.eventRaceData.renownRewardsObtained + 1) &&
      this.globalService.globalVar.eventRaceData.renownRewardsObtained < totalRenownRewards) {
      this.globalService.globalVar.eventRaceData.renownRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Renown");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += renownRewardAmount;
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 0 && distanceCovered > token1MeterCount) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += 1;
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", 1, ShopItemTypeEnum.Resources));
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 1 && distanceCovered > token2MeterCount) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += 1;
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", 1, ShopItemTypeEnum.Resources));
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 2 && distanceCovered > token3MeterCount) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += 2;
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", 2, ShopItemTypeEnum.Resources));
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 3 && distanceCovered > token4MeterCount) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += 3;
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", 3, ShopItemTypeEnum.Resources));
    }
  }

  handleFreeRaceTimer(deltaTime: number) {
    //console.log("Handle Free Races: " + deltaTime);
    this.globalService.globalVar.freeRaceTimePeriodCounter += deltaTime;

    //delay if user is racing to prevent lag
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

      var raceResult = this.raceLogicService.runRace(freeRace);
      //console.log("Result: " + raceResult.wasSuccessful + " National Race Counter: " + this.globalService.globalVar.nationalRaceCountdown + " Medals: " + this.lookupService.getMedals())
    }
  }

  public saveGame() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
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