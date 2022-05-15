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

    //calculate speed of animal based on acceleration and top speed (no obstacles)
    race.raceLegs.forEach(item => {
      var racingAnimal = this.racingAnimals.find(animal => animal.raceCourseType === item.courseType);
      if (racingAnimal === null || racingAnimal === undefined) {
        //TODO: throw error? no animal found
        return;
      }

      var lastLeg = undefined;
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
      var currentPathCount = 0;
      var permanentMaxSpeedIncreaseMultiplier = 1; //Cheetah Ability - On The Hunt
      var permanentAdaptabilityIncreaseMultiplierObj = { permanentAdaptabilityIncreaseMultiplier: 1 }; //Goat Ability - Sure-footed, created as an object so it can be passed as reference

      for (var i = framesPassed; i <= this.timeToComplete * this.frameModifier; i++) {
        //Race logic here
        currentRacerEffect = RacerEffectEnum.None;
        var completedLegDistance = 0;
        if (completedLegCount > 0) {
          for (var x = 0; x < completedLegCount; x++) {
            completedLegDistance += race.raceLegs[x].distance;
          }
        }

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
        });

        var modifiedAdaptabilityMs = this.getModifiedAdaptability(racingAnimal, permanentAdaptabilityIncreaseMultiplierObj);
        var didAnimalStumble = this.didAnimalStumble(racingAnimal, currentPath, currentDistanceInPath, item.terrain, permanentAdaptabilityIncreaseMultiplierObj, modifiedAdaptabilityMs);
        var didAnimalLoseFocus = this.didAnimalLoseFocus(racingAnimal, this.timeToComplete, race.length, distanceCovered, item.terrain);


        if (didAnimalLoseFocus) {
          racingAnimal.raceVariables.lostFocus = true;
          racingAnimal.raceVariables.currentLostFocusLength = racingAnimal.raceVariables.defaultLostFocusLength;
          racingAnimal.raceVariables.metersSinceLostFocus = 0;
          velocityBeforeEffect = velocity;

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " got distracted and lost focus!");
        }

        if (didAnimalStumble) {
          racingAnimal.raceVariables.stumbled = true;
          racingAnimal.raceVariables.currentStumbledLength = racingAnimal.raceVariables.defaultStumbledLength;
          velocityBeforeEffect = velocity;

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " stumbled!");
        }

        if (racingAnimal.currentStats.stamina === 0 && !racingAnimal.raceVariables.recoveringStamina) {
          racingAnimal.raceVariables.recoveringStamina = true;
          racingAnimal.raceVariables.currentRecoveringStaminaLength = racingAnimal.raceVariables.defaultRecoveringStaminaLength;
          velocityBeforeEffect = velocity;

          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " ran out of stamina and must slow down.");
        }

        //Handle logic for recovering stamina / lost focus / stumbled
        if (racingAnimal.raceVariables.recoveringStamina || racingAnimal.raceVariables.lostFocus || racingAnimal.raceVariables.stumbled) {
          if (racingAnimal.raceVariables.recoveringStamina) {
            console.log("Recovering Stamina");
            currentRacerEffect = RacerEffectEnum.LostStamina;

            var velocityLoss = .5;
            var lostVelocity = velocityBeforeEffect * velocityLoss;

            if (velocity > 0)
              velocity -= lostVelocity / racingAnimal.raceVariables.defaultRecoveringStaminaLength;

            racingAnimal.raceVariables.currentRecoveringStaminaLength -= 1;

            if (racingAnimal.raceVariables.currentRecoveringStaminaLength === 0) {
              racingAnimal.raceVariables.recoveringStamina = false;
              racingAnimal.raceVariables.currentRecoveringStaminaLength = racingAnimal.raceVariables.defaultRecoveringStaminaLength;

              var regainStaminaModifier = .5; //penalty for running out of stamina, only get half back     

              if (racingAnimal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.quickSnack)) {
                regainStaminaModifier = 1;
                var quickSnackModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "quickSnackEquipmentModifier");
                if (quickSnackModifierPair !== undefined)
                  regainStaminaModifier = quickSnackModifierPair.value;
              }

              racingAnimal.currentStats.stamina = animalMaxStamina * regainStaminaModifier;
            }
          }

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
              var percentPerSecond = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier);
              var modifiedAmount = (meterDifferential / distancePerSecond) * percentPerSecond;
              if (modifiedAmount >= 1)
                modifiedAccelerationMs *= modifiedAmount;
            }
          }

          //console.log("Acceleration: " + modifiedAccelerationMs);
          velocity += modifiedAccelerationMs / this.frameModifier;
        }

        var modifiedMaxSpeed = racingAnimal.currentStats.maxSpeedMs;
        modifiedMaxSpeed *= item.terrain.maxSpeedModifier;

        if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "Sprint" && racingAnimal.ability.abilityInUse) {
          modifiedMaxSpeed *= 1.25;
          console.log("Modified max speed: " + modifiedMaxSpeed);
        }
        if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "On The Hunt") {
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

            if (racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Frenzy") {
              racingAnimal.raceVariables.remainingBurstMeters += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier);
            }

            raceResult.addRaceUpdate(framesPassed, "<strong>BURST!</strong> " + animalDisplayName + " is breaking their limit!");

            if (racingAnimal.type === AnimalTypeEnum.Cheetah && racingAnimal.ability.name === "On The Hunt") {
              permanentMaxSpeedIncreaseMultiplier += (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier) / 100);
            }

            if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Deep Breathing") {
              var staminaGain = animalMaxStamina * (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier) / 100);
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
            burstModifier += this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier);
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
        }

        //don't go further than distance to go
        var distanceCoveredPerFrame = modifiedVelocity / this.frameModifier;

        if (racingAnimal.ability.abilityInUse &&
          ((racingAnimal.type === AnimalTypeEnum.Monkey && racingAnimal.ability.name === "Leap") ||
            (racingAnimal.type === AnimalTypeEnum.Dolphin && racingAnimal.ability.name === "Breach"))) {
          var totalDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, item.terrain.powerModifier);
          var extraDistanceCovered = totalDistance / racingAnimal.ability.totalFrames;
          distanceCoveredPerFrame += extraDistanceCovered;

          racingAnimal.ability.remainingFrames -= 1;

          if (racingAnimal.ability.remainingFrames <= 0) {
            racingAnimal.ability.abilityInUse = false;
          }
        }
        
        this.handleTundraDrift(racingAnimal, currentPath, modifiedAdaptabilityMs, item.terrain, currentDistanceInPath, distanceCoveredPerFrame);
        //race.raceUI.yAdjustmentByFrame.push(racingAnimal.raceVariables.icyCurrentYAmount);

        if (racingAnimal.raceVariables.icyCurrentAngle !== 90)
        {
          var anglePercentOfVelocity = Math.abs(90 - racingAnimal.raceVariables.icyCurrentAngle) / 90;
          distanceCoveredPerFrame *= anglePercentOfVelocity;
        }

        distanceCovered += distanceCoveredPerFrame > distanceToGo ? distanceToGo : distanceCoveredPerFrame;
        distanceToGo -= distanceCoveredPerFrame;
        race.raceUI.distanceCoveredByFrame.push(distanceCovered);
        race.raceUI.velocityByFrame.push(distanceCoveredPerFrame);
        race.raceUI.timeToCompleteByFrame.push(this.timeToComplete);
        race.raceUI.maxSpeedByFrame.push(modifiedMaxSpeed);
        race.raceUI.staminaPercentByFrame.push(racingAnimal.currentStats.stamina / animalMaxStamina);
        race.raceUI.racerEffectByFrame.push(currentRacerEffect);        

        if (!racingAnimal.raceVariables.recoveringStamina)
          this.handleStamina(racingAnimal, raceResult, distanceCoveredPerFrame, framesPassed, item.terrain);

        //Cooldown housekeeping
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
          racingAnimal.ability.currentCooldown <= 0 && this.abilityRedundancyCheck(racingAnimal, velocity, item, distanceToGo)) {
          var timingUpdate: StringNumberPair = new StringNumberPair();
          timingUpdate.value = framesPassed;
          timingUpdate.text = racingAnimal.getAbilityUseUpdateText(animalDisplayName);
          raceResult.raceUpdates.push(timingUpdate);
          this.useAbility(racingAnimal, race, item, distanceToGo, framesPassed, raceResult);
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

        racingAnimal.ability.currentCooldown -= 1 / this.frameModifier;
        framesPassed += 1;

        //TODO: do anything about fractional time?
        if (distanceToGo <= 0) {
          //framesPassed = i;
          raceResult.addRaceUpdate(framesPassed, animalDisplayName + " finishes their leg of the race.");
          item.legComplete = true;
          //console.log("Leg Complete at " + framesPassed + " seconds");
          this.PrepareRacingAnimal(racingAnimal); //Reset so that stamina and such look correct on view pages
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
      this.raceWasSuccessfulUpdate(raceResult);
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
  }

  doesRacerBurst(animal: Animal, currentPath: RacePath): boolean {
    var modifiedBurstChance = animal.currentStats.burstChance;

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

  raceWasSuccessfulUpdate(raceResult: RaceResult): void {
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

  PrepareRacingAnimal(animal: Animal, completedAnimals?: Animal[], currentLeg?: RaceLeg, previousLeg?: RaceLeg) {
    animal.ability.currentCooldown = animal.ability.cooldown;
    if (animal.getEquippedItemName() === this.globalService.getEquipmentName(EquipmentEnum.pendant)) {
      var pendantCooldownModifier = .9;
      var pendantModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "pendantEquipmentModifier");
      if (pendantModifierPair !== undefined)
        pendantCooldownModifier = pendantModifierPair.value;
      animal.ability.currentCooldown *= pendantCooldownModifier;
    }

    animal.ability.abilityUsed = false;
    animal.ability.abilityInUse = false;
    this.globalService.calculateAnimalRacingStats(animal);
    animal.raceVariables = new RaceVariables();

    if (completedAnimals !== undefined && completedAnimals !== null && completedAnimals.length > 0) {
      var lastCompletedAnimal = completedAnimals[completedAnimals.length - 1];
      if (lastCompletedAnimal.ability.name === "Inspiration" && lastCompletedAnimal.type === AnimalTypeEnum.Horse) {
        //add max speed to animal but only for a certain number of meters
        if (previousLeg !== undefined && previousLeg !== null) {
          var length = this.lookupService.GetAbilityEffectiveAmount(lastCompletedAnimal, previousLeg.terrain.powerModifier);
          this.AddRelayEffect(animal, length, new AnimalStats(1.25, 1, 1, 1, 1, 1));
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

  didAnimalStumble(racingAnimal: Animal, currentPath: RacePath, currentDistanceInPath: number, terrain: Terrain, obj: { permanentAdaptabilityIncreaseMultiplier: number }, modifiedAdaptabilityMs: number): boolean {
    if (racingAnimal.raceVariables.stumbled)
      return false; //already stumbling

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
        obj.permanentAdaptabilityIncreaseMultiplier += (this.lookupService.GetAbilityEffectiveAmount(racingAnimal, terrain.powerModifier) / 100);
        currentPath.currentStumbleOpportunity += 1; //use this so that you don't trigger multiple times -- can come up with better method
      }
    }

    if (currentPath.currentStumbleOpportunity * stumbleBreakpoint < currentDistanceInPath) {
      currentPath.currentStumbleOpportunity += 1;

      var rng = this.utilityService.getRandomNumber(1, 100);

      var adjustedStumbleFrequency = 500 + (modifiedAdaptabilityMs * terrain.adaptabilityModifier);
      var percentChanceOfStumbling = (currentPath.frequencyOfStumble / adjustedStumbleFrequency) * 100;

      if (rng <= percentChanceOfStumbling) {
        currentPath.didAnimalStumble = true;
        return true;
      }
    }

    return false;
  }

  didAnimalLoseFocus(racingAnimal: Animal, timeToComplete: number, raceLength: number, currentDistanceInRace: number, terrain: Terrain): boolean {
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

      var unwaveringFocus = (racingAnimal.currentStats.focusMs * terrain.focusModifier) * focusModifier;

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
  abilityRedundancyCheck(racingAnimal: Animal, velocity: number, currentLeg: RaceLeg, distanceToGo: number): boolean {
    if (racingAnimal.ability.oneTimeEffect && racingAnimal.ability.abilityUsed)
      return false;

    if (racingAnimal.ability.name === "Thoroughbred" && racingAnimal.type === AnimalTypeEnum.Horse &&
      racingAnimal.raceVariables.recoveringStamina)
      return false;

    if (racingAnimal.ability.name === "Pacemaker" && racingAnimal.type === AnimalTypeEnum.Horse &&
      velocity === racingAnimal.currentStats.maxSpeedMs)
      return false;

    if (racingAnimal.ability.name === "Leap" && racingAnimal.type === AnimalTypeEnum.Monkey) {
      var leapDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier);
      if (leapDistance < distanceToGo) {
        return false;
      }
    }

    //TODO: gecko should use sticky when entering a special path only

    return true;
  }

  useAbility(racingAnimal: Animal, race: Race, currentLeg: RaceLeg, distanceToGo: number, framesPassed: number, raceResult: RaceResult) {
    racingAnimal.ability.abilityUsed = true;

    if (racingAnimal.type === AnimalTypeEnum.Horse) {
      if (racingAnimal.ability.name === "Thoroughbred" ||
        racingAnimal.ability.name === "Pacemaker") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier);
      }
      else if (racingAnimal.ability.name === "Inspiration") {
        //racingAnimal.ability.abilityInUse = true;
        //racingAnimal.ability.remainingLength = racingAnimal.ability.efficiency * (1 + racingAnimal.currentStats.powerMs);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Cheetah) {
      if (racingAnimal.ability.name === "Sprint") {
        racingAnimal.ability.abilityInUse = true;
        racingAnimal.ability.remainingLength = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier);
      }
    }

    if (racingAnimal.type === AnimalTypeEnum.Monkey) {
      if (racingAnimal.ability.name === "Landslide") {
        var effectiveDistance = this.lookupService.GetAbilityEffectiveAmount(racingAnimal, currentLeg.terrain.powerModifier);
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
  }

  getModifiedAdaptability(racingAnimal: Animal, obj: { permanentAdaptabilityIncreaseMultiplier: number }) {
    var modifiedAdaptabilityMs = racingAnimal.currentStats.adaptabilityMs;
    if (racingAnimal.type === AnimalTypeEnum.Dolphin && racingAnimal.ability.name === "Echolocation" && racingAnimal.ability.abilityInUse) {
      modifiedAdaptabilityMs *= 1.5;
    }
    if (racingAnimal.type === AnimalTypeEnum.Goat && racingAnimal.ability.name === "Sure-footed") {
      modifiedAdaptabilityMs *= obj.permanentAdaptabilityIncreaseMultiplier;
    }

    return modifiedAdaptabilityMs;
  }

  handleTundraDrift(racingAnimal: Animal, currentPath: RacePath, modifiedAdaptabilityMs: number, terrain: Terrain, currentDistanceInPath: number, xDistanceCovered: number) {
    var wallHit = false;

    if (racingAnimal.raceCourseType !== RaceCourseTypeEnum.Tundra)
      return;

    var stumbleBreakpoint = currentPath.length / currentPath.stumbleOpportunities;
    if (currentPath.currentStumbleOpportunity * stumbleBreakpoint >= currentDistanceInPath) 
      return;          

    currentPath.currentStumbleOpportunity += 1;

    //get drift angle change
    var rng = this.utilityService.getRandomNumber(1, 100);

    var adjustedSlipFrequency = 200 + (modifiedAdaptabilityMs * terrain.adaptabilityModifier);
    var percentChanceOfSlipping = (currentPath.frequencyOfStumble / adjustedSlipFrequency) * 100;

    console.log("RNG: " + rng + " Chance To Slip: " + percentChanceOfSlipping);
    if (rng <= percentChanceOfSlipping) {
      currentPath.didAnimalStumble = true;
      console.log("Slipped");

      if (racingAnimal.raceVariables.slipCountBeforeNewDirection <= 0)      
        racingAnimal.raceVariables.slipCountBeforeNewDirection = this.utilityService.getRandomInteger(1, 50);
      
      racingAnimal.raceVariables.slipCountBeforeNewDirection -= 1;

      var angleDifferential = (percentChanceOfSlipping - rng) / 100;

      if (racingAnimal.raceVariables.icyCurrentDirectionUp)
        racingAnimal.raceVariables.icyCurrentAngle -= angleDifferential;
      else
        racingAnimal.raceVariables.icyCurrentAngle += angleDifferential;

      if (racingAnimal.raceVariables.icyCurrentAngle >= 150)
        racingAnimal.raceVariables.icyCurrentAngle = 150;
        if (racingAnimal.raceVariables.icyCurrentAngle <= 30)
        racingAnimal.raceVariables.icyCurrentAngle = 30;

      console.log("New Angle: " + racingAnimal.raceVariables.icyCurrentAngle);
    }

    //get drift Y amount
    //this needs to play by its own rules using percents, can't rely on max speed or anything or you will hit it immediately
    var yAnglePercentOfVelocity = 90 - racingAnimal.raceVariables.icyCurrentAngle / 90;
    racingAnimal.raceVariables.icyCurrentYAmount += yAnglePercentOfVelocity / 100;

    if (racingAnimal.raceVariables.icyCurrentYAmount >= 100)
      racingAnimal.raceVariables.icyCurrentYAmount = 100;

    if (racingAnimal.raceVariables.icyCurrentYAmount <= -100)
      racingAnimal.raceVariables.icyCurrentYAmount = -100;

    console.log("Icy Current Y Amount: " + racingAnimal.raceVariables.icyCurrentYAmount);
    currentPath.driftAmount.push(racingAnimal.raceVariables.icyCurrentYAmount);

    if (racingAnimal.raceVariables.icyCurrentYAmount >= 100 || 
      racingAnimal.raceVariables.icyCurrentYAmount <= -100)
      {
        //hit wall
        wallHit = true;
      }

      return wallHit;
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
