import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { Race } from 'src/app/models/races/race.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-circuit-view',
  templateUrl: './circuit-view.component.html',
  styleUrls: ['./circuit-view.component.css']
})
export class CircuitViewComponent implements OnInit {
  circuitRank: string;
  circuitRankUpDescription: string;
  availableCircuitRaces: Race[];
  @Output() raceSelected = new EventEmitter<Race>();
  tutorialActive = false;
  freeRaceTimer = "";
  freeRacesRemaining = 10;
  totalFreeRaces = 10;
  availableLocalRaces: Race[];
  subscription: any;

  constructor(private globalService: GlobalService, private utilityService: UtilityService, private lookupService: LookupService,
    private gameLoopService: GameLoopService) { }

  ngOnInit(): void {
    this.handleTutorial();
    this.availableLocalRaces = [];
    
    this.availableLocalRaces.push(this.globalService.generateFreeRace());
    this.availableLocalRaces.push(this.globalService.generateFreeRace());
    this.availableLocalRaces.push(this.globalService.generateFreeRace());

    
    var rank = this.globalService.globalVar.circuitRank;
    if (this.globalService.globalVar.settings.get("useNumbersForCircuitRank"))
      this.circuitRank = this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank).toString();
    else
      this.circuitRank = this.globalService.globalVar.circuitRank;

    this.circuitRankUpDescription = this.globalService.globalVar.circuitRankUpRewardDescription;
    this.availableCircuitRaces = this.globalService.globalVar.circuitRaces.filter(item => item.requiredRank === rank);
    var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);

    this.availableCircuitRaces.forEach(race => {
      if (primaryDeck !== undefined)
        race.raceLegs = this.globalService.reorganizeLegsByDeckOrder(race.raceLegs, primaryDeck);
    });

    this.totalFreeRaces = this.lookupService.getTotalFreeRacesPerPeriod();

    var freeRaceTimePeriod = 15 * 60;
    var freeRaceTimePeriodPair = this.globalService.globalVar.modifiers.find(item => item.text === "freeRacesTimePeriodModifier");
    if (freeRaceTimePeriodPair !== undefined)
      freeRaceTimePeriod = freeRaceTimePeriodPair.value;

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {          
      var remainingTime = freeRaceTimePeriod - this.globalService.globalVar.freeRaceTimePeriodCounter; //in seconds
      var minutes = Math.floor(remainingTime / 60);
      var seconds = (remainingTime - (minutes * 60));
      var secondsDisplay = Math.floor(seconds).toString();
      if (seconds < 10) {
        if (seconds < 1 || seconds > 59)
          secondsDisplay = "00";
        else
          secondsDisplay = String(secondsDisplay).padStart(2, '0');
      }

      this.freeRaceTimer = minutes + ":" + secondsDisplay;
      this.freeRacesRemaining = this.lookupService.getRemainingFreeRacesPerPeriod();//freeRacePerTimePeriod - this.globalService.globalVar.freeRaceCounter;
    });
  }

  selectCircuitRace(race: Race): void {
    var canRace = true;
    var racingAnimals = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (racingAnimals === undefined || racingAnimals === null || racingAnimals.selectedAnimals.length === 0) {
      canRace = false;
      return;
    }

    race.raceLegs.forEach(leg => {
      if (!racingAnimals?.selectedAnimals.some(item => item.raceCourseType === leg.courseType))
        canRace = false;
    });

    if (race.isCompleted)
      canRace = false;

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 4) {
      this.tutorialActive = false;
      this.globalService.globalVar.tutorials.currentTutorialId += 1;      
    }

    if (canRace) {
      /* bubble back up to race selection with the chosen race, over there show the race occur */
      this.raceSelected.emit(race);
    }
  }

  selectLocalRace(race: Race) {
    var canRace = true;
    var isFreeRace = race.localRaceType === LocalRaceTypeEnum.Free;
    var racingAnimals = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (racingAnimals === undefined || racingAnimals === null || racingAnimals.selectedAnimals.length === 0) {
      canRace = false;
      return;
    }

    race.raceLegs.forEach(leg => {
      if (!racingAnimals?.selectedAnimals.some(item => item.raceCourseType === leg.courseType))
        canRace = false;
    });

    if (isFreeRace) {
      if (this.lookupService.getRemainingFreeRacesPerPeriod() <= 0)
        canRace = false;
    }


    if (canRace) {
      /* bubble back up to race selection with the chosen race, over there show the race occur */
      if (isFreeRace)
        this.globalService.globalVar.freeRaceCounter += 1;

      this.raceSelected.emit(race);
    }
  }

  handleTutorial() {
    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 3) {
      this.tutorialActive = true;
      this.globalService.globalVar.tutorials.currentTutorialId += 1;
      this.globalService.globalVar.tutorials.showTutorial = true;
    }

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 5) {
      this.globalService.globalVar.tutorials.showTutorial = true;      
    }

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 6 &&
      this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey)?.isAvailable)
    {
      this.globalService.globalVar.tutorials.showTutorial = true;  
    }
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
