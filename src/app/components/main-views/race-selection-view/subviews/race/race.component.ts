import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnInit, Output, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { race, Subject } from 'rxjs';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Ability } from 'src/app/models/animals/ability.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceVariables } from 'src/app/models/animals/race-variables.model';
import { EquipmentEnum } from 'src/app/models/equipment-enum.model';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceDesignEnum } from 'src/app/models/race-design-enum.model';
import { RaceDisplayInfoEnum } from 'src/app/models/race-display-info-enum.model';
import { RacerEffectEnum } from 'src/app/models/racer-effect-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { RacePath } from 'src/app/models/races/race-path.model';
import { RaceResult } from 'src/app/models/races/race-result.model';
import { Race } from 'src/app/models/races/race.model';
import { Terrain } from 'src/app/models/races/terrain.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { StringNumberPair } from 'src/app/models/utility/string-number-pair.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { InitializeService } from 'src/app/services/utility/initialize.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.css']
})
export class RaceComponent implements OnInit {
  @Input() selectedRace: Race;
  racingAnimals: Animal[];
  incrementalRaceUpdates: string;
  displayResults: boolean;
  rewardRows: any[][];
  rewardCells: any[];
  @Output() raceFinished = new EventEmitter<boolean>();
  skipRace: Subject<boolean> = new Subject<boolean>();
  pauseRace: Subject<boolean> = new Subject<boolean>();
  @ViewChild('circuitRewardModal', { static: true }) circuitRewardModal: ElementRef;
  raceSkipped = false;
  racePaused = false;
  frameModifier = 60;
  timeToComplete = 60;
  velocityAtCurrentFrame: any;
  maxSpeedAtCurrentFrame: any;
  staminaAtCurrentFrame: any;
  frameByFrameSubscription: any;
  currentLostFocusOpportunity = 0;
  displayVisualRace = true;
  displayTextUpdates = true;
  circuitIncreaseReward: any;
  tundraPreviousYAmount = 0;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService,
    private lookupService: LookupService, private initializeService: InitializeService, private modalService: NgbModal,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    var raceDisplayInfo = this.globalService.globalVar.settings.get("raceDisplayInfo");
    if (raceDisplayInfo === RaceDisplayInfoEnum.draw) {
      this.displayVisualRace = true;
      this.displayTextUpdates = false;
    }
    else if (raceDisplayInfo === RaceDisplayInfoEnum.text) {
      this.displayVisualRace = false;
      this.displayTextUpdates = true;
    }
    else if (raceDisplayInfo === RaceDisplayInfoEnum.both) {
      this.displayVisualRace = true;
      this.displayTextUpdates = true;
    }

    this.runRace(this.selectedRace);

