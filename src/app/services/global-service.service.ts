import { Injectable } from '@angular/core';
import { GlobalVariables } from '../models/global/global-variables.model';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalStats } from '../models/animals/animal-stats.model';
import { Animal, Cheetah, Goat, Horse, Monkey } from '../models/animals/animal.model';
import { RaceCourseTypeEnum } from '../models/race-course-type-enum.model';
import { TrainingOptionsEnum } from '../models/training-options-enum.model';
import { TrainingOption } from '../models/training/training-option.model';
import { Race } from '../models/races/race.model';
import { RaceLeg } from '../models/races/race-leg.model';
import { ResourceValue } from '../models/resources/resource-value.model';
import { UtilityService } from './utility/utility.service';
import { StringNumberPair } from '../models/utility/string-number-pair.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  globalVar = new GlobalVariables();

  constructor(private utilityService: UtilityService) { }

  initializeGlobalVariables(): void {
    //pull global from localStorage
    //below is for testing purposes on the model
    this.globalVar.animals = [];
    this.globalVar.trainingOptions = [];
    this.globalVar.circuitRaces = [];
    this.globalVar.resources = [];
    this.globalVar.modifiers = [];

    //Initialize animals
    var horse = new Horse();
    horse.name = "John";
    horse.isAvailable = true;

    var monkey = new Monkey();
    monkey.name = "Monkey";
    monkey.isAvailable = true;

    var cheetah = new Cheetah();
    cheetah.name = "Cheetah";
    cheetah.isAvailable = true;

    var goat = new Goat();
    goat.name = "Goat";
    goat.isAvailable = true;

    //Initialize training options
    var trainingOption = new TrainingOption();
    trainingOption.trainingName = "Test Training 1";
    trainingOption.isAvailable = true;
    trainingOption.timeTrained = 0;
    trainingOption.timeToComplete = 5;
    trainingOption.trainingType = TrainingOptionsEnum.LandTraining1;
    trainingOption.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    trainingOption.statGain = 1;
    trainingOption.affectedStatRatios = new AnimalStats(1, 0, 0, 0, 0, 0);

    horse.currentTraining = trainingOption;

    var trainingOption2 = new TrainingOption();
    trainingOption2.trainingName = "Test Training 2";
    trainingOption2.isAvailable = true;
    trainingOption2.timeTrained = 0;
    trainingOption2.timeToComplete = 100;
    trainingOption2.trainingType = TrainingOptionsEnum.LandTraining2;
    trainingOption2.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    trainingOption2.statGain = 1;
    trainingOption2.affectedStatRatios = new AnimalStats(0, 0, 0, 0, .5, .5);    

    this.globalVar.trainingOptions.push(trainingOption);
    this.globalVar.trainingOptions.push(trainingOption2);
    this.globalVar.animals.push(horse);
    this.globalVar.animals.push(cheetah);
    this.globalVar.animals.push(goat);
    this.globalVar.animals.push(monkey);

    //Initialize circuit race information
    this.globalVar.circuitRank = "Z";
    this.GenerateCircuitRaces();    
    
    //Initialize local race information

    //Initialize resources
    this.globalVar.resources.push(new ResourceValue("Money", 50));

    //Initialize Resources
    this.globalVar.modifiers.push(new StringNumberPair(.2, "staminaModifier"));
  }

  IncreaseCircuitRank(): void {
    var currentCircuitRank = this.globalVar.circuitRank;

    var nextCircuitRank = currentCircuitRank.replace(/([A-Z])[^A-Z]*$/, function (a) {
      var c = a.charCodeAt(0);
      switch (c) {
        case 65: return c + 'Z';
        default: return String.fromCharCode(--c);
      }
    });

    this.globalVar.circuitRank = nextCircuitRank;
  }

  //TODO: make it always be the same races between save files
  //TODO: tweak progression as needed
  GenerateCircuitRaces(): void {
    //use basic algorithm to go ahead and auto generate these
    var circuitRank = "Z";
    var raceIndex = 1;
    var raceLength = 60;
    var legLengthCutoff = raceLength / 4;

    var baseMeters = 250;
    var factor = 1.15;

    var maxRandomFactor = 1.1;
    var minRandomFactor = 0.9;

    var legMinimumDistance = 20;
    var legMaximumDistance = 80;

    for (var i = 0; i < 26; i++) //Circuit rank Z-A
    {
      for (var j = 0; j < 5; j++) {
        var raceLegs: RaceLeg[] = [];
        var uniqueRacingTypes: RaceCourseTypeEnum[] = []; //if you're premaking these, you can't base it on their loadout at the time

        if (i < 2) //make these breakpoints configurable, figure out your time horizon on new races
        {
          var leg = new RaceLeg();
          leg.courseType = RaceCourseTypeEnum.FlatLand;
          leg.distance = Math.round(baseMeters * (factor ^ i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
          raceLegs.push(leg);
        }
        else if (i <= 10) {
          var leg1Distance = this.utilityService.getRandomNumber(legMinimumDistance, legMaximumDistance);
          var leg2Distance = this.utilityService.getRandomNumber(legMinimumDistance, legMaximumDistance);
          var sum = leg1Distance + leg2Distance;
          var normalizeValue = raceLength / sum;
          var leg1Normalized = leg1Distance * normalizeValue;
          var leg2Normalized = leg2Distance * normalizeValue;

          if (leg1Normalized < legLengthCutoff) {
            leg1Normalized = 0;
            leg2Normalized = raceLength;
          }
          else if (leg2Normalized < legLengthCutoff) {
            leg2Normalized = 0;
            leg1Normalized = raceLength;
          }

          if (leg1Normalized > 0) {
            var leg1 = new RaceLeg();
            leg1.courseType = RaceCourseTypeEnum.FlatLand;
            leg1.distance = (Math.round(baseMeters * (factor ^ i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / raceLength));
            raceLegs.push(leg1);
          }

          if (leg2Normalized > 0) {
            var leg2 = new RaceLeg();
            leg2.courseType = RaceCourseTypeEnum.Rock;
            leg2.distance = (Math.round(baseMeters * (factor ^ i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / raceLength));
            raceLegs.push(leg2);
          }
        }
        else {
          //make it 3 race types but variable on what they are based on what the user has?
          var leg = new RaceLeg();
          leg.courseType = RaceCourseTypeEnum.FlatLand;
          leg.distance = Math.round(baseMeters * (factor ^ i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
          raceLegs.push(leg);
        }

        //TODO: need to include rewards as well
        var testRewards: ResourceValue[] = [];
        testRewards.push(new ResourceValue("Resource1", 50));
        testRewards.push(new ResourceValue("Resource2", 5));
        testRewards.push(new ResourceValue("Resource3", 54));
        testRewards.push(new ResourceValue("Resource4", 500));

        this.globalVar.circuitRaces.push(new Race(raceLegs, circuitRank, true, raceIndex, testRewards));

        raceIndex += 1;
      }

      var charCode = circuitRank.charCodeAt(0);
      circuitRank = String.fromCharCode(--charCode);
    }
  }
}
