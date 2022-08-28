import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { EasyPinnacleConditionsEnum, MediumPinnacleConditionsEnum } from 'src/app/models/pinnacle-conditions-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { Race } from 'src/app/models/races/race.model';
import { Terrain } from 'src/app/models/races/terrain.model';
import { TerrainTypeEnum } from 'src/app/models/terrain-type-enum.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-local-view',
  templateUrl: './local-view.component.html',
  styleUrls: ['./local-view.component.css']
})
export class LocalViewComponent implements OnInit {
  availableLocalRaces: Race[];
  availableMonoRace: Race;
  availableDuoRace: Race;
  availableRainbowRace: Race;
  availablePinnacleRace: Race;
  areMonoRacesAvailable: boolean;
  areDuoRacesAvailable: boolean;
  areRainbowRacesAvailable: boolean;
  arePinnacleRacesAvailable: boolean;
  monoRaceRank: string;
  duoRaceRank: string;
  rainbowRaceRank: string;
  pinnacleRaceFloor: string;
  @Output() raceSelected = new EventEmitter<Race>();
  freeRaceTimer = "";
  freeRacesRemaining = 10;
  totalFreeRaces = 10;
  subscription: any;
  isMonoRaceToggled = false;
  isDuoRaceToggled = false;
  isRainbowRaceToggled = false;
  isPinnacleRaceToggled = false;

  constructor(public globalService: GlobalService, private utilityService: UtilityService, private lookupService: LookupService,
    private gameLoopService: GameLoopService) { }

  ngOnInit(): void {
    this.availableLocalRaces = [];

    this.isMonoRaceToggled = this.globalService.globalVar.settings.get("monoRaceToggled");
    this.isDuoRaceToggled = this.globalService.globalVar.settings.get("duoRaceToggled");
    this.isRainbowRaceToggled = this.globalService.globalVar.settings.get("rainbowRaceToggled");
    this.isPinnacleRaceToggled = this.globalService.globalVar.settings.get("pinnacleRaceToggled");

    var nextMonoRace = this.getNextAvailableSpecialRace(LocalRaceTypeEnum.Mono);
    if (nextMonoRace !== undefined)
      this.availableMonoRace = nextMonoRace;

    var nextDuoRace = this.getNextAvailableSpecialRace(LocalRaceTypeEnum.Duo);
    if (nextDuoRace !== undefined)
      this.availableDuoRace = nextDuoRace;

    var nextRainbowRace = this.getNextAvailableSpecialRace(LocalRaceTypeEnum.Rainbow);
    if (nextRainbowRace !== undefined)
      this.availableRainbowRace = nextRainbowRace;

    var nextPinnacleRace = this.getNextAvailableSpecialRace(LocalRaceTypeEnum.Pinnacle);
    if (nextPinnacleRace !== undefined)
      this.availablePinnacleRace = nextPinnacleRace;

    var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (primaryDeck !== undefined && primaryDeck !== null) {
      if (this.availableDuoRace !== null && this.availableDuoRace !== undefined)
        this.availableDuoRace.raceLegs = this.globalService.reorganizeLegsByDeckOrder(this.availableDuoRace.raceLegs, primaryDeck);
      if (this.availableRainbowRace !== null && this.availableRainbowRace !== undefined)
        this.availableRainbowRace.raceLegs = this.globalService.reorganizeLegsByDeckOrder(this.availableRainbowRace.raceLegs, primaryDeck);
    }

    if (this.globalService.globalVar.settings.get("useNumbersForCircuitRank")) {
      if (this.availableMonoRace !== null && this.availableMonoRace !== undefined)
        this.monoRaceRank = this.utilityService.getNumericValueOfCircuitRank(this.availableMonoRace.requiredRank).toString();
      if (this.availableDuoRace !== null && this.availableDuoRace !== undefined)
        this.duoRaceRank = this.utilityService.getNumericValueOfCircuitRank(this.availableDuoRace.requiredRank).toString();
      if (this.availableRainbowRace !== null && this.availableRainbowRace !== undefined)
        this.rainbowRaceRank = this.utilityService.getNumericValueOfCircuitRank(this.availableRainbowRace.requiredRank).toString();
      if (this.availablePinnacleRace !== null && this.availablePinnacleRace !== undefined)
        this.pinnacleRaceFloor = this.utilityService.getNumericValueOfCircuitRank(this.availablePinnacleRace.requiredRank).toString();
    }
    else {
      if (this.availableMonoRace !== null && this.availableMonoRace !== undefined)
        this.monoRaceRank = this.availableMonoRace.requiredRank;
      if (this.availableDuoRace !== null && this.availableDuoRace !== undefined)
        this.duoRaceRank = this.availableDuoRace.requiredRank;
      if (this.availableRainbowRace !== null && this.availableRainbowRace !== undefined)
        this.rainbowRaceRank = this.availableRainbowRace.requiredRank;
      if (this.availablePinnacleRace !== null && this.availablePinnacleRace !== undefined)
        this.pinnacleRaceFloor = this.availablePinnacleRace.requiredRank;
    }

    this.areMonoRacesAvailable = this.lookupService.isItemUnlocked("monoRace");
    this.areDuoRacesAvailable = this.lookupService.isItemUnlocked("duoRace");
    this.areRainbowRacesAvailable = this.lookupService.isItemUnlocked("rainbowRace");
    this.arePinnacleRacesAvailable = this.lookupService.isItemUnlocked("thePinnacle");
  }

