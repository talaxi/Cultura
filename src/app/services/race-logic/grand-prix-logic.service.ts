import { Injectable } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { GrandPrixData } from 'src/app/models/races/event-race-data.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { GlobalService } from '../global-service.service';
import { LookupService } from '../lookup.service';
import { UtilityService } from '../utility/utility.service';
import { RaceLogicService } from './race-logic.service';

@Injectable({
  providedIn: 'root'
})
export class GrandPrixLogicService {

  deltaTime: number;

  constructor(private globalService: GlobalService, private utilityService: UtilityService, private raceLogicService: RaceLogicService,
    private lookupService: LookupService) { }

  handleGrandPrix(deltaTime: number) {
    //console.log(this.globalService.globalVar.eventRaceData.currentEventEndDate + " Timer: " + this.globalService.globalVar.eventRaceData.segmentTimeCounter);
    var raceTimeOver = false;
    if (this.globalService.globalVar.eventRaceData.currentEventEndDate !== null && this.globalService.globalVar.eventRaceData.currentEventEndDate !== undefined &&
      new Date() > this.utilityService.addDaysToDate(this.globalService.globalVar.eventRaceData.currentEventEndDate, 1)) {
      raceTimeOver = true;
      this.globalService.globalVar.eventRaceData = new GrandPrixData();
      this.globalService.globalVar.eventRaceData.initialSetupComplete = false;
      return;
    }

    if ((this.globalService.getTimeToEventRace() > 0 && this.globalService.globalVar.eventRaceData.bonusTime === 0)) {
      raceTimeOver = true;

      if (this.globalService.globalVar.eventRaceData.isCatchingUp)
        raceTimeOver = false;

      //console.log("Remaining: " + this.globalService.globalVar.eventRaceData.remainingEventRaceTime + " Catching UP: " + this.globalService.globalVar.eventRaceData.isCatchingUp);

      if (this.globalService.globalVar.eventRaceData.initialSetupComplete) {
        //first check if delta time was in between starting/stopping and calculate any necessary race during that time
        if (this.globalService.globalVar.eventRaceData.remainingEventRaceTime > 0 && new Date() < this.utilityService.addDaysToDate(this.globalService.globalVar.eventRaceData.currentEventEndDate, 1)) {
          this.globalService.globalVar.eventRaceData.segmentTimeCounter = this.globalService.globalVar.eventRaceData.remainingEventRaceTime;
          this.globalService.globalVar.eventRaceData.overallTimeCounter = this.globalService.globalVar.eventRaceData.remainingEventRaceTime;
        }
        else if (!this.globalService.globalVar.eventRaceData.isCatchingUp) {
          //reset race
          this.globalService.globalVar.eventRaceData = new GrandPrixData();
        }
      }

      if (!this.globalService.globalVar.eventRaceData.isCatchingUp && this.globalService.globalVar.eventRaceData.remainingEventRaceTime === 0) {
        this.globalService.globalVar.eventRaceData.initialSetupComplete = false;
        return;
      }
    }

    if (!this.globalService.globalVar.eventRaceData.initialSetupComplete) //wasn't within event and now you are
    {
      //do initial set up
      this.globalService.initialGrandPrixSetup("Z", 1);
      this.globalService.globalVar.eventRaceData.initialSetupComplete = true;
      this.globalService.globalVar.notifications.isEventRaceNowActive = true;

      var startDate = this.globalService.getCurrentEventStartEndDateTime(false);
      if (startDate instanceof Date)
        this.globalService.globalVar.eventRaceData.currentEventStartDate = startDate;

      var endDate = this.globalService.getCurrentEventStartEndDateTime(true);
      if (endDate instanceof Date)
        this.globalService.globalVar.eventRaceData.currentEventEndDate = endDate;

      //if setting is active
      if (this.globalService.globalVar.settings.get("autoStartEventRace")) {
        if (this.globalService.globalVar.eventRaceData.isRunning === false) {

          var timeSinceRaceStarted = this.globalService.globalVar.eventRaceData.grandPrixTimeLength - this.globalService.getRemainingEventRaceTime();
          //retroactively add past time  
          //console.log("Time Since Race Started: " + timeSinceRaceStarted);        
          this.globalService.globalVar.eventRaceData.segmentTimeCounter = timeSinceRaceStarted;
          this.globalService.globalVar.eventRaceData.overallTimeCounter = timeSinceRaceStarted;

          //do set up
          var racingAnimal = this.globalService.getGrandPrixRacingAnimal();

          if (racingAnimal.type !== undefined && racingAnimal.type !== null) {
            if (!this.globalService.globalVar.eventRaceData.animalData.some(item => item.isCurrentlyRacing)) {
              var matchingAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType == racingAnimal.type);
              if (matchingAnimalData !== undefined) {
                matchingAnimalData.isCurrentlyRacing = true;
              }
            }

            this.globalService.globalVar.eventRaceData.isRunning = true;
            this.globalService.globalVar.eventRaceData.currentRaceSegment = this.globalService.generateGrandPrixSegment(racingAnimal);
            this.globalService.globalVar.eventRaceData.currentRaceSegmentResult = this.raceLogicService.runRace(this.globalService.globalVar.eventRaceData.currentRaceSegment);
            this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(racingAnimal);

            if (this.globalService.globalVar.eventRaceData.currentRaceSegmentCount === 0) {
              this.globalService.globalVar.eventRaceData.currentRaceSegmentCount += 1;
            }
          }
        }
      }
    }

