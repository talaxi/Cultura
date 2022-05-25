import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { Race } from 'src/app/models/races/race.model';
import { Terrain } from 'src/app/models/races/terrain.model';
import { TerrainTypeEnum } from 'src/app/models/terrain-type-enum.model';
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
  areMonoRacesAvailable: boolean;
  areDuoRacesAvailable: boolean;
  areRainbowRacesAvailable: boolean;
  @Output() raceSelected = new EventEmitter<Race>();

  constructor(private globalService: GlobalService, private utilityService: UtilityService, private lookupService: LookupService) { }

  ngOnInit(): void {
    console.log(this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck)?.courseTypeOrder);

    this.availableLocalRaces = [];
    
    var nextMonoRace = this.getNextAvailableSpecialRace(LocalRaceTypeEnum.Mono);
    if (nextMonoRace !== undefined)
      this.availableMonoRace = nextMonoRace;

    var nextDuoRace = this.getNextAvailableSpecialRace(LocalRaceTypeEnum.Duo);    
    if (nextDuoRace !== undefined)
      this.availableDuoRace = nextDuoRace;

    var nextRainbowRace = this.getNextAvailableSpecialRace(LocalRaceTypeEnum.Rainbow);
    if (nextRainbowRace !== undefined)
      this.availableRainbowRace = nextRainbowRace;

    this.createLocalRaces();

    this.areMonoRacesAvailable = this.lookupService.isItemUnlocked("monoRace");
    this.areDuoRacesAvailable = this.lookupService.isItemUnlocked("duoRace");
    this.areRainbowRacesAvailable = this.lookupService.isItemUnlocked("rainbowRace");
  }

  getNextAvailableSpecialRace(raceType: LocalRaceTypeEnum) {
    if (raceType === LocalRaceTypeEnum.Mono)
      this.globalService.GenerateMonoRaces(this.globalService.globalVar.monoRank);      
    if (raceType === LocalRaceTypeEnum.Duo)
     this.globalService.GenerateMonoRaces(this.globalService.globalVar.duoRank);
    if (raceType === LocalRaceTypeEnum.Rainbow)
    this.globalService.GenerateMonoRaces(this.globalService.globalVar.rainbowRank);

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
    var racingAnimals = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (racingAnimals === undefined || racingAnimals === null || racingAnimals.selectedAnimals.length === 0) {
      canRace = false;
      return;
    }

    race.raceLegs.forEach(leg => {
      if (!racingAnimals?.selectedAnimals.some(item => item.raceCourseType === leg.courseType))
        canRace = false;
    });

    if (canRace) {
      /* bubble back up to race selection with the chosen race, over there show the race occur */
      this.raceSelected.emit(race);
    }
  }

  createLocalRaces() {
    var numericalRank = this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank);
    var raceIndex = 1;
    var timeToComplete = 60;
    var legLengthCutoff = timeToComplete / 4; //a leg cannot be any shorter than this as a percentage

    var baseMeters = 90;
    var factor = 1.15;

    var maxRandomFactor = 1.05;
    var minRandomFactor = 0.8;

    var legMinimumDistance = 20; //as a percentage of 100
    var legMaximumDistance = 80; //as a percentage of 100


    var localRaces = 3;

    for (var j = 0; j < localRaces; j++) {
      var raceLegs: RaceLeg[] = [];

      if (numericalRank < 2) {
        var leg = new RaceLeg();
        leg.courseType = RaceCourseTypeEnum.Flatland;
        leg.terrain = this.globalService.getRandomTerrain(leg.courseType);
        leg.distance = Math.round(baseMeters * (factor ** numericalRank) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
        raceLegs.push(leg);
      }
      else if (numericalRank < 9) {
        var availableCourses: RaceCourseTypeEnum[] = [];
        availableCourses.push(RaceCourseTypeEnum.Flatland);
        availableCourses.push(RaceCourseTypeEnum.Mountain);
        var randomizedCourseList = this.globalService.getCourseTypeInRandomOrder(availableCourses);

        var leg1Distance = this.utilityService.getRandomNumber(legMinimumDistance, legMaximumDistance);
        var leg2Distance = this.utilityService.getRandomNumber(legMinimumDistance, legMaximumDistance);
        var sum = leg1Distance + leg2Distance;
        var normalizeValue = timeToComplete / sum;
        var leg1Normalized = leg1Distance * normalizeValue;
        var leg2Normalized = leg2Distance * normalizeValue;

        if (leg1Normalized < legLengthCutoff) {
          leg1Normalized = 0;
          leg2Normalized = timeToComplete;
        }
        else if (leg2Normalized < legLengthCutoff) {
          leg2Normalized = 0;
          leg1Normalized = timeToComplete;
        }

        if (leg1Normalized > 0) {
          var leg1 = new RaceLeg();
          leg1.courseType = randomizedCourseList[0];
          leg1.distance = (Math.round(baseMeters * (factor ** numericalRank) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
          leg1.terrain = this.globalService.getRandomTerrain(leg1.courseType);
          raceLegs.push(leg1);
        }

        if (leg2Normalized > 0) {
          var leg2 = new RaceLeg();
          leg2.courseType = randomizedCourseList[1];
          leg2.distance = (Math.round(baseMeters * (factor ** numericalRank) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
          leg2.terrain = this.globalService.getRandomTerrain(leg2.courseType);
          raceLegs.push(leg2);
        }
      }
      else {
        legLengthCutoff = timeToComplete / 6;

        var availableCourses: RaceCourseTypeEnum[] = [];
        if (numericalRank < 35) {
          availableCourses.push(RaceCourseTypeEnum.Flatland);
          availableCourses.push(RaceCourseTypeEnum.Mountain);
          availableCourses.push(RaceCourseTypeEnum.Ocean);
        }
        else {
          availableCourses.push(RaceCourseTypeEnum.Flatland);
          availableCourses.push(RaceCourseTypeEnum.Mountain);
          availableCourses.push(RaceCourseTypeEnum.Ocean);
          availableCourses.push(RaceCourseTypeEnum.Tundra);
          availableCourses.push(RaceCourseTypeEnum.Volcanic);
        }

        var randomizedCourseList = this.globalService.getCourseTypeInRandomOrder(availableCourses);

        var leg1Distance = this.utilityService.getRandomNumber(legMinimumDistance, legMaximumDistance);
        var leg2Distance = this.utilityService.getRandomNumber(legMinimumDistance, legMaximumDistance);
        var leg3Distance = this.utilityService.getRandomNumber(legMinimumDistance, legMaximumDistance);
        var sum = leg1Distance + leg2Distance + leg3Distance;
        var normalizeValue = timeToComplete / sum;
        var leg1Normalized = leg1Distance * normalizeValue;
        var leg2Normalized = leg2Distance * normalizeValue;
        var leg3Normalized = leg3Distance * normalizeValue;

        if (leg1Normalized < legLengthCutoff) {
          leg2Normalized += leg1Normalized / 2;
          leg3Normalized += leg1Normalized / 2;
          leg1Normalized = 0;
        }
        else if (leg2Normalized < legLengthCutoff) {
          leg1Normalized += leg2Normalized / 2;
          leg3Normalized += leg2Normalized / 2;
          leg2Normalized = 0;
        }
        else if (leg3Normalized < legLengthCutoff) {
          leg1Normalized += leg3Normalized / 2;
          leg2Normalized += leg3Normalized / 2;
          leg3Normalized = 0;
        }

        if (leg1Normalized > 0) {
          var leg1 = new RaceLeg();
          leg1.courseType = randomizedCourseList[0];
          leg1.distance = (Math.round(baseMeters * (factor ** numericalRank) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
          leg1.terrain = this.globalService.getRandomTerrain(leg1.courseType);
          raceLegs.push(leg1);
        }

        if (leg2Normalized > 0) {
          var leg2 = new RaceLeg();
          leg2.courseType = randomizedCourseList[1];
          leg2.distance = (Math.round(baseMeters * (factor ** numericalRank) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
          leg2.terrain = this.globalService.getRandomTerrain(leg2.courseType);
          raceLegs.push(leg2);
        }

        if (leg3Normalized > 0) {
          var leg3 = new RaceLeg();
          leg3.courseType = randomizedCourseList[2];
          leg3.distance = (Math.round(baseMeters * (factor ** numericalRank) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg3Normalized / timeToComplete));
          leg3.terrain = this.globalService.getRandomTerrain(leg3.courseType);
          raceLegs.push(leg3);
        }
      }
      
      var totalDistance = 0;

      var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (primaryDeck !== undefined)
      raceLegs = this.globalService.reorganizeLegsByDeckOrder(raceLegs, primaryDeck);

      raceLegs.forEach(leg => {
        totalDistance += leg.distance;
      });

      raceLegs.forEach(leg => {
        leg.pathData = this.globalService.GenerateRaceLegPaths(leg, totalDistance);
      });

      this.availableLocalRaces.push(new Race(raceLegs, this.globalService.globalVar.circuitRank, false,
        1, totalDistance, timeToComplete, this.globalService.GenerateLocalRaceRewards(this.globalService.globalVar.circuitRank), LocalRaceTypeEnum.Free));
    }
  }
}