  getNextAvailableSpecialRace(raceType: LocalRaceTypeEnum) {
    if (raceType === LocalRaceTypeEnum.Mono)
      this.globalService.GenerateMonoRaces(this.globalService.globalVar.monoRank);
    if (raceType === LocalRaceTypeEnum.Duo)
      this.globalService.GenerateDuoRaces(this.globalService.globalVar.duoRank);
    if (raceType === LocalRaceTypeEnum.Rainbow)
      this.globalService.GenerateRainbowRaces(this.globalService.globalVar.rainbowRank);
    if (raceType === LocalRaceTypeEnum.Pinnacle)
      this.globalService.GeneratePinnacleRaces(this.globalService.globalVar.pinnacleFloor);

    return this.globalService.globalVar.localRaces.find(item => item.localRaceType === raceType);
  }

  sortByRankRequired(a: Race, b: Race): number {
    if (a.requiredRank > b.requiredRank)
      return 1;
    else if (b.requiredRank > a.requiredRank)
      return -1;
    else
      return 0;
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

      var selectedAnimal = racingAnimals?.selectedAnimals.find(item => item.raceCourseType === leg.courseType);
      if (selectedAnimal !== undefined && !this.lookupService.canAnimalRace(selectedAnimal)) {
        canRace = false;
      }
    });

    if (race.pinnacleConditions !== undefined) {
      if (race.pinnacleConditions.containsCondition(EasyPinnacleConditionsEnum[EasyPinnacleConditionsEnum.twoRacersOnly])) {
        if (racingAnimals.selectedAnimals.length < 2)
          canRace = false;
      }
      if (race.pinnacleConditions.containsCondition(EasyPinnacleConditionsEnum[EasyPinnacleConditionsEnum.threeRacersOnly])) {
        if (racingAnimals.selectedAnimals.length < 3)
          canRace = false;
      }
      if (race.pinnacleConditions.containsCondition(MediumPinnacleConditionsEnum[MediumPinnacleConditionsEnum.fourRacersOnly])) {
        if (racingAnimals.selectedAnimals.length < 4)
          canRace = false;
      }
    }

    if (canRace) {
      /* bubble back up to race selection with the chosen race, over there show the race occur */
      if (isFreeRace)
        this.globalService.globalVar.freeRaceCounter += 1;

      this.raceSelected.emit(race);
    }
  }

  toggleRace(type: string) {
    var currentStatus = this.globalService.globalVar.settings.get(type);
    this.globalService.globalVar.settings.set(type, !currentStatus);

    if (type === "monoRaceToggled")
      this.isMonoRaceToggled = !this.isMonoRaceToggled;
    if (type === "duoRaceToggled")
      this.isDuoRaceToggled = !this.isDuoRaceToggled;
    if (type === "rainbowRaceToggled")
      this.isRainbowRaceToggled = !this.isRainbowRaceToggled;
    if (type === "pinnacleRaceToggled")
      this.isPinnacleRaceToggled = !this.isPinnacleRaceToggled;
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