    if (this.globalService.globalVar.eventRaceData.isGrandPrixCompleted) { //current rank completed
      this.globalService.increaseGrandPrixRaceRank();
    }

    //count down from bonus time after race ends
    if (this.globalService.getTimeToEventRace() > 0 && this.globalService.globalVar.eventRaceData.bonusTime > 0) {
      this.globalService.globalVar.eventRaceData.bonusTime -= deltaTime;

      if (this.globalService.globalVar.eventRaceData.bonusTime <= 0)
        this.globalService.globalVar.eventRaceData.bonusTime = 0;
    }

    if (this.globalService.globalVar.eventRaceData.isRunning) {
      var eventDeck = this.globalService.globalVar.animalDecks.find(item => item.isEventDeck);
      if (eventDeck === null || eventDeck === undefined)
        return;

      if (!raceTimeOver) {
        this.globalService.globalVar.eventRaceData.segmentTimeCounter += deltaTime;
        this.globalService.globalVar.eventRaceData.overallTimeCounter += deltaTime;
        //console.log("rollin -- " + this.globalService.globalVar.eventRaceData.segmentTimeCounter + " vs " + (this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed / 60));
      }

      if (new Date() < this.utilityService.addDaysToDate(this.globalService.globalVar.eventRaceData.currentEventEndDate, 1))
        this.globalService.globalVar.eventRaceData.remainingEventRaceTime = 0;
      else
        this.globalService.globalVar.eventRaceData.remainingEventRaceTime = this.globalService.getRemainingEventRaceTime();

      var timeToComplete = this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed / 60; //framemodifier =

      //game is far enough behind that trying to view would be problematic. let event catch up first
      //if expedite race was really a thing, you could turn it on while this is active      
      if (this.globalService.globalVar.eventRaceData.segmentTimeCounter >= timeToComplete * 2 && new Date() < this.utilityService.addDaysToDate(this.globalService.globalVar.eventRaceData.currentEventEndDate, 1)) { //&& within 24 hours after end of race
        this.globalService.globalVar.eventRaceData.isCatchingUp = true;
        this.globalService.globalVar.eventRaceData.delayCatchingUpTimeCounter += deltaTime;
      }
      else {
        this.globalService.globalVar.eventRaceData.isCatchingUp = false;
        this.globalService.globalVar.eventRaceData.delayCatchingUpTimeCounter = 0;
      }

      if (this.globalService.globalVar.eventRaceData.segmentTimeCounter >= timeToComplete) {
        //TODO FOR LATER:
        /*if (this.globalService.globalVar.eventRaceData.isCatchingUp && this.globalService.globalVar.eventRaceData.delayCatchingUpTimeCounter < 2)
        {
          return;
        }*/

        //console.log("Segment complete");
        this.globalService.globalVar.eventRaceData.currentRaceSegmentCount += 1;
        this.globalService.globalVar.eventRaceData.segmentTimeCounter -= timeToComplete;
        this.globalService.globalVar.eventRaceData.distanceCovered += this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.distanceCovered;

        this.globalService.globalVar.eventRaceData.previousRaceSegment = this.globalService.globalVar.eventRaceData.currentRaceSegment.makeCopy(this.globalService.globalVar.eventRaceData.currentRaceSegment);
        this.globalService.globalVar.eventRaceData.previousRaceSegment.reduceExportSize();

        if (this.globalService.globalVar.eventRaceData.distanceCovered >= this.globalService.globalVar.eventRaceData.totalDistance) {
          this.globalService.globalVar.eventRaceData.distanceCovered = this.globalService.globalVar.eventRaceData.totalDistance;
          this.grandPrixRaceCompleted();
        }
        else {
          var didAnimalSwitch = this.checkForEventRelayAnimal(this.globalService.globalVar.eventRaceData.isCatchingUp, this.globalService.globalVar.eventRaceData.segmentTimeCounter);
          if (didAnimalSwitch) {
            this.resetEventAbilityUseCounts();
          }

          var racingAnimal = this.globalService.getGrandPrixRacingAnimal();

          //console.log("Racing Animal: " + racingAnimal.name);
          if (racingAnimal.type !== undefined && racingAnimal.name !== undefined) {
            this.globalService.globalVar.eventRaceData.currentRaceSegment = this.globalService.globalVar.eventRaceData.nextRaceSegment.makeCopy(this.globalService.globalVar.eventRaceData.nextRaceSegment);
            this.globalService.globalVar.eventRaceData.currentRaceSegmentResult = this.raceLogicService.runRace(this.globalService.globalVar.eventRaceData.currentRaceSegment);
            //console.log("Ran segment " + this.globalService.globalVar.eventRaceData.currentRaceSegmentCount);
            //console.log("Resulting frames: " + this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed + "(" + (this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed / 60) + ")");            
            this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(racingAnimal, this.globalService.globalVar.eventRaceData.isCatchingUp ? this.globalService.globalVar.eventRaceData.segmentTimeCounter : undefined);
            this.globalService.globalVar.eventRaceData.delayCatchingUpTimeCounter = 0;
          }
        }
      }

      this.checkForGrandPrixRewards();
    }
    else {
      //event race is not running
      this.globalService.globalVar.eventRaceData.isCatchingUp = false;
    }

