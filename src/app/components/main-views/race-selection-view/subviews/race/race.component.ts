import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { race, Subject } from 'rxjs';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Ability } from 'src/app/models/animals/ability.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceVariables } from 'src/app/models/animals/race-variables.model';
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
  rewardRows: string[][];
  rewardCells: string[];
  @Output() raceFinished = new EventEmitter<boolean>();
  skipRace: Subject<boolean> = new Subject<boolean>();
  pauseRace: Subject<boolean> = new Subject<boolean>();
  raceSkipped = false;
  racePaused = false;
  frameModifier = 60;
  timeToComplete = 60;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService,
    private lookupService: LookupService, private initializeService: InitializeService) { }

  ngOnInit(): void {
    this.runRace(this.selectedRace);

    if (this.globalService.globalVar.settings.get("skipDrawRace"))
      this.raceSkipped = true;
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

    if (selectedDeck === undefined) {
      raceResult.errorMessage = 'No animal deck selected.';
      return raceResult;
    }

    this.racingAnimals = this.lookupService.getAnimalsFromAnimalDeck(selectedDeck);

    race.raceUI.distanceCoveredBySecond = [];
    race.raceUI.velocityBySecond = [];
    race.raceUI.timeToCompleteByFrame = [];

    //calculate speed of animal based on acceleration and top speed (no obstacles)
    race.raceLegs.forEach(item => {
      var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === item.courseType);
      if (racingAnimal === null || racingAnimal === undefined) {
        //TODO: throw error? no animal found
        return;
      }
      this.PrepareRacingAnimal(racingAnimal, completedAnimals);
      raceResult.addRaceUpdate(framesPassed, racingAnimal.name + " starts their leg of the race.");

      var animalMaxStamina = racingAnimal.currentStats.stamina;
      var velocity = 0;
      var distanceToGo = item.distance;
      var currentPath = new RacePath();
      var currentPathCount = 0;

      for (var i = framesPassed; i <= this.timeToComplete * this.frameModifier; i++) {
        //Race logic here
        var completedLegDistance = 0;
        if (completedLegCount > 0) {
          for (var x = 0; x < completedLegCount; x++) {
            completedLegDistance += race.raceLegs[x].distance;
          }
        }

        distancePerSecond = totalRaceDistance / this.timeToComplete;
        var currentDistanceInLeg = distanceCovered - completedLegDistance;
        var pathFound = false;
        var totalDistanceInLeg = 0;

        item.pathData.forEach(path => {
          if (!pathFound && currentDistanceInLeg >= totalDistanceInLeg && currentDistanceInLeg < totalDistanceInLeg + path.length) {
            pathFound = true;
            currentPath = path;
          }
          path.legStartingDistance = totalDistanceInLeg;
          totalDistanceInLeg += path.length;
          currentPathCount += 1;
        });

        var didAnimalStumble = this.didAnimalStumble(racingAnimal, currentPath, framesPassed);
        var didAnimalLoseFocus = this.didAnimalLoseFocus(racingAnimal, framesPassed);

        if (didAnimalLoseFocus) {
          racingAnimal.raceVariables.lostFocus = true;
          racingAnimal.raceVariables.currentLostFocusLength = racingAnimal.raceVariables.defaultLostFocusLength;
          racingAnimal.raceVariables.metersSinceLostFocus = 0;

          raceResult.addRaceUpdate(framesPassed, racingAnimal.name + " got distracted and lost focus!");
        }

        if (didAnimalStumble) {
          racingAnimal.raceVariables.stumbled = true;

          raceResult.addRaceUpdate(framesPassed, racingAnimal.name + " stumbled!");
        }

        if (racingAnimal.currentStats.stamina === 0) {
          racingAnimal.raceVariables.recoveringStamina = true;
          velocity = velocity / 2;

          raceResult.addRaceUpdate(framesPassed, racingAnimal.name + " ran out of stamina and must slow down.");
        }

        //Handle logic for recovering stamina / lost focus / stumbled
        if (racingAnimal.raceVariables.recoveringStamina || racingAnimal.raceVariables.lostFocus || racingAnimal.raceVariables.stumbled) {
          if (racingAnimal.raceVariables.recoveringStamina) {
            console.log("Recovering Stamina");
            racingAnimal.raceVariables.currentRecoveringStaminaLength -= 1;
            //velocity += racingAnimal.currentStats.accelerationMs / 2;

            if (racingAnimal.raceVariables.currentRecoveringStaminaLength === 0) {
              racingAnimal.raceVariables.recoveringStamina = false;
              racingAnimal.raceVariables.currentRecoveringStaminaLength = racingAnimal.raceVariables.defaultRecoveringStaminaLength;
              racingAnimal.currentStats.stamina = animalMaxStamina / 2; //penalty for running out of stamina, only get half back             
            }
          }

          if (racingAnimal.raceVariables.lostFocus) {
            console.log("Lost Focus");
            velocity = velocity / 2;
            racingAnimal.raceVariables.currentLostFocusLength -= 1;

            if (racingAnimal.raceVariables.currentLostFocusLength === 0) {
              racingAnimal.raceVariables.lostFocus = false;
              racingAnimal.raceVariables.currentLostFocusLength = racingAnimal.raceVariables.defaultLostFocusLength;
            }
          }

          if (racingAnimal.raceVariables.stumbled) {
            velocity = velocity * currentPath.stumbleSeverity;
            racingAnimal.raceVariables.stumbled = false;
          }
        }
        else {
          var modifiedAccelerationMs = racingAnimal.currentStats.accelerationMs;

          if (racingAnimal.type === AnimalTypeEnum.Horse && racingAnimal.ability.name === "Pacemaker" && racingAnimal.ability.abilityInUse) {
            modifiedAccelerationMs *= 1.25;
          }

          velocity += modifiedAccelerationMs / this.frameModifier;
        }

        if (velocity > racingAnimal.currentStats.maxSpeedMs)
          velocity = racingAnimal.currentStats.maxSpeedMs;

        //if you are entering a new path, check if you burst here
        //if so, do the necessary number adjustments
        if (currentDistanceInLeg + velocity >= currentPath.legStartingDistance + currentPath.length && this.isSecond(framesPassed)) {
          //Entering new path
          var doesRacerBurst = this.doesRacerBurst(racingAnimal, currentPath);
          if (doesRacerBurst) {
            //do a raceupdate
            racingAnimal.raceVariables.isBursting = true;
            racingAnimal.raceVariables.remainingBurstMeters = racingAnimal.currentStats.burstDistance;
            raceResult.addRaceUpdate(framesPassed, "BURST! " + racingAnimal.name + " is breaking their limit!");
          }
        }

        var modifiedVelocity = velocity;
        //do any velocity modifications here before finalizing distance traveled per sec

        //do modifier until you are about to run out of burst, then do it fractionally
        if (racingAnimal.raceVariables.isBursting) {
          var burstModifier = 1.25;

          if (racingAnimal.raceVariables.remainingBurstMeters >= modifiedVelocity) {
            modifiedVelocity *= burstModifier;
            racingAnimal.raceVariables.remainingBurstMeters -= modifiedVelocity;

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
            raceResult.addRaceUpdate(framesPassed, racingAnimal.name + "'s burst ends.");
          }
        }

        //don't go further than distance to go
        var distanceCoveredPerFrame = modifiedVelocity / this.frameModifier;

        if (racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Leap") {
          var leapDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal);
          if (leapDistance >= distanceToGo) {
            raceResult.addRaceUpdate(framesPassed, racingAnimal.name + " leaps the remaining distance of their leg.");
            distanceCoveredPerFrame = leapDistance;
          }
        }

        distanceCovered += distanceCoveredPerFrame > distanceToGo ? distanceToGo : distanceCoveredPerFrame;
        distanceToGo -= distanceCoveredPerFrame;
        race.raceUI.distanceCoveredBySecond.push(distanceCovered);
        race.raceUI.velocityBySecond.push(distanceCoveredPerFrame);
        race.raceUI.timeToCompleteByFrame.push(this.timeToComplete);

        if (!racingAnimal.raceVariables.recoveringStamina)
          this.handleStamina(racingAnimal, raceResult, distanceCoveredPerFrame, framesPassed, item.terrain);

        //Cooldown housekeeping
        if (!didAnimalLoseFocus)
          racingAnimal.raceVariables.metersSinceLostFocus += distanceCoveredPerFrame;

        if (racingAnimal.ability.abilityInUse) {
          racingAnimal.ability.remainingLength -= distanceCoveredPerFrame;

          if (racingAnimal.ability.remainingLength <= 0) {
            racingAnimal.ability.abilityInUse = false;
            racingAnimal.ability.currentCooldown = racingAnimal.ability.cooldown;
          }
        }

        if (racingAnimal.ability.currentCooldown <= 0 && this.abilityRedundancyCheck(racingAnimal, velocity)) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = framesPassed;
          timingUpdate.text = racingAnimal.getAbilityUseUpdateText();
          raceResult.raceUpdates.push(timingUpdate);
          this.useAbility(racingAnimal, race);
          racingAnimal.ability.currentCooldown = racingAnimal.ability.cooldown;
        }

        if (racingAnimal.raceVariables.hasRelayEffect) {
          if (racingAnimal.raceVariables.remainingRelayMeters <= modifiedVelocity) {
            racingAnimal.raceVariables.remainingRelayMeters = 0;
            racingAnimal.raceVariables.hasRelayEffect = false;
            racingAnimal.currentStats.divideCurrentRacingStats(racingAnimal.raceVariables.relayAffectedStatRatios);
            raceResult.addRaceUpdate(framesPassed, racingAnimal.name + "'s relay effect ends.");
          }
          else {
            racingAnimal.raceVariables.remainingRelayMeters -= modifiedVelocity;
          }
        }

        //Race housekeeping here
        if (framesPassed !== 0 && framesPassed !== this.timeToComplete && framesPassed % (10 * this.frameModifier) === 0) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = framesPassed;
          timingUpdate.text = this.getUpdateMessageByRelativeDistance(distancePerSecond, framesPassed, distanceCovered, racingAnimal.name);
          raceResult.raceUpdates.push(timingUpdate);
        }

        racingAnimal.ability.currentCooldown -= 1 / this.frameModifier;
        framesPassed += 1;

        //TODO: do anything about fractional time?
        if (distanceToGo <= 0) {
          //framesPassed = i;
          raceResult.addRaceUpdate(framesPassed, racingAnimal.name + " finishes their leg of the race.");
          item.legComplete = true;
          //console.log("Leg Complete at " + framesPassed + " seconds");
          this.PrepareRacingAnimal(racingAnimal); //Reset so that stamina and such look correct on view pages
          completedAnimals.push(racingAnimal);
          break;
        }
      }

      completedLegCount += 1;
    });

    if (!race.raceLegs.some(item => !item.legComplete)) {
      race.isCompleted = true;
      raceResult.wasSuccessful = true;

      raceResult.addRaceUpdate(framesPassed, "You won the race!");
    }
    else {
      raceResult.addRaceUpdate(framesPassed, "You lost the race...");
    }

    //TODO: add tripping and hazards, adaptability stat
    //TODO: add abilities, power stat
    //TODO: add stopping, focus stat    
    if (raceResult.wasSuccessful) {
      this.raceWasSuccessfulUpdate(raceResult);
    }
    //console.log("Pre Draw Distance: ");
    console.log(race.raceUI.distanceCoveredBySecond);
    this.setupDisplayRewards(race);
    this.displayRaceUpdates(raceResult);
    return raceResult;
  }

  getStaminaModifier(terrain: Terrain): number {
    var staminaModifier: number;
    var staminaModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "staminaModifier");
    if (staminaModifierPair === undefined)
      staminaModifier = .2;
    else
      staminaModifier = staminaModifierPair.value;

    if (terrain !== undefined && terrain !== null)
      staminaModifier += terrain.staminaModifier;

    return staminaModifier;
  }

  handleStamina(racingAnimal: Animal, raceResult: RaceResult, distanceCoveredPerFrame: number, framesPassed: number, terrain: Terrain) {
    var staminaModifier = this.getStaminaModifier(terrain);

    if (!(racingAnimal.type === AnimalTypeEnum.Horse && racingAnimal.ability.name === "Thoroughbred" && racingAnimal.ability.abilityInUse)) {
      racingAnimal.currentStats.stamina -= distanceCoveredPerFrame * staminaModifier;
    }

    if (racingAnimal.currentStats.stamina < 0)
      racingAnimal.currentStats.stamina = 0;
  }

  doesRacerBurst(animal: Animal, currentPath: RacePath): boolean {
    //if (!currentPath.isSpecialPath)
    //  return false;

    var rng = this.utilityService.getRandomNumber(1, 100);

    if (rng <= animal.currentStats.burstChance)
      return true;

    return false;
  }

  getUpdateMessageByRelativeDistance(distancePerSecond: number, framesPassed: number, distanceCovered: number, animalName: string): string {
    var timingUpdateMessage = animalName;

    var expectedDistance = distancePerSecond * (framesPassed / this.frameModifier);
    if (distanceCovered < expectedDistance * .9)
      timingUpdateMessage = animalName + " is falling behind the rest of the pack!";
    else if (distanceCovered >= expectedDistance * .9 && distanceCovered <= expectedDistance * 1.1)
      timingUpdateMessage = animalName + " is right on pace.";
    else if (distanceCovered >= expectedDistance * 1.1)
      timingUpdateMessage = animalName + " is way ahead of the pack!";

    return timingUpdateMessage;
  }

  displayRaceUpdates(raceResult: RaceResult): void {
    var raceUpdates = raceResult.raceUpdates;
    var currentTime = 0;
    this.incrementalRaceUpdates = "";
    var subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      if (!this.racePaused)
        currentTime += deltaTime;

      if (raceUpdates.length === 0 || this.raceSkipped) //also check if skip button pressed/setting to auto skip is checked
      {
        if (this.raceSkipped) {
          raceUpdates.forEach(update => {
            this.incrementalRaceUpdates += update.text + "\n";
          });
        }

        if (raceResult.wasSuccessful)
          this.displayResults = true;

        subscription.unsubscribe();
        return;
      }

      if ((currentTime * this.frameModifier) >= raceUpdates[0].value) {
        this.incrementalRaceUpdates += raceUpdates[0].text + "\n";
        raceUpdates.shift();
      }
    });
  }

  setupDisplayRewards(race: Race): void {
    this.rewardCells = [];
    this.rewardRows = [];

    var maxColumns = 6;

    for (var i = 1; i <= race.rewards.length; i++) {
      this.rewardCells.push(race.rewards[i - 1].name + ": " + race.rewards[i - 1].amount);
      if ((i % maxColumns) == 0) {
        this.rewardRows.push(this.rewardCells);
        this.rewardCells = [];
      }
    }

    if (this.rewardCells.length !== 0)
      this.rewardRows.push(this.rewardCells);
  }

  raceWasSuccessfulUpdate(raceResult: RaceResult): void {
    var globalCircuitRank = this.globalService.globalVar.circuitRank;
    var globalRaceVal: Race | undefined;
    var breedGaugeIncrease = 0;

    //TODO: This is just for circuit -- need local as 
    if (this.selectedRace.isCircuitRace) {
      globalRaceVal = this.globalService.globalVar.circuitRaces.find(item => item.raceId === this.selectedRace.raceId);
      breedGaugeIncrease = this.lookupService.getCircuitBreedGaugeIncrease();

      var circuitRankRaces = this.globalService.globalVar.circuitRaces.filter(item => item.requiredRank === globalCircuitRank);
      if (circuitRankRaces.every(item => item.isCompleted)) {
        this.globalService.IncreaseCircuitRank();
        this.selectedRace.rewards.push(this.initializeService.initializeResource("Medals", 1));
      }
    }
    else
    {
      globalRaceVal = this.globalService.globalVar.localRaces
      .find(item => item.raceId === this.selectedRace.raceId && item.localRaceType === this.selectedRace.localRaceType);    
      breedGaugeIncrease = this.lookupService.getLocalBreedGaugeIncrease();  
    }

    if (globalRaceVal === undefined)
      return;

    globalRaceVal.isCompleted = true;    
    this.racingAnimals.forEach(animal => {
      this.globalService.IncreaseAnimalBreedGauge(animal, breedGaugeIncrease);
    });

    if (this.selectedRace.rewards !== undefined && this.selectedRace.rewards !== null) {
      this.selectedRace.rewards.forEach(item => {
        if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
          if (this.globalService.globalVar.resources.some(x => x.name === item.name)) {
            var globalResource = this.globalService.globalVar.resources.find(x => x.name === item.name);
            if (globalResource !== null && globalResource !== undefined) {
              if (globalResource.name === "Money") {
                var currentRenown = this.lookupService.getRenown();
                globalResource.amount += item.amount * this.utilityService.getRenownCircuitRaceModifier(currentRenown);
              }
              else if (globalResource.name === "Facility Level")
              {
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

  isSecond(framesPassed: number) {
    return framesPassed % this.frameModifier === 0;
  }

  PrepareRacingAnimal(animal: Animal, completedAnimals?: Animal[]) {
    animal.ability.currentCooldown = animal.ability.cooldown;
    this.globalService.calculateAnimalRacingStats(animal);
    animal.raceVariables = new RaceVariables();

    if (completedAnimals !== undefined && completedAnimals !== null && completedAnimals.length > 0) {
      var lastCompletedAnimal = completedAnimals[completedAnimals.length - 1];
      if (lastCompletedAnimal.ability.name === "Inspiration" && lastCompletedAnimal.type === AnimalTypeEnum.Horse) {
        //add max speed to animal but only for a certain number of meters
        var length = lastCompletedAnimal.ability.efficiency * (1 + lastCompletedAnimal.currentStats.powerMs);
        this.AddRelayEffect(animal, length, new AnimalStats(1.25, 1, 1, 1, 1, 1));
      }
    }

    if (animal.raceVariables.hasRelayEffect) {
      animal.currentStats.multiplyCurrentRacingStats(animal.raceVariables.relayAffectedStatRatios);
    }
  }

  AddRelayEffect(racingAnimal: Animal, distance: number, statMultiplers: AnimalStats) {
    racingAnimal.raceVariables.hasRelayEffect = true;
    racingAnimal.raceVariables.remainingRelayMeters = distance;
    racingAnimal.raceVariables.relayAffectedStatRatios = statMultiplers;
  }

  didAnimalStumble(racingAnimal: Animal, currentPath: RacePath, framesPassed: number): boolean {
    //each path has a stumble severity and frequency of stumble per X meters
    //adaptabilityMS decreases that frequency    
    if (!this.isSecond(framesPassed))
      return false;

    var rng = this.utilityService.getRandomNumber(1, 100);

    var adjustedStumbleFrequency = 1000 + racingAnimal.currentStats.adaptabilityMs;
    var percentChanceOfStumbling = (currentPath.frequencyOfStumble / adjustedStumbleFrequency) * 100;

    if (rng <= percentChanceOfStumbling)
      return true;

    return false;
  }

  didAnimalLoseFocus(racingAnimal: Animal, framesPassed: number): boolean {
    if (!this.isSecond(framesPassed))
      return false;

    //focusModifier is inverse of what percent chance the animal will lose focus right at their focusMs amount
    var focusModifier: number;
    var focusModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "focusModifier");
    if (focusModifierPair === undefined)
      focusModifier = .75;
    else
      focusModifier = focusModifierPair.value;

    var unwaveringFocus = racingAnimal.currentStats.focusMs * focusModifier;

    if (racingAnimal.raceVariables.metersSinceLostFocus < unwaveringFocus)
      return false;

    var metersSinceExpectedDistraction = racingAnimal.raceVariables.metersSinceLostFocus - unwaveringFocus;
    var percentChanceOfLosingFocus = (metersSinceExpectedDistraction / racingAnimal.currentStats.focusMs) * 100;

    var rng = this.utilityService.getRandomNumber(1, 100);

    if (rng <= percentChanceOfLosingFocus)
      return true;

    return false;
  }

  //only use abilities when they are actually useful/able to be used
  abilityRedundancyCheck(racingAnimal: Animal, velocity: number): boolean {
    if (racingAnimal.ability.name === "Thoroughbred" && racingAnimal.type === AnimalTypeEnum.Horse &&
      racingAnimal.raceVariables.recoveringStamina)
      return false;

    if (racingAnimal.ability.name === "Pacemaker" && racingAnimal.type === AnimalTypeEnum.Horse &&
      velocity === racingAnimal.currentStats.maxSpeedMs)
      return false;

    return true;
  }

  useAbility(racingAnimal: Animal, race: Race) {
    if (racingAnimal.type === AnimalTypeEnum.Horse) {
      if (racingAnimal.ability.name === "Thoroughbred" ||
        racingAnimal.ability.name === "Pacemaker") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal);
      }
      else if (racingAnimal.ability.name === "Inspiration") {
        //racingAnimal.ability.abilityInUse = true;
        //racingAnimal.ability.remainingLength = racingAnimal.ability.efficiency * (1 + racingAnimal.currentStats.powerMs);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Monkey) {
      if (racingAnimal.ability.name === "Landslide") {
        var effectiveDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal);
        var averageDistancePerSecond = race.length / this.timeToComplete;
        this.timeToComplete += effectiveDistance / averageDistancePerSecond;
      }
    }
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
}
