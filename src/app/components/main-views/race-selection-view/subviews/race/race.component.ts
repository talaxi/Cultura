import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceResult } from 'src/app/models/races/race-result.model';
import { Race } from 'src/app/models/races/race.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { StringNumberPair } from 'src/app/models/utility/string-number-pair.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.css']
})
export class RaceComponent implements OnInit {
  @Input() selectedRace: Race;
  incrementalRaceUpdates: string;
  displayResults: boolean;
  rewardRows: string[][];
  rewardCells: string[];
  @Output() raceFinished = new EventEmitter<boolean>();

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService,
    private lookupService: LookupService) { }

  ngOnInit(): void {
    this.runRace(this.selectedRace);
  }

  runRace(race: Race): RaceResult {
    var raceResult = new RaceResult();
    var totalRaceDistance = 0;
    var distancePerSecond = 0;
    var distanceCovered = 0;
    race.raceLegs.forEach(item => totalRaceDistance += item.distance);
    distancePerSecond = totalRaceDistance / 60;
    var secondsPassed = 0;
    if (race.timeToComplete === 0 || race.timeToComplete === undefined || race.timeToComplete === null)
      race.timeToComplete = 60;
    var selectedDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);

    if (selectedDeck === undefined)
    {
      raceResult.errorMessage = 'No animal deck selected.';
      return raceResult;
    }

    var racingAnimals = this.lookupService.getAnimalsFromAnimalDeck(selectedDeck);

    //TODO: more specific way to get the animals racing each leg
    //calculate speed of animal based on acceleration and top speed (no obstacles)
    race.raceLegs.forEach(item => {
      var racingAnimal = racingAnimals.find(animal => animal.raceCourseType === item.courseType);
      if (racingAnimal === null || racingAnimal === undefined) {
        //TODO: throw error? no animal found
        return;
      }
      this.PrepareRacingAnimal(racingAnimal);

      var firstUpdate: StringNumberPair = new StringNumberPair();
      firstUpdate.value = secondsPassed;
      firstUpdate.text = racingAnimal.name + " starts their leg of the race."
      raceResult.raceUpdates.push(firstUpdate);

      var velocity = 0;
      var distanceToGo = item.distance;
      for (var i = secondsPassed; i <= race.timeToComplete; i++) {
        //Race logic here

        //TODO: Add focus and adaptability here
        var didAnimalStumble = this.didAnimalStumble(racingAnimal);
        var didAnimalLoseFocus = this.didAnimalLoseFocus(racingAnimal);

        if (didAnimalLoseFocus)
          racingAnimal.raceVariables.lostFocus = true;

        if (didAnimalStumble)
          racingAnimal.raceVariables.stumbled = true;

        if (racingAnimal.raceVariables.recoveringStamina || racingAnimal.raceVariables.lostFocus || racingAnimal.raceVariables.stumbled) {
          if (racingAnimal.raceVariables.recoveringStamina) {
            racingAnimal.raceVariables.currentRecoveringStaminaLength -= 1;
            velocity = racingAnimal.currentStats.accelerationMs / 2;

            if (racingAnimal.raceVariables.currentRecoveringStaminaLength === 0) {
              racingAnimal.raceVariables.recoveringStamina = false;
              racingAnimal.raceVariables.currentRecoveringStaminaLength = racingAnimal.raceVariables.defaultRecoveringStaminaLength;
            }
          }
          
          if (racingAnimal.raceVariables.lostFocus)
          {            
            velocity = 0;

            if (racingAnimal.raceVariables.currentLostFocusLength === 0) {
              racingAnimal.raceVariables.lostFocus = false;
              racingAnimal.raceVariables.currentLostFocusLength = racingAnimal.raceVariables.defaultLostFocusLength;
              racingAnimal.raceVariables.metersSinceLostFocus = 0;
            }
            //TODO: ADD MESSAGE
          }

          if (racingAnimal.raceVariables.stumbled)
          {            
            //TODO: ??
          }
        }
        else {
          velocity += racingAnimal.currentStats.accelerationMs;
        }

        if (velocity > racingAnimal.currentStats.maxSpeedMs)
          velocity = racingAnimal.currentStats.maxSpeedMs;

        distanceCovered += velocity;
        distanceToGo -= velocity;

        race.raceUI.distanceCoveredBySecond.push(distanceCovered);
        race.raceUI.velocityBySecond.push(velocity);

        if (!didAnimalLoseFocus)        
          racingAnimal.raceVariables.metersSinceLostFocus += velocity;                

        if (racingAnimal.ability.abilityInUse) {
          racingAnimal.ability.remainingLength -= velocity;

          if (racingAnimal.ability.remainingLength <= 0) {
            racingAnimal.ability.abilityInUse = false;
            racingAnimal.ability.currentCooldown = racingAnimal.ability.cooldown;
          }
        }

        var staminaModifier: number;
        var staminaModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "staminaModifier");
        if (staminaModifierPair === undefined)
          staminaModifier = .2;
        else
          staminaModifier = staminaModifierPair.value;

        if (!(racingAnimal.type === AnimalTypeEnum.Horse && racingAnimal.ability.abilityInUse)) {
          racingAnimal.currentStats.stamina -= velocity * staminaModifier;
        }

        if (racingAnimal.currentStats.stamina < 0)
          racingAnimal.currentStats.stamina = 0;

        if (racingAnimal.currentStats.stamina === 0) {
          racingAnimal.raceVariables.recoveringStamina = true;
          velocity = velocity / 2;

          var staminaUpdate: StringNumberPair = new StringNumberPair();
          staminaUpdate.value = secondsPassed;
          staminaUpdate.text = racingAnimal.name + " ran out of stamina and must slow down.";
          raceResult.raceUpdates.push(staminaUpdate);
        }

        if (racingAnimal.ability.currentCooldown <= 0) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = secondsPassed;
          timingUpdate.text = racingAnimal.getAbilityUseUpdateText();
          raceResult.raceUpdates.push(timingUpdate);
          racingAnimal.useAbility();
          racingAnimal.ability.currentCooldown = racingAnimal.ability.cooldown;
        }

        //Race housekeeping here
        if (secondsPassed !== 0 && secondsPassed !== race.timeToComplete && secondsPassed % 10 === 0) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = secondsPassed;
          timingUpdate.text = this.getUpdateMessageByRelativeDistance(distancePerSecond, secondsPassed, distanceCovered, racingAnimal.name);
          raceResult.raceUpdates.push(timingUpdate);
        }

        racingAnimal.ability.currentCooldown -= 1;
        secondsPassed += 1;

        //TODO: do anything about fractional time?
        if (distanceToGo <= 0) {
          secondsPassed = i;
          var finishUpdate: StringNumberPair = new StringNumberPair();
          finishUpdate.value = secondsPassed;
          finishUpdate.text = racingAnimal.name + " finishes their leg of the race.";
          raceResult.raceUpdates.push(finishUpdate);
          item.legComplete = true;
          this.PrepareRacingAnimal(racingAnimal); //Reset so that stamina and such look correct on view pages
          break;
        }
      }
    });

    if (!race.raceLegs.some(item => !item.legComplete)) {
      race.isCompleted = true;
      raceResult.wasSuccessful = true;

      var raceFinishUpdate: StringNumberPair = new StringNumberPair();
      raceFinishUpdate.value = secondsPassed;
      raceFinishUpdate.text = "You won the race!";
      raceResult.raceUpdates.push(raceFinishUpdate);
    }
    else {
      var raceFinishUpdate: StringNumberPair = new StringNumberPair();
      raceFinishUpdate.value = secondsPassed;
      raceFinishUpdate.text = "You lost the race...";
      raceResult.raceUpdates.push(raceFinishUpdate);
    }
    //then display those over a 60 second time frame or if user has changed settings, just display result

    //TODO: add tripping and hazards, adaptability stat
    //TODO: add abilities, power stat
    //TODO: add stopping, focus stat    
    if (raceResult.wasSuccessful) {
      this.raceWasSuccessfulUpdate(raceResult);
    }
    this.setupDisplayRewards(race);
    this.displayRaceUpdates(raceResult);
    return raceResult;
  }

  getUpdateMessageByRelativeDistance(distancePerSecond: number, secondsPassed: number, distanceCovered: number, animalName: string): string {
    var timingUpdateMessage = animalName;

    var expectedDistance = distancePerSecond * secondsPassed;
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
      currentTime += deltaTime;

      if (raceUpdates.length === 0) //also check if skip button pressed/setting to auto skip is checked
      {
        if (raceResult.wasSuccessful)
          this.displayResults = true;

        subscription.unsubscribe();
        return;
      }

      if (currentTime >= raceUpdates[0].value) {
        this.incrementalRaceUpdates += raceUpdates[0].text + "\n";
        raceUpdates.shift();
      }
    });
  }

  setupDisplayRewards(race: Race): void {
    this.rewardCells = [];
    this.rewardRows = [];

    var maxColumns = 3;

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
    //need some sort of race ID so you can update the correct race
    var globalRaceVal = this.globalService.globalVar.circuitRaces.find(item => item.raceId === this.selectedRace.raceId);
    if (globalRaceVal === undefined || globalRaceVal === null)
      return;

    globalRaceVal.isCompleted = true;

    if (this.selectedRace.rewards !== undefined && this.selectedRace.rewards !== null) {
      this.selectedRace.rewards.forEach(item => {
        if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
          if (this.globalService.globalVar.resources.some(x => x.name === item.name)) {
            var globalResource = this.globalService.globalVar.resources.find(x => x.name === item.name);
            if (globalResource !== null && globalResource !== undefined)
              globalResource.amount += item.amount;
          }
          else {
            this.globalService.globalVar.resources.push(new ResourceValue(item.name, item.amount));
          }
        }
      });
    }

    //TODO: move this to race selection page so an animation can accompany it
    if (globalRaceVal.isCircuitRace) {
      var circuitRankRaces = this.globalService.globalVar.circuitRaces.filter(item => item.requiredRank === globalCircuitRank);
      if (circuitRankRaces.every(item => item.isCompleted)) {
        this.globalService.IncreaseCircuitRank();
      }
    }
  }

  PrepareRacingAnimal(animal: Animal) {
    animal.ability.currentCooldown = animal.ability.cooldown;
    animal.currentStats.stamina = animal.currentStats.calculateStamina();
  }

  didAnimalStumble(racingAnimal: Animal): boolean {
    //TODO: eventually this will be replaced with different track routes with various chances of stumbling
      return false;
  }

  didAnimalLoseFocus(racingAnimal: Animal): boolean {
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
    var percentChangeOfLosingFocus = metersSinceExpectedDistraction / racingAnimal.currentStats.focusMs;

    var rng = this.utilityService.getRandomNumber(1, 100);

    if (rng <= percentChangeOfLosingFocus)
      return true;
    else
      return false;
  }

  goToRaceSelection(): void {
    this.raceFinished.emit(true);
  }
}