    //do is catching up check here, if true handle it differently. maybe wait until segmentcounter reaches the desired amount
    this.updateExhaustionAndMorale(deltaTime);
    this.updateWeatherCluster(deltaTime);
  }

  grandPrixRaceCompleted() {
    this.globalService.globalVar.eventRaceData.isGrandPrixCompleted = true;
    this.globalService.stopGrandPrixRace();
  }

  updateExhaustionAndMorale(deltaTime: number) {
    if (this.globalService.globalVar.eventRaceData.isCatchingUp) {
      this.globalService.globalVar.eventRaceData.exhaustionMoraleUpdateCounter += this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed / 60;
    }
    else {
      this.globalService.globalVar.eventRaceData.exhaustionMoraleUpdateCounter += deltaTime;
    }

    var timerCap = 5 * 60;
    var timerCapPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionGainTimerCapGrandPrixModifier");
    if (timerCapPair !== null && timerCapPair !== undefined)
      timerCap = timerCapPair.value;    

    var exhaustionGain = .02;
    var exhaustionGainPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionGainGrandPrixModifier");
    if (exhaustionGainPair !== null && exhaustionGainPair !== undefined)
      exhaustionGain = exhaustionGainPair.value;

    var currentRacer = this.globalService.globalVar.eventRaceData.animalData.find(item => item.isCurrentlyRacing);

    if (this.globalService.globalVar.eventRaceData.exhaustionMoraleUpdateCounter > timerCap) {
      this.globalService.globalVar.eventRaceData.animalData.forEach(item => {
        if (!this.globalService.globalVar.eventRaceData.isRunning || currentRacer === undefined || 
          item.associatedAnimalType !== currentRacer?.associatedAnimalType) {

          item.exhaustionStatReduction += exhaustionGain;
          if (item.exhaustionStatReduction >= 1)
            item.exhaustionStatReduction = 1;
        }

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

  checkForEventRelayAnimal(isCatchingUp: boolean, catchUpTime: number) {
    var didAnimalSwitch = false;

    if (this.globalService.globalVar.eventRaceData.animalData.some(animal => animal.isSetToRelay)) {
      this.globalService.globalVar.eventRaceData.animalData.forEach(data => {
        data.isCurrentlyRacing = false;
        if (data.isSetToRelay) {
          data.isCurrentlyRacing = true;
          data.isSetToRelay = false;
          this.globalService.globalVar.eventRaceData.animalAlreadyPrepped = false;
          didAnimalSwitch = true;

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
      if (exhaustionOfRacingAnimal !== undefined && (exhaustionOfRacingAnimal < .5 || this.globalService.globalVar.eventRaceData.triggerEnergyFloorRelay)) {
        this.globalService.globalVar.eventRaceData.triggerEnergyFloorRelay = false;
        var eventDeck = this.globalService.globalVar.animalDecks.find(item => item.isEventDeck);

        if (eventDeck !== undefined && eventDeck !== null) {          
          var currentAnimals: Animal[] = [];
          eventDeck.selectedAnimals.forEach(animal => {
            var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === animal.type);
            if (globalAnimal !== undefined)
              currentAnimals.push(globalAnimal);
          });
          var filteredAnimals = currentAnimals.filter(item => item.breedLevel >= requiredBreedLevel);
          var animalsCapableOfRacing: Animal[] = [];          

          if (eventDeck.isCourseOrderActive) {
            for (var i = 0; i < filteredAnimals.length; i++) {
              if (eventDeck.courseTypeOrder.length > i) {
                var type = eventDeck.courseTypeOrder[i];                
                var matchingAnimal = filteredAnimals.find(animal => animal.raceCourseType === type);
                if (matchingAnimal !== undefined)
                  animalsCapableOfRacing.push(matchingAnimal);
              }
            }
          }
          else {
            filteredAnimals.forEach(animal => {
              animalsCapableOfRacing.push(animal);
            });
          }

          var relayExhaustionFloor = .5;
          if (this.globalService.globalVar.doNotRelayBelowEnergyFloor)
            relayExhaustionFloor = this.globalService.globalVar.relayEnergyFloor / 100;

          animalsCapableOfRacing = animalsCapableOfRacing.filter(item => {
            var associatedData = this.globalService.globalVar.eventRaceData.animalData.find(data => data.associatedAnimalType === item.type);

            if (associatedData !== undefined && associatedData !== null) {
              var globalData = this.globalService.globalVar.animals.find(data => data.type === item.type);

              return (associatedData.exhaustionStatReduction >= relayExhaustionFloor && !this.globalService.shouldShowSlowSegmentWarning(globalData)) || associatedData.associatedAnimalType === racingAnimal.type;
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
                  didAnimalSwitch = true;
                  if (this.lookupService.getCourseTypeFromAnimalType(data.associatedAnimalType) === RaceCourseTypeEnum.Mountain) {
                    this.globalService.globalVar.eventRaceData.mountainEndingY = 0;
                  }
                  this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(animalsCapableOfRacing[nextIndex], isCatchingUp ? catchUpTime : undefined);
                }
              });
            }
            else {
              this.globalService.globalVar.eventRaceData.animalData.forEach(data => {
                if (data.associatedAnimalType === animalsCapableOfRacing[0].type) {
                  data.isCurrentlyRacing = true;
                  didAnimalSwitch = true;
                  if (this.lookupService.getCourseTypeFromAnimalType(data.associatedAnimalType) === RaceCourseTypeEnum.Mountain) {
                    this.globalService.globalVar.eventRaceData.mountainEndingY = 0;
                  }
                  this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(animalsCapableOfRacing[0], isCatchingUp ? catchUpTime : undefined);
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

    return didAnimalSwitch;
  }

  resetEventAbilityUseCounts() {
    if (this.globalService.globalVar.eventRaceData === null || this.globalService.globalVar.eventRaceData === undefined ||
      this.globalService.globalVar.eventRaceData.eventAbilityData === null || this.globalService.globalVar.eventRaceData.eventAbilityData === undefined)
      return;

    this.globalService.globalVar.eventRaceData.eventAbilityData.resetUseCounts();
  }

  checkForGrandPrixRewards() {
    var distanceCovered = this.globalService.globalVar.eventRaceData.distanceCovered;
    var numericRankValue = this.globalService.globalVar.eventRaceData.rankDistanceMultiplier;//this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.eventRaceData.rank);

    var coinRewardAmount = 100;
    var coinRewardAmountValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixCoinRewardModifier");
    if (coinRewardAmountValuePair !== null && coinRewardAmountValuePair !== undefined)
      coinRewardAmount = coinRewardAmountValuePair.value * numericRankValue;

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

    var tokenGainModifier = this.lookupService.getTokenModifier();
    var totalCoinRewards = this.globalService.globalVar.eventRaceData.totalDistance / (metersPerCoinRewardValue * numericRankValue);
    var totalRenownRewards = this.globalService.globalVar.eventRaceData.totalDistance / (metersPerRenownRewardValue * numericRankValue);

    if (distanceCovered >= (metersPerCoinRewardValue * numericRankValue) * (this.globalService.globalVar.eventRaceData.coinRewardsObtained + 1) &&
      this.globalService.globalVar.eventRaceData.coinRewardsObtained < totalCoinRewards) {
      this.globalService.globalVar.eventRaceData.coinRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Coins");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += coinRewardAmount;

      this.lookupService.addResourceToResourceList(new ResourceValue("Coins", coinRewardAmount, ShopItemTypeEnum.Resources), this.globalService.globalVar.previousEventRewards);
    }

    if (distanceCovered >= (metersPerRenownRewardValue * numericRankValue) * (this.globalService.globalVar.eventRaceData.renownRewardsObtained + 1) &&
      this.globalService.globalVar.eventRaceData.renownRewardsObtained < totalRenownRewards) {
      this.globalService.globalVar.eventRaceData.renownRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Renown");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += renownRewardAmount;

      this.lookupService.addResourceToResourceList(new ResourceValue("Renown", renownRewardAmount, ShopItemTypeEnum.Progression), this.globalService.globalVar.previousEventRewards);
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 0 && distanceCovered >= token1MeterCount * numericRankValue) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += (1 * tokenGainModifier);
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", (1 * tokenGainModifier), ShopItemTypeEnum.Resources));

      this.lookupService.addResourceToResourceList(new ResourceValue("Tokens", (1 * tokenGainModifier), ShopItemTypeEnum.Resources), this.globalService.globalVar.previousEventRewards);
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 1 && distanceCovered >= token2MeterCount * numericRankValue) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += (2 * tokenGainModifier);
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", (2 * tokenGainModifier), ShopItemTypeEnum.Resources));

      this.lookupService.addResourceToResourceList(new ResourceValue("Tokens", (2 * tokenGainModifier), ShopItemTypeEnum.Resources), this.globalService.globalVar.previousEventRewards);
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 2 && distanceCovered >= token3MeterCount * numericRankValue) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += (3 * tokenGainModifier);
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", (3 * tokenGainModifier), ShopItemTypeEnum.Resources));

      this.lookupService.addResourceToResourceList(new ResourceValue("Tokens", (3 * tokenGainModifier), ShopItemTypeEnum.Resources), this.globalService.globalVar.previousEventRewards);
    }

    if (this.globalService.globalVar.eventRaceData.tokenRewardsObtained <= 3 && distanceCovered >= token4MeterCount * numericRankValue) {
      this.globalService.globalVar.eventRaceData.tokenRewardsObtained += 1;
      this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
      var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
      if (globalResource !== null && globalResource !== undefined)
        globalResource.amount += (4 * tokenGainModifier);
      else
        this.globalService.globalVar.resources.push(new ResourceValue("Tokens", (4 * tokenGainModifier), ShopItemTypeEnum.Resources));

      this.lookupService.addResourceToResourceList(new ResourceValue("Tokens", (4 * tokenGainModifier), ShopItemTypeEnum.Resources), this.globalService.globalVar.previousEventRewards);
    }

    //early race food rewards
    if (numericRankValue === 1) {
      var strawberryRewardDistance = 25000;
      var appleRewardDistance = 50000;
      var orangeRewardDistance = 75000;
      var mangoRewardDistance = 100000;
      var turnipRewardDistance = 250000;
      var bananaRewardDistance = 500000;
      var carrotRewardDistance = 750000;
      var mangoReward2Distance = 1000000;
      var baseFoodAmount = 100;
      var firstMangoAmount = 5;
      var secondMangoAmount = 10;

      if (distanceCovered >= strawberryRewardDistance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 0) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Strawberries");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (baseFoodAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Strawberries", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Strawberries", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }

      if (distanceCovered >= appleRewardDistance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 1) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Apples");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (baseFoodAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Apples", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Apples", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }

      if (distanceCovered >= orangeRewardDistance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 2) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Oranges");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (baseFoodAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Oranges", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Oranges", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }

      if (distanceCovered >= mangoRewardDistance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 3) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Mangoes");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (firstMangoAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Mangoes", (firstMangoAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Mangoes", (firstMangoAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }

      if (distanceCovered >= turnipRewardDistance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 4) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Turnips");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (baseFoodAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Turnips", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Turnips", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }

      if (distanceCovered >= bananaRewardDistance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 5) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Bananas");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (baseFoodAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Bananas", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Bananas", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }

      if (distanceCovered >= carrotRewardDistance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 6) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Carrots");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (baseFoodAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Carrots", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Carrots", (baseFoodAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }

      if (distanceCovered >= mangoReward2Distance * numericRankValue &&
        this.globalService.globalVar.eventRaceData.foodRewardsObtained === 7) {
        this.globalService.globalVar.eventRaceData.remainingRewards -= 1;
        this.globalService.globalVar.eventRaceData.foodRewardsObtained += 1;
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Mangoes");
        if (globalResource !== null && globalResource !== undefined)
          globalResource.amount += (secondMangoAmount * numericRankValue);
        else
          this.globalService.globalVar.resources.push(new ResourceValue("Mangoes", (secondMangoAmount * numericRankValue), ShopItemTypeEnum.Food));

        this.lookupService.addResourceToResourceList(new ResourceValue("Mangoes", (secondMangoAmount * numericRankValue), ShopItemTypeEnum.Food), this.globalService.globalVar.previousEventRewards);
      }
    }
  }
}