    if (this.globalService.globalVar.settings.get("skipDrawRace"))
      this.raceSkipped = true;
  }

  ngOnDestroy() {
    this.frameByFrameSubscription.unsubscribe();
  }

  runRace(race: Race): RaceResult {
    var raceResult = new RaceResult();
    var totalRaceDistance = 0;
    var distanceCovered = 0;
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
    var previousLegDistancePercentComplete = 0;
    var herdMentalityStaminaGain = 0; //Caribou Ability - Herd Mentality  
    var specialDeliveryMaxSpeedBonus = 0;
    var buriedTreasureModifier = 1;    

    if (selectedDeck === undefined) {
      raceResult.errorMessage = 'No animal deck selected.';
      return raceResult;
    }

    this.racingAnimals = this.lookupService.getAnimalsFromAnimalDeck(selectedDeck);

    race.raceUI.distanceCoveredByFrame = [];
    race.raceUI.velocityByFrame = [];
    race.raceUI.timeToCompleteByFrame = [];
    race.raceUI.maxSpeedByFrame = [];
    race.raceUI.staminaPercentByFrame = [];
    race.raceUI.yAdjustmentByFrame = [];

    //do any pre-race setup
    race.raceLegs.forEach(item => {
      var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === item.courseType);
      if (racingAnimal === null || racingAnimal === undefined) {
        //TODO: throw error? no animal found
        return;
      }

      racingAnimal.raceVariables = new RaceVariables();
    });

    //calculate speed of animal based on acceleration and top speed (no obstacles)
    race.raceLegs.forEach(item => {
      var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === item.courseType);
      if (racingAnimal === null || racingAnimal === undefined) {
        //TODO: throw error? no animal found
        return;
      }

      var lastLeg = undefined;
      var nextLeg = new RaceLeg();
      //get correct color class
      var courseClass = "coloredText " + item.getCourseTypeClass();
      var animalDisplayName = "<span class='" + courseClass + "'>" + racingAnimal.name + "</span>";

      if (framesPassed < this.timeToComplete * this.frameModifier) {
        if (completedLegs.length > 0)
          lastLeg = completedLegs[completedLegs.length - 1];

        this.PrepareRacingAnimal(racingAnimal, completedAnimals, item, lastLeg);
        this.prepareRacingLeg(item, racingAnimal);
        raceResult.addRaceUpdate(framesPassed, animalDisplayName + " starts their leg of the race.");
      }

      var animalMaxStamina = racingAnimal.currentStats.stamina;
      var velocity = 0;
      var distanceToGo = item.distance;
      var currentPath = new RacePath();
      var lastPath = new RacePath();
      var lastAnimal: Animal | null = new Animal();
      var nextAnimal: Animal | null = new Animal();
      var currentPathCount = 0;
      var isLastPathInLeg = false;
      var permanentMaxSpeedIncreaseMultiplier = 1; //Cheetah Ability - On The Hunt, Gecko Ability - Night Vision   
      var permanentAccelerationIncreaseMultiplier = 1; //Octopus Ability - Propulsion
      var permanentAdaptabilityIncreaseMultiplierObj = { permanentAdaptabilityIncreaseMultiplier: 1 }; //Goat Ability - Sure-footed, created as an object so it can be passed as reference
      var feedingFrenzyIncreaseMultiplier = 1; //Shark Ability - Feeding Frenzy      
      var statLossFromExhaustion = 1;
      var aheadOfAveragePace = false;
      var legPercentBreakpoint = 0; //used to keep up with various ability distance breakpoints
      var framesInCurrentLeg = 0;

      if (racingAnimal.ability.name === "Nap" && racingAnimal.type === AnimalTypeEnum.Hare) {
        var distanceFromEnd = item.distance - this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion)
        if (distanceFromEnd < 0)
          distanceFromEnd = 0;
        racingAnimal.ability.remainingLength = distanceFromEnd;
      }

      for (var i = framesPassed; i <= this.timeToComplete * this.frameModifier; i++) {
        //Race logic here
        framesInCurrentLeg += 1;
        currentRacerEffect = RacerEffectEnum.None;
        var completedLegDistance = 0;
        if (completedLegCount > 0) {
          for (var x = 0; x < completedLegCount; x++) {
            completedLegDistance += race.raceLegs[x].distance;
          }
        }

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
          }
        }
        else
          nextAnimal = null;

        distancePerSecond = totalRaceDistance / this.timeToComplete;
        var currentDistanceInLeg = distanceCovered - completedLegDistance;
        var currentDistanceInLegPercent = currentDistanceInLeg / race.length;
        var currentDistanceInPath = 0;
        var pathFound = false;
        var totalDistanceInLeg = 0;

        if (racingAnimal.ability.name === "Night Vision" && racingAnimal.type === AnimalTypeEnum.Gecko) {
          var percentComplete = Math.floor(currentDistanceInLegPercent);
          var amountSinceLastFrame = percentComplete - previousLegDistancePercentComplete;
          permanentMaxSpeedIncreaseMultiplier += amountSinceLastFrame * (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);
          previousLegDistancePercentComplete = percentComplete;
        }

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

        if (racingAnimal.ability.name === "Feeding Frenzy" && racingAnimal.type === AnimalTypeEnum.Shark) {
          var distance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          if (currentDistanceInLeg <= distance || currentDistanceInLeg >= item.distance - distance) {
            feedingFrenzyIncreaseMultiplier = 1.5;
            var feedingFrenzyPositivePair = this.globalService.globalVar.modifiers.find(item => item.text === "feedingFrenzyPositiveModifier");
            if (feedingFrenzyPositivePair !== undefined)
              feedingFrenzyIncreaseMultiplier = feedingFrenzyPositivePair.value;
          }
        }

        if (lastAnimal !== null && lastLeg !== undefined) {
          if (lastAnimal.ability.name === "Camouflage" && lastAnimal.type === AnimalTypeEnum.Gecko && !lastAnimal.ability.abilityInUse) {
            var length = this.lookupService.GetAbilityEffectiveAmount(lastAnimal, lastLeg.terrain.powerModifier, statLossFromExhaustion);
            this.AddRelayEffect(racingAnimal, length, new AnimalStats(1, 1, 1, 1, 1, 1.25));
            lastAnimal.ability.abilityInUse = true;
          }

          if (lastAnimal.type === AnimalTypeEnum.Caribou && lastAnimal.ability.name === "Herd Mentality" && !lastAnimal.ability.abilityUsed) {
            if (herdMentalityStaminaGain > 0)
              racingAnimal.raceVariables.isBursting = true;

            racingAnimal.currentStats.stamina += herdMentalityStaminaGain;
            herdMentalityStaminaGain = 0;
            lastAnimal.ability.abilityUsed = true;            
          }
        }

        if (nextAnimal !== null && nextLeg !== undefined && nextAnimal.ability.name === "Camouflage" && nextAnimal.type === AnimalTypeEnum.Gecko && !nextAnimal.ability.abilityInUse) {
          var length = this.lookupService.GetAbilityEffectiveAmount(nextAnimal, nextLeg.terrain.powerModifier, statLossFromExhaustion);
          this.AddRelayEffect(racingAnimal, length, new AnimalStats(1, 1, 1, 1, 1, 1.25));
          nextAnimal.ability.abilityInUse = true;
        }        

        if (racingAnimal.ability.name === "Camouflage" && racingAnimal.type === AnimalTypeEnum.Gecko) {
          racingAnimal.ability.abilityInUse = false;
        }

        isLastPathInLeg = currentPath === item.pathData[item.pathData.length - 1];

        var modifiedAdaptabilityMs = this.getModifiedAdaptability(racingAnimal, permanentAdaptabilityIncreaseMultiplierObj, statLossFromExhaustion);
        var didAnimalStumble = this.didAnimalStumble(racingAnimal, currentPath, currentDistanceInPath, item.terrain, permanentAdaptabilityIncreaseMultiplierObj, modifiedAdaptabilityMs, statLossFromExhaustion);
        var didAnimalLoseFocus = this.didAnimalLoseFocus(racingAnimal, this.timeToComplete, race.length, distanceCovered, item.terrain, statLossFromExhaustion);

        if (didAnimalLoseFocus) {
          racingAnimal.raceVariables.lostFocus = true;
          racingAnimal.raceVariables.currentLostFocusLength = racingAnimal.raceVariables.defaultLostFocusLength;
          racingAnimal.raceVariables.metersSinceLostFocus = 0;
          velocityBeforeEffect = velocity;

          if (racingAnimal.ability.name === "Camouflage" && racingAnimal.type === AnimalTypeEnum.Gecko) {
            permanentMaxSpeedIncreaseMultiplier = 1;
          }

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " got distracted and lost focus!");
        }

        if (didAnimalStumble) {
          racingAnimal.raceVariables.stumbled = true;
          racingAnimal.raceVariables.currentStumbledLength = racingAnimal.raceVariables.defaultStumbledLength;
          velocityBeforeEffect = velocity;

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " stumbled!");
        }

        if (racingAnimal.currentStats.stamina === 0) {
          var exhaustionStatLossModifier = .9;
          var exhaustionStatLossPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionStatLossModifier");
          if (exhaustionStatLossPair !== undefined)
            exhaustionStatLossModifier = exhaustionStatLossPair.value;

          statLossFromExhaustion = statLossFromExhaustion * exhaustionStatLossModifier;

          var regainStaminaModifier = .5; //penalty for running out of stamina, only get half back     

          if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.quickSnack)) {
            regainStaminaModifier = 1;
            var quickSnackModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "quickSnackEquipmentModifier");
            if (quickSnackModifierPair !== undefined)
              regainStaminaModifier = quickSnackModifierPair.value;
          }

          racingAnimal.currentStats.stamina = animalMaxStamina * regainStaminaModifier;

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " ran out of stamina and must slow down.");
        }

        //Handle logic for recovering stamina / lost focus / stumbled
        if (racingAnimal.raceVariables.lostFocus || racingAnimal.raceVariables.stumbled) {
          if (racingAnimal.raceVariables.lostFocus) {
            currentRacerEffect = RacerEffectEnum.LostFocus;
            var velocityLoss = .9;
            var lostVelocity = velocityBeforeEffect * velocityLoss;

            if (velocity > 0)
              velocity -= lostVelocity / racingAnimal.raceVariables.defaultLostFocusLength;
            racingAnimal.raceVariables.currentLostFocusLength -= 1;

            if (racingAnimal.raceVariables.currentLostFocusLength === 0) {
              racingAnimal.raceVariables.lostFocus = false;
              //racingAnimal.raceVariables.currentLostFocusLength = racingAnimal.raceVariables.defaultLostFocusLength;
            }
          }

          if (racingAnimal.raceVariables.stumbled) {
            currentRacerEffect = RacerEffectEnum.Stumble;
            var lostVelocity = velocityBeforeEffect - (velocityBeforeEffect * currentPath.stumbleSeverity);

            if (velocity > 0)
              velocity -= lostVelocity / racingAnimal.raceVariables.defaultStumbledLength;
            racingAnimal.raceVariables.currentStumbledLength -= 1;

            if (racingAnimal.raceVariables.currentStumbledLength === 0) {
              racingAnimal.raceVariables.stumbled = false;
            }
          }
        }
        else {
          var modifiedAccelerationMs = racingAnimal.currentStats.accelerationMs;

          modifiedAccelerationMs *= item.terrain.accelerationModifier;
          modifiedAccelerationMs *= statLossFromExhaustion;

          if (racingAnimal.type === AnimalTypeEnum.Horse && racingAnimal.ability.name === "Pacemaker" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1.25;
          }
          if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Sprint" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1.1;
          }
          if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Giving Chase") {
            var averageDistance = distancePerSecond * (framesPassed / this.frameModifier);
            var meterDifferential = averageDistance - distanceCovered;
            if (meterDifferential > 0) {
              var percentPerSecond = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
              var modifiedAmount = (meterDifferential / distancePerSecond) * percentPerSecond;
              if (modifiedAmount >= 1)
                modifiedAccelerationMs *= modifiedAmount;
            }
          }
          if (racingAnimal.type === AnimalTypeEnum.Octopus && racingAnimal.ability.name === "Propulsion") {
            var percentComplete = Math.floor(currentDistanceInLegPercent);
            var amountSinceLastBreakpoint = percentComplete - legPercentBreakpoint;
            while (amountSinceLastBreakpoint > 8) {
              if (amountSinceLastBreakpoint > 8)
                permanentAccelerationIncreaseMultiplier += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100;

              amountSinceLastBreakpoint -= 8;
            }

            modifiedAccelerationMs *= permanentAccelerationIncreaseMultiplier;
            legPercentBreakpoint = percentComplete - (percentComplete % 8);
            previousLegDistancePercentComplete = percentComplete;
          }
          if (racingAnimal.ability.name === "Feeding Frenzy" && racingAnimal.type === AnimalTypeEnum.Shark) {
            modifiedAccelerationMs *= feedingFrenzyIncreaseMultiplier;
          }
          if (racingAnimal.ability.name === "Wild Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin && racingAnimal.ability.abilityInUse) {
            var percentOfDrift = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100;
            modifiedAccelerationMs = percentOfDrift * currentPath.driftAmount;
            racingAnimal.ability.abilityInUse = true;
          }
          if (racingAnimal.ability.name === "Nap" && racingAnimal.type === AnimalTypeEnum.Hare) {
            if (distancePerSecond * (framesPassed / this.frameModifier) < completedLegDistance + racingAnimal.ability.remainingLength) {
              modifiedAccelerationMs = 0;
            }
            else {
              modifiedAccelerationMs *= 2;
            }
          }
          if (racingAnimal.ability.name === "Buried Treasure" && racingAnimal.type === AnimalTypeEnum.Octopus) {
            racingAnimal.ability.remainingLength += i;
            if (racingAnimal.ability.remainingLength < 8 * this.frameModifier) {
              modifiedAccelerationMs = 0;
            }
          }
          if (racingAnimal.type === AnimalTypeEnum.Salamander && racingAnimal.ability.name === "Heat Up" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= (1.15 * racingAnimal.ability.totalUseCount);
          }

          //console.log("Acceleration: " + modifiedAccelerationMs);
          velocity += modifiedAccelerationMs / this.frameModifier;
        }

        var modifiedMaxSpeed = racingAnimal.currentStats.maxSpeedMs;
        modifiedMaxSpeed *= item.terrain.maxSpeedModifier;
        modifiedMaxSpeed *= statLossFromExhaustion;

        if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Sprint" && racingAnimal.ability.abilityInUse) {
          modifiedMaxSpeed *= 1.25;
        }
        if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "On The Hunt") {
          modifiedMaxSpeed *= permanentMaxSpeedIncreaseMultiplier;
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
        if (racingAnimal.ability.name === "Quick Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin && racingAnimal.ability.abilityInUse) {
          modifiedMaxSpeed *= 1 + (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);
        }
        if (racingAnimal.type === AnimalTypeEnum.Gecko && racingAnimal.ability.name === "Night Vision") {
          modifiedMaxSpeed *= permanentMaxSpeedIncreaseMultiplier;
        }

        if (velocity > modifiedMaxSpeed)
          velocity = modifiedMaxSpeed;

        //if you are entering a new path, check if you burst here
        //if so, do the necessary number adjustments
        if (currentDistanceInLeg + velocity >= currentPath.legStartingDistance + currentPath.length && this.isSecond(framesPassed)) {
          //Entering new path
          var doesRacerBurst = this.doesRacerBurst(racingAnimal, currentPath);
          if (doesRacerBurst) {
            //do a raceupdate
            racingAnimal.raceVariables.isBursting = true;
            racingAnimal.raceVariables.remainingBurstMeters = racingAnimal.currentStats.burstDistance;
            racingAnimal.raceVariables.burstCount += 1;

            if (racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Frenzy") {
              racingAnimal.raceVariables.remainingBurstMeters += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
            }

            if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Prey Instinct" && !racingAnimal.ability.abilityUsed) {
              racingAnimal.raceVariables.remainingBurstMeters += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
              racingAnimal.ability.abilityUsed = true;
            }

            if (racingAnimal.type === AnimalTypeEnum.Octopus && racingAnimal.ability.name === "Big Brain" && racingAnimal.raceVariables.burstCount === 8) {
              var indexOfOctopus = race.raceLegs.findIndex(item => item.courseType === RaceCourseTypeEnum.Ocean);
              if (race.raceLegs.length > indexOfOctopus) {
                race.raceLegs.slice(indexOfOctopus + 1).forEach(remainingLeg => {
                  var remainingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === remainingLeg.courseType);
                  if (remainingAnimal !== null && remainingAnimal !== undefined) {
                    var powerMultiplier = 1 + (this.lookupService.GetAbilityEffectiveAmount(remainingAnimal, remainingLeg.terrain.powerModifier, statLossFromExhaustion) / 100);
                    this.AddRelayEffect(remainingAnimal, remainingLeg.distance, new AnimalStats(1, 1, 1, powerMultiplier, 1, 1));
                  }
                });
              }
            }

            raceResult.addRaceUpdate(framesPassed, "<strong>BURST!</strong> " + animalDisplayName + " is breaking their limit!");

            if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "On The Hunt") {
              permanentMaxSpeedIncreaseMultiplier += (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);
            }

            if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Deep Breathing") {
              var staminaGain = animalMaxStamina * (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100);
              racingAnimal.currentStats.stamina += staminaGain;

              if (racingAnimal.currentStats.stamina > animalMaxStamina) {
                racingAnimal.currentStats.stamina = animalMaxStamina;

                var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === racingAnimal?.type);
                if (globalAnimal !== undefined && globalAnimal !== null)
                  globalAnimal.currentStats.endurance += 1;
              }
            }
          }
        }

        var modifiedVelocity = velocity;
        //do any velocity modifications here before finalizing distance traveled per sec

        //do modifier until you are about to run out of burst, then do it fractionally
        if (racingAnimal.raceVariables.isBursting) {
          currentRacerEffect = RacerEffectEnum.Burst;
          var burstModifier = 1.25;

          if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "In The Rhythm") {
            burstModifier += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          }
          
          burstModifier += specialDeliveryMaxSpeedBonus;

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
        }

        //don't go further than distance to go
        var distanceCoveredPerFrame = modifiedVelocity / this.frameModifier;

        if (racingAnimal.ability.abilityInUse &&
          ((racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Leap") ||
            (racingAnimal.type === AnimalTypeEnum.Dolphin && racingAnimal.ability.name === "Breach"))) {
          var totalDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          var extraDistanceCovered = totalDistance / racingAnimal.ability.totalFrames;
          distanceCoveredPerFrame += extraDistanceCovered;

          racingAnimal.ability.remainingFrames -= 1;

          if (racingAnimal.ability.remainingFrames <= 0) {
            racingAnimal.ability.abilityInUse = false;
          }
        }

        if (item.courseType === RaceCourseTypeEnum.Tundra) {
          var wallHit = this.handleTundraDrift(racingAnimal, currentPath, lastPath, isLastPathInLeg, modifiedAdaptabilityMs, item.terrain, currentDistanceInPath, distanceCoveredPerFrame);

          if (wallHit) {
            distanceCoveredPerFrame = 0;
            velocity = 0;
            raceResult.addRaceUpdate(framesPassed, animalDisplayName + " slid into a wall and lost all momentum!");
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
          this.handleLavaFall(racingAnimal, framesInCurrentLeg, race.length / this.timeToComplete, currentDistanceInLeg, item.distance);
        }


        distanceCovered += distanceCoveredPerFrame > distanceToGo ? distanceToGo : distanceCoveredPerFrame;
        distanceToGo -= distanceCoveredPerFrame;
        race.raceUI.distanceCoveredByFrame.push(distanceCovered);
        race.raceUI.velocityByFrame.push(distanceCoveredPerFrame);
        race.raceUI.timeToCompleteByFrame.push(this.timeToComplete);
        race.raceUI.maxSpeedByFrame.push(modifiedMaxSpeed);
        race.raceUI.staminaPercentByFrame.push(racingAnimal.currentStats.stamina / animalMaxStamina);
        race.raceUI.racerEffectByFrame.push(currentRacerEffect);

        this.handleStamina(racingAnimal, raceResult, distanceCoveredPerFrame, framesPassed, item.terrain);

        if (!didAnimalLoseFocus)
          racingAnimal.raceVariables.metersSinceLostFocus += distanceCoveredPerFrame;

        if (racingAnimal.ability.abilityInUse && racingAnimal.ability.remainingLength > 0) {
          racingAnimal.ability.remainingLength -= distanceCoveredPerFrame;

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
          }
        }

        if (racingAnimal.ability.currentCooldown !== undefined && racingAnimal.ability.currentCooldown !== null &&
          racingAnimal.ability.currentCooldown <= 0 && this.abilityRedundancyCheck(racingAnimal, velocity, currentPath, item, distanceToGo, statLossFromExhaustion)) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = framesPassed;
          timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName);
          raceResult.raceUpdates.push(timingUpdate);
          this.useAbility(racingAnimal, race, item, statLossFromExhaustion);
          racingAnimal.ability.currentCooldown = racingAnimal.ability.cooldown;
        }

        if (racingAnimal.raceVariables.hasRelayEffect) {
          if (racingAnimal.raceVariables.remainingRelayMeters <= distanceCoveredPerFrame) {
            racingAnimal.raceVariables.remainingRelayMeters = 0;
            racingAnimal.raceVariables.hasRelayEffect = false;
            racingAnimal.currentStats.divideCurrentRacingStats(racingAnimal.raceVariables.relayAffectedStatRatios);
            raceResult.addRaceUpdate(framesPassed, animalDisplayName + "'s relay effect ends.");
          }
          else {
            racingAnimal.raceVariables.remainingRelayMeters -= distanceCoveredPerFrame;
          }
        }

        //Race housekeeping here
        if (framesPassed !== 0 && framesPassed !== this.timeToComplete && framesPassed % (10 * this.frameModifier) === 0) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = framesPassed;
          timingUpdate.text = this.getUpdateMessageByRelativeDistance(distancePerSecond, framesPassed, distanceCovered, animalDisplayName);
          raceResult.raceUpdates.push(timingUpdate);
        }

        var passedAveragePace = false;
        if (distanceCovered > distancePerSecond * (framesPassed / this.frameModifier)) {
          if (!aheadOfAveragePace)
            passedAveragePace = true;

          aheadOfAveragePace = true;
        }
        else {
          if (aheadOfAveragePace)
            passedAveragePace = true;

          aheadOfAveragePace = false;
        }

        if (passedAveragePace && racingAnimal.type === AnimalTypeEnum.Shark && racingAnimal.ability.name === "Apex Predator" && !racingAnimal.ability.abilityUsed &&
          i > 1) //wait until second frame to start
        {
          var delayAmount = 1.5;
          racingAnimal.ability.abilityUsed = true;
          var effectiveDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          var percentOfRaceAffected = effectiveDistance / this.selectedRace.length;
          var raceTimeAffected = this.timeToComplete * percentOfRaceAffected;
          var delayedTime = raceTimeAffected * delayAmount;
          this.timeToComplete += delayedTime - raceTimeAffected;
        }

        racingAnimal.ability.currentCooldown -= 1 / this.frameModifier;
        framesPassed += 1;

        if (distanceToGo <= 0) {
          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " finishes their leg of the race.");
          item.legComplete = true;
          legCounter += 1;
          if (racingAnimal.type === AnimalTypeEnum.Caribou && racingAnimal.ability.name === "Herd Mentality" && !racingAnimal.raceVariables.ranOutOfStamina) {
            herdMentalityStaminaGain = racingAnimal.currentStats.stamina * this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          } 
          if (racingAnimal.type === AnimalTypeEnum.Caribou && racingAnimal.ability.name === "Special Delivery" && !racingAnimal.raceVariables.ranOutOfStamina) {
            specialDeliveryMaxSpeedBonus = ((racingAnimal.currentStats.stamina / animalMaxStamina) * 100) * this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion);
          } 
          if (racingAnimal.ability.name === "Buried Treasure" && racingAnimal.type === AnimalTypeEnum.Octopus) {
            buriedTreasureModifier = 1 + this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier, statLossFromExhaustion) / 100;
          }                
          this.PrepareRacingAnimal(racingAnimal, undefined, undefined, undefined, statLossFromExhaustion); //Reset so that stamina and such look correct on view pages
          completedAnimals.push(racingAnimal);
          completedLegs.push(item);
          break;
        }
      }

      completedLegCount += 1;
    });

    if (!race.raceLegs.some(item => !item.legComplete)) {
      race.isCompleted = true;
      raceResult.wasSuccessful = true;
      raceResult.totalFramesPassed = framesPassed;

      raceResult.addRaceUpdate(framesPassed, "You won the race!");
    }
    else {
      raceResult.addRaceUpdate(framesPassed, "You lost the race...");
    }

    if (raceResult.wasSuccessful) {
      this.raceWasSuccessfulUpdate(raceResult, buriedTreasureModifier);
    }
    this.setupDisplayRewards(race);
    this.displayRaceUpdates(raceResult);
    this.getFrameByFrameStats();
    return raceResult;
  }

  getStaminaModifier(terrain: Terrain): number {
    var staminaModifier: number;
    var staminaModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "staminaModifier");
    if (staminaModifierPair === undefined)
      staminaModifier = .2;
    else
      staminaModifier = staminaModifierPair.value;

    if (terrain !== undefined && terrain !== null && terrain.staminaModifier !== undefined && terrain.staminaModifier !== null)
      staminaModifier += terrain.staminaModifier;

    return staminaModifier;
  }

  handleStamina(racingAnimal: Animal, raceResult: RaceResult, distanceCoveredPerFrame: number, framesPassed: number, terrain: Terrain) {
    var staminaModifier = this.getStaminaModifier(terrain);

    //if using thoroughbred, don't reduce stamina at all
    if (!(racingAnimal.type === AnimalTypeEnum.Horse && racingAnimal.ability.name === "Thoroughbred" && racingAnimal.ability.abilityInUse)) {
      if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Sprint" && racingAnimal.ability.abilityInUse)
        racingAnimal.currentStats.stamina -= (distanceCoveredPerFrame * staminaModifier) * 2;
      else
        racingAnimal.currentStats.stamina -= distanceCoveredPerFrame * staminaModifier;
    }

    if (racingAnimal.currentStats.stamina < 0)
      racingAnimal.currentStats.stamina = 0;
      racingAnimal.raceVariables.ranOutOfStamina = true;
  }

  doesRacerBurst(animal: Animal, currentPath: RacePath): boolean {
    var modifiedBurstChance = animal.currentStats.burstChance;

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

        console.log("Original Chance: " + animal.currentStats.burstChance);
        console.log("Modifier: " + racerMapModifier);
        modifiedBurstChance *= racerMapModifier;

        console.log("Modified Chance: " + modifiedBurstChance);
      }
    }

    var rng = this.utilityService.getRandomNumber(1, 100);

    if (rng <= modifiedBurstChance)
      return true;

    return false;
  }

  getUpdateMessageByRelativeDistance(distancePerSecond: number, framesPassed: number, distanceCovered: number, animalName: string): string {
    var timingUpdateMessage = animalName;

    var expectedDistance = distancePerSecond * (framesPassed / this.frameModifier);
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
      timingUpdateMessage = animalName + " is <strong>WAY ahead the pack!</strong>";
    else if (distanceCovered >= expectedDistance * 1.1)
      timingUpdateMessage = animalName + " is <strong>barely leading the pack!</strong>";

    return timingUpdateMessage;
  }

  displayRaceUpdates(raceResult: RaceResult): void {
    var raceUpdates = raceResult.raceUpdates;
    var currentTime = 0;
    this.incrementalRaceUpdates = "";
    var subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      if (!this.racePaused)
        currentTime += deltaTime;

      //TODO: if you hit the back button then this is delayed -- needs to be considered like skipping.
      //run a race that will rank you up, hit back, and wait and you should see this
      if (raceUpdates.length === 0 || this.raceSkipped) //also check if skip button pressed/setting to auto skip is checked
      {
        if (this.raceSkipped) {
          raceUpdates.forEach(update => {
            this.incrementalRaceUpdates += this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(update.text + "\n"));
          });
        }

        if (raceResult.wasSuccessful) {
          this.displayResults = true;

          if (this.circuitIncreaseReward !== null && this.circuitIncreaseReward !== undefined && this.circuitIncreaseReward[0] !== "")
            this.modalService.open(this.circuitRewardModal, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
        }

        subscription.unsubscribe();
        return;
      }

      if ((currentTime * this.frameModifier) >= raceUpdates[0].value) {
        this.incrementalRaceUpdates += this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(raceUpdates[0].text + "\n"));
        raceUpdates.shift();
      }
    });
  }

  setupDisplayRewards(race: Race): void {
    this.rewardCells = [];
    this.rewardRows = [];

    var maxColumns = 6;

    for (var i = 1; i <= race.rewards.length; i++) {
      this.rewardCells.push({ name: race.rewards[i - 1].name, amount: race.rewards[i - 1].amount });
      if ((i % maxColumns) == 0) {
        this.rewardRows.push(this.rewardCells);
        this.rewardCells = [];
      }
    }

    if (this.rewardCells.length !== 0)
      this.rewardRows.push(this.rewardCells);
  }

  raceWasSuccessfulUpdate(raceResult: RaceResult, buriedTreasureModifier: number): void {
    var globalCircuitRank = this.globalService.globalVar.circuitRank;
    var globalRaceVal: Race | undefined;
    var breedGaugeIncrease = 0;

    if (this.selectedRace.isCircuitRace) {
      globalRaceVal = this.globalService.globalVar.circuitRaces.find(item => item.raceId === this.selectedRace.raceId);
      breedGaugeIncrease = this.lookupService.getCircuitBreedGaugeIncrease();

      var circuitRankRaces = this.globalService.globalVar.circuitRaces.filter(item => item.requiredRank === globalCircuitRank);
      if (circuitRankRaces.every(item => item.isCompleted)) {
        this.circuitIncreaseReward = this.globalService.IncreaseCircuitRank();
        this.selectedRace.rewards.push(this.initializeService.initializeResource("Medals", 1));
      }
    }
    else {
      globalRaceVal = this.globalService.globalVar.localRaces
        .find(item => item.raceId === this.selectedRace.raceId && item.localRaceType === this.selectedRace.localRaceType);
      breedGaugeIncrease = this.lookupService.getLocalBreedGaugeIncrease();
    }

    if (this.selectedRace.localRaceType !== LocalRaceTypeEnum.Free) {
      if (globalRaceVal === undefined)
        return;

      this.globalService.IncreaseLocalRaceRank(this.selectedRace.localRaceType);
      globalRaceVal.isCompleted = true;
    }
    else {
      this.globalService.globalVar.nationalRaceCountdown += 1;
    }

    this.racingAnimals.forEach(animal => {
      this.globalService.IncreaseAnimalBreedGauge(animal, breedGaugeIncrease);     
    });

    raceResult.beatMoneyMark = this.checkMoneyMark(raceResult);

    if (this.selectedRace.rewards !== undefined && this.selectedRace.rewards !== null) {
      this.selectedRace.rewards.forEach(item => {
        if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
          if (this.globalService.globalVar.resources.some(x => x.name === item.name)) {
            var globalResource = this.globalService.globalVar.resources.find(x => x.name === item.name);
            if (globalResource !== null && globalResource !== undefined) {
              if (globalResource.name === "Coins") {
                //adjust for money mark
                if (raceResult.beatMoneyMark) {
                  raceResult.addRaceUpdate(raceResult.totalFramesPassed, "You beat the money mark!");

                  var defaultMoneyMarkModifier = 1.25;
                  var moneyMarkModifier = this.globalService.globalVar.modifiers.find(item => item.text === "moneyMarkRewardModifier");
                  if (moneyMarkModifier !== undefined && moneyMarkModifier !== null) {
                    defaultMoneyMarkModifier = moneyMarkModifier.value;
                  }

                  item.amount = Math.round(item.amount * defaultMoneyMarkModifier);
                }

                //adjust for renown
                var currentRenown = this.lookupService.getRenown();
                item.amount = Math.round(item.amount * this.utilityService.getRenownCircuitRaceModifier(currentRenown));
                
                //adjust for buried treasure
                item.amount = Math.round(item.amount * buriedTreasureModifier);

                globalResource.amount += item.amount;
              }
              else if (globalResource.name === "Facility Level") {
                globalResource.amount += item.amount;
                this.lookupService.recalculateAllAnimalStats();
              }
              else
                globalResource.amount += item.amount;
            }
          }
          else {
            this.globalService.globalVar.resources.push(new ResourceValue(item.name, item.amount));
          }
        }
      });
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

    console.log("Total Frames Passed: " + result.totalFramesPassed);
    console.log("MM Pace: " + totalRaceTime * moneyMarkPace.value);
    if (result.totalFramesPassed <= totalRaceTime * moneyMarkPace.value) {
      beatMoneyMark = true;
    }

    return beatMoneyMark;
  }

  isSecond(framesPassed: number) {
    return framesPassed % this.frameModifier === 0;
  }

  PrepareRacingAnimal(animal: Animal, completedAnimals?: Animal[], currentLeg?: RaceLeg, previousLeg?: RaceLeg, statLossFromExhaustion?: number) {
    animal.ability.currentCooldown = animal.ability.cooldown;
    animal.ability.remainingLength = 0;
    animal.ability.totalUseCount = 0;
    animal.raceVariables.ranOutOfStamina = true;
    if (animal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.pendant)) {
      var pendantCooldownModifier = .9;
      var pendantModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "pendantEquipmentModifier");
      if (pendantModifierPair !== undefined)
        pendantCooldownModifier = pendantModifierPair.value;
      animal.ability.currentCooldown *= pendantCooldownModifier;
    }

    animal.ability.abilityUsed = false;
    animal.ability.abilityInUse = false;
    animal.raceVariables.burstCount = 0;
    this.globalService.calculateAnimalRacingStats(animal);

    if (completedAnimals !== undefined && completedAnimals !== null && completedAnimals.length > 0) {
      var lastCompletedAnimal = completedAnimals[completedAnimals.length - 1];
      if (lastCompletedAnimal.ability.name === "Inspiration" && lastCompletedAnimal.type === AnimalTypeEnum.Horse) {
        if (previousLeg !== undefined && previousLeg !== null) {
          var length = this.lookupService.GetAbilityEffectiveAmount(lastCompletedAnimal, previousLeg.terrain.powerModifier, statLossFromExhaustion);
          this.AddRelayEffect(animal, length, new AnimalStats(1.25, 1, 1, 1, 1, 1));
        }
      }

      if (lastCompletedAnimal.ability.name === "Flowing Current" && lastCompletedAnimal.type === AnimalTypeEnum.Dolphin) {
        if (previousLeg !== undefined && previousLeg !== null) {
          var length = this.lookupService.GetAbilityEffectiveAmount(lastCompletedAnimal, previousLeg.terrain.powerModifier, statLossFromExhaustion);
          this.AddRelayEffect(animal, length, new AnimalStats(1, 1.25, 1, 1, 1, 1));
        }
      }

      if (currentLeg !== undefined)
        this.batonEquipmentCheck(lastCompletedAnimal, animal, currentLeg.distance);
    }

    if (animal.raceVariables.hasRelayEffect) {
      animal.currentStats.multiplyCurrentRacingStats(animal.raceVariables.relayAffectedStatRatios);
    }
  }

  batonEquipmentCheck(previousAnimal: Animal, nextAnimal: Animal, length: number) {

    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.redBaton)) {
      var defaultRedBatonModifier = 1.1;
      var redBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "redBatonEquipmentModifier");
      if (redBatonEquipmentModifierPair !== undefined)
        defaultRedBatonModifier = redBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, length, new AnimalStats(defaultRedBatonModifier, 1, 1, 1, 1, 1));
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.blueBaton)) {
      var defaultBlueBatonModifier = 1.1;
      var blueBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "blueBatonEquipmentModifier");
      if (blueBatonEquipmentModifierPair !== undefined)
        defaultBlueBatonModifier = blueBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, length, new AnimalStats(1, 1, 1, 1, defaultBlueBatonModifier, 1));
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.violetBaton)) {
      var defaultVioletBatonModifier = 1.1;
      var violetBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "violetBatonEquipmentModifier");
      if (violetBatonEquipmentModifierPair !== undefined)
        defaultVioletBatonModifier = violetBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, length, new AnimalStats(1, 1, 1, defaultVioletBatonModifier, 1, 1));
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.greenBaton)) {
      var defaultGreenBatonModifier = 1.1;
      var greenBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "greenBatonEquipmentModifier");
      if (greenBatonEquipmentModifierPair !== undefined)
        defaultGreenBatonModifier = greenBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, length, new AnimalStats(1, 1, 1, 1, 1, defaultGreenBatonModifier));
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.orangeBaton)) {
      var defaultOrangeBatonModifier = 1.1;
      var orangeBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "orangeBatonEquipmentModifier");
      if (orangeBatonEquipmentModifierPair !== undefined)
        defaultOrangeBatonModifier = orangeBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, length, new AnimalStats(1, defaultOrangeBatonModifier, 1, 1, 1, 1));
    }
    if (previousAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.yellowBaton)) {
      var defaultYellowBatonModifier = 1.1;
      var yellowBatonEquipmentModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "yellowBatonEquipmentModifier");
      if (yellowBatonEquipmentModifierPair !== undefined)
        defaultYellowBatonModifier = yellowBatonEquipmentModifierPair.value;
      this.AddRelayEffect(nextAnimal, length, new AnimalStats(1, 1, defaultYellowBatonModifier, 1, 1, 1));
    }
  }

  prepareRacingLeg(raceLeg: RaceLeg, racingAnimal: Animal) {
    if (racingAnimal.type === AnimalTypeEnum.Dolphin && racingAnimal.ability.name === "Echolocation" && racingAnimal.ability.abilityInUse) {
      if (raceLeg.terrain.maxSpeedModifier < 1)
        raceLeg.terrain.maxSpeedModifier = 1;
      if (raceLeg.terrain.accelerationModifier < 1)
        raceLeg.terrain.accelerationModifier = 1;
      if (raceLeg.terrain.staminaModifier < 1)
        raceLeg.terrain.staminaModifier = 1;
      if (raceLeg.terrain.powerModifier < 1)
        raceLeg.terrain.powerModifier = 1;
      if (raceLeg.terrain.focusModifier < 1)
        raceLeg.terrain.focusModifier = 1;
      if (raceLeg.terrain.adaptabilityModifier < 1)
        raceLeg.terrain.adaptabilityModifier = 1;
    }

    raceLeg.pathData.forEach(path => {
      path.currentStumbleOpportunity = 0;
    });

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

  AddRelayEffect(racingAnimal: Animal, distance: number, statMultiplers: AnimalStats) {
    racingAnimal.raceVariables.hasRelayEffect = true;
    racingAnimal.raceVariables.remainingRelayMeters = distance;
    racingAnimal.raceVariables.relayAffectedStatRatios = statMultiplers;
  }

  didAnimalStumble(racingAnimal: Animal, currentPath: RacePath, currentDistanceInPath: number, terrain: Terrain, obj: { permanentAdaptabilityIncreaseMultiplier: number }, modifiedAdaptabilityMs: number, statLossFromExhaustion: number): boolean {    
    if (racingAnimal.raceVariables.stumbled)
      return false; //already stumbling

    if (currentPath.frequencyOfStumble === 0)
      return false;

    if (racingAnimal.type === AnimalTypeEnum.Gecko && racingAnimal.ability.name === "Sticky" && racingAnimal.ability.abilityInUse) {
      return false;
    }

    if (racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Frenzy" && racingAnimal.raceVariables.isBursting) {
      return false;
    }
    

    if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.headband)) {
      var headbandMaxStumblePrevention = 3;
      var headbandModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "headbandEquipmentModifier");
      if (headbandModifierPair !== undefined)
        headbandMaxStumblePrevention = headbandModifierPair.value;
      if (racingAnimal.raceVariables.headbandStumblePreventionCount < headbandMaxStumblePrevention) {
        racingAnimal.raceVariables.headbandStumblePreventionCount += 1;
        //TODO: Add display message
        //console.log("Headband prevents stumble");
        return false;
      }
    }

    var stumbleBreakpoint = currentPath.length / currentPath.stumbleOpportunities;
    
    //made it through without stumbling
    if (currentPath.currentStumbleOpportunity === currentPath.stumbleOpportunities && currentPath.routeDesign !== RaceDesignEnum.Regular) {
      if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Sure-footed") {
        obj.permanentAdaptabilityIncreaseMultiplier += (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, terrain.powerModifier, statLossFromExhaustion) / 100);
        currentPath.currentStumbleOpportunity += 1; //use this so that you don't trigger multiple times -- can come up with better method
      }
    }

    //console.log(currentPath.currentStumbleOpportunity + " * " + stumbleBreakpoint + " < " + currentDistanceInPath);
    if (currentPath.currentStumbleOpportunity * stumbleBreakpoint < currentDistanceInPath) {
      currentPath.currentStumbleOpportunity += 1;

      var rng = this.utilityService.getRandomNumber(1, 100);

      var frequencyPerNumberOfMeters = 250; //frequency / 250 meters
      var terrainAdjustedAdaptability = modifiedAdaptabilityMs * terrain.adaptabilityModifier;
      frequencyPerNumberOfMeters += terrainAdjustedAdaptability;

      var percentChanceOfStumbling = ((currentPath.frequencyOfStumble / frequencyPerNumberOfMeters) * currentPath.length);

      console.log(rng + " vs " + percentChanceOfStumbling);
      if (rng <= percentChanceOfStumbling) {
        currentPath.didAnimalStumble = true;
        return true;
      }
    }

    return false;
  }

  didAnimalLoseFocus(racingAnimal: Animal, timeToComplete: number, raceLength: number, currentDistanceInRace: number, terrain: Terrain, statLossFromExhaustion: number): boolean {
    if (racingAnimal.raceVariables.lostFocus)
      return false; //already lost focus

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

      var unwaveringFocus = (racingAnimal.currentStats.focusMs * terrain.focusModifier) * focusModifier * statLossFromExhaustion;

      if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Awareness" && racingAnimal.ability.abilityInUse) {
        unwaveringFocus *= 1.25;
      }
      if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Nap") {
        unwaveringFocus *= 2;
      }

      if (racingAnimal.raceVariables.metersSinceLostFocus < unwaveringFocus)
        return false;

      var metersSinceExpectedDistraction = racingAnimal.raceVariables.metersSinceLostFocus - unwaveringFocus;
      var percentChanceOfLosingFocus = (metersSinceExpectedDistraction / racingAnimal.currentStats.focusMs) * 100;

      var rng = this.utilityService.getRandomNumber(1, 100);
      if (rng <= percentChanceOfLosingFocus)
        return true;
    }
    return false;
  }

  //only use abilities when they are actually useful/able to be used
  abilityRedundancyCheck(racingAnimal: Animal, velocity: number, currentPath: RacePath, currentLeg: RaceLeg, distanceToGo: number, statLossFromExhaustion: number): boolean {
    if (racingAnimal.ability.oneTimeEffect && racingAnimal.ability.abilityUsed)
      return false;

    if (racingAnimal.ability.name === "Thoroughbred" && racingAnimal.type === AnimalTypeEnum.Horse &&
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

  useAbility(racingAnimal: Animal, race: Race, currentLeg: RaceLeg, statLossFromExhaustion: number) {
    racingAnimal.ability.abilityUsed = true;

    if (racingAnimal.type === AnimalTypeEnum.Horse) {
      if (racingAnimal.ability.name === "Thoroughbred" ||
        racingAnimal.ability.name === "Pacemaker") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Cheetah) {
      if (racingAnimal.ability.name === "Sprint") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Monkey) {
      if (racingAnimal.ability.name === "Landslide") {
        var effectiveDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
        var averageDistancePerSecond = race.length / this.timeToComplete;
        this.timeToComplete += effectiveDistance / averageDistancePerSecond;
      }

      if (racingAnimal.ability.name === "Leap") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingFrames = racingAnimal.ability.totalFrames;
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Dolphin) {
      if (racingAnimal.ability.name === "Breach") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingFrames = racingAnimal.ability.totalFrames;
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Salamander) {
      if (racingAnimal.ability.name === "Heat Up") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.totalUseCount += 1;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier, statLossFromExhaustion);
      }
    }
  }

  getModifiedAdaptability(racingAnimal: Animal, obj: { permanentAdaptabilityIncreaseMultiplier: number }, statLossFromExhaustion: number) {
    var modifiedAdaptabilityMs = racingAnimal.currentStats.adaptabilityMs * statLossFromExhaustion;
    if (racingAnimal.type === AnimalTypeEnum.Dolphin && racingAnimal.ability.name === "Echolocation" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= 1.5;
    }
    if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Sure-footed") {
      modifiedAdaptabilityMs *= obj.permanentAdaptabilityIncreaseMultiplier;
    }
    if (racingAnimal.type === AnimalTypeEnum.Hare && racingAnimal.ability.name === "Awareness" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= 1.25;
    }

    return modifiedAdaptabilityMs;
  }

  handleTundraDrift(racingAnimal: Animal, currentPath: RacePath, lastPath: RacePath, isLastPathInLeg: boolean, modifiedAdaptabilityMs: number, terrain: Terrain, currentDistanceInPath: number, xDistanceCovered: number) {
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
      //console.log("Drift Amount: " + currentPath.driftAmount + " New Y Amount: " + currentPath.totalTundraYAmount);      
      return wallHit;
    }

    //get drift change    
    var rng = this.utilityService.getRandomNumber(1, 100);
    var frequencyPerNumberOfMeters = 1000; //frequency / 1000 meters
    var terrainAdjustedAdaptability = modifiedAdaptabilityMs * terrain.adaptabilityModifier;
    frequencyPerNumberOfMeters += terrainAdjustedAdaptability;

    var percentChanceOfSlipping = ((currentPath.frequencyOfDrift / frequencyPerNumberOfMeters) * currentPath.length);

    //console.log("RNG: " + rng + " Chance To Slip: " + percentChanceOfSlipping + " Path Length: " + currentPath.length);
    if (rng <= percentChanceOfSlipping) {
      currentPath.didAnimalStumble = true;

      var goingUp = this.utilityService.getRandomInteger(1, 2);
      if (goingUp === 1)
        racingAnimal.raceVariables.icyCurrentDirectionUp = true;
      else
        racingAnimal.raceVariables.icyCurrentDirectionUp = false;

      var slipAmount = percentChanceOfSlipping - rng;
      var maxSlipAmount = 20;

      if (racingAnimal.ability.name === "Wild Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin) {
        maxSlipAmount *= 2;
        racingAnimal.ability.abilityInUse = true;
      }

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

      //console.log("Slippage: " + racingAnimal.raceVariables.icyCurrentDirectionUp ? -slipAmount : slipAmount);
      //console.log("Total Amount: " + racingAnimal.raceVariables.icyCurrentYAmount);
      currentPath.driftAmount = racingAnimal.raceVariables.icyCurrentDirectionUp ? -slipAmount : slipAmount;
      currentPath.totalTundraYAmount = racingAnimal.raceVariables.icyCurrentYAmount;
    }
    else {
      currentPath.driftAmount = 0;
      currentPath.totalTundraYAmount = racingAnimal.raceVariables.icyCurrentYAmount;

      if (racingAnimal.ability.name === "Quick Toboggan" && racingAnimal.type === AnimalTypeEnum.Penguin)
        racingAnimal.ability.abilityInUse = true;
    }

    return wallHit;
  }

  handleLavaFall(racingAnimal: Animal, framesInCurrentLeg: number, averageDistancePerSecond: number, currentDistanceInLeg: number, legDistance: number)
  {
    var ranIntoLava = false;
    var secondsIntoLeg = framesInCurrentLeg / this.frameModifier;
    
    //divide total leg distance by distance per second to get expected time to finish leg
    var legTimeCompleteExpectancy = legDistance / averageDistancePerSecond;

    //what percent of the total expected time to finish leg should each lava fall
    var lavaFallPercent = [.4, .45, .475, .525, .55, .6];
    var percentOfLavaDropPerFrame = [];

    for (var i = 0; i < lavaFallPercent.length; i++)
    {
      var timeLavaDrops = legTimeCompleteExpectancy * lavaFallPercent[i];
      var percentOfIndividualLavaDropPerFrame = secondsIntoLeg / timeLavaDrops;
      percentOfLavaDropPerFrame.push(percentOfIndividualLavaDropPerFrame);

      if (secondsIntoLeg >= timeLavaDrops)
        ranIntoLava = true;
    }

    this.selectedRace.raceUI.lavaFallPercentByFrame.push(percentOfLavaDropPerFrame);

    return ranIntoLava;
  }

  goToRaceSelection(): void {
    this.raceFinished.emit(true);
  }

  skipRaceAnimation(): void {
    this.raceSkipped = true;
    this.skipRace.next(true);
  }

  pauseRaceAnimation(): void {
    this.racePaused = !this.racePaused;
    this.pauseRace.next(true);
  }

  getFrameByFrameStats() {
    var currentTime = 0;

    this.frameByFrameSubscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      if (!this.racePaused)
        currentTime += deltaTime;
      var currentFrame = Math.floor(currentTime * this.frameModifier);

      if (this.selectedRace.raceUI.velocityByFrame.length <= currentFrame || this.raceSkipped) {
        var lastFrameCount = this.selectedRace.raceUI.velocityByFrame.length - 1;
        this.velocityAtCurrentFrame = (this.selectedRace.raceUI.velocityByFrame[lastFrameCount] * this.frameModifier).toFixed(2); //needs to be m/s
        this.staminaAtCurrentFrame = (this.selectedRace.raceUI.staminaPercentByFrame[lastFrameCount] * 100).toFixed(2);
        this.maxSpeedAtCurrentFrame = this.selectedRace.raceUI.maxSpeedByFrame[lastFrameCount].toFixed(2);
      }
      else {
        this.velocityAtCurrentFrame = (this.selectedRace.raceUI.velocityByFrame[currentFrame] * this.frameModifier).toFixed(2);
        this.staminaAtCurrentFrame = (this.selectedRace.raceUI.staminaPercentByFrame[currentFrame] * 100).toFixed(2);
        this.maxSpeedAtCurrentFrame = this.selectedRace.raceUI.maxSpeedByFrame[currentFrame].toFixed(2);
      }
    });
  }
}
