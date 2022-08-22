import { ElementRef, EventEmitter, Injectable, Input, Output } from '@angular/core';
import { times } from 'lodash';
import { Subject } from 'rxjs';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceVariables } from 'src/app/models/animals/race-variables.model';
import { EquipmentEnum } from 'src/app/models/equipment-enum.model';
import { EventRaceTypeEnum } from 'src/app/models/event-race-type-enum.model';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceDesignEnum } from 'src/app/models/race-design-enum.model';
import { RaceTypeEnum } from 'src/app/models/race-type-enum.model';
import { RacerEffectEnum } from 'src/app/models/racer-effect-enum.model';
import { EventSegmentCarryOverData } from 'src/app/models/races/event-segment-carry-over-data.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { RacePath } from 'src/app/models/races/race-path.model';
import { RaceResult } from 'src/app/models/races/race-result.model';
import { Race } from 'src/app/models/races/race.model';
import { RelayEffect } from 'src/app/models/races/relay-effect.model';
import { Terrain } from 'src/app/models/races/terrain.model';
import { RelayEffectEnum } from 'src/app/models/relay-effect-enum.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { TalentTreeTypeEnum } from 'src/app/models/talent-tree-type-enum.model';
import { TrackRaceTypeEnum } from 'src/app/models/track-race-type-enum.model';
import { StringNumberPair } from 'src/app/models/utility/string-number-pair.model';
import { GlobalService } from '../global-service.service';
import { LookupService } from '../lookup.service';
import { InitializeService } from '../utility/initialize.service';
import { UtilityService } from '../utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class RaceLogicService {
  selectedRace: Race;
  racingAnimals: Animal[];
  displayResults: boolean;
  frameModifier = 60;
  timeToComplete = 60;
  currentLostFocusOpportunity = 0;
  currentBurstOpportunity = 0;
  tundraPreviousYAmount = 0;

  constructor(private globalService: GlobalService, private lookupService: LookupService, private utilityService: UtilityService,
    private initializeService: InitializeService) { }

  runRace(race: Race, expediteRace?: boolean): RaceResult {
    //console.log("Race Info:");
    //console.log(race);    

    this.currentBurstOpportunity = 0;
    this.currentLostFocusOpportunity = 0;
    this.tundraPreviousYAmount = 0;
    this.selectedRace = race;

    var raceResult = new RaceResult();
    var totalRaceDistance = 0;
    var distanceCovered = 0;
    var previousRacerVelocity = 0;
    var previousRacerAdaptabilityMs = 0;
    var previousRacerFocusMs = 0;

    race.raceLegs.forEach(item => totalRaceDistance += item.distance);
    var framesPassed = 0;
    if (race.timeToComplete === 0 || race.timeToComplete === undefined || race.timeToComplete === null)
      race.timeToComplete = 60;
    var distancePerSecond = totalRaceDistance / race.timeToComplete;
    var selectedDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    var completedLegCount = 0;
    this.timeToComplete = race.timeToComplete;
    var completedAnimals: Animal[] = [];
    var completedLegs: RaceLeg[] = [];
    var currentRacerEffect = RacerEffectEnum.None;
    var velocityBeforeEffect = 0;
    var legCounter = 0;
    var herdMentalityStaminaGain = 0; //Caribou Ability - Herd Mentality  
    var deepBreathingStaminaGain = 0; //Goat Ability - Deep Breathing
    var camouflageVelocityGain = 0; //Gecko Ability - Camouflage
    var specialDeliveryMaxSpeedBonus = 0;
    var buriedTreasureModifier = 1;
    var timeToTusslePosition = 0;

    var lastAnimal: Animal | null = new Animal();
    var nextAnimal: Animal | null = new Animal();

    if (selectedDeck === undefined) {
      raceResult.errorMessage = 'No relay team selected.';
      return raceResult;
    }

    this.racingAnimals = this.lookupService.getAnimalsFromAnimalDeck(selectedDeck);

    race.raceUI.distanceCoveredByFrame = [];
    race.raceUI.velocityByFrame = [];
    race.raceUI.timeToCompleteByFrame = [];
    race.raceUI.maxSpeedByFrame = [];
    race.raceUI.staminaPercentByFrame = [];
    race.raceUI.yAdjustmentByFrame = [];
    race.raceUI.racerEffectByFrame = [];
    race.raceUI.lavaFallPercentByFrame = [];
    race.raceUI.racePositionByFrame = [];

    if (race.timeToComplete <= 180)
      raceResult.addRaceUpdate(framesPassed, Math.round(race.timeToComplete) + " seconds are on the race clock.");
    else {
      var timeLeftToComplete = this.globalService.getRemainingEventRaceTime() + this.globalService.globalVar.eventRaceData.bonusTime;
      var hoursRemaining = this.utilityService.getHoursRemainingFromSeconds(timeLeftToComplete);
      var minutesRemaining = this.utilityService.getMinutesLeftInHourRemainingFromSeconds(timeLeftToComplete);
      var secondsRemaining = this.utilityService.getSecondsLeftInMinuteRemainingFromSeconds(timeLeftToComplete);
      var secondsDisplay = Math.floor(secondsRemaining).toString();
      var hoursDisplay = hoursRemaining.toString();
      var minutesDisplay = minutesRemaining.toString();

      if (hoursRemaining < 10) {
        if (hoursRemaining < 1 || hoursRemaining > 59)
          hoursDisplay = "00";
        else
          hoursDisplay = String(hoursDisplay).padStart(2, '0');
      }
      if (minutesRemaining < 10) {
        if (minutesRemaining < 1 || minutesRemaining > 59)
          minutesDisplay = "00";
        else
          minutesDisplay = String(minutesDisplay).padStart(2, '0');
      }
      if (secondsRemaining < 10) {
        if (secondsRemaining < 1 || secondsRemaining > 59)
          secondsDisplay = "00";
        else
          secondsDisplay = String(secondsDisplay).padStart(2, '0');
      }

      var remainingTime = hoursDisplay + ":" + minutesDisplay + ":" + secondsDisplay;

      raceResult.addRaceUpdate(framesPassed, remainingTime + " is left on the race clock.");
    }

    //do any pre-race setup
    race.raceLegs.forEach(item => {
      var racingAnimal = null;
      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        racingAnimal = this.globalService.getGrandPrixRacingAnimal();
      }
      else
        racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === item.courseType);

      if (racingAnimal === null || racingAnimal === undefined) {
        alert("You've run into an error! Please try again. If you have the time, please export your data under the Settings tab and send me the data and any relevant info at CulturaIdle@gmail.com. Thank you!");
        return;
      }

      if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
        this.globalService.globalVar.eventRaceData.animalAlreadyPrepped)) {
        racingAnimal.raceVariables = new RaceVariables();
        racingAnimal.totalRacesRun += 1;
      }
    });

    this.globalService.globalVar.trackedStats.totalRaces += 1;

    //calculate speed of animal based on acceleration and top speed (no obstacles)
    race.raceLegs.forEach(item => {
      var racingAnimal: Animal | undefined = undefined;
      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        racingAnimal = this.globalService.getGrandPrixRacingAnimal();
      }
      else
        racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === item.courseType);

      if (racingAnimal === null || racingAnimal === undefined) {
        alert("You've run into an error! Please try again. If you have the time, please export your data under the Settings tab and send me the data and any relevant info at CulturaIdle@gmail.com. Thank you!");
        return;
      }

      this.increasePersistentAbilityXp(racingAnimal);

      var previousEventRaceSegmentData: EventSegmentCarryOverData | undefined = undefined;
      //do carry over for event race segments -- should not carry over if prep hasn't happened because animal may have switched
      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
        this.globalService.globalVar.eventRaceData.animalAlreadyPrepped && this.globalService.globalVar.eventRaceData.previousRaceSegmentData.racingAnimalType === racingAnimal.type) {          
        previousEventRaceSegmentData = this.globalService.globalVar.eventRaceData.previousRaceSegmentData;
      }

      var lastLeg = undefined;
      var nextLeg = new RaceLeg();
      //get correct color class
      var courseClass = "coloredText " + item.getCourseTypeClass();
      var animalDisplayName = "<span class='" + courseClass + "'>" + racingAnimal.name + "</span>";

      var lastCourseClass = "";
      var lastAnimalDisplayName = "";
      var nextCourseClass = "";
      var nextAnimalDisplayName = "";

      if (legCounter > 0) {
        var lastGlobalAnimal = this.racingAnimals.find(animal => animal.raceCourseType === race.raceLegs[legCounter - 1].courseType);
        if (lastGlobalAnimal !== null && lastGlobalAnimal !== undefined) {
          lastAnimal = lastGlobalAnimal;
        }
      }
      else
        lastAnimal = null;

      if (legCounter < race.raceLegs.length - 1) {
        nextLeg = race.raceLegs[legCounter + 1];
        var nextGlobalAnimal = this.racingAnimals.find(animal => animal.raceCourseType === nextLeg.courseType);
        if (nextGlobalAnimal !== null && nextGlobalAnimal !== undefined) {
          nextAnimal = nextGlobalAnimal;
          nextCourseClass = "coloredText " + nextLeg.getCourseTypeClass();
          nextAnimalDisplayName = "<span class='" + nextCourseClass + "'>" + nextAnimal?.name + "</span>";
        }
      }
      else
        nextAnimal = null;

      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
        this.globalService.globalVar.eventRaceData.animalAlreadyPrepped)
        raceResult.addRaceUpdate(framesPassed, animalDisplayName + " clears " + Math.round(this.selectedRace.length).toLocaleString() + " meters of the Grand Prix and moves onto the next leg of the race.");


      var defaultTerrainMaxSpeedModifier = item.terrain.maxSpeedModifier;
      var defaultTerrainAccelerationModifier = item.terrain.accelerationModifier;
      var defaultTerrainStaminaModifier = item.terrain.staminaModifier;
      var defaultTerrainPowerModifier = item.terrain.powerModifier;
      var defaultTerrainFocusModifier = item.terrain.focusModifier;
      var defaultTerrainAdaptabilityModifier = item.terrain.adaptabilityModifier;

      if (framesPassed < this.timeToComplete * this.frameModifier) {
        if (completedLegs.length > 0) {
          lastLeg = completedLegs[completedLegs.length - 1];

          if (lastLeg !== undefined) {
            lastCourseClass = "coloredText " + lastLeg.getCourseTypeClass();
            lastAnimalDisplayName = "<span class='" + lastCourseClass + "'>" + lastAnimal?.name + "</span>";
          }
        }

        //get any prelay effects here
        this.getPrelayEffects(racingAnimal, nextAnimal, nextLeg?.terrain, 1, raceResult, framesPassed, lastAnimalDisplayName, nextLeg, item);

        //check previous animal for relay effects here                
        if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
          this.globalService.globalVar.eventRaceData.animalAlreadyPrepped)) {
          this.PrepareRacingAnimal(raceResult, framesPassed, lastAnimalDisplayName, racingAnimal, completedAnimals, item, lastLeg, undefined, undefined, previousRacerVelocity, previousRacerFocusMs, previousRacerAdaptabilityMs);          
        }

        this.prepareRacingLeg(item, racingAnimal);

        //console.log("Start Leg of Race Relay Length Check: " + racingAnimal.raceVariables.relayEffects.length);
        if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix))
          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " starts their leg of the race.");
      }

      var animalMaxStamina = racingAnimal.currentStats.stamina;
      var velocity = 0;
      var distanceToGo = item.distance;
      var currentPath = new RacePath();
      var lastPath = new RacePath();
      var currentPathCount = 0;
      var isLastPathInLeg = false;
      var permanentMaxSpeedIncreaseMultiplier = 1; //Cheetah Ability - On The Hunt, Gecko Ability - Night Vision, Penguin Ability - Quick Toboggan      
      var permanentAdaptabilityIncreaseMultiplierObj = { permanentAdaptabilityIncreaseMultiplier: 1 }; //Goat Ability - Sure-footed, created as an object so it can be passed as reference
      var permanentMaxSpeedIncreaseMultiplierObj = { permanentMaxSpeedIncreaseMultiplier: 1 }; //Penguin Ability - Quick Toboggan, created as an object so it can be passed as reference
      var feedingFrenzyIncreaseMultiplier = 1; //Shark Ability - Feeding Frenzy     
      var greatMigrationAccelerationIncreaseAdditive = 1; //Caribou Ability - Great Migration 
      var coldBloodedIncreaseMultiplierObj = { coldBloodedIncreaseMultiplier: 1 }; //Salamander Ability - Cold Blooded, created as an object so it can be passed as reference
      var fleetingSpeedIncreaseMultiplier = 1; //Fox Ability - Fleeting Speed
      var nineTailsBuffs: [string, number][] = []; //stat, remaining distance. Fox Ability - Nine Tails
      var grazeBuffs: [string, number][] = []; //stat, remaining distance. Warthog Ability - Graze
      var statLossFromExhaustion = 1;
      var aheadOfAveragePace = false;
      //var legPercentBreakpoint = 0; //used to keep up with various ability distance breakpoints
      var framesInCurrentLeg = 0;
      var previousPassedLavaBreakpoint = [false, false, false, false, false];
      var longDistanceTalentIncreaseAccelerationWithLowVelocity = false;
      var maxSpeedFloor = 0;
      var rollingInMud = false;
      var timeSpentRollingInMud = 0;
      var whalePowerStored = 0;
      var whalePowerStoredBase = 0; //the amount that gets storied into powerstored
      var pathsClearedWithoutLosingFocus = 0; //Whale Ability - Unparalleled Focus

      //check placement before starting leg
      var currentEventDistance = 0;
      var currentEventDistanceCovered = 0;
      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        var timePassed = (this.globalService.globalVar.eventRaceData.grandPrixTimeLength + this.globalService.globalVar.eventRaceData.bonusTime) - this.globalService.getRemainingEventRaceTime();
        var averageDistancePassed = distancePerSecond * timePassed;
        currentEventDistance += averageDistancePassed;

        currentEventDistanceCovered = this.globalService.globalVar.eventRaceData.distanceCovered;
      }

      if (distanceCovered + currentEventDistanceCovered > distancePerSecond * (framesPassed / this.frameModifier) + currentEventDistance) {
        if (!aheadOfAveragePace)
          passedAveragePace = true;

        aheadOfAveragePace = true;
      }
      else {
        if (aheadOfAveragePace)
          passedAveragePace = true;

        aheadOfAveragePace = false;
      }

      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
      {
        statLossFromExhaustion = this.globalService.getAnimalStatLossFromExhaustionEventRace(racingAnimal);    
                  
        if (statLossFromExhaustion < 1)
          racingAnimal.raceVariables.ranOutOfStamina = true;    
      }

      if (previousEventRaceSegmentData !== undefined && previousEventRaceSegmentData !== null) {        
        velocity = previousEventRaceSegmentData.velocity;
        racingAnimal.currentStats.stamina = previousEventRaceSegmentData.stamina;
        deepBreathingStaminaGain = previousEventRaceSegmentData.deepBreathingStaminaGain;
        permanentMaxSpeedIncreaseMultiplier = previousEventRaceSegmentData.permanentMaxSpeedIncreaseMultiplier;
        permanentAdaptabilityIncreaseMultiplierObj.permanentAdaptabilityIncreaseMultiplier = previousEventRaceSegmentData.permanentAdaptabilityIncreaseMultiplier;
        permanentMaxSpeedIncreaseMultiplierObj.permanentMaxSpeedIncreaseMultiplier = previousEventRaceSegmentData.permanentMaxSpeedIncreaseObjMultiplier;
        feedingFrenzyIncreaseMultiplier = previousEventRaceSegmentData.feedingFrenzyIncreaseMultiplier;
        greatMigrationAccelerationIncreaseAdditive = previousEventRaceSegmentData.greatMigrationAccelerationIncreaseAdditive;
        coldBloodedIncreaseMultiplierObj.coldBloodedIncreaseMultiplier = previousEventRaceSegmentData.coldBloodedIncreaseMultiplier;
        fleetingSpeedIncreaseMultiplier = previousEventRaceSegmentData.fleetingSpeedIncreaseMultiplier;
        whalePowerStored = previousEventRaceSegmentData.whalePowerStored;
        pathsClearedWithoutLosingFocus = previousEventRaceSegmentData.pathsClearedWithoutLosingFocus;
        racingAnimal.raceVariables = previousEventRaceSegmentData.raceVariables.makeCopy();        

        if (previousEventRaceSegmentData.nineTailsBuffs.length > 0) {
          previousEventRaceSegmentData.nineTailsBuffs.forEach(buff => {
            nineTailsBuffs.push(buff);
          });
        }

        if (previousEventRaceSegmentData.grazeBuffs.length > 0) {
          previousEventRaceSegmentData.grazeBuffs.forEach(buff => {
            grazeBuffs.push(buff);
          });
        }

        if (previousEventRaceSegmentData.relayEffects.length > 0) {
          previousEventRaceSegmentData.relayEffects.forEach(buff => {
            if (racingAnimal !== null && racingAnimal !== undefined) {
              racingAnimal.raceVariables.relayEffects.push(buff);

              if (racingAnimal.raceVariables.relayEffects !== null && racingAnimal.raceVariables.relayEffects !== undefined && racingAnimal.raceVariables.relayEffects.length > 0) {
                racingAnimal.raceVariables.relayEffects.forEach(effect => {
                  if (effect.isMultiplicative)
                    racingAnimal!.currentStats.multiplyCurrentRacingStats(effect.relayAffectedStatRatios);
                  else
                    racingAnimal!.currentStats.addCurrentRacingStats(effect.relayAffectedStatRatios);
                });
              }
            }
          });
        }
        longDistanceTalentIncreaseAccelerationWithLowVelocity = previousEventRaceSegmentData.longDistanceTalentIncreaseAccelerationWithLowVelocity;
        maxSpeedFloor = previousEventRaceSegmentData.maxSpeedFloor;
        statLossFromExhaustion = previousEventRaceSegmentData.statLossFromExhaustion;      
      }

      //get values from relay effects      
      var camouflageRelayEffect = this.lookupService.getRelayEffectFromListByType(racingAnimal.raceVariables.relayEffects, RelayEffectEnum.camouflage);
      if (camouflageRelayEffect !== undefined && camouflageRelayEffect.additionalValue !== undefined) {
        camouflageVelocityGain = camouflageRelayEffect.additionalValue;
      }

      var herdMentalityRelayEffect = this.lookupService.getRelayEffectFromListByType(racingAnimal.raceVariables.relayEffects, RelayEffectEnum.herdMentality);
      if (herdMentalityRelayEffect !== undefined && herdMentalityRelayEffect.additionalValue !== undefined) {
        herdMentalityStaminaGain = herdMentalityRelayEffect.additionalValue;
      }

      var specialDeliveryRelayEffect = this.lookupService.getRelayEffectFromListByType(racingAnimal.raceVariables.relayEffects, RelayEffectEnum.specialDelivery);
      if (specialDeliveryRelayEffect !== undefined && specialDeliveryRelayEffect.additionalValue !== undefined) {
        specialDeliveryMaxSpeedBonus = specialDeliveryRelayEffect.additionalValue;
      }

      if (racingAnimal.ability.name === "Nap" && racingAnimal.type === AnimalTypeEnum.Hare) {
        var distanceFromEnd = item.distance - this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion)
        if (distanceFromEnd < 0)
          distanceFromEnd = 0;
        racingAnimal.ability.remainingLength = distanceFromEnd;
      }

      if (racingAnimal.ability.name === "Buried Treasure" && racingAnimal.type === AnimalTypeEnum.Octopus) {
        var distanceFromEnd = item.distance - this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion)
        if (distanceFromEnd < 0)
          distanceFromEnd = 0;
        racingAnimal.ability.remainingLength = distanceFromEnd;
      }

      var deepBreathingRelayEffect = this.lookupService.getRelayEffectFromListByType(racingAnimal.raceVariables.relayEffects, RelayEffectEnum.deepBreathing);
      if (deepBreathingRelayEffect !== undefined && deepBreathingRelayEffect.additionalValue !== undefined) {
        var allDeepBreathingRelayEffects = racingAnimal.raceVariables.relayEffects.filter(item => item.effectType === RelayEffectEnum.deepBreathing);
        if (allDeepBreathingRelayEffects !== undefined) {
          allDeepBreathingRelayEffects.forEach(effect => {
            if (effect.additionalValue !== undefined)
              deepBreathingStaminaGain = effect.additionalValue;

            //bonus does not apply to itself
            if (deepBreathingStaminaGain > 0 && racingAnimal!.type !== AnimalTypeEnum.Goat)
              racingAnimal!.currentStats.stamina += deepBreathingStaminaGain;
          });
        }
      }

      for (var i = framesPassed; i <= this.timeToComplete * this.frameModifier; i++) {
        //Race logic here
        framesInCurrentLeg += 1;
        currentRacerEffect = RacerEffectEnum.None;
        var herdMentalityBurst = false;
        var completedLegDistance = 0;
        if (completedLegCount > 0) {
          for (var x = 0; x < completedLegCount; x++) {
            completedLegDistance += race.raceLegs[x].distance;
          }
        }

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
          distancePerSecond = this.globalService.globalVar.eventRaceData.totalDistance / (this.globalService.globalVar.eventRaceData.grandPrixTimeLength + this.globalService.globalVar.eventRaceData.bonusTime);
        }
        else
          distancePerSecond = totalRaceDistance / this.timeToComplete;

        var currentDistanceInLeg = distanceCovered - completedLegDistance;
        var currentDistanceInPath = 0;
        var pathFound = false;
        var totalDistanceInLeg = 0;

        item.pathData.forEach(path => {
          if (!pathFound && currentDistanceInLeg >= totalDistanceInLeg && currentDistanceInLeg < totalDistanceInLeg + path.length) {
            pathFound = true;
            currentPath = path;
            currentDistanceInPath = currentDistanceInLeg - totalDistanceInLeg;
          }
          path.legStartingDistance = totalDistanceInLeg;
          totalDistanceInLeg += path.length;
          currentPathCount += 1;

          if (!pathFound)
            lastPath = path;
        });

        if (racingAnimal.ability.name === "Night Vision" && racingAnimal.type === AnimalTypeEnum.Gecko &&
          !racingAnimal.ability.abilityInUse && !lastPath.didAnimalLoseFocus && lastPath.length > 0) {
          if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
            this.globalService.globalVar.eventRaceData.eventAbilityData.nightVisionUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.nightVisionUseCap)) {

            if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
              this.globalService.globalVar.eventRaceData.eventAbilityData.nightVisionUseCount += 1;

            permanentMaxSpeedIncreaseMultiplier += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100;
            this.globalService.increaseAbilityXp(racingAnimal);
            racingAnimal.ability.abilityInUse = true;
          }
        }


        if (racingAnimal.ability.name === "Feeding Frenzy" && racingAnimal.type === AnimalTypeEnum.Shark) {
          var distance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          if (currentDistanceInLeg <= distance || currentDistanceInLeg >= item.distance - distance) {
            feedingFrenzyIncreaseMultiplier = 1.5;
            var feedingFrenzyPositivePair = this.globalService.globalVar.modifiers.find(item => item.text === "feedingFrenzyPositiveModifier");
            if (feedingFrenzyPositivePair !== undefined)
              feedingFrenzyIncreaseMultiplier = feedingFrenzyPositivePair.value;
          }
          else
            feedingFrenzyIncreaseMultiplier = 1;
        }

        if (herdMentalityStaminaGain > 0) {
          racingAnimal.raceVariables.isBursting = true;
          herdMentalityBurst = true;
          racingAnimal.currentStats.stamina += herdMentalityStaminaGain;
          herdMentalityStaminaGain = 0;
          if (lastAnimal !== null && lastAnimal !== undefined)
            lastAnimal.ability.abilityUsed = true;
        }

        if (racingAnimal.ability.name === "Navigator" && racingAnimal.type === AnimalTypeEnum.Dolphin) {
          racingAnimal.ability.abilityInUse = false;
        }

        if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Fleeting Speed" && !racingAnimal.ability.abilityUsed) {
          fleetingSpeedIncreaseMultiplier += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100;
          racingAnimal.ability.abilityUsed = true;
        }

        if (racingAnimal.type === AnimalTypeEnum.Dolphin && racingAnimal.ability.name === "Echolocation") {
          if (racingAnimal.ability.abilityInUse) {
            if (item.terrain.maxSpeedModifier < 1)
              item.terrain.maxSpeedModifier = 1;
            if (item.terrain.accelerationModifier < 1)
              item.terrain.accelerationModifier = 1;
            if (item.terrain.staminaModifier < 1)
              item.terrain.staminaModifier = 1;
            if (item.terrain.powerModifier < 1)
              item.terrain.powerModifier = 1;
            if (item.terrain.focusModifier < 1)
              item.terrain.focusModifier = 1;
            if (item.terrain.adaptabilityModifier < 1)
              item.terrain.adaptabilityModifier = 1;
          }
          else {
            item.terrain.maxSpeedModifier = defaultTerrainMaxSpeedModifier;
            item.terrain.accelerationModifier = defaultTerrainAccelerationModifier;
            item.terrain.staminaModifier = defaultTerrainStaminaModifier;
            item.terrain.powerModifier = defaultTerrainPowerModifier;
            item.terrain.focusModifier = defaultTerrainFocusModifier;
            item.terrain.adaptabilityModifier = defaultTerrainAdaptabilityModifier;

            this.checkForBlinders(item, racingAnimal);
          }
        }

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
          isLastPathInLeg = false;

          if (currentPath === item.pathData[item.pathData.length - 1] &&
            this.globalService.globalVar.eventRaceData.animalData.some(animal => animal.isSetToRelay)) {
            isLastPathInLeg = true;
          }
        }
        else
          isLastPathInLeg = currentPath === item.pathData[item.pathData.length - 1];

        var modifiedAdaptabilityMs = this.getModifiedAdaptability(racingAnimal, permanentAdaptabilityIncreaseMultiplierObj, statLossFromExhaustion, nineTailsBuffs, grazeBuffs, item, currentDistanceInLeg, nextAnimal, nextLeg, raceResult, framesPassed, animalDisplayName, nextAnimalDisplayName);
        var modifiedFocusMs = this.getModifiedFocus(racingAnimal, statLossFromExhaustion, nineTailsBuffs, grazeBuffs, coldBloodedIncreaseMultiplierObj);
        var didAnimalStumble = this.didAnimalStumble(racingAnimal, currentPath, currentDistanceInPath, item.terrain, permanentAdaptabilityIncreaseMultiplierObj, modifiedAdaptabilityMs, statLossFromExhaustion, framesPassed, animalDisplayName, raceResult);
        var didAnimalLoseFocus = this.didAnimalLoseFocus(racingAnimal, this.timeToComplete, race.length, distanceCovered, item.terrain, statLossFromExhaustion, coldBloodedIncreaseMultiplierObj, currentPath, modifiedFocusMs);

        if (didAnimalLoseFocus) {
          racingAnimal.raceVariables.lostFocus = true;
          racingAnimal.raceVariables.hasLostFocusDuringRace = true;
          racingAnimal.raceVariables.currentLostFocusLength = racingAnimal.raceVariables.defaultLostFocusLength;
          racingAnimal.raceVariables.metersSinceLostFocus = 0;
          velocityBeforeEffect = velocity;

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
            var lostFocusMoraleLoss = .02;
            var lostFocusMoraleLossPair = this.globalService.globalVar.modifiers.find(item => item.text === "focusMoraleLossModifier");
            if (lostFocusMoraleLossPair !== null && lostFocusMoraleLossPair !== undefined)
              lostFocusMoraleLoss = lostFocusMoraleLossPair.value;

            this.lookupService.changeGrandPrixMorale(racingAnimal.type, -lostFocusMoraleLoss);
          }

          if (racingAnimal.ability.name === "Night Vision" && racingAnimal.type === AnimalTypeEnum.Gecko) {
            permanentMaxSpeedIncreaseMultiplier = 1;
          }

          if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.scaryMask)) {
            if (aheadOfAveragePace && !racingAnimal.raceVariables.scaryMaskEffectOccurred) {
              racingAnimal.raceVariables.scaryMaskEffectOccurred = true;
              var scaryMaskModifier = 2;
              var scaryMaskModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "scaryMaskEquipmentModifier");
              if (scaryMaskModifierPair !== undefined)
                scaryMaskModifier = scaryMaskModifierPair.value;

              if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
                this.globalService.globalVar.eventRaceData.bonusTime += scaryMaskModifier;
              }
              else {
                this.timeToComplete += scaryMaskModifier;
              }
            }
          }

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " is distracted and lost focus!");
        }

        if (didAnimalStumble) {
          racingAnimal.raceVariables.stumbled = true;
          racingAnimal.raceVariables.currentStumbledLength = racingAnimal.raceVariables.defaultStumbledLength;
          velocityBeforeEffect = velocity;

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
            var stumbleMoraleLoss = .02;
            var stumbleMoraleLossPair = this.globalService.globalVar.modifiers.find(item => item.text === "stumbleMoraleLossModifier");
            if (stumbleMoraleLossPair !== null && stumbleMoraleLossPair !== undefined)
              stumbleMoraleLoss = stumbleMoraleLossPair.value;

            this.lookupService.changeGrandPrixMorale(racingAnimal.type, -stumbleMoraleLoss);
          }

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " stumbles!");
        }

        if (racingAnimal.currentStats.stamina === 0) {          
          var exhaustionStatLossModifier = .9;
          var exhaustionStatLossPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionStatLossModifier");
          if (exhaustionStatLossPair !== undefined)
            exhaustionStatLossModifier = exhaustionStatLossPair.value;

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
            var morale = this.lookupService.getAnimalMorale(racingAnimal.type);
            var statLoss = 1 - exhaustionStatLossModifier;
            statLoss = statLoss * (1 / morale);
            exhaustionStatLossModifier = 1 - statLoss;
          }

          statLossFromExhaustion = statLossFromExhaustion * exhaustionStatLossModifier;          

          var exhaustionStatLossMinimumModifier = .1;
          var exhaustionStatLossMinimumModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionStatLossMinimumModifier");
          if (exhaustionStatLossMinimumModifierPair !== undefined)
            exhaustionStatLossMinimumModifier = exhaustionStatLossMinimumModifierPair.value;

          if (statLossFromExhaustion < exhaustionStatLossMinimumModifier)
            statLossFromExhaustion = exhaustionStatLossMinimumModifier;

          //console.log("Exhaustion: " + statLossFromExhaustion);
          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
            this.setStaminaLossForEventAnimal(statLossFromExhaustion, racingAnimal.type);
          }

          var regainStaminaModifier = .5; //penalty for running out of stamina, only get half back     

          if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
            regainStaminaModifier += (racingAnimal.talentTree.column3Row4Points * .02);
          }

          if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.quickSnack)) {
            regainStaminaModifier = 1;
            var quickSnackModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "quickSnackEquipmentModifier");
            if (quickSnackModifierPair !== undefined)
              regainStaminaModifier = quickSnackModifierPair.value;
          }

          racingAnimal.currentStats.stamina = animalMaxStamina * regainStaminaModifier;

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " runs out of stamina and must slow down.");
        }

        //Handle logic for recovering stamina / lost focus / stumbled
        if (racingAnimal.raceVariables.lostFocus || racingAnimal.raceVariables.stumbled || rollingInMud) {
          if (racingAnimal.raceVariables.lostFocus) {
            currentRacerEffect = RacerEffectEnum.LostFocus;
            var velocityLoss = .9;

            if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
              velocityLoss -= (racingAnimal.talentTree.column1Row4Points * .02);
            }

            var lostVelocity = velocityBeforeEffect * velocityLoss;

            if (velocity > maxSpeedFloor)
              velocity -= lostVelocity / racingAnimal.raceVariables.defaultLostFocusLength;
            racingAnimal.raceVariables.currentLostFocusLength -= 1;

            if (racingAnimal.raceVariables.currentLostFocusLength === 0) {
              racingAnimal.raceVariables.lostFocus = false;
              if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Mud Pit") {
                raceResult.addRaceUpdate(framesPassed, animalDisplayName + " finds a mud pit and can't help but roll in it.");
                //set ability active, get length
                racingAnimal.ability.abilityInUse = true;
                rollingInMud = true;
                velocityBeforeEffect = velocity;
                velocity = 0;
                racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
                this.globalService.increaseAbilityXp(racingAnimal);
              }
            }
          }

          if (racingAnimal.raceVariables.stumbled) {
            currentRacerEffect = RacerEffectEnum.Stumble;
            var lostVelocity = velocityBeforeEffect - (velocityBeforeEffect * currentPath.stumbleSeverity);

            if (velocity > maxSpeedFloor)
              velocity -= lostVelocity / racingAnimal.raceVariables.defaultStumbledLength;
            racingAnimal.raceVariables.currentStumbledLength -= 1;

            if (racingAnimal.raceVariables.currentStumbledLength === 0) {
              racingAnimal.raceVariables.stumbled = false;
            }
          }

          if (rollingInMud) {
            var adps = race.length / this.timeToComplete;
            if (timeSpentRollingInMud < this.frameModifier / 4 || timeSpentRollingInMud >= 3 * this.frameModifier / 4) {
              velocity += adps / this.frameModifier;
            }
            else
              velocity -= adps / this.frameModifier;
            var totalTime = this.frameModifier; //1 second
            //averageDistancePerSecond;

            //go .25 seconds forward
            //back .5 seconds
            //forward .25 seconds to back to starting point
            timeSpentRollingInMud += 1;
            if (timeSpentRollingInMud === this.frameModifier) {
              rollingInMud = false;
              timeSpentRollingInMud = 0;
              velocity = velocityBeforeEffect;
            }
          }
        }
        else {
          var modifiedAccelerationMs = racingAnimal.currentStats.accelerationMs;

          modifiedAccelerationMs *= item.terrain.accelerationModifier;
          modifiedAccelerationMs *= statLossFromExhaustion;

          if (racingAnimal.type === AnimalTypeEnum.Horse && racingAnimal.ability.name === "Pacemaker" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1.5;
          }
          if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Sprint" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1.35;
          }
          if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Giving Chase" && !aheadOfAveragePace) {
            modifiedAccelerationMs *= 1 + (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);
          }
          if (racingAnimal.ability.name === "Feeding Frenzy" && racingAnimal.type === AnimalTypeEnum.Shark) {
            modifiedAccelerationMs *= feedingFrenzyIncreaseMultiplier;
          }
          if (racingAnimal.type === AnimalTypeEnum.Caribou && racingAnimal.ability.name === "Great Migration") {
            modifiedAccelerationMs += greatMigrationAccelerationIncreaseAdditive;
          }
          if (racingAnimal.ability.name === "Wild Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin && racingAnimal.ability.abilityInUse) {
            var percentOfDrift = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100;
            var maxDriftAmount = 20;
            var maxDriftAmountPair = this.globalService.globalVar.modifiers.find(item => item.text === "maxDriftAmountModifier");
            if (maxDriftAmountPair !== undefined)
              maxDriftAmount = maxDriftAmountPair.value;
            maxDriftAmount *= 2;
            var driftAmount = currentPath.driftAmount;

            if (driftAmount > maxDriftAmount) //drifting back to 0
              driftAmount = maxDriftAmount;
            modifiedAccelerationMs *= 1 + (percentOfDrift * (Math.abs(driftAmount) / (maxDriftAmount)));
            racingAnimal.ability.abilityInUse = true;
          }
          if (racingAnimal.ability.name === "Nap" && racingAnimal.type === AnimalTypeEnum.Hare) {
            var averageDistanceCovered = distancePerSecond * (1 / this.frameModifier);
            racingAnimal.ability.remainingLength -= averageDistanceCovered;
            if (racingAnimal.ability.remainingLength <= 0)
              racingAnimal.ability.remainingLength = 0;

            if (racingAnimal.ability.remainingLength > 0) {
              modifiedAccelerationMs = 0;
            }
          }
          if (racingAnimal.ability.name === "Buried Treasure" && racingAnimal.type === AnimalTypeEnum.Octopus) {
            /*if (framesInCurrentLeg < 8 * this.frameModifier) {
              modifiedAccelerationMs = 0;
            }*/
            var averageDistanceCovered = distancePerSecond * (1 / this.frameModifier);
            racingAnimal.ability.remainingLength -= averageDistanceCovered;
            if (racingAnimal.ability.remainingLength <= 0)
              racingAnimal.ability.remainingLength = 0;

            if (racingAnimal.ability.remainingLength > 0) {
              modifiedAccelerationMs = 0;
            }
          }
          if (racingAnimal.type === AnimalTypeEnum.Salamander && racingAnimal.ability.name === "Heat Up" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1 + (.15 * racingAnimal.ability.totalUseCount);
          }
          if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatLoss === "Acceleration" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= .75;
          }
          if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatGain === "Acceleration" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1.5;
          }
          if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Nine Tails") {
            modifiedAccelerationMs *= 1 + (this.getNineTailsBuffCount("Acceleration", nineTailsBuffs) * .15);
          }
          if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Graze") {
            modifiedAccelerationMs *= 1 + (this.getGrazeBuffCount("Acceleration", grazeBuffs) * .10);
          }
          if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Whalesong" && (racingAnimal.ability.totalUseCount === 3 || racingAnimal.ability.totalUseCount > 5) && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1.3;
          }
          if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.athleticTape)) {
            if (racingAnimal.raceVariables.isBursting)
              modifiedAccelerationMs *= .5;
          }
          if (longDistanceTalentIncreaseAccelerationWithLowVelocity) {
            modifiedAccelerationMs *= 1 + racingAnimal.talentTree.column2Row2Points * .05;
          }

          velocity += modifiedAccelerationMs / this.frameModifier;
        }

        if (velocity < 0 && !rollingInMud)
          velocity = 0;

        var modifiedMaxSpeed = racingAnimal.currentStats.maxSpeedMs;
        modifiedMaxSpeed *= item.terrain.maxSpeedModifier;

        modifiedMaxSpeed *= statLossFromExhaustion;

        if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Sprint" && racingAnimal.ability.abilityInUse) {
          modifiedMaxSpeed *= 1.35;
        }
        if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "On The Hunt") {
          modifiedMaxSpeed *= permanentMaxSpeedIncreaseMultiplier;
        }
        if (racingAnimal.ability.name === "Nap" && racingAnimal.type === AnimalTypeEnum.Hare) {
          modifiedMaxSpeed *= 2;
        }
        if (aheadOfAveragePace && racingAnimal.type === AnimalTypeEnum.Shark && racingAnimal.ability.name === "Blood In The Water") {
          modifiedMaxSpeed *= 1 + (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);
        }
        if ((nextAnimal !== null && nextAnimal.type === AnimalTypeEnum.Shark && nextAnimal.ability.name === "Feeding Frenzy") ||
          (lastAnimal !== null && lastAnimal.type === AnimalTypeEnum.Shark && lastAnimal.ability.name === "Feeding Frenzy")) {
          var feedingFrenzyNegativeModifier = .9;
          var feedingFrenzyNegativeModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "feedingFrenzyNegativeModifier");
          if (feedingFrenzyNegativeModifierPair !== undefined)
            feedingFrenzyNegativeModifier = feedingFrenzyNegativeModifierPair.value;
          modifiedMaxSpeed *= feedingFrenzyNegativeModifier;
        }
        if (racingAnimal.ability.name === "Feeding Frenzy" && racingAnimal.type === AnimalTypeEnum.Shark) {
          modifiedMaxSpeed *= feedingFrenzyIncreaseMultiplier;
        }
        if (racingAnimal.ability.name === "Quick Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin) {
          if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
            this.globalService.globalVar.eventRaceData.eventAbilityData.quickTobogganUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.quickTobogganUseCap)) {

            if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
              this.globalService.globalVar.eventRaceData.eventAbilityData.quickTobogganUseCount += 1;

            modifiedMaxSpeed *= permanentMaxSpeedIncreaseMultiplierObj.permanentMaxSpeedIncreaseMultiplier;
          }
        }
        if (racingAnimal.type === AnimalTypeEnum.Gecko && racingAnimal.ability.name === "Night Vision") {
          modifiedMaxSpeed *= permanentMaxSpeedIncreaseMultiplier;
        }
        if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatLoss === "Max Speed" && racingAnimal.ability.abilityInUse) {
          modifiedMaxSpeed *= .75;
        }
        if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatGain === "Max Speed" && racingAnimal.ability.abilityInUse) {
          modifiedMaxSpeed *= 1.5;
        }
        if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Fleeting Speed") {
          var percentComplete = Math.floor((currentDistanceInLeg / item.distance) * 100);
          var modifiedFleetingSpeedIncreaseMultiplier = fleetingSpeedIncreaseMultiplier;

          modifiedFleetingSpeedIncreaseMultiplier -= (percentComplete * .02) * (modifiedFleetingSpeedIncreaseMultiplier - 1);
          if (modifiedFleetingSpeedIncreaseMultiplier < 1)
            modifiedFleetingSpeedIncreaseMultiplier = 1;

          modifiedMaxSpeed *= modifiedFleetingSpeedIncreaseMultiplier;
        }
        if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Nine Tails") {
          modifiedMaxSpeed *= 1 + (this.getNineTailsBuffCount("Max Speed", nineTailsBuffs) * .15);
        }
        if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Graze") {
          modifiedMaxSpeed *= 1 + (this.getGrazeBuffCount("Max Speed", grazeBuffs) * .1);
        }
        if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Whalesong" && (racingAnimal.ability.totalUseCount >= 5) && racingAnimal.ability.abilityInUse) {
          modifiedMaxSpeed *= 1.3;
        }
        if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Storing Power") {
          if (racingAnimal.ability.abilityInUse) {
            var whalePowerStoredBase = modifiedMaxSpeed * .1;
            modifiedMaxSpeed *= .9;
          }

          modifiedMaxSpeed += whalePowerStored;
        }
        if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
          modifiedMaxSpeed *= 1 + ((racingAnimal.talentTree.column2Row4Points * .005) * racingAnimal.raceVariables.velocityReachesMaxSpeedCount);
        }

        //all max speed modifiers need to be above here

        //set max speed floor from long distance talent
        maxSpeedFloor = 0;
        if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
          if (velocity > modifiedMaxSpeed * (racingAnimal.talentTree.column2Row4Points * .005)) {
            maxSpeedFloor += modifiedMaxSpeed * (racingAnimal.talentTree.column2Row4Points * .005);
          }
        }

        if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Unparalleled Focus" && racingAnimal.ability.abilityInUse) {
          maxSpeedFloor += modifiedMaxSpeed * .2;
        }

        if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.incense)) {
          var defaultIncenseModifier = .9;
          var defaultIncenseModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "incenseEquipmentModifier");
          if (defaultIncenseModifierPair !== undefined)
            defaultIncenseModifier = defaultIncenseModifierPair.value;

          if (velocity >= modifiedMaxSpeed * defaultIncenseModifier)
            velocity = modifiedMaxSpeed;
        }

        if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance && velocity <= modifiedMaxSpeed * .25)
          longDistanceTalentIncreaseAccelerationWithLowVelocity = true;
        else
          longDistanceTalentIncreaseAccelerationWithLowVelocity = false;

        if (velocity > modifiedMaxSpeed) {
          velocity = modifiedMaxSpeed;

          if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint && racingAnimal.raceVariables.velocityReachesMaxSpeedCount < 10) {
            racingAnimal.raceVariables.velocityReachesMaxSpeedCount += 1;
          }
        }

        //new path
        if (!currentPath.checkedForBurst) {
          if (lastPath.didAnimalLoseFocus)
            pathsClearedWithoutLosingFocus = 0;
          else
            pathsClearedWithoutLosingFocus += 1;

          if (pathsClearedWithoutLosingFocus >= 3) {
            if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Unparalleled Focus") {
              racingAnimal.ability.abilityInUse = true;
              racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
              this.globalService.increaseAbilityXp(racingAnimal);
              raceResult.addRaceUpdate(framesPassed, animalDisplayName + "'s immense focus prevents their velocity from dropping too low.");
              pathsClearedWithoutLosingFocus = 0;
            }
          }
        }

        var doesRacerMiniBurst = this.doesRacerMiniBurst(racingAnimal, lastPath);
        var doesRacerBurst = this.doesRacerBurst(racingAnimal, currentPath, this.timeToComplete, race.length, distanceCovered, modifiedAdaptabilityMs, modifiedFocusMs);
        if (doesRacerBurst || doesRacerMiniBurst || herdMentalityBurst) {
          racingAnimal.raceVariables.isBursting = true;
          if (doesRacerBurst || herdMentalityBurst) {
            racingAnimal.raceVariables.remainingBurstMeters += this.getBurstDistance(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion, grazeBuffs);
          }
          if (doesRacerMiniBurst) {
            racingAnimal.raceVariables.remainingBurstMeters += this.getBurstDistance(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion, grazeBuffs) * (racingAnimal.talentTree.column1Row4Points * .05);
          }
          racingAnimal.raceVariables.burstCount += 1;

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
            var burstMoraleBoost = .02;
            var burstMoraleBoostPair = this.globalService.globalVar.modifiers.find(item => item.text === "burstMoraleBoostModifier");
            if (burstMoraleBoostPair !== null && burstMoraleBoostPair !== undefined)
              burstMoraleBoost = burstMoraleBoostPair.value;

            this.lookupService.changeGrandPrixMorale(racingAnimal.type, burstMoraleBoost);
          }

          if (racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Frenzy") {
            racingAnimal.raceVariables.remainingBurstMeters += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
            this.globalService.increaseAbilityXp(racingAnimal);
          }

          if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Prey Instinct" && !racingAnimal.ability.abilityUsed) {
            racingAnimal.raceVariables.remainingBurstMeters += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
            racingAnimal.ability.abilityUsed = true;
          }

          if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Storing Power") {
            whalePowerStored += whalePowerStoredBase;
          }

          if (racingAnimal.type === AnimalTypeEnum.Octopus && racingAnimal.ability.name === "Big Brain") {
            if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
              this.globalService.globalVar.eventRaceData.eventAbilityData.bigBrainUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.bigBrainUseCap)) {
              var burstCap = Math.round(item.pathData.length / 3);

              if (racingAnimal.raceVariables.burstCount === burstCap) {
                if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
                  this.globalService.globalVar.eventRaceData.eventAbilityData.bigBrainUseCount += 1;

                raceResult.addRaceUpdate(framesPassed, animalDisplayName + " uses " + racingAnimal?.ability.name + ".");
                var powerMultiplier = 1 + (this.lookupService.GetAbilityEffectiveAmount(racingAnimal!, item.terrain.powerModifier, statLossFromExhaustion) / 100);
                var length = this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix ?
                  this.globalService.globalVar.eventRaceData.totalDistance : this.selectedRace.length;

                this.AddRelayEffect(new Animal(), racingAnimal, length, new AnimalStats(1, 1, 1, powerMultiplier, 1, 1), true, RelayEffectEnum.bigBrain, true);
                var relayAbilityXpIncrease = 4;
                var relayAbilityXpIncreasePair = this.globalService.globalVar.modifiers.find(item => item.text === "relayAbilityXpGainModifier");
                if (relayAbilityXpIncreasePair !== undefined)
                  relayAbilityXpIncrease = relayAbilityXpIncreasePair.value;

                this.globalService.increaseAbilityXp(racingAnimal!, relayAbilityXpIncrease);
              }
            }
          }

          if (doesRacerBurst || herdMentalityBurst)
            raceResult.addRaceUpdate(framesPassed, "<strong>BURST!</strong> " + animalDisplayName + " is breaking their limit!");
          if (doesRacerMiniBurst)
            raceResult.addRaceUpdate(framesPassed, "<strong>MINI BURST!</strong> " + animalDisplayName + " is breaking their limit!");

          if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "On The Hunt") {
            if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
              this.globalService.globalVar.eventRaceData.eventAbilityData.onTheHuntUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.onTheHuntUseCap)) {

              if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
                this.globalService.globalVar.eventRaceData.eventAbilityData.onTheHuntUseCount += 1;

              var increaseAmount = (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);

              permanentMaxSpeedIncreaseMultiplier += increaseAmount;
              this.globalService.increaseAbilityXp(racingAnimal);
            }
          }

          if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Deep Breathing") {
            var staminaGain = animalMaxStamina * (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);
            racingAnimal.currentStats.stamina += staminaGain;
            raceResult.addRaceUpdate(framesPassed, animalDisplayName + " uses " + racingAnimal.ability.name + ".");

            if (racingAnimal.currentStats.stamina > animalMaxStamina) {
              //deepBreathingStaminaGain += racingAnimal.currentStats.stamina - animalMaxStamina;
              var staminaGain = racingAnimal.currentStats.stamina - animalMaxStamina;
              var distance = 0;

              if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
                this.globalService.globalVar.eventRaceData.eventAbilityData.deepBreathingUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.deepBreathingUseCap)) {

                if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
                  staminaGain *= .2;
                  this.globalService.globalVar.eventRaceData.eventAbilityData.deepBreathingUseCount += 1;
                }

                this.AddRelayEffect(new Animal(), racingAnimal, distance, new AnimalStats(0, 0, 0, 0, 0, 0), false, RelayEffectEnum.deepBreathing, true, staminaGain);
              }
              racingAnimal.currentStats.stamina = animalMaxStamina;
            }
            this.globalService.increaseAbilityXp(racingAnimal);
          }
        }
        //}

        var modifiedVelocity = velocity;
        //do any velocity modifications here before finalizing distance traveled per sec        
        if (camouflageVelocityGain > 0) {
          var relayEffect = this.lookupService.getRelayEffectFromListByType(racingAnimal.raceVariables.relayEffects, RelayEffectEnum.camouflage);
          if (relayEffect !== undefined && relayEffect.additionalValue !== undefined) {
            var percentOfLengthCovered = currentDistanceInLeg / relayEffect.remainingRelayMeters;
            if (percentOfLengthCovered > 1)
              percentOfLengthCovered = 1;

            modifiedVelocity += (1 - percentOfLengthCovered) * camouflageVelocityGain;
            if (modifiedVelocity > modifiedMaxSpeed * 1.5)
              modifiedVelocity = modifiedMaxSpeed * 1.5;
          }
        }

        //do modifier until you are about to run out of burst, then do it fractionally
        if (racingAnimal.raceVariables.isBursting) {
          currentRacerEffect = RacerEffectEnum.Burst;
          var burstModifier = 1.25;

          if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "In The Rhythm") {
            burstModifier += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100;
          }

          burstModifier += specialDeliveryMaxSpeedBonus;

          if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
            burstModifier += racingAnimal.raceVariables.burstCount * (racingAnimal.talentTree.column1Row2Points * .005);
          }

          if (racingAnimal.raceVariables.remainingBurstMeters >= modifiedVelocity / this.frameModifier) {
            modifiedVelocity *= burstModifier;
            racingAnimal.raceVariables.remainingBurstMeters -= modifiedVelocity / this.frameModifier;

            if (racingAnimal.raceVariables.remainingBurstMeters < 0) {
              //overshot the amount, add back the excess
              modifiedVelocity += racingAnimal.raceVariables.remainingBurstMeters;
              racingAnimal.raceVariables.remainingBurstMeters = 0;
            }
          }
          else {
            modifiedVelocity -= racingAnimal.raceVariables.remainingBurstMeters;
            modifiedVelocity += racingAnimal.raceVariables.remainingBurstMeters * burstModifier;
            racingAnimal.raceVariables.remainingBurstMeters = 0;
            racingAnimal.raceVariables.isBursting = false;
            raceResult.addRaceUpdate(framesPassed, animalDisplayName + "'s burst ends.");
          }

          if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint && !racingAnimal.raceVariables.velocityExceedsMaxSpeedDuringBurst &&
            modifiedVelocity > modifiedMaxSpeed && racingAnimal.raceVariables.isBursting) {
            racingAnimal.raceVariables.remainingBurstMeters += racingAnimal.raceVariables.remainingBurstMeters * (racingAnimal.talentTree.column2Row2Points * .05);
            racingAnimal.raceVariables.velocityExceedsMaxSpeedDuringBurst = true;
          }
        }

        //don't go further than distance to go
        var distanceCoveredPerFrame = modifiedVelocity / this.frameModifier;

        if (racingAnimal.ability.abilityInUse &&
          ((racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Leap") ||
            (racingAnimal.type === AnimalTypeEnum.Octopus && racingAnimal.ability.name === "Propulsion"))) {
          var totalDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          var extraDistanceCovered = totalDistance / racingAnimal.ability.totalFrames;

          distanceCoveredPerFrame += extraDistanceCovered;
          racingAnimal.ability.remainingFrames -= 1;
          if (racingAnimal.ability.remainingFrames <= 0) {
            racingAnimal.ability.abilityInUse = false;
          }
        }

        if (item.courseType === RaceCourseTypeEnum.Tundra) {
          var wallHit = this.handleTundraDrift(racingAnimal, currentPath, lastPath, isLastPathInLeg, modifiedAdaptabilityMs, item.terrain, currentDistanceInPath, distanceCoveredPerFrame, statLossFromExhaustion, permanentMaxSpeedIncreaseMultiplierObj, raceResult, animalDisplayName, framesPassed);

          if (wallHit) {
            distanceCoveredPerFrame = 0;
            velocity = 0;
            raceResult.addRaceUpdate(framesPassed, animalDisplayName + " slides into a wall and loses all momentum!");
          }
          else {
            var driftAmount = Math.abs(currentPath.driftAmount);
            var maxDriftAmount = 20;

            if (driftAmount <= maxDriftAmount && !isLastPathInLeg) {
              var driftModifier = 1 - (driftAmount / 100);
              distanceCoveredPerFrame *= driftModifier;
              modifiedMaxSpeed *= driftModifier;
            }
          }

          this.tundraPreviousYAmount = racingAnimal.raceVariables.icyCurrentYAmount;
        }
        if (item.courseType === RaceCourseTypeEnum.Volcanic) {
          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
            var percentOfLavaDropPerFrame = [0, 0, 0, 0, 0];
            this.selectedRace.raceUI.lavaFallPercentByFrame.push(percentOfLavaDropPerFrame);
          }
          else {
            var ranIntoLava = this.handleLavaFall(racingAnimal, framesInCurrentLeg, race.length / this.timeToComplete, currentDistanceInLeg, item.distance, raceResult, framesPassed, previousPassedLavaBreakpoint);

            if (ranIntoLava) {
              this.timeToComplete = framesPassed / this.frameModifier;
            }
          }
        }
        else if (this.selectedRace.raceLegs.some(item => item.courseType === RaceCourseTypeEnum.Volcanic)) {
          var percentOfLavaDropPerFrame: number[] = [];

          if (this.selectedRace.raceUI.lavaFallPercentByFrame.length > 0 &&
            this.selectedRace.raceUI.lavaFallPercentByFrame[this.selectedRace.raceUI.lavaFallPercentByFrame.length - 1][0] !== null &&
            this.selectedRace.raceUI.lavaFallPercentByFrame[this.selectedRace.raceUI.lavaFallPercentByFrame.length - 1][0] !== undefined &&
            this.selectedRace.raceUI.lavaFallPercentByFrame[this.selectedRace.raceUI.lavaFallPercentByFrame.length - 1][0] > 0)
            percentOfLavaDropPerFrame = this.selectedRace.raceUI.lavaFallPercentByFrame[this.selectedRace.raceUI.lavaFallPercentByFrame.length - 1];
          else
            percentOfLavaDropPerFrame = [0, 0, 0, 0, 0];

          this.selectedRace.raceUI.lavaFallPercentByFrame.push(percentOfLavaDropPerFrame);
        }

        distanceCovered += distanceCoveredPerFrame > distanceToGo ? distanceToGo : distanceCoveredPerFrame;
        distanceToGo -= distanceCoveredPerFrame;

        var precisionModifier = 1e5;
        if (this.timeToComplete * this.frameModifier > 20000) //333 seconds
          precisionModifier = 1e4;

        var distanceCoveredByFramePrecisionModifier = 1e5;
        if (this.timeToComplete * this.frameModifier > 20000) //333 seconds
          distanceCoveredByFramePrecisionModifier = 1e3;

        race.raceUI.distanceCoveredByFrame.push(Math.round(distanceCovered * distanceCoveredByFramePrecisionModifier) / distanceCoveredByFramePrecisionModifier);
        race.raceUI.velocityByFrame.push(Math.round(distanceCoveredPerFrame * precisionModifier) / precisionModifier);
        if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix))
          race.raceUI.timeToCompleteByFrame.push(this.timeToComplete);
        race.raceUI.maxSpeedByFrame.push(Math.round(modifiedMaxSpeed * precisionModifier) / precisionModifier);
        race.raceUI.staminaPercentByFrame.push((Math.round((racingAnimal.currentStats.stamina / animalMaxStamina) * precisionModifier) / precisionModifier));
        race.raceUI.racerEffectByFrame.push(currentRacerEffect);

        //console.log("Stamina By Frame: " + racingAnimal.currentStats.stamina + " / " + animalMaxStamina + " = " + (racingAnimal.currentStats.stamina / animalMaxStamina))

        this.handleRacePositionByFrame(race, distancePerSecond, framesPassed,
          this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix ?
            this.globalService.globalVar.eventRaceData.distanceCovered + distanceCovered : distanceCovered);

        this.handleStamina(racingAnimal, raceResult, distanceCoveredPerFrame, framesPassed, item.terrain, animalMaxStamina, currentDistanceInLeg, item, coldBloodedIncreaseMultiplierObj);

        if (!didAnimalLoseFocus)
          racingAnimal.raceVariables.metersSinceLostFocus += distanceCoveredPerFrame;

        //ability logic
        if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Nine Tails") {
          this.checkForNineTailsBuff(currentPath, nineTailsBuffs, racingAnimal, item, statLossFromExhaustion, raceResult, framesPassed, animalDisplayName);

          if (nineTailsBuffs.length > 0) {
            nineTailsBuffs.forEach(buff => {
              buff[1] -= distanceCoveredPerFrame;
            });

            nineTailsBuffs = nineTailsBuffs.filter(item => item[1] > 0);
          }
        }

        if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Graze") {
          if (grazeBuffs.length > 0) {
            grazeBuffs.forEach(buff => {
              buff[1] -= distanceCoveredPerFrame;
            });

            grazeBuffs = grazeBuffs.filter(item => item[1] > 0);
          }
        }

        if (racingAnimal.ability.abilityInUse && racingAnimal.ability.remainingLength > 0) {
          racingAnimal.ability.remainingLength -= distanceCoveredPerFrame;

          if (racingAnimal.type === AnimalTypeEnum.Gecko && racingAnimal.ability.name === "Camouflage") {
            racingAnimal.ability.remainingLength -= distanceCoveredPerFrame;
          }

          if (racingAnimal.ability.remainingLength <= 0) {
            racingAnimal.ability.abilityInUse = false;
            racingAnimal.ability.currentCooldown = racingAnimal.ability.cooldown;
            if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.pendant)) {
              var pendantCooldownModifier = .9;
              var pendantModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "pendantEquipmentModifier");
              if (pendantModifierPair !== undefined)
                pendantCooldownModifier = pendantModifierPair.value;
              racingAnimal.ability.currentCooldown *= pendantCooldownModifier;
            }

            if (racingAnimal.raceVariables !== null && racingAnimal.raceVariables !== undefined && racingAnimal.raceVariables.relayEffects !== null &&
              racingAnimal.raceVariables.relayEffects !== undefined && racingAnimal.raceVariables.relayEffects.length > 0) {

              var abilityCooldownRelayBonus = 1;
              var abilityCooldownRelayEffect = this.lookupService.getRelayEffectFromListByType(racingAnimal.raceVariables.relayEffects, RelayEffectEnum.supportAbilityCooldown);
              if (abilityCooldownRelayEffect !== undefined && abilityCooldownRelayEffect.additionalValue !== undefined) {
                abilityCooldownRelayBonus = abilityCooldownRelayEffect.additionalValue;
                racingAnimal.ability.currentCooldown *= abilityCooldownRelayBonus;
              }
            }
          }
        }

        if (racingAnimal.ability.currentCooldown !== undefined && racingAnimal.ability.currentCooldown !== null &&
          racingAnimal.ability.currentCooldown <= 0 && this.abilityRedundancyCheck(racingAnimal, velocity, currentPath, item, distanceToGo, statLossFromExhaustion)) {
          this.useAbility(racingAnimal, race, item, statLossFromExhaustion, animalMaxStamina, currentDistanceInLeg, coldBloodedIncreaseMultiplierObj, grazeBuffs, raceResult, framesPassed, animalDisplayName);
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = framesPassed;
          if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster")
            timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, ", gaining " + racingAnimal.ability.tricksterStatGain + " but losing " + racingAnimal.ability.tricksterStatLoss);
          else if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Whalesong") {
            if (racingAnimal.ability.totalUseCount === 1)
              timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Adaptability)");
            else if (racingAnimal.ability.totalUseCount === 2)
              timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Burst Distance)");
            else if (racingAnimal.ability.totalUseCount === 3)
              timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Acceleration)");
            else if (racingAnimal.ability.totalUseCount === 4)
              timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Focus)");
            else if (racingAnimal.ability.totalUseCount === 5)
              timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Max Speed)");
            else if (racingAnimal.ability.totalUseCount > 5)
              timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (All)");
          }
          else
            timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName);

          if (!(racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Graze"))
            raceResult.raceUpdates.push(timingUpdate);
          racingAnimal.ability.currentCooldown = racingAnimal.ability.cooldown;
          if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.pendant)) {
            var pendantCooldownModifier = .9;
            var pendantModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "pendantEquipmentModifier");
            if (pendantModifierPair !== undefined)
              pendantCooldownModifier = pendantModifierPair.value;
            racingAnimal.ability.currentCooldown *= pendantCooldownModifier;
          }

          if (racingAnimal.type === AnimalTypeEnum.Caribou && racingAnimal.ability.name === "Great Migration") {
            var lostStamina = animalMaxStamina * .1;
            racingAnimal.currentStats.stamina -= lostStamina;
            greatMigrationAccelerationIncreaseAdditive = lostStamina > 1 ? lostStamina * .25 : 1;
          }
        }

        if (racingAnimal.raceVariables.relayEffects !== null && racingAnimal.raceVariables.relayEffects !== undefined && racingAnimal.raceVariables.relayEffects.length > 0) {
          racingAnimal.raceVariables.relayEffects.forEach(effect => {
            if (effect.remainingRelayMeters <= distanceCoveredPerFrame) {
              effect.remainingRelayMeters = 0;

              if (effect.isMultiplicative)
                racingAnimal?.currentStats.divideCurrentRacingStats(effect.relayAffectedStatRatios);
              else
                racingAnimal?.currentStats.subtractCurrentRacingStats(effect.relayAffectedStatRatios);

              //ignore any immediate effect types
              if (effect.effectType !== RelayEffectEnum.deepBreathing && effect.effectType !== RelayEffectEnum.bigBrain &&
                effect.effectType !== RelayEffectEnum.specialDelivery)
                raceResult.addRaceUpdate(framesPassed, animalDisplayName + "'s relay effect " + this.lookupService.getRelayEffectNameByType(effect.effectType) + " ends.");
            }
            else {
              effect.remainingRelayMeters -= distanceCoveredPerFrame;
            }
          });

          racingAnimal.raceVariables.relayEffects = racingAnimal.raceVariables.relayEffects.filter(item => item.remainingRelayMeters > 0);
        }

        //Race housekeeping here
        var timeBetweenUpdates = 10;
        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
          timeBetweenUpdates = 20;

        if (framesPassed !== 0 && framesPassed !== this.timeToComplete && framesPassed % (timeBetweenUpdates * this.frameModifier) === 0) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = framesPassed;
          timingUpdate.text = this.getUpdateMessageByRelativeDistance(distancePerSecond, framesPassed,
            this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix ?
              this.globalService.globalVar.eventRaceData.distanceCovered + distanceCovered : distanceCovered,
            animalDisplayName);
          raceResult.raceUpdates.push(timingUpdate);
        }

        var passedAveragePace = false;
        var eventDistance = 0;
        var eventDistanceCovered = 0;
        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
          var timePassed = (this.globalService.globalVar.eventRaceData.grandPrixTimeLength + this.globalService.globalVar.eventRaceData.bonusTime) - this.globalService.getRemainingEventRaceTime();
          var averageDistancePassed = distancePerSecond * timePassed;
          eventDistance += averageDistancePassed;

          eventDistanceCovered = this.globalService.globalVar.eventRaceData.distanceCovered;
        }

        if (distanceCovered + eventDistanceCovered > distancePerSecond * (framesPassed / this.frameModifier) + eventDistance) {
          if (!aheadOfAveragePace)
            passedAveragePace = true;

          aheadOfAveragePace = true;
        }
        else {
          if (aheadOfAveragePace)
            passedAveragePace = true;

          aheadOfAveragePace = false;
        }

        //console.log("Racer at " + (distancePerSecond * (framesPassed / this.frameModifier) + eventDistance) + " You're at " + (distanceCovered + eventDistanceCovered) + " Ahead? " + aheadOfAveragePace);

        if (passedAveragePace && racingAnimal.type === AnimalTypeEnum.Shark && racingAnimal.ability.name === "Apex Predator" && !racingAnimal.ability.abilityUsed &&
          i > 1) //wait until second frame to start
        {
          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " bites the other racers as they pass, slowing them down.");
          var delayAmount = 1.5;
          racingAnimal.ability.abilityUsed = true;
          var effectiveDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          var percentOfRaceAffected = effectiveDistance / this.selectedRace.length;
          var raceTimeAffected = this.timeToComplete * percentOfRaceAffected;
          var delayedTime = raceTimeAffected * delayAmount;
          this.timeToComplete += delayedTime - raceTimeAffected;

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
            this.globalService.globalVar.eventRaceData.bonusTime += delayedTime - raceTimeAffected;

          this.globalService.increaseAbilityXp(racingAnimal);
        }

        if (timeToTusslePosition > 0 && distancePerSecond * (framesPassed / this.frameModifier) + eventDistance >= timeToTusslePosition &&
          distancePerSecond * ((framesPassed - 1) / this.frameModifier) + eventDistance < timeToTusslePosition) {
          var warthog = this.racingAnimals.find(animal => animal.type === AnimalTypeEnum.Warthog);

          if (warthog !== undefined) {
            var effectiveDistance = this.lookupService.GetAbilityEffectiveAmount(warthog, item.terrain.powerModifier);
            var averageDistancePerSecond = race.length / this.timeToComplete;

            if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
              averageDistancePerSecond = this.globalService.globalVar.eventRaceData.totalDistance / (this.globalService.globalVar.eventRaceData.grandPrixTimeLength + this.globalService.globalVar.eventRaceData.bonusTime);
              this.globalService.globalVar.eventRaceData.bonusTime += effectiveDistance / averageDistancePerSecond;
            }
            else {
              this.timeToComplete += effectiveDistance / averageDistancePerSecond;
            }
            timeToTusslePosition = 0;
            var warthogDisplayName = "<span class='coloredText flatlandColor'>" + warthog?.name + "</span>";
            raceResult.addRaceUpdate(framesPassed, warthogDisplayName + " tussles with the competition as they pass, slowing them down.");
          }
        }

        racingAnimal.ability.currentCooldown -= 1 / this.frameModifier;
        framesPassed += 1;

        if (distanceToGo <= 0) {
          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " finishes their leg of the race.");
          item.legComplete = true;
          legCounter += 1;

          if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Time To Tussle" && aheadOfAveragePace) {
            timeToTusslePosition = distanceCovered + eventDistanceCovered;
            this.globalService.increaseAbilityXp(racingAnimal);
          }

          this.preRacerResetRelayEffectCheck(racingAnimal, nextAnimal, raceResult, framesPassed, animalDisplayName, item, item, statLossFromExhaustion, modifiedVelocity, animalMaxStamina);

          if (racingAnimal.type === AnimalTypeEnum.Octopus && racingAnimal.ability.name === "Buried Treasure") {
            buriedTreasureModifier = 1.25;
          }

          if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
            this.globalService.globalVar.eventRaceData.animalAlreadyPrepped))
            this.PrepareRacingAnimal(raceResult, framesPassed, lastAnimalDisplayName, racingAnimal, undefined, undefined, undefined, statLossFromExhaustion, undefined, modifiedVelocity); //Reset so that stamina and such look correct on view pages
          else if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
            this.endOfLegRelayEffectCheck(racingAnimal, new Animal(), raceResult, framesPassed, lastAnimalDisplayName, item, item, statLossFromExhaustion, modifiedVelocity, modifiedFocusMs, modifiedAdaptabilityMs);
          }

          item.terrain.accelerationModifier = defaultTerrainAccelerationModifier;
          item.terrain.maxSpeedModifier = defaultTerrainMaxSpeedModifier;
          item.terrain.staminaModifier = defaultTerrainStaminaModifier;
          item.terrain.powerModifier = defaultTerrainPowerModifier;
          item.terrain.focusModifier = defaultTerrainFocusModifier;
          item.terrain.adaptabilityModifier = defaultTerrainAdaptabilityModifier;

          completedAnimals.push(racingAnimal);
          completedLegs.push(item);
          break;
        }

        if (framesPassed === this.timeToComplete * this.frameModifier) {
          item.terrain.accelerationModifier = defaultTerrainAccelerationModifier;
          item.terrain.maxSpeedModifier = defaultTerrainMaxSpeedModifier;
          item.terrain.staminaModifier = defaultTerrainStaminaModifier;
          item.terrain.powerModifier = defaultTerrainPowerModifier;
          item.terrain.focusModifier = defaultTerrainFocusModifier;
          item.terrain.adaptabilityModifier = defaultTerrainAdaptabilityModifier;
        }

        previousRacerVelocity = modifiedVelocity;
        previousRacerAdaptabilityMs = modifiedAdaptabilityMs;
        previousRacerFocusMs = modifiedFocusMs;
      }

      completedLegCount += 1;

      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        var segmentMoraleBoost = .05;
        var segmentMoraleBoostPair = this.globalService.globalVar.modifiers.find(item => item.text === "segmentCompleteMoraleBoostModifier");
        if (segmentMoraleBoostPair !== null && segmentMoraleBoostPair !== undefined)
          segmentMoraleBoost = segmentMoraleBoostPair.value;

        this.lookupService.changeGrandPrixMorale(racingAnimal.type, segmentMoraleBoost);

        this.globalService.globalVar.eventRaceData.previousRaceSegmentData = this.carryOverEventRaceSegmentData(racingAnimal, velocity, permanentMaxSpeedIncreaseMultiplier, permanentAdaptabilityIncreaseMultiplierObj.permanentAdaptabilityIncreaseMultiplier,
          permanentMaxSpeedIncreaseMultiplierObj.permanentMaxSpeedIncreaseMultiplier, feedingFrenzyIncreaseMultiplier, greatMigrationAccelerationIncreaseAdditive,
          coldBloodedIncreaseMultiplierObj.coldBloodedIncreaseMultiplier, fleetingSpeedIncreaseMultiplier, nineTailsBuffs, grazeBuffs,
          deepBreathingStaminaGain, longDistanceTalentIncreaseAccelerationWithLowVelocity, maxSpeedFloor, whalePowerStored, pathsClearedWithoutLosingFocus);
      }
    });

    if (!race.raceLegs.some(item => !item.legComplete)) {
      race.isCompleted = true;
      raceResult.wasSuccessful = true;
      raceResult.totalFramesPassed = framesPassed;
      raceResult.distanceCovered = race.raceUI.distanceCoveredByFrame[framesPassed - 1];
      
      raceResult.addRaceUpdate(framesPassed, "You won the race!");
    }
    else {
      raceResult.wasSuccessful = false;
      raceResult.totalFramesPassed = framesPassed;
      raceResult.distanceCovered = race.raceUI.distanceCoveredByFrame[framesPassed - 1];
      //console.log("Lost race somehow? "); //if you've changed event race start time, it triggers this
      raceResult.addRaceUpdate(framesPassed, "You lost the race...");
    }

    if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
      this.globalService.globalVar.eventRaceData.animalAlreadyPrepped)) {
      this.racingAnimals.forEach(animal => {
        //reset each racing animal
        this.PrepareRacingAnimal(raceResult, framesPassed, "", animal, undefined, undefined, undefined, undefined, true);
      });
    }

    this.globalService.globalVar.trackedStats.totalMetersRaced += distanceCovered;

    if (raceResult.wasSuccessful) {
      this.raceWasSuccessfulUpdate(raceResult, buriedTreasureModifier);
    }

    return raceResult;
  }

  getStaminaModifier(terrain: Terrain, racingAnimal: Animal, maxStamina: number, currentDistanceInLeg: number, currentLeg: RaceLeg, coldBloodedIncreaseMultiplier: number): number {
    var staminaModifier: number;
    var staminaModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "staminaModifier");
    if (staminaModifierPair === undefined)
      staminaModifier = .2;
    else
      staminaModifier = staminaModifierPair.value;

    if (terrain !== undefined && terrain !== null && terrain.staminaModifier !== undefined && terrain.staminaModifier !== null)
      staminaModifier *= terrain.staminaModifier;

    if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
      staminaModifier *= 1 + (racingAnimal.talentTree.column3Row2Points * .05);
    }

    if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance && (racingAnimal.currentStats.stamina / maxStamina) <= .35) {
      staminaModifier *= 1 - (racingAnimal.talentTree.column3Row2Points * .05);
    }

    //if warthog, cut stamina modifier down
    if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Mud Pit" && racingAnimal.ability.abilityInUse) {
      var staminaReduction = .25;
      staminaModifier *= 1 - staminaReduction;
    }

    //if salamander, cut stamina modifier down
    if (racingAnimal.type === AnimalTypeEnum.Salamander && racingAnimal.ability.name === "Cold Blooded" && racingAnimal.ability.abilityInUse) {
      staminaModifier *= 1 - coldBloodedIncreaseMultiplier;
    }

    return staminaModifier;
  }

  handleStamina(racingAnimal: Animal, raceResult: RaceResult, distanceCoveredPerFrame: number, framesPassed: number, terrain: Terrain, maxStamina: number, currentDistanceInLeg: number, currentLeg: RaceLeg, obj: { coldBloodedIncreaseMultiplier: number }) {
    var staminaModifier = this.getStaminaModifier(terrain, racingAnimal, maxStamina, currentDistanceInLeg, currentLeg, obj.coldBloodedIncreaseMultiplier);
    //if using Second Wind, don't reduce stamina at all
    if (!(racingAnimal.type === AnimalTypeEnum.Horse && racingAnimal.ability.name === "Second Wind" && racingAnimal.ability.abilityInUse)) {
      if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Sprint" && racingAnimal.ability.abilityInUse)
        racingAnimal.currentStats.stamina -= (distanceCoveredPerFrame * staminaModifier) * 2;
      else {
        racingAnimal.currentStats.stamina -= distanceCoveredPerFrame * staminaModifier;
      }
    }

    if (racingAnimal.currentStats.stamina < 0) {
      racingAnimal.currentStats.stamina = 0;
      racingAnimal.raceVariables.ranOutOfStamina = true;
    }
  }

  getBurstDistance(animal: Animal, terrainModifier: number, statLossFromExhaustion: number, grazeBuffs?: [string, number][]) {
    var breedLevelStatModifierValue = 0;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var powerAbilityModifier = 1;
    if (animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Trickster" && animal.ability.tricksterStatLoss === "Power" && animal.ability.abilityInUse) {
      powerAbilityModifier *= .75;
    }
    if (animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Trickster" && animal.ability.tricksterStatGain === "Power" && animal.ability.abilityInUse) {
      powerAbilityModifier *= 1.5;
    }
    if (animal.type === AnimalTypeEnum.Warthog && animal.ability.name === "Graze" && grazeBuffs !== undefined) {
      powerAbilityModifier *= 1 + (this.getGrazeBuffCount("Power", grazeBuffs) * .10);
    }

    var modifiedPowerMs = animal.currentStats.powerMs * powerAbilityModifier * terrainModifier * statLossFromExhaustion;

    var runningShoesModifier = 1;
    if (animal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.runningShoes)) {
      var defaultRunningShoesModifier = 1.2;
      var defaultRunningShoesModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "runningShoesEquipmentModifier");
      if (defaultRunningShoesModifierPair !== undefined)
        defaultRunningShoesModifier = defaultRunningShoesModifierPair.value;

      runningShoesModifier = 1 + (animal.raceVariables.burstCount * (defaultRunningShoesModifier - 1));
    }

    var burstDistanceRelayBonus = 0;
    var burstDistanceRelayEffect = this.lookupService.getRelayEffectFromListByType(animal.raceVariables.relayEffects, RelayEffectEnum.supportBurstDistance);
    if (burstDistanceRelayEffect !== undefined && burstDistanceRelayEffect.additionalValue !== undefined) {
      burstDistanceRelayBonus = burstDistanceRelayEffect.additionalValue;
    }

    var whalesongBurstDistanceBonus = 1;
    if (animal.type === AnimalTypeEnum.Whale && animal.ability.name === "Whalesong" && (animal.ability.totalUseCount === 2 || animal.ability.totalUseCount > 5) && animal.ability.abilityInUse) {
      whalesongBurstDistanceBonus *= 1.3;
    }

    return animal.currentStats.calculateBurstDistance(breedLevelStatModifierValue, undefined, modifiedPowerMs) * runningShoesModifier * whalesongBurstDistanceBonus + burstDistanceRelayBonus;
  }

  doesRacerMiniBurst(animal: Animal, lastPath: RacePath): boolean {
    var doesRacerMiniBurst = false;

    if (lastPath !== undefined && lastPath !== null && lastPath.isSpecialPath) {
      if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint && animal.talentTree.column1Row4Points > 0 &&
        !lastPath.didAnimalStumble && !lastPath.checkedForMiniBurst) {
        doesRacerMiniBurst = true;
      }

      lastPath.checkedForMiniBurst = true;
    }
    return doesRacerMiniBurst;
  }

  getBurstChance(animal: Animal, modifiedFocusMs?: number, modifiedAdaptabilityMs?: number) {
    var distanceModifier = 1000 / this.selectedRace.length;

    var breedLevelStatModifierValue = 0;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));
    var modifiedBurstChance = animal.currentStats.calculateBurstChance(breedLevelStatModifierValue, modifiedFocusMs, modifiedAdaptabilityMs) * distanceModifier;

    if (animal.type === AnimalTypeEnum.Warthog && animal.ability.name === "Mud Pit" && animal.ability.abilityInUse) {
      modifiedBurstChance *= 1.25;
    }

    var burstChanceRelayBonus = 0;
    var burstChanceRelayEffect = this.lookupService.getRelayEffectFromListByType(animal.raceVariables.relayEffects, RelayEffectEnum.supportBurstChance);
    if (burstChanceRelayEffect !== undefined && burstChanceRelayEffect.additionalValue !== undefined) {
      burstChanceRelayBonus = burstChanceRelayEffect.additionalValue;
    }

    return modifiedBurstChance + burstChanceRelayBonus;
  }

  doesRacerBurst(animal: Animal, currentPath: RacePath, timeToComplete: number, raceLength: number, currentDistanceInRace: number, modifiedAdaptabilityMs: number, modifiedFocusMs: number): boolean {
    var modifiedBurstChance = this.getBurstChance(animal, modifiedFocusMs, modifiedAdaptabilityMs);

    if (currentPath.checkedForBurst)
      return false;

    currentPath.checkedForBurst = true;

    //way to check for new path
    if (animal.ability.name === "Night Vision" && animal.type === AnimalTypeEnum.Gecko)
      animal.ability.abilityInUse = false;

    if (animal.type === AnimalTypeEnum.Hare && animal.ability.name === "Prey Instinct" && !animal.ability.abilityUsed) {
      return true;
    }

    if (currentPath.isSpecialPath) {
      var racerMaps = this.lookupService.getResourceByName("Course Maps");
      if (racerMaps === undefined || racerMaps === null)
        racerMaps = 0;

      if (racerMaps > 0) {
        var racerMapModifier = 1;

        var racerMapModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "racerMapsModifier");
        if (racerMapModifierPair !== undefined && racerMapModifierPair !== null)
          racerMapModifier = 1 + (racerMaps * racerMapModifierPair.value);

        modifiedBurstChance *= racerMapModifier;
      }
    }

    var rng = this.utilityService.getRandomNumber(1, 100);

    if (rng <= (modifiedBurstChance + 1))
      return true;
    return false;
  }


  raceWasSuccessfulUpdate(raceResult: RaceResult, buriedTreasureModifier: number): void {
    var octopus = this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Octopus);
    var octopusDisplayName = "<span class='coloredText waterColor'>" + octopus?.name + "</span>";

    var globalCircuitRank = this.globalService.globalVar.circuitRank;
    var globalRaceVal: Race | undefined;
    var breedGaugeIncrease = 0;

    if (this.selectedRace.isCircuitRace) {
      globalRaceVal = this.globalService.globalVar.circuitRaces.find(item => item.raceId === this.selectedRace.raceId);

      var circuitRankRaces = this.globalService.globalVar.circuitRaces.filter(item => item.requiredRank === globalCircuitRank);
      if (circuitRankRaces.every(item => item.isCompleted)) {
        this.selectedRace.circuitIncreaseReward = this.globalService.IncreaseCircuitRank();
        this.selectedRace.rewards.push(this.initializeService.initializeResource("Medals", 1, ShopItemTypeEnum.Resources));
      }
    }
    else {
      globalRaceVal = this.globalService.globalVar.localRaces
        .find(item => item.raceId === this.selectedRace.raceId && item.localRaceType === this.selectedRace.localRaceType);

      if (this.selectedRace.localRaceType === LocalRaceTypeEnum.Free) {
        var internationalRaceItem = this.globalService.globalVar.resources.find(item => item.name === "International Races");
        var nationalRaceItem = this.globalService.globalVar.resources.find(item => item.name === "National Races");
        if (internationalRaceItem !== undefined && internationalRaceItem !== null && internationalRaceItem.amount > 0) {
          var internationalRaceCountNeeded = 5;
          var internationalRaceCountNeededModifier = this.globalService.globalVar.modifiers.find(item => item.text === "internationalRacesToMedalModifier");
          if (internationalRaceCountNeededModifier !== undefined && internationalRaceCountNeededModifier !== null)
            internationalRaceCountNeeded = internationalRaceCountNeededModifier.value;

          if (this.globalService.globalVar.nationalRaceCountdown >= internationalRaceCountNeeded) {
            this.selectedRace.rewards.push(this.initializeService.initializeResource("Medals", 1, ShopItemTypeEnum.Resources));
            this.globalService.globalVar.nationalRaceCountdown = 0;
          }
        }
        else if (nationalRaceItem !== undefined && nationalRaceItem !== null && nationalRaceItem.amount > 0) {
          var nationalRaceCountNeeded = 12;
          var nationalRaceCountNeededModifier = this.globalService.globalVar.modifiers.find(item => item.text === "nationalRacesToMedalModifier");
          if (nationalRaceCountNeededModifier !== undefined && nationalRaceCountNeededModifier !== null)
            nationalRaceCountNeeded = nationalRaceCountNeededModifier.value;

          if (this.globalService.globalVar.nationalRaceCountdown >= nationalRaceCountNeeded) {
            this.selectedRace.rewards.push(this.initializeService.initializeResource("Medals", 1, ShopItemTypeEnum.Resources));
            this.globalService.globalVar.nationalRaceCountdown = 0;
          }
        }
        else { //default amount
          var freeRaceCountNeeded = 50;
          var freeRaceCountNeededModifier = this.globalService.globalVar.modifiers.find(item => item.text === "freeRacesToMedalModifier");
          if (freeRaceCountNeededModifier !== undefined && freeRaceCountNeededModifier !== null)
            freeRaceCountNeeded = freeRaceCountNeededModifier.value;

          if (this.globalService.globalVar.nationalRaceCountdown >= freeRaceCountNeeded) {
            this.selectedRace.rewards.push(this.initializeService.initializeResource("Medals", 1, ShopItemTypeEnum.Resources));
            this.globalService.globalVar.nationalRaceCountdown = 0;
          }
        }
      }
    }

    if (this.selectedRace.localRaceType !== LocalRaceTypeEnum.Free && this.selectedRace.localRaceType !== LocalRaceTypeEnum.Track) {
      if (globalRaceVal === undefined)
        return;

      if (this.selectedRace.localRaceType === LocalRaceTypeEnum.Mono) {
        var courseType = this.selectedRace.raceLegs[0].courseType;
        this.globalService.globalVar.lastMonoRaceCourseType = courseType;
      }

      this.globalService.IncreaseLocalRaceRank(this.selectedRace.localRaceType);
      globalRaceVal.isCompleted = true;
    }
    else if (this.selectedRace.localRaceType === LocalRaceTypeEnum.Free) {
      this.globalService.globalVar.nationalRaceCountdown += 1;
    }

    this.racingAnimals.forEach(animal => {
      if (this.selectedRace.isCircuitRace)
        breedGaugeIncrease = this.lookupService.getCircuitBreedGaugeIncrease(animal);
      else if (this.selectedRace.raceType !== RaceTypeEnum.trainingTrack)
        breedGaugeIncrease = this.lookupService.getLocalBreedGaugeIncrease(animal);

      this.globalService.IncreaseAnimalBreedGauge(animal, breedGaugeIncrease);
    });

    if (this.selectedRace.localRaceType !== LocalRaceTypeEnum.Track)
      raceResult.beatMoneyMark = this.checkMoneyMark(raceResult);
    else
      this.handleTrackRaceRewards(raceResult);

    if (this.selectedRace.rewards !== undefined && this.selectedRace.rewards !== null) {
      this.selectedRace.rewards.forEach(item => {
        if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
          if (this.globalService.globalVar.resources.some(x => x.name === item.name)) {
            var globalResource = this.globalService.globalVar.resources.find(x => x.name === item.name);
            if (globalResource !== null && globalResource !== undefined) {
              if (this.selectedRace.localRaceType !== LocalRaceTypeEnum.Track) {
                if (globalResource.name === "Coins") {
                  //adjust for money mark
                  //console.log("Base Amount: " + item.amount);
                  if (raceResult.beatMoneyMark) {
                    raceResult.addRaceUpdate(raceResult.totalFramesPassed, "You beat the money mark!");

                    var defaultMoneyMarkModifier = 1.25;
                    var moneyMarkModifier = this.globalService.globalVar.modifiers.find(item => item.text === "moneyMarkRewardModifier");
                    if (moneyMarkModifier !== undefined && moneyMarkModifier !== null) {
                      defaultMoneyMarkModifier = moneyMarkModifier.value;
                    }

                    item.amount = Math.round(item.amount * defaultMoneyMarkModifier);
                    //console.log("* 1.25 for Money Mark: " + item.amount);
                  }

                  //adjust for renown                
                  var currentRenown = this.lookupService.getRenown();
                  item.amount = Math.round(item.amount * this.lookupService.getRenownCoinModifier(currentRenown, false));
                  //console.log("* " + this.lookupService.getRenownCoinModifier(currentRenown, false) + " for Renown: " + item.amount);

                  //adjust for buried treasure
                  if (buriedTreasureModifier > 1)
                    raceResult.addRaceUpdate(raceResult.totalFramesPassed, octopusDisplayName + " finds buried treasure at the bottom of the ocean!");
                  item.amount = Math.round(item.amount * buriedTreasureModifier);

                  globalResource.amount += item.amount;
                  //console.log("* " + buriedTreasureModifier + " for Buried Treasure: " + item.amount);
                }
                else if (globalResource.name === "Facility Level") {
                  globalResource.amount += item.amount;
                  this.lookupService.recalculateAllAnimalStats();
                }
                else if (globalResource.name === "Renown") {
                  globalResource.amount = parseFloat((globalResource.amount + item.amount).toFixed(3));
                }
                else
                  globalResource.amount += item.amount;
              }
              else {
                globalResource.amount += item.amount;
              }
            }
          }
          else {
            if (item.name === "Bonus Breed XP Gain From Training" && item.itemType === ShopItemTypeEnum.Other) {
              var courseType = this.selectedRace.raceLegs[0].courseType;
              var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
              if (racingAnimal !== undefined && racingAnimal !== null)
                racingAnimal.miscStats.bonusBreedXpGainFromTraining += item.amount;
            }
            else if (item.name === "Bonus Breed XP Gain From Free Races" && item.itemType === ShopItemTypeEnum.Other) {
              var courseType = this.selectedRace.raceLegs[0].courseType;
              var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
              if (racingAnimal !== undefined && racingAnimal !== null)
                racingAnimal.miscStats.bonusBreedXpGainFromLocalRaces += item.amount;
            }
            else if (item.name === "Bonus Breed XP Gain From Circuit Races" && item.itemType === ShopItemTypeEnum.Other) {
              var courseType = this.selectedRace.raceLegs[0].courseType;
              var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
              if (racingAnimal !== undefined && racingAnimal !== null)
                racingAnimal.miscStats.bonusBreedXpGainFromCircuitRaces += item.amount;
            }
            else if (item.name === "Training Time Reduction" && item.itemType === ShopItemTypeEnum.Other) {
              var courseType = this.selectedRace.raceLegs[0].courseType;
              var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
              if (racingAnimal !== undefined && racingAnimal !== null)
                racingAnimal.miscStats.trainingTimeReduction += item.amount;
            }
            else if (item.name === "Diminishing Returns per Facility Level" && item.itemType === ShopItemTypeEnum.Other) {
              var courseType = this.selectedRace.raceLegs[0].courseType;
              var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
              if (racingAnimal !== undefined && racingAnimal !== null)
                racingAnimal.miscStats.diminishingReturnsBonus += item.amount;
            }
            else if (item.name === "Orb Pendant" && item.itemType === ShopItemTypeEnum.Other) {
              var courseType = this.selectedRace.raceLegs[0].courseType;
              var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
              if (racingAnimal !== undefined && racingAnimal !== null)
                racingAnimal.canEquipOrb = true;
            }
            else if (item.name === "Bonus Talents" && item.itemType === ShopItemTypeEnum.Other) {
              var courseType = this.selectedRace.raceLegs[0].courseType;
              var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
              if (racingAnimal !== undefined && racingAnimal !== null)
                racingAnimal.miscStats.bonusTalents += item.amount;
            }
            else
              this.globalService.globalVar.resources.push(new ResourceValue(item.name, item.amount, item.itemType));
          }
        }
      });
    }
    else if (this.selectedRace.localRaceType === LocalRaceTypeEnum.Track) {
      //do your own thing here
    }
  }

  checkMoneyMark(result: RaceResult): boolean {
    var beatMoneyMark = false;

    var moneyMarkIsUnlocked = this.lookupService.getResourceByName("Money Mark");
    if (moneyMarkIsUnlocked === 0)
      return beatMoneyMark;

    var moneyMarkPace = this.globalService.globalVar.modifiers.find(item => item.text === "moneyMarkPaceModifier");
    if (moneyMarkPace === undefined || moneyMarkPace === null)
      return beatMoneyMark;

    var totalRaceTime = this.timeToComplete * this.frameModifier;

    if (result.totalFramesPassed <= totalRaceTime * moneyMarkPace.value) {
      beatMoneyMark = true;
    }

    return beatMoneyMark;
  }

  handleTrackRaceRewards(result: RaceResult) {
    if (this.selectedRace.raceLegs.length !== 1)
      return;
    var courseType = this.selectedRace.raceLegs[0].courseType;
    var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === courseType);
    if (racingAnimal === undefined)
      return;

    var track = null;
    if (this.selectedRace.trackRaceType === TrackRaceTypeEnum.novice)
      track = racingAnimal.allTrainingTracks.noviceTrack;
    if (this.selectedRace.trackRaceType === TrackRaceTypeEnum.intermediate)
      track = racingAnimal.allTrainingTracks.intermediateTrack;
    if (this.selectedRace.trackRaceType === TrackRaceTypeEnum.master)
      track = racingAnimal.allTrainingTracks.masterTrack;

    if (track === null)
      return;

    var totalRaceTime = this.timeToComplete * this.frameModifier;
    var trackPaceModifierValue = .25;
    var trackPaceModifierValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingTrackPaceModifier");
    if (trackPaceModifierValuePair !== undefined)
      trackPaceModifierValue = trackPaceModifierValuePair.value;

    for (var i = 0; i < track.totalRewards; i++) {
      if (i < track.rewardsObtained)
        continue;

      var paceModifier = 1 + (trackPaceModifierValue * (i));

      if (result.totalFramesPassed <= (totalRaceTime / paceModifier)) {
        track.rewardsObtained = i + 1;
        if (track.rewardsObtained === track.totalRewards) {
          if (this.selectedRace.trackRaceType === TrackRaceTypeEnum.novice)
            racingAnimal.allTrainingTracks.intermediateTrackAvailable = true;
          if (this.selectedRace.trackRaceType === TrackRaceTypeEnum.intermediate)
            racingAnimal.allTrainingTracks.masterTrackAvailable = true;
        }

        if (this.selectedRace.rewards === undefined || this.selectedRace.rewards === null)
          this.selectedRace.rewards = [];
        this.selectedRace.rewards.push(track.rewards[i]);
      }
    }

    if (this.selectedRace.rewards !== undefined && this.selectedRace.rewards !== null)
      this.selectedRace.rewards = this.utilityService.condenseList(this.selectedRace.rewards);
  }

  getUpdateMessageByRelativeDistance(distancePerSecond: number, framesPassed: number, distanceCovered: number, animalName: string): string {
    var timingUpdateMessage = animalName;

    var expectedDistance = distancePerSecond * (framesPassed / this.frameModifier);

    if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
      var timePassed = (this.globalService.globalVar.eventRaceData.grandPrixTimeLength + this.globalService.globalVar.eventRaceData.bonusTime) - this.globalService.getRemainingEventRaceTime();
      var averageDistancePassed = distancePerSecond * timePassed;
      expectedDistance += averageDistancePassed;
    }

    if (distanceCovered < expectedDistance * .5)
      timingUpdateMessage = "Is " + animalName + " <strong>even moving?!</strong>";
    else if (distanceCovered < expectedDistance * .75)
      timingUpdateMessage = animalName + " is <strong>falling out of the race!</strong>";
    else if (distanceCovered < expectedDistance * .9)
      timingUpdateMessage = animalName + " is <strong>just a step behind everyone else!</strong>";
    else if (distanceCovered >= expectedDistance * .9 && distanceCovered <= expectedDistance * 1.1)
      timingUpdateMessage = animalName + " is <strong>right on pace!</strong>";
    else if (distanceCovered >= expectedDistance * 1.5)
      timingUpdateMessage = animalName + " <strong>CANNOT be caught!!</strong>";
    else if (distanceCovered >= expectedDistance * 1.25)
      timingUpdateMessage = animalName + " is <strong>WAY ahead of the pack!</strong>";
    else if (distanceCovered >= expectedDistance * 1.1)
      timingUpdateMessage = animalName + " is <strong>barely leading the pack!</strong>";

    return timingUpdateMessage;
  }

  PrepareRacingAnimal(raceResult: RaceResult, framesPassed: number, lastAnimalDisplayName: string, animal: Animal, completedAnimals?: Animal[], currentLeg?: RaceLeg, previousLeg?: RaceLeg, statLossFromExhaustion?: number, raceFinished?: boolean, modifiedVelocity?: number, modifiedFocusMs?: number, modifiedAdaptabilityMs?: number) {
    if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
      this.globalService.globalVar.eventRaceData.animalAlreadyPrepped = true;

    animal.ability.currentCooldown = animal.ability.cooldown;
    animal.ability.remainingLength = 0;
    animal.ability.totalUseCount = 0;
    if (animal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.pendant)) {
      var pendantCooldownModifier = .9;
      var pendantModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "pendantEquipmentModifier");
      if (pendantModifierPair !== undefined)
        pendantCooldownModifier = pendantModifierPair.value;
      animal.ability.currentCooldown *= pendantCooldownModifier;
    }

    if (animal.raceVariables !== null && animal.raceVariables !== undefined && animal.raceVariables.relayEffects !== null &&
      animal.raceVariables.relayEffects !== undefined && animal.raceVariables.relayEffects.length > 0) {
      var abilityCooldownRelayBonus = 1;
      var abilityCooldownRelayEffect = this.lookupService.getRelayEffectFromListByType(animal.raceVariables.relayEffects, RelayEffectEnum.supportAbilityCooldown);
      if (abilityCooldownRelayEffect !== undefined && abilityCooldownRelayEffect.additionalValue !== undefined) {
        abilityCooldownRelayBonus = abilityCooldownRelayEffect.additionalValue;
        animal.ability.currentCooldown *= abilityCooldownRelayBonus;
      }
    }

    animal.ability.abilityUsed = false;
    animal.ability.abilityInUse = false;
    if (animal.raceVariables !== null && animal.raceVariables !== undefined) {
      animal.raceVariables.ranOutOfStamina = false;
      animal.raceVariables.burstCount = 0;
      animal.raceVariables.metersSinceLostFocus = 0;
      animal.raceVariables.hasLostFocusDuringRace = false;
      animal.raceVariables.firstAbilityUseEffectApplied = false;
      animal.raceVariables.velocityExceedsMaxSpeedDuringBurst = false;
      animal.raceVariables.velocityReachesMaxSpeedCount = 0;
    }

    this.globalService.calculateAnimalRacingStats(animal);

    if (raceFinished !== true) {
      if (completedAnimals !== undefined && completedAnimals !== null && completedAnimals.length > 0) {
        var lastCompletedAnimal = completedAnimals[completedAnimals.length - 1];
        this.endOfLegRelayEffectCheck(lastCompletedAnimal, animal, raceResult, framesPassed, lastAnimalDisplayName, currentLeg, previousLeg, statLossFromExhaustion, modifiedVelocity, modifiedFocusMs, modifiedAdaptabilityMs);
      }

      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        this.globalService.globalVar.eventRaceData.queuedRelayEffects.forEach(effect => {
          animal.raceVariables.relayEffects.push(effect.makeCopy());
        });

        if (this.globalService.globalVar.eventRaceData.queuedRelayEffects.length > 0)
          this.globalService.globalVar.eventRaceData.queuedRelayEffects = this.globalService.globalVar.eventRaceData.queuedRelayEffects.filter(item => item.affectsAllRacers);
      }

      if (animal.raceVariables.relayEffects !== null && animal.raceVariables.relayEffects !== undefined && animal.raceVariables.relayEffects.length > 0) {
        animal.raceVariables.relayEffects.forEach(effect => {
          if (effect.isMultiplicative)
            animal.currentStats.multiplyCurrentRacingStats(effect.relayAffectedStatRatios);
          else
            animal.currentStats.addCurrentRacingStats(effect.relayAffectedStatRatios);
        });
      }
    }
  }

  //this set of relay effects is called before race variables/stats are reset from them finishing the race
  preRacerResetRelayEffectCheck(animalGivingRelayEffect: Animal, animalReceivingRelayEffect: Animal | null, raceResult: RaceResult, framesPassed: number, animalDisplayName: string, currentLeg?: RaceLeg, previousLeg?: RaceLeg, statLossFromExhaustion?: number, modifiedVelocity?: number, animalMaxStamina?: number) {
    var relayAbilityXpIncrease = 4;
    var relayAbilityXpIncreasePair = this.globalService.globalVar.modifiers.find(item => item.text === "relayAbilityXpGainModifier");
    if (relayAbilityXpIncreasePair !== undefined)
      relayAbilityXpIncrease = relayAbilityXpIncreasePair.value;

    if (animalReceivingRelayEffect === null)
      animalReceivingRelayEffect = new Animal();

    if (previousLeg !== null && previousLeg !== undefined) {
      if (animalGivingRelayEffect.type === AnimalTypeEnum.Caribou && animalGivingRelayEffect.ability.name === "Herd Mentality" && !animalGivingRelayEffect.raceVariables.ranOutOfStamina) {
        var herdMentalityStaminaGain = animalGivingRelayEffect.currentStats.stamina * (this.lookupService.GetAbilityEffectiveAmount(animalGivingRelayEffect, previousLeg.terrain.powerModifier, statLossFromExhaustion) / 100);
        var distance = 0;

        if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
          this.globalService.globalVar.eventRaceData.eventAbilityData.herdMentalityUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.herdMentalityUseCap)) {

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
            this.globalService.globalVar.eventRaceData.eventAbilityData.herdMentalityUseCount += 1;

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " uses " + animalGivingRelayEffect.ability.name + ".");
          this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, distance, new AnimalStats(0, 0, 0, 0, 0, 0), false, RelayEffectEnum.herdMentality, false, herdMentalityStaminaGain);
          this.globalService.increaseAbilityXp(animalGivingRelayEffect, relayAbilityXpIncrease);
        }
      }
      
      if (animalGivingRelayEffect.type === AnimalTypeEnum.Caribou && animalGivingRelayEffect.ability.name === "Special Delivery" && !animalGivingRelayEffect.raceVariables.ranOutOfStamina) {
        if (animalMaxStamina === undefined)
          animalMaxStamina = 1;

        if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
          this.globalService.globalVar.eventRaceData.eventAbilityData.specialDeliveryUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.specialDeliveryUseCap)) {

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
            this.globalService.globalVar.eventRaceData.eventAbilityData.specialDeliveryUseCount += 1;

          //should last the entire time
          var distance = this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix ?
            this.globalService.globalVar.eventRaceData.totalDistance : this.selectedRace.length;

          var remainingStaminaPercent = (animalGivingRelayEffect.currentStats.stamina / animalMaxStamina);
          if (remainingStaminaPercent > 1)
            remainingStaminaPercent = 1;
          var specialDeliveryMaxSpeedBonus = remainingStaminaPercent * (this.lookupService.GetAbilityEffectiveAmount(animalGivingRelayEffect, previousLeg.terrain.powerModifier, statLossFromExhaustion) / 100);
          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
            specialDeliveryMaxSpeedBonus *= .2;

          this.AddRelayEffect(animalGivingRelayEffect, animalGivingRelayEffect, distance, new AnimalStats(0, 0, 0, 0, 0, 0), false, RelayEffectEnum.specialDelivery, true, specialDeliveryMaxSpeedBonus);
          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " uses " + animalGivingRelayEffect.ability.name + ".");
          this.globalService.increaseAbilityXp(animalGivingRelayEffect, relayAbilityXpIncrease);
        }
      }
    }
  }

  endOfLegRelayEffectCheck(animalGivingRelayEffect: Animal, animalReceivingRelayEffect: Animal, raceResult: RaceResult, framesPassed: number, lastAnimalDisplayName: string, currentLeg?: RaceLeg, previousLeg?: RaceLeg, statLossFromExhaustion?: number, modifiedVelocity?: number, modifiedFocusMs?: number, modifiedAdaptabilityMs?: number, reducedDistanceAmount: number = 1) {
    var relayAbilityXpIncrease = 4;
    var relayAbilityXpIncreasePair = this.globalService.globalVar.modifiers.find(item => item.text === "relayAbilityXpGainModifier");
    if (relayAbilityXpIncreasePair !== undefined)
      relayAbilityXpIncrease = relayAbilityXpIncreasePair.value;

    if (animalGivingRelayEffect.ability.name === "Inspiration" && animalGivingRelayEffect.type === AnimalTypeEnum.Horse) {
      if (previousLeg !== undefined && previousLeg !== null) {
        var length = this.lookupService.GetAbilityEffectiveAmount(animalGivingRelayEffect, previousLeg.terrain.powerModifier, statLossFromExhaustion);
        var additiveAmount = animalGivingRelayEffect.currentStats.maxSpeedMs * .25;
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(additiveAmount, 0, 0, 0, 0, 0), false, RelayEffectEnum.inspiration, false);
        raceResult.addRaceUpdate(framesPassed, lastAnimalDisplayName + " uses " + animalGivingRelayEffect.ability.name + ".");
        this.globalService.increaseAbilityXp(animalGivingRelayEffect, relayAbilityXpIncrease);

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
          this.globalService.globalVar.eventRaceData.eventAbilityData.inspirationUseCount += 1;
      }
    }

    if (animalGivingRelayEffect.ability.name === "Flowing Current" && animalGivingRelayEffect.type === AnimalTypeEnum.Dolphin) {
      if (previousLeg !== undefined && previousLeg !== null) {
        var length = this.lookupService.GetAbilityEffectiveAmount(animalGivingRelayEffect, previousLeg.terrain.powerModifier, statLossFromExhaustion);
        var additiveAmount = animalGivingRelayEffect.currentStats.accelerationMs * .25;
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(0, additiveAmount, 0, 0, 0, 0), false, RelayEffectEnum.flowingCurrent, false);
        raceResult.addRaceUpdate(framesPassed, lastAnimalDisplayName + " uses " + animalGivingRelayEffect.ability.name + ".");
        this.globalService.increaseAbilityXp(animalGivingRelayEffect, relayAbilityXpIncrease);

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
          this.globalService.globalVar.eventRaceData.eventAbilityData.flowingCurrentUseCount += 1;
      }
    }

    if (animalGivingRelayEffect.ability.name === "Navigator" && animalGivingRelayEffect.type === AnimalTypeEnum.Dolphin) {
      if (previousLeg !== undefined && previousLeg !== null) {
        var length = this.lookupService.GetAbilityEffectiveAmount(animalGivingRelayEffect, previousLeg.terrain.powerModifier, statLossFromExhaustion);
        var additiveAmount = animalGivingRelayEffect.currentStats.adaptabilityMs * .25;
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(0, 0, 0, 0, 0, additiveAmount), false, RelayEffectEnum.navigator, false);
        raceResult.addRaceUpdate(framesPassed, lastAnimalDisplayName + " uses " + animalGivingRelayEffect?.ability.name + ".");
        this.globalService.increaseAbilityXp(animalGivingRelayEffect, relayAbilityXpIncrease);

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
          this.globalService.globalVar.eventRaceData.eventAbilityData.navigatorUseCount += 1;
      }
    }

    if (animalGivingRelayEffect.type === AnimalTypeEnum.Gecko && animalGivingRelayEffect.ability.name === "Camouflage") {
      if (previousLeg !== undefined && previousLeg !== null) {
        var additionalEffect = modifiedVelocity;
        var length = this.lookupService.GetAbilityEffectiveAmount(animalGivingRelayEffect, previousLeg.terrain.powerModifier, statLossFromExhaustion);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(0, 0, 0, 0, 0, 0), false, RelayEffectEnum.camouflage, false, additionalEffect);
        raceResult.addRaceUpdate(framesPassed, lastAnimalDisplayName + " uses " + animalGivingRelayEffect.ability.name + ".");
        this.globalService.increaseAbilityXp(animalGivingRelayEffect, relayAbilityXpIncrease);

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
          this.globalService.globalVar.eventRaceData.eventAbilityData.camouflageUseCount += 1;
      }
    }


    if (currentLeg !== undefined) {
      var terrain = new Terrain();
      if (previousLeg !== undefined)
        terrain = previousLeg.terrain;

      var statLossFromExhaustionDefault = 1;
      if (statLossFromExhaustion === undefined)
        statLossFromExhaustion = statLossFromExhaustionDefault;

      if (modifiedAdaptabilityMs === undefined)
        modifiedAdaptabilityMs = animalGivingRelayEffect.currentStats.adaptabilityMs;

      if (modifiedFocusMs === undefined)
        modifiedFocusMs = animalGivingRelayEffect.currentStats.focusMs;

      this.talentRelayCheck(animalGivingRelayEffect, animalReceivingRelayEffect, currentLeg.distance * reducedDistanceAmount, terrain, statLossFromExhaustion, modifiedFocusMs, modifiedAdaptabilityMs);
      this.batonEquipmentCheck(animalGivingRelayEffect, animalReceivingRelayEffect, currentLeg.distance * reducedDistanceAmount);
    }
  }

  //reduceddistanceamount is a number from 0-1 representing the percent of distance the effect should be to its normal value
  talentRelayCheck(animalGivingRelayEffect: Animal, animalReceivingRelayEffect: Animal, length: number, terrain: Terrain, statLossFromExhaustion: number, modifiedFocusMs?: number, modifiedAdaptabilityMs?: number, reducedDistanceAmount: number = 1) {
    if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
      length = this.globalService.globalVar.eventRaceData.totalDistance;

    if (animalGivingRelayEffect.talentTree.talentTreeType === TalentTreeTypeEnum.support) {
      if (animalGivingRelayEffect.talentTree.column1Row1Points > 0) {
        var effectiveness = 1 + (animalGivingRelayEffect.talentTree.column1Row1Points * .01);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(1, 1, 1, 1, 1, effectiveness), true, RelayEffectEnum.supportAdaptabilityRelay, false);
      }

      if (animalGivingRelayEffect.talentTree.column1Row3Points > 0) {
        var effectiveness = 1 + (animalGivingRelayEffect.talentTree.column1Row3Points * .01);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(effectiveness, 1, 1, 1, 1, 1), true, RelayEffectEnum.supportMaxSpeedRelay, false);
      }

      if (animalGivingRelayEffect.talentTree.column2Row1Points > 0) {
        var effectiveness = 1 + (animalGivingRelayEffect.talentTree.column2Row1Points * .01);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(1, effectiveness, 1, 1, 1, 1), true, RelayEffectEnum.supportAccelerationRelay, false);
      }

      if (animalGivingRelayEffect.talentTree.column2Row2Points > 0) {
        var effectiveness = this.getBurstDistance(animalGivingRelayEffect, terrain.powerModifier, statLossFromExhaustion) * (animalGivingRelayEffect.talentTree.column2Row2Points * .05);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(0, 0, 0, 0, 0, 0), false, RelayEffectEnum.supportBurstDistance, false, effectiveness);
      }

      if (animalGivingRelayEffect.talentTree.column2Row3Points > 0) {
        var effectiveness = 1 + (animalGivingRelayEffect.talentTree.column2Row3Points * .01);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(1, 1, effectiveness, 1, 1, 1), true, RelayEffectEnum.supportStaminaRelay, false);
      }

      if (animalGivingRelayEffect.talentTree.column2Row4Points > 0) {
        var effectiveness = this.getBurstChance(animalGivingRelayEffect, modifiedFocusMs, modifiedAdaptabilityMs) * (animalGivingRelayEffect.talentTree.column2Row4Points * .03);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(0, 0, 0, 0, 0, 0), false, RelayEffectEnum.supportBurstChance, false, effectiveness);
      }

      if (animalGivingRelayEffect.talentTree.column3Row1Points > 0) {
        var effectiveness = 1 + (animalGivingRelayEffect.talentTree.column3Row1Points * .01);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(1, 1, 1, effectiveness, 1, 1), true, RelayEffectEnum.supportPowerRelay, false);
      }

      if (animalGivingRelayEffect.talentTree.column3Row2Points > 0) {
        var effectiveness = 1 - (animalGivingRelayEffect.talentTree.column3Row2Points * .02);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(0, 0, 0, 0, 0, 0), false, RelayEffectEnum.supportAbilityCooldown, false, effectiveness);
      }

      if (animalGivingRelayEffect.talentTree.column3Row3Points > 0) {
        var effectiveness = 1 + (animalGivingRelayEffect.talentTree.column3Row3Points * .01);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(1, 1, 1, 1, effectiveness, 1), true, RelayEffectEnum.supportFocusRelay, false);
      }

      if (animalGivingRelayEffect.talentTree.column3Row4Points > 0) {
        var effectiveness = 1 + (animalGivingRelayEffect.talentTree.column3Row4Points * .02);
        this.AddRelayEffect(animalReceivingRelayEffect, animalGivingRelayEffect, length * reducedDistanceAmount, new AnimalStats(1, 1, 1, 1, 1, 1), true, RelayEffectEnum.supportAbilityEfficiency, false, effectiveness);
      }
    }
  }

  batonEquipmentCheck(previousAnimal: Animal, nextAnimal: Animal, length: number, reducedDistanceAmount: number = 1) {
    if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
      length = this.globalService.globalVar.eventRaceData.totalDistance;

    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.redBaton)) {
      var defaultRedBatonModifier = 1.1;
      var redBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "redBatonEquipmentModifier");
      if (redBatonEquipmentModifierPair !== undefined)
        defaultRedBatonModifier = redBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, previousAnimal, length * reducedDistanceAmount, new AnimalStats(defaultRedBatonModifier, 1, 1, 1, 1, 1), true, RelayEffectEnum.redBaton, false);
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.blueBaton)) {
      var defaultBlueBatonModifier = 1.1;
      var blueBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "blueBatonEquipmentModifier");
      if (blueBatonEquipmentModifierPair !== undefined)
        defaultBlueBatonModifier = blueBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, previousAnimal, length * reducedDistanceAmount, new AnimalStats(1, 1, 1, 1, defaultBlueBatonModifier, 1), true, RelayEffectEnum.blueBaton, false);
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.violetBaton)) {
      var defaultVioletBatonModifier = 1.1;
      var violetBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "violetBatonEquipmentModifier");
      if (violetBatonEquipmentModifierPair !== undefined)
        defaultVioletBatonModifier = violetBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, previousAnimal, length * reducedDistanceAmount, new AnimalStats(1, 1, 1, defaultVioletBatonModifier, 1, 1), true, RelayEffectEnum.violetBaton, false);
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.greenBaton)) {
      var defaultGreenBatonModifier = 1.1;
      var greenBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "greenBatonEquipmentModifier");
      if (greenBatonEquipmentModifierPair !== undefined)
        defaultGreenBatonModifier = greenBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, previousAnimal, length * reducedDistanceAmount, new AnimalStats(1, 1, 1, 1, 1, defaultGreenBatonModifier), true, RelayEffectEnum.greenBaton, false);
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.orangeBaton)) {
      var defaultOrangeBatonModifier = 1.1;
      var orangeBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "orangeBatonEquipmentModifier");
      if (orangeBatonEquipmentModifierPair !== undefined)
        defaultOrangeBatonModifier = orangeBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, previousAnimal, length * reducedDistanceAmount, new AnimalStats(1, defaultOrangeBatonModifier, 1, 1, 1, 1), true, RelayEffectEnum.orangeBaton, false);
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.yellowBaton)) {
      var defaultYellowBatonModifier = 1.1;
      var yellowBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "yellowBatonEquipmentModifier");
      if (yellowBatonEquipmentModifierPair !== undefined)
        defaultYellowBatonModifier = yellowBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, previousAnimal, length * reducedDistanceAmount, new AnimalStats(1, 1, defaultYellowBatonModifier, 1, 1, 1), true, RelayEffectEnum.yellowBaton, false);
    }
  }

  prepareRacingLeg(raceLeg: RaceLeg, racingAnimal: Animal) {
    raceLeg.pathData.forEach(path => {
      path.currentStumbleOpportunity = 0;
      path.checkedForBurst = false;
      path.checkedForNineTails = false;
      path.driftAmount = 0;
      path.didAnimalStumble = false;
      path.checkedForDrift = false;
    });

    this.checkForBlinders(raceLeg, racingAnimal);
  }

  checkForBlinders(raceLeg: RaceLeg, racingAnimal: Animal) {
    if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.blinders)) {
      var blinderBonus = .5; //.9 = 1 - ((1 - .8) * .5); 
      //if you wanted to make it stronger, .95 = 1 - ((1 - .8) * .25);

      if (raceLeg.terrain.maxSpeedModifier < 1)
        raceLeg.terrain.maxSpeedModifier = 1 - ((1 - raceLeg.terrain.maxSpeedModifier) * blinderBonus);
      if (raceLeg.terrain.accelerationModifier < 1)
        raceLeg.terrain.accelerationModifier = 1 - ((1 - raceLeg.terrain.accelerationModifier) * blinderBonus);
      if (raceLeg.terrain.staminaModifier < 1)
        raceLeg.terrain.staminaModifier = 1 - ((1 - raceLeg.terrain.staminaModifier) * blinderBonus);
      if (raceLeg.terrain.powerModifier < 1)
        raceLeg.terrain.powerModifier = 1 - ((1 - raceLeg.terrain.powerModifier) * blinderBonus);
      if (raceLeg.terrain.focusModifier < 1)
        raceLeg.terrain.focusModifier = 1 - ((1 - raceLeg.terrain.focusModifier) * blinderBonus);
      if (raceLeg.terrain.adaptabilityModifier < 1)
        raceLeg.terrain.adaptabilityModifier = 1 - ((1 - raceLeg.terrain.adaptabilityModifier) * blinderBonus);
    }
  }

  getPrelayEffects(racingAnimal: Animal, nextAnimal: Animal | null, terrain: Terrain, statLossFromExhaustion: number, raceResult: RaceResult, framesPassed: number, lastAnimalDisplayName: string, currentLeg?: RaceLeg, previousLeg?: RaceLeg) {
    if (nextAnimal === null || currentLeg === undefined)
      return;

    //should also move navigator here
    //and create an application type situation like relays have but distance is from end of leg

    if (nextAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.support && nextAnimal.talentTree.column1Row4Points > 0) {
      var relayLength = nextAnimal.talentTree.column1Row4Points * .03;
      this.endOfLegRelayEffectCheck(nextAnimal, racingAnimal, raceResult, framesPassed, lastAnimalDisplayName, currentLeg, previousLeg, statLossFromExhaustion, undefined, undefined, undefined, relayLength);
    }
  }

  AddRelayEffect(racingAnimal: Animal, animalGivingRelayEffect: Animal, distance: number, statMultiplers: AnimalStats, isMultiplicative: boolean, type: RelayEffectEnum, affectsAllRacers: boolean, additionalValue?: number, isSecondaryEffect: boolean = false) {
    var newRelayEffect = new RelayEffect();
    newRelayEffect.remainingRelayMeters = distance;
    newRelayEffect.relayAffectedStatRatios = statMultiplers;
    newRelayEffect.isMultiplicative = isMultiplicative;
    newRelayEffect.effectType = type;
    newRelayEffect.additionalValue = additionalValue;
    newRelayEffect.affectsAllRacers = affectsAllRacers;

    //change effectiveness here    
    if (animalGivingRelayEffect.talentTree.talentTreeType === TalentTreeTypeEnum.support && animalGivingRelayEffect.talentTree.column1Row2Points > 0) {
      var effectivenessBoost = 1 + (animalGivingRelayEffect.talentTree.column1Row2Points * .02);

      if (newRelayEffect.isMultiplicative) {
        if (newRelayEffect.relayAffectedStatRatios.topSpeed > 1)
          newRelayEffect.relayAffectedStatRatios.topSpeed = 1 + ((newRelayEffect.relayAffectedStatRatios.topSpeed - 1) * effectivenessBoost);
        if (newRelayEffect.relayAffectedStatRatios.acceleration > 1)
          newRelayEffect.relayAffectedStatRatios.acceleration = 1 + ((newRelayEffect.relayAffectedStatRatios.acceleration - 1) * effectivenessBoost);
        if (newRelayEffect.relayAffectedStatRatios.endurance > 1)
          newRelayEffect.relayAffectedStatRatios.endurance = 1 + ((newRelayEffect.relayAffectedStatRatios.endurance - 1) * effectivenessBoost);
        if (newRelayEffect.relayAffectedStatRatios.power > 1)
          newRelayEffect.relayAffectedStatRatios.power = 1 + ((newRelayEffect.relayAffectedStatRatios.power - 1) * effectivenessBoost);
        if (newRelayEffect.relayAffectedStatRatios.focus > 1)
          newRelayEffect.relayAffectedStatRatios.focus = 1 + ((newRelayEffect.relayAffectedStatRatios.focus - 1) * effectivenessBoost);
        if (newRelayEffect.relayAffectedStatRatios.adaptability > 1)
          newRelayEffect.relayAffectedStatRatios.adaptability = 1 + ((newRelayEffect.relayAffectedStatRatios.adaptability - 1) * effectivenessBoost);
        if (newRelayEffect.additionalValue !== undefined && newRelayEffect.additionalValue > 1)
          newRelayEffect.additionalValue *= effectivenessBoost;
      }
      else {
        if (newRelayEffect.relayAffectedStatRatios.topSpeed > 0)
          newRelayEffect.relayAffectedStatRatios.topSpeed = 1 + ((newRelayEffect.relayAffectedStatRatios.topSpeed - 1) * effectivenessBoost);;
        if (newRelayEffect.relayAffectedStatRatios.acceleration > 0)
          newRelayEffect.relayAffectedStatRatios.acceleration = 1 + ((newRelayEffect.relayAffectedStatRatios.acceleration - 1) * effectivenessBoost);;
        if (newRelayEffect.relayAffectedStatRatios.endurance > 0)
          newRelayEffect.relayAffectedStatRatios.endurance = 1 + ((newRelayEffect.relayAffectedStatRatios.endurance - 1) * effectivenessBoost);;
        if (newRelayEffect.relayAffectedStatRatios.power > 0)
          newRelayEffect.relayAffectedStatRatios.power = 1 + ((newRelayEffect.relayAffectedStatRatios.power - 1) * effectivenessBoost);;
        if (newRelayEffect.relayAffectedStatRatios.focus > 0)
          newRelayEffect.relayAffectedStatRatios.focus = 1 + ((newRelayEffect.relayAffectedStatRatios.focus - 1) * effectivenessBoost);;
        if (newRelayEffect.relayAffectedStatRatios.adaptability > 0)
          newRelayEffect.relayAffectedStatRatios.adaptability = 1 + ((newRelayEffect.relayAffectedStatRatios.adaptability - 1) * effectivenessBoost);;
        if (newRelayEffect.additionalValue !== undefined && newRelayEffect.additionalValue > 0)
          newRelayEffect.additionalValue *= effectivenessBoost;
      }
    }

    if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
      if (this.globalService.globalVar.eventRaceData.queuedRelayEffects.some(effect => effect.effectType === type)) {
        if (this.lookupService.relayEffectTypeStacksEffectiveness(type)) {
          var matchingEffect = this.globalService.globalVar.eventRaceData.queuedRelayEffects.find(effect => effect.effectType === type);
          if (matchingEffect !== null && matchingEffect !== undefined) {
            matchingEffect.relayAffectedStatRatios.addCurrentRacingStats(statMultiplers);
            if (matchingEffect.additionalValue !== undefined && newRelayEffect.additionalValue !== undefined)
              matchingEffect.additionalValue += newRelayEffect.additionalValue;
          }
        }
        else {
          var matchingEffect = this.globalService.globalVar.eventRaceData.queuedRelayEffects.find(effect => effect.effectType === type);
          if (matchingEffect !== null && matchingEffect !== undefined)
            matchingEffect.remainingRelayMeters += distance;
        }
      }
      else {
        this.globalService.globalVar.eventRaceData.queuedRelayEffects.push(newRelayEffect);
      }
    }
    else {
      if (affectsAllRacers) {
        var indexOfAnimalGivingEffect = this.selectedRace.raceLegs.findIndex(item => item.courseType === racingAnimal.raceCourseType);
        if (this.selectedRace.raceLegs.length > indexOfAnimalGivingEffect) {
          this.selectedRace.raceLegs.slice(indexOfAnimalGivingEffect + 1).forEach(remainingLeg => {
            var remainingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === remainingLeg.courseType);
            if (remainingAnimal !== null && remainingAnimal !== undefined && remainingAnimal.raceVariables !== null &&
              remainingAnimal.raceVariables !== undefined && remainingAnimal.raceVariables.relayEffects !== null &&
              remainingAnimal.raceVariables.relayEffects !== undefined) {
              remainingAnimal.raceVariables.relayEffects.push(newRelayEffect);
            }
          });
        }
      }
      else {
        if (racingAnimal !== null && racingAnimal !== undefined && racingAnimal.raceVariables !== null &&
          racingAnimal.raceVariables !== undefined && racingAnimal.raceVariables.relayEffects !== null &&
          racingAnimal.raceVariables.relayEffects !== undefined) {
          racingAnimal.raceVariables.relayEffects.push(newRelayEffect);
        }
      }
    }
  }

  didAnimalStumble(racingAnimal: Animal, currentPath: RacePath, currentDistanceInPath: number, terrain: Terrain, obj: { permanentAdaptabilityIncreaseMultiplier: number }, modifiedAdaptabilityMs: number, statLossFromExhaustion: number, framesPassed: number, animalDisplayName: string, raceResult: RaceResult): boolean {
    if (racingAnimal.raceVariables.stumbled)
      return false; //already stumbling

    if (currentPath.frequencyOfStumble === 0)
      return false;

    if (racingAnimal.type === AnimalTypeEnum.Gecko && racingAnimal.ability.name === "Sticky" && racingAnimal.ability.abilityInUse) {
      return false;
    }

    if (racingAnimal.type === AnimalTypeEnum.Salamander && racingAnimal.ability.name === "Burrow" && racingAnimal.ability.abilityInUse) {
      return false;
    }

    if (racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Frenzy" && racingAnimal.raceVariables.isBursting) {
      return false;
    }

    var stumbleBreakpoint = currentPath.length / currentPath.stumbleOpportunities;

    //made it through without stumbling
    if (currentPath.currentStumbleOpportunity === currentPath.stumbleOpportunities && currentPath.routeDesign !== RaceDesignEnum.Regular) {
      if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Sure-footed") {
        if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix &&
          this.globalService.globalVar.eventRaceData.eventAbilityData.sureFootedUseCount >= this.globalService.globalVar.eventRaceData.eventAbilityData.sureFootedUseCap)) {

          if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
            this.globalService.globalVar.eventRaceData.eventAbilityData.sureFootedUseCount += 1;

          obj.permanentAdaptabilityIncreaseMultiplier += (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, terrain.powerModifier, statLossFromExhaustion) / 100);
          this.globalService.increaseAbilityXp(racingAnimal);
          currentPath.currentStumbleOpportunity += 1; //use this so that you don't trigger multiple times -- can come up with better method
        }
      }
    }

    if (currentPath.currentStumbleOpportunity * stumbleBreakpoint < currentDistanceInPath) {
      currentPath.currentStumbleOpportunity += 1;

      var rng = this.utilityService.getRandomNumber(1, 100);

      var frequencyPerNumberOfMeters = 250; //frequency / 250 meters
      var terrainAdjustedAdaptability = modifiedAdaptabilityMs * terrain.adaptabilityModifier;
      frequencyPerNumberOfMeters += terrainAdjustedAdaptability;

      var percentChanceOfStumbling = ((currentPath.frequencyOfStumble / frequencyPerNumberOfMeters) * currentPath.length);

      if (rng <= percentChanceOfStumbling) {

        if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.headband)) {
          var headbandMaxStumblePrevention = 3;
          var headbandModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "headbandEquipmentModifier");
          if (headbandModifierPair !== undefined)
            headbandMaxStumblePrevention = headbandModifierPair.value;
          if (racingAnimal.raceVariables.headbandStumblePreventionCount < headbandMaxStumblePrevention) {
            racingAnimal.raceVariables.headbandStumblePreventionCount += 1;
            raceResult.addRaceUpdate(framesPassed, animalDisplayName + "'s headband prevents them from stumbling.");
            return false;
          }
        }

        currentPath.didAnimalStumble = true;
        return true;
      }
    }

    return false;
  }

  didAnimalLoseFocus(racingAnimal: Animal, timeToComplete: number, raceLength: number, currentDistanceInRace: number, terrain: Terrain, statLossFromExhaustion: number, obj: { coldBloodedIncreaseMultiplier: number }, currentPath: RacePath, modifiedFocusMs: number): boolean {
    if (racingAnimal.raceVariables.lostFocus) {
      return false; //already lost focus
    }

    if (racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Frenzy" && racingAnimal.raceVariables.isBursting) {
      return false;
    }

    var focusBreakpoint = raceLength / timeToComplete;

    if (this.currentLostFocusOpportunity * focusBreakpoint < currentDistanceInRace) {
      this.currentLostFocusOpportunity += 1;

      //focusModifier is inverse of what percent chance the animal will lose focus right at their focusMs amount
      var focusModifier: number;
      var focusModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "focusModifier");
      if (focusModifierPair === undefined)
        focusModifier = .75;
      else
        focusModifier = focusModifierPair.value;

      var unwaveringFocus = (modifiedFocusMs * terrain.focusModifier) * focusModifier;

      if (racingAnimal.raceVariables.metersSinceLostFocus < unwaveringFocus)
        return false;

      var metersSinceExpectedDistraction = racingAnimal.raceVariables.metersSinceLostFocus - unwaveringFocus;
      var percentChanceOfLosingFocus = (metersSinceExpectedDistraction / racingAnimal.currentStats.focusMs) * 100;

      var rng = this.utilityService.getRandomNumber(1, 100);

      if (rng <= percentChanceOfLosingFocus) {
        currentPath.didAnimalLoseFocus = true;
        return true;
      }
    }

    return false;
  }

  increasePersistentAbilityXp(animal: Animal) {
    if (animal.type === AnimalTypeEnum.Cheetah && animal.ability.name === "Giving Chase" ||
      animal.type === AnimalTypeEnum.Hare && animal.ability.name === "Prey Instinct" ||
      animal.type === AnimalTypeEnum.Hare && animal.ability.name === "Nap" ||
      animal.type === AnimalTypeEnum.Goat && animal.ability.name === "In The Rhythm" ||
      animal.type === AnimalTypeEnum.Shark && animal.ability.name === "Feeding Frenzy" ||
      animal.type === AnimalTypeEnum.Shark && animal.ability.name === "Blood In The Water" ||
      animal.type === AnimalTypeEnum.Octopus && animal.ability.name === "Buried Treasure" ||
      animal.type === AnimalTypeEnum.Penguin && animal.ability.name === "Wild Toboggan" ||
      animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Fleeting Speed")
      this.globalService.increaseAbilityXp(animal, 3);
  }

  //only use abilities when they are actually useful/able to be used
  abilityRedundancyCheck(racingAnimal: Animal, velocity: number, currentPath: RacePath, currentLeg: RaceLeg, distanceToGo: number, statLossFromExhaustion: number): boolean {
    if (racingAnimal.ability.oneTimeEffect && racingAnimal.ability.abilityUsed)
      return false;

    if (racingAnimal.ability.name === "Second Wind" && racingAnimal.type === AnimalTypeEnum.Horse &&
      racingAnimal.raceVariables.recoveringStamina)
      return false;

    if (racingAnimal.ability.name === "Pacemaker" && racingAnimal.type === AnimalTypeEnum.Horse &&
      velocity === racingAnimal.currentStats.maxSpeedMs)
      return false;

    if (racingAnimal.ability.name === "Leap" && racingAnimal.type === AnimalTypeEnum.Monkey) {
      var leapDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
      if (leapDistance < distanceToGo) {
        return false;
      }
    }

    if (racingAnimal.ability.name === "Sticky" && racingAnimal.type === AnimalTypeEnum.Gecko &&
      currentPath.frequencyOfStumble === 0)
      return false;

    return true;
  }

  useAbility(racingAnimal: Animal, race: Race, currentLeg: RaceLeg, statLossFromExhaustion: number, animalMaxStamina: number, currentDistanceInLeg: number, obj: { coldBloodedIncreaseMultiplier: number }, grazeBuffs: [string, number][], raceResult: RaceResult, framesPassed: number, animalDisplayName: string) {
    racingAnimal.ability.abilityUsed = true;

    if (racingAnimal.type === AnimalTypeEnum.Horse) {
      if (racingAnimal.ability.name === "Second Wind" ||
        racingAnimal.ability.name === "Pacemaker") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Cheetah) {
      if (racingAnimal.ability.name === "Sprint") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Hare) {
      if (racingAnimal.ability.name === "Awareness") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Warthog) {
      if (racingAnimal.ability.name === "Graze") {
        racingAnimal.ability.abilityInUse = true;
        this.checkForGrazeBuff(grazeBuffs, racingAnimal, currentLeg, statLossFromExhaustion, raceResult, framesPassed, animalDisplayName);
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Monkey) {
      if (racingAnimal.ability.name === "Landslide") {
        var effectiveDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        var averageDistancePerSecond = race.length / this.timeToComplete;

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
          averageDistancePerSecond = this.globalService.globalVar.eventRaceData.totalDistance / (this.globalService.globalVar.eventRaceData.grandPrixTimeLength + this.globalService.globalVar.eventRaceData.bonusTime);
          this.globalService.globalVar.eventRaceData.bonusTime += effectiveDistance / averageDistancePerSecond;
        }
        else {
          this.timeToComplete += effectiveDistance / averageDistancePerSecond;
        }

        this.globalService.increaseAbilityXp(racingAnimal);
      }

      if (racingAnimal.ability.name === "Leap") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingFrames = racingAnimal.ability.totalFrames;
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Gecko) {
      if (racingAnimal.ability.name === "Sticky") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Dolphin) {
      if (racingAnimal.ability.name === "Echolocation") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);

        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Octopus) {
      if (racingAnimal.ability.name === "Propulsion") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingFrames = racingAnimal.ability.totalFrames;
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Whale) {
      if (racingAnimal.ability.name === "Storing Power") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }

      if (racingAnimal.ability.name === "Whalesong") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.totalUseCount += 1;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Penguin) {
      if (racingAnimal.ability.name === "Careful Toboggan") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Caribou) {
      if (racingAnimal.ability.name === "Great Migration") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Salamander) {
      if (racingAnimal.ability.name === "Cold Blooded") {
        racingAnimal.ability.abilityInUse = true;
        this.globalService.increaseAbilityXp(racingAnimal);
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        var percentInLeg = (currentDistanceInLeg / currentLeg.distance);
        if (percentInLeg > .5)
          percentInLeg = .5 - (percentInLeg - .5);

        obj.coldBloodedIncreaseMultiplier = percentInLeg;
      }

      if (racingAnimal.ability.name === "Burrow") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }

      if (racingAnimal.ability.name === "Heat Up") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.totalUseCount += 1;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        this.globalService.increaseAbilityXp(racingAnimal);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Fox) {
      if (racingAnimal.ability.name === "Trickster") {
        racingAnimal.ability.abilityInUse = true;
        this.globalService.increaseAbilityXp(racingAnimal);

        var statLoss = this.utilityService.getRandomInteger(1, 6);
        if (statLoss === 1)
          racingAnimal.ability.tricksterStatLoss = "Acceleration";
        if (statLoss === 2)
          racingAnimal.ability.tricksterStatLoss = "Max Speed";
        if (statLoss === 3)
          racingAnimal.ability.tricksterStatLoss = "Adaptability";
        if (statLoss === 4)
          racingAnimal.ability.tricksterStatLoss = "Focus";
        if (statLoss === 5) {
          racingAnimal.ability.tricksterStatLoss = "Stamina";
          racingAnimal.currentStats.stamina -= animalMaxStamina * .25;
          if (racingAnimal.currentStats.stamina < 0)
            racingAnimal.currentStats.stamina = 0;
        }
        if (statLoss === 6)
          racingAnimal.ability.tricksterStatLoss = "Power";

        var statGain = this.utilityService.getRandomInteger(1, 6);
        if (statGain === statLoss) {
          statGain += 1;
          if (statGain > 6)
            statGain = 1;
        }

        if (statGain === 1)
          racingAnimal.ability.tricksterStatGain = "Acceleration";
        if (statGain === 2)
          racingAnimal.ability.tricksterStatGain = "Max Speed";
        if (statGain === 3)
          racingAnimal.ability.tricksterStatGain = "Adaptability";
        if (statGain === 4)
          racingAnimal.ability.tricksterStatGain = "Focus";
        if (statGain === 5) {
          racingAnimal.ability.tricksterStatGain = "Stamina";
          racingAnimal.currentStats.stamina += animalMaxStamina * .5;
          if (racingAnimal.currentStats.stamina > animalMaxStamina)
            racingAnimal.currentStats.stamina = animalMaxStamina;
        }
        if (statGain === 6)
          racingAnimal.ability.tricksterStatGain = "Power";

        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
      }
    }
  }

  checkForNineTailsBuff(currentPath: RacePath, nineTailsBuffs: [string, number][], racingAnimal: Animal, currentLeg: RaceLeg, statLossFromExhaustion: number, raceResult: RaceResult, framesPassed: number, animalDisplayName: string) {
    if (currentPath.checkedForNineTails)
      return;

    currentPath.checkedForNineTails = true;

    var rng = this.utilityService.getRandomInteger(1, 4);
    var timingUpdate: StringNumberPair = new StringNumberPair();
    timingUpdate.value = framesPassed;

    if (rng === 1) {
      nineTailsBuffs.push(["Acceleration", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Acceleration)");
      raceResult.raceUpdates.push(timingUpdate);
    }
    else if (rng === 2) {
      nineTailsBuffs.push(["Max Speed", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Max Speed)");
      raceResult.raceUpdates.push(timingUpdate);
    }
    else if (rng === 3) {
      nineTailsBuffs.push(["Adaptability", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Adaptability)");
      raceResult.raceUpdates.push(timingUpdate);
    }
    else if (rng === 4) {
      nineTailsBuffs.push(["Focus", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Focus)");
      raceResult.raceUpdates.push(timingUpdate);
    }

    this.globalService.increaseAbilityXp(racingAnimal);
  }

  checkForGrazeBuff(grazeBuffs: [string, number][], racingAnimal: Animal, currentLeg: RaceLeg, statLossFromExhaustion: number, raceResult: RaceResult, framesPassed: number, animalDisplayName: string) {
    var rng = this.utilityService.getRandomInteger(1, 5);
    var timingUpdate: StringNumberPair = new StringNumberPair();
    timingUpdate.value = framesPassed;

    if (rng === 1) {
      grazeBuffs.push(["Acceleration", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Acceleration)");
      raceResult.raceUpdates.push(timingUpdate);
    }
    else if (rng === 2) {
      grazeBuffs.push(["Max Speed", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Max Speed)");
      raceResult.raceUpdates.push(timingUpdate);
    }
    else if (rng === 3) {
      grazeBuffs.push(["Adaptability", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Adaptability)");
      raceResult.raceUpdates.push(timingUpdate);
    }
    else if (rng === 4) {
      grazeBuffs.push(["Focus", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Focus)");
      raceResult.raceUpdates.push(timingUpdate);
    }
    else if (rng === 4) {
      grazeBuffs.push(["Power", this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion)]);
      timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName, " (Power)");
      raceResult.raceUpdates.push(timingUpdate);
    }

    this.globalService.increaseAbilityXp(racingAnimal);
  }

  getNineTailsBuffCount(stat: string, nineTailsBuffs: [string, number][]) {
    return nineTailsBuffs.filter(item => item[0] === stat).length;
  }

  getGrazeBuffCount(stat: string, grazeBuffs: [string, number][]) {
    return grazeBuffs.filter(item => item[0] === stat).length;
  }

  getModifiedAdaptability(racingAnimal: Animal, obj: { permanentAdaptabilityIncreaseMultiplier: number }, statLossFromExhaustion: number, nineTailsBuffs: [string, number][], grazeBuffs: [string, number][], currentLeg: RaceLeg, currentDistanceInLeg: number, nextAnimal: Animal | null, nextLeg: RaceLeg,
    raceResult: RaceResult, framesPassed: number, animalDisplayName: string, nextAnimalDisplayName: string) {
    var modifiedAdaptabilityMs = racingAnimal.currentStats.adaptabilityMs * statLossFromExhaustion;
    if (racingAnimal.type === AnimalTypeEnum.Dolphin && racingAnimal.ability.name === "Echolocation" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= 1.75;
    }
    if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Sure-footed") {
      modifiedAdaptabilityMs *= obj.permanentAdaptabilityIncreaseMultiplier;
    }
    if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Awareness" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= 1.4;
    }
    if (racingAnimal.type === AnimalTypeEnum.Penguin && racingAnimal.ability.name === "Careful Toboggan" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= 1.6;
    }
    if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatLoss === "Adaptability" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= .75;
    }
    if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatGain === "Adaptability" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= 1.5;
    }
    if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Nine Tails") {
      modifiedAdaptabilityMs *= 1 + (this.getNineTailsBuffCount("Adaptability", nineTailsBuffs) * .15);
    }
    if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Graze") {
      modifiedAdaptabilityMs *= 1 + (this.getGrazeBuffCount("Adaptability", grazeBuffs) * .1);
    }
    if (nextAnimal !== null && nextLeg !== undefined && nextAnimal.ability.name === "Navigator" &&
      nextAnimal.type === AnimalTypeEnum.Dolphin &&
      currentLeg.distance - currentDistanceInLeg <= this.lookupService.GetAbilityEffectiveAmount(nextAnimal, nextLeg.terrain.powerModifier, statLossFromExhaustion)) {
      var additiveAmount = nextAnimal.currentStats.adaptabilityMs * .25;
      modifiedAdaptabilityMs += additiveAmount;
      //raceResult.addRaceUpdate(framesPassed, animalDisplayName + " uses " + nextAnimal?.ability.name);
      if (!nextAnimal.ability.abilityInUse)
        raceResult.addRaceUpdate(framesPassed, animalDisplayName + " is shown the way by " + nextAnimalDisplayName + "'s " + nextAnimal?.ability.name + " ability.");
      nextAnimal.ability.abilityInUse = true;
    }
    if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.athleticTape)) {
      if (racingAnimal.raceVariables.isBursting)
        modifiedAdaptabilityMs *= 1.5;
    }

    if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint && !racingAnimal.raceVariables.hasLostFocusDuringRace) {
      modifiedAdaptabilityMs *= 1 + ((racingAnimal.talentTree.column1Row2Points * 5) / 100);
    }

    return modifiedAdaptabilityMs;
  }

  getModifiedFocus(racingAnimal: Animal, statLossFromExhaustion: number, nineTailsBuffs: [string, number][], grazeBuffs: [string, number][], obj: { coldBloodedIncreaseMultiplier: number }) {
    var unwaveringFocus = racingAnimal.currentStats.focusMs * statLossFromExhaustion;

    if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Awareness" && racingAnimal.ability.abilityInUse) {
      unwaveringFocus *= 1.4;
    }
    if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Nap") {
      unwaveringFocus *= 2;
    }
    if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatLoss === "Focus" && racingAnimal.ability.abilityInUse) {
      unwaveringFocus *= .75;
    }
    if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Trickster" && racingAnimal.ability.tricksterStatGain === "Focus" && racingAnimal.ability.abilityInUse) {
      unwaveringFocus *= 1.5;
    }
    if (racingAnimal.type === AnimalTypeEnum.Fox && racingAnimal.ability.name === "Nine Tails") {
      unwaveringFocus *= 1 + (this.getNineTailsBuffCount("Focus", nineTailsBuffs) * .15);
    }
    if (racingAnimal.type === AnimalTypeEnum.Warthog && racingAnimal.ability.name === "Graze") {
      unwaveringFocus *= 1 + (this.getGrazeBuffCount("Focus", grazeBuffs) * .1);
    }
    if (racingAnimal.type === AnimalTypeEnum.Salamander && racingAnimal.ability.name === "Cold Blooded" && racingAnimal.ability.abilityInUse) {
      unwaveringFocus *= 1 + obj.coldBloodedIncreaseMultiplier;
    }
    if (racingAnimal.type === AnimalTypeEnum.Whale && racingAnimal.ability.name === "Whalesong" && (racingAnimal.ability.totalUseCount === 4 || racingAnimal.ability.totalUseCount > 5) && racingAnimal.ability.abilityInUse) {
      unwaveringFocus *= 1.3;
    }
    if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.athleticTape)) {
      if (racingAnimal.raceVariables.isBursting)
        unwaveringFocus *= 1.5;
    }
    if (racingAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
      unwaveringFocus *= 1 - ((racingAnimal.talentTree.column2Row4Points * .005) * racingAnimal.raceVariables.velocityReachesMaxSpeedCount);
    }

    return unwaveringFocus;
  }

  handleTundraDrift(racingAnimal: Animal, currentPath: RacePath, lastPath: RacePath, isLastPathInLeg: boolean, modifiedAdaptabilityMs: number, terrain: Terrain, currentDistanceInPath: number, xDistanceCovered: number, statLossFromExhaustion: number, obj: { permanentMaxSpeedIncreaseMultiplier: number }, raceResult: RaceResult, animalDisplayName: string, framesPassed: number) {
    var wallHit = false;

    if (currentPath.checkedForDrift)
      return;

    currentPath.checkedForDrift = true;
    var maxYAmount = 80;
    var minYAmount = -80;

    if (currentPath.routeDesign === RaceDesignEnum.Cavern || lastPath.routeDesign === RaceDesignEnum.Cavern) {
      maxYAmount = 60;
      minYAmount = -60;
    }

    if (racingAnimal.raceVariables.icyCurrentYAmount >= maxYAmount ||
      racingAnimal.raceVariables.icyCurrentYAmount <= minYAmount || isLastPathInLeg) {
      if (racingAnimal.raceVariables.icyCurrentYAmount >= maxYAmount ||
        racingAnimal.raceVariables.icyCurrentYAmount <= minYAmount)
        wallHit = true;

      currentPath.driftAmount = -racingAnimal.raceVariables.icyCurrentYAmount;
      racingAnimal.raceVariables.icyCurrentYAmount = 0;
      currentPath.totalTundraYAmount = racingAnimal.raceVariables.icyCurrentYAmount;
      return wallHit;
    }

    //get drift change    
    var rng = this.utilityService.getRandomNumber(1, 100);
    var frequencyPerNumberOfMeters = 1000; //frequency / 1000 meters
    var terrainAdjustedAdaptability = modifiedAdaptabilityMs * terrain.adaptabilityModifier;
    frequencyPerNumberOfMeters += terrainAdjustedAdaptability;

    var percentChanceOfSlipping = ((currentPath.frequencyOfDrift / frequencyPerNumberOfMeters) * currentPath.length);

    if (rng < percentChanceOfSlipping) {
      currentPath.didAnimalStumble = true;
      percentChanceOfSlipping -= rng;
      if (percentChanceOfSlipping <= 0)
        percentChanceOfSlipping = 0; //should never happen but you never know

      var goingUp = this.utilityService.getRandomInteger(1, 2);
      if (goingUp === 1)
        racingAnimal.raceVariables.icyCurrentDirectionUp = true;
      else
        racingAnimal.raceVariables.icyCurrentDirectionUp = false;

      //var slipAmount = percentChanceOfSlipping - rng;
      var percentChanceOfSlippingCap = 100;

      var maxSlipAmount = 20;
      var maxSlipAmountPair = this.globalService.globalVar.modifiers.find(item => item.text === "maxDriftAmountModifier");
      if (maxSlipAmountPair !== undefined)
        maxSlipAmount = maxSlipAmountPair.value;

      if (racingAnimal.ability.name === "Wild Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin) {
        maxSlipAmount *= 2;
        percentChanceOfSlippingCap *= 2;
        racingAnimal.ability.abilityInUse = true;
      }
      if (racingAnimal.ability.name === "Quick Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin)
        racingAnimal.ability.abilityInUse = false;

      //var slipAmount = percentChanceOfSlipping - rng;
      var slipAmount = 0;
      if (percentChanceOfSlipping > percentChanceOfSlippingCap)
        slipAmount = maxSlipAmount;
      else
        slipAmount = (percentChanceOfSlipping / percentChanceOfSlippingCap) * maxSlipAmount;

      if (slipAmount > maxSlipAmount)
        slipAmount = maxSlipAmount;

      if (racingAnimal.raceVariables.icyCurrentDirectionUp)
        racingAnimal.raceVariables.icyCurrentYAmount -= slipAmount;
      else
        racingAnimal.raceVariables.icyCurrentYAmount += slipAmount;

      if (racingAnimal.raceVariables.icyCurrentYAmount >= maxYAmount)
        racingAnimal.raceVariables.icyCurrentYAmount = maxYAmount;

      if (racingAnimal.raceVariables.icyCurrentYAmount <= minYAmount)
        racingAnimal.raceVariables.icyCurrentYAmount = minYAmount;

      raceResult.addRaceUpdate(framesPassed, animalDisplayName + " drifts to the side, losing " + slipAmount.toFixed(2) + "% max speed.");
      //console.log("Slippage: " + racingAnimal.raceVariables.icyCurrentDirectionUp ? -slipAmount : slipAmount);
      //console.log("Total Amount: " + racingAnimal.raceVariables.icyCurrentYAmount);
      currentPath.driftAmount = racingAnimal.raceVariables.icyCurrentDirectionUp ? -slipAmount : slipAmount;
      currentPath.totalTundraYAmount = racingAnimal.raceVariables.icyCurrentYAmount;
    }
    else {
      currentPath.driftAmount = 0;
      currentPath.totalTundraYAmount = racingAnimal.raceVariables.icyCurrentYAmount;

      if (racingAnimal.ability.name === "Quick Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin) {

        raceResult.addRaceUpdate(framesPassed, animalDisplayName + " slides through without drifting, gaining speed.");
        this.globalService.increaseAbilityXp(racingAnimal);
        obj.permanentMaxSpeedIncreaseMultiplier += (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, terrain.powerModifier, statLossFromExhaustion) / 100);
        racingAnimal.ability.abilityInUse = true;
      }
    }

    return wallHit;
  }

  handleLavaFall(racingAnimal: Animal, framesInCurrentLeg: number, averageDistancePerSecond: number, currentDistanceInLeg: number, legDistance: number, raceResult: RaceResult, framesPassed: number, previousPassedBreakpoint: boolean[]) {
    var ranIntoLava = false;
    var secondsIntoLeg = framesInCurrentLeg / this.frameModifier;

    //divide total leg distance by distance per second to get expected time to finish leg
    var legTimeCompleteExpectancy = legDistance / averageDistancePerSecond;

    //what percent of the total expected time to finish leg should each lava fall
    var lavaFallPercent = [.4, .45, .5, .55, .6];
    var percentOfLavaDropPerFrame = [];

    //needs to drop only if volcanic
    for (var i = 0; i < lavaFallPercent.length; i++) {
      var timeLavaDrops = legTimeCompleteExpectancy * lavaFallPercent[i];
      var percentOfIndividualLavaDropPerFrame = secondsIntoLeg / timeLavaDrops;
      if (percentOfIndividualLavaDropPerFrame > 1)
        percentOfIndividualLavaDropPerFrame = 1;
      percentOfLavaDropPerFrame.push(Math.round(percentOfIndividualLavaDropPerFrame * 1e5) / 1e5);

      var passedBreakpoint = currentDistanceInLeg > lavaFallPercent[i] * legDistance;
      var didJustPass = passedBreakpoint != previousPassedBreakpoint[i];
      previousPassedBreakpoint[i] = passedBreakpoint;

      if (secondsIntoLeg >= timeLavaDrops && didJustPass) {
        if (!(racingAnimal.type === AnimalTypeEnum.Salamander && racingAnimal.ability.name === "Burrow" && racingAnimal.ability.abilityInUse)) {
          raceResult.addRaceUpdate(framesPassed, "Lava spills out onto the course, forcing you to evacuate.");
          ranIntoLava = true;
        }
      }
    }

    this.selectedRace.raceUI.lavaFallPercentByFrame.push(percentOfLavaDropPerFrame);

    //test change
    return ranIntoLava;
  }

  handleRacePositionByFrame(race: Race, averageDistancePerSecond: number, framesPassed: number, distanceCovered: number) {
    var totalRacers = this.lookupService.getTotalRacersByRace(race);
    var currentPosition = totalRacers;

    var trackPaceModifierValue = .25;
    var trackPaceModifierValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingTrackPaceModifier");
    if (trackPaceModifierValuePair !== undefined)
      trackPaceModifierValue = trackPaceModifierValuePair.value;

    if (race.localRaceType === LocalRaceTypeEnum.Track) {
      for (var i = 0; i < totalRacers - 1; i++) {
        var paceModifier = 1 + (trackPaceModifierValue * (i));

        var competitorDistancePerSecond = race.length / (this.timeToComplete / paceModifier);

        if (distanceCovered > competitorDistancePerSecond * (framesPassed / this.frameModifier))
          currentPosition = totalRacers - (i + 1);
      }
    }
    else {
      var averageDistance = averageDistancePerSecond * (framesPassed / this.frameModifier);
      var averageDistancePassed = 0;
      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        var timePassed = (this.globalService.globalVar.eventRaceData.grandPrixTimeLength + this.globalService.globalVar.eventRaceData.bonusTime) - this.globalService.getRemainingEventRaceTime();
        averageDistancePassed = averageDistancePerSecond * timePassed;
        averageDistance += averageDistancePassed;
      }

      if (totalRacers === 2) //money mark not unlocked
      {
        if (distanceCovered > averageDistance)
          currentPosition = 1;
      }
      else if (totalRacers === 3) {
        if (distanceCovered > averageDistance)
          currentPosition = 2;

        var defaultMoneyMarkPace = .75;
        var moneyMarkPace = this.globalService.globalVar.modifiers.find(item => item.text === "moneyMarkPaceModifier");
        if (moneyMarkPace !== undefined && moneyMarkPace !== null)
          defaultMoneyMarkPace = moneyMarkPace.value;

        var moneyMarkDistancePerSecond = race.length / (this.timeToComplete * defaultMoneyMarkPace);

        if (distanceCovered > (moneyMarkDistancePerSecond * (framesPassed / this.frameModifier)) + averageDistancePassed)
          currentPosition = 1;
      }
    }

    race.raceUI.racePositionByFrame.push(currentPosition);
  }

  carryOverEventRaceSegmentData(racingAnimal: Animal, velocity: number, permanentMaxSpeedIncrease: number, permanentAdaptabilityIncrease: number,
    permanentMaxSpeedObjIncrease: number, feedingFrenzyIncrease: number, greatMigrationIncrease: number, coldBloodedIncrease: number,
    fleetingSpeedIncrease: number, nineTailsBuffs: [string, number][], grazeBuffs: [string, number][], deepBreathingStaminaGain: number,
    longDistanceTalentIncreaseAccelerationWithLowVelocity: boolean, maxSpeedFloor: number, whalePowerStored: number, pathsClearedWithoutLosingFocus: number) {
    var carryOverData = new EventSegmentCarryOverData();

    carryOverData.velocity = velocity;
    carryOverData.stamina = racingAnimal.currentStats.stamina;
    carryOverData.permanentMaxSpeedIncreaseMultiplier = permanentMaxSpeedIncrease;
    carryOverData.permanentAdaptabilityIncreaseMultiplier = permanentAdaptabilityIncrease;
    carryOverData.permanentMaxSpeedIncreaseObjMultiplier = permanentMaxSpeedObjIncrease;
    carryOverData.feedingFrenzyIncreaseMultiplier = feedingFrenzyIncrease;
    carryOverData.greatMigrationAccelerationIncreaseAdditive = greatMigrationIncrease;
    carryOverData.coldBloodedIncreaseMultiplier = coldBloodedIncrease;
    carryOverData.fleetingSpeedIncreaseMultiplier = fleetingSpeedIncrease;
    carryOverData.racingAnimalType = racingAnimal.type;
    carryOverData.deepBreathingStaminaGain = deepBreathingStaminaGain;
    carryOverData.longDistanceTalentIncreaseAccelerationWithLowVelocity = longDistanceTalentIncreaseAccelerationWithLowVelocity;
    carryOverData.maxSpeedFloor = maxSpeedFloor;
    carryOverData.whalePowerStored = whalePowerStored;
    carryOverData.pathsClearedWithoutLosingFocus = pathsClearedWithoutLosingFocus;

    if (nineTailsBuffs.length > 0) {
      nineTailsBuffs.forEach(item => {
        carryOverData.nineTailsBuffs.push(item);
      });
    }

    if (grazeBuffs.length > 0) {
      grazeBuffs.forEach(item => {
        carryOverData.grazeBuffs.push(item);
      });
    }

    if (racingAnimal.raceVariables.relayEffects.length > 0) {
      racingAnimal.raceVariables.relayEffects.forEach(item => {
        carryOverData.relayEffects.push(item);
      });
    }

    this.globalService.globalVar.eventRaceData.animalData.forEach(animal => {
      if (animal.associatedAnimalType === racingAnimal.type)
        carryOverData.statLossFromExhaustion = animal.exhaustionStatReduction;
    });

    carryOverData.raceVariables = racingAnimal.raceVariables.makeCopy();

    return carryOverData;
  }

  setStaminaLossForEventAnimal(statLossFromExhaustion: number, type: AnimalTypeEnum) {
    this.globalService.globalVar.eventRaceData.animalData.forEach(animal => {
      if (animal.associatedAnimalType === type) {
        animal.exhaustionStatReduction = statLossFromExhaustion;
        if (statLossFromExhaustion < (this.globalService.globalVar.relayEnergyFloor / 100))
        {          
          this.globalService.globalVar.eventRaceData.triggerEnergyFloorRelay = true;
        }
      }
    });
  }
}