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
import { RacePath } from '../models/races/race-path.model';
import { RaceDesignEnum } from '../models/race-design-enum.model';

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
    this.InitializeGlobalTrainingOptions();

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

  InitializeGlobalTrainingOptions(): void {
    var shortTrackRunning = new TrainingOption();
    shortTrackRunning.trainingName = "Short Track Running";
    shortTrackRunning.isAvailable = true;    
    shortTrackRunning.timeToComplete = 30;
    shortTrackRunning.trainingType = TrainingOptionsEnum.ShortTrackRunning;
    shortTrackRunning.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    shortTrackRunning.statGain = 1;
    shortTrackRunning.affectedStatRatios = new AnimalStats(1, 0, 0, 0, 0, 0);
    this.globalVar.trainingOptions.push(shortTrackRunning);

    var sprints = new TrainingOption();
    sprints.trainingName = "Sprints";
    sprints.isAvailable = true;    
    sprints.timeToComplete = 20;
    sprints.trainingType = TrainingOptionsEnum.Sprints;
    sprints.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    sprints.statGain = 1;
    sprints.affectedStatRatios = new AnimalStats(0, 1, 0, 0, 0, 0);    
    this.globalVar.trainingOptions.push(sprints);

    var trailRunning = new TrainingOption();
    trailRunning.trainingName = "Trail Running";
    trailRunning.isAvailable = true;    
    trailRunning.timeToComplete = 60;
    trailRunning.trainingType = TrainingOptionsEnum.TrailRunning;
    trailRunning.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    trailRunning.statGain = 1;
    trailRunning.affectedStatRatios = new AnimalStats(.5, 0, 1, 0, 0, 0);    
    this.globalVar.trainingOptions.push(trailRunning);

    var moveLogs = new TrainingOption();
    moveLogs.trainingName = "Move Logs";
    moveLogs.isAvailable = true;    
    moveLogs.timeToComplete = 30;
    moveLogs.trainingType = TrainingOptionsEnum.MoveLogs;
    moveLogs.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    moveLogs.statGain = 1;
    moveLogs.affectedStatRatios = new AnimalStats(0, 0, 0, 1, 0, 0);    
    this.globalVar.trainingOptions.push(moveLogs);

    var footwork = new TrainingOption();
    footwork.trainingName = "Footwork";
    footwork.isAvailable = true;    
    footwork.timeToComplete = 45;
    footwork.trainingType = TrainingOptionsEnum.Footwork;
    footwork.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    footwork.statGain = 1;
    footwork.affectedStatRatios = new AnimalStats(0, .5, 0, 0, 0, 1);    
    this.globalVar.trainingOptions.push(footwork);

    var practiceCommands = new TrainingOption();
    practiceCommands.trainingName = "Practice Commands";
    practiceCommands.isAvailable = true;    
    practiceCommands.timeToComplete = 60;
    practiceCommands.trainingType = TrainingOptionsEnum.PracticeCommands;
    practiceCommands.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    practiceCommands.statGain = 1;
    practiceCommands.affectedStatRatios = new AnimalStats(0, 0, 0, 0, 1, .25);    
    this.globalVar.trainingOptions.push(practiceCommands);

    var scentTraining = new TrainingOption();
    scentTraining.trainingName = "Scent Training";
    scentTraining.isAvailable = true;    
    scentTraining.timeToComplete = 45;
    scentTraining.trainingType = TrainingOptionsEnum.ScentTraining;
    scentTraining.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    scentTraining.statGain = 1;
    scentTraining.affectedStatRatios = new AnimalStats(0, 0, .5, 0, 1, 0);    
    this.globalVar.trainingOptions.push(scentTraining);

    var smallWagonTow = new TrainingOption();
    smallWagonTow.trainingName = "Small Wagon Tow";
    smallWagonTow.isAvailable = true;    
    smallWagonTow.timeToComplete = 45;
    smallWagonTow.trainingType = TrainingOptionsEnum.SmallWagonTow;
    smallWagonTow.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    smallWagonTow.statGain = 1;
    smallWagonTow.affectedStatRatios = new AnimalStats(0, 0, 0, 1.5, .25, 0);    
    this.globalVar.trainingOptions.push(smallWagonTow);

    var sidestep = new TrainingOption();
    sidestep.trainingName = "Sidestep";
    sidestep.isAvailable = true;    
    sidestep.timeToComplete = 35;
    sidestep.trainingType = TrainingOptionsEnum.Sidestep;
    sidestep.trainingCourseType = RaceCourseTypeEnum.FlatLand;
    sidestep.statGain = 1;
    sidestep.affectedStatRatios = new AnimalStats(0, 2, 0, 0, 0, 0);    
    this.globalVar.trainingOptions.push(sidestep);
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
    var timeToComplete = 60;
    var legLengthCutoff = timeToComplete / 4;

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
            leg1.courseType = RaceCourseTypeEnum.FlatLand;
            leg1.distance = (Math.round(baseMeters * (factor ^ i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
            raceLegs.push(leg1);
          }

          if (leg2Normalized > 0) {
            var leg2 = new RaceLeg();
            leg2.courseType = RaceCourseTypeEnum.Rock;
            leg2.distance = (Math.round(baseMeters * (factor ^ i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
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

        var totalDistance = 0;

        raceLegs.forEach(leg => {
          totalDistance += leg.distance;
        });        

        raceLegs.forEach(leg => {
          leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
        });

        //TODO: need to include rewards as well
        var testRewards: ResourceValue[] = [];
        testRewards.push(new ResourceValue("Resource1", 50));
        testRewards.push(new ResourceValue("Resource2", 5));
        testRewards.push(new ResourceValue("Resource3", 54));
        testRewards.push(new ResourceValue("Resource4", 500));

        this.globalVar.circuitRaces.push(new Race(raceLegs, circuitRank, true, raceIndex, totalDistance, testRewards));

        raceIndex += 1;
      }

      var charCode = circuitRank.charCodeAt(0);
      circuitRank = String.fromCharCode(--charCode);
    }
  }

  GenerateRaceLegPaths(leg: RaceLeg, totalDistance: number): RacePath[] {
    var paths: RacePath[] = [];
    var totalLegLengthRemaining = leg.distance;
    var pathLength = totalDistance / 20;
    var totalRoutes = totalLegLengthRemaining / pathLength;
    var lastRouteSpecial = false;

    //console.log("totalLegLengthRemaining: " + totalLegLengthRemaining);
    //console.log("pathLength: " + pathLength);
    //console.log("totalRoutes: " + totalRoutes);

    for (var i = 0; i < totalRoutes; i++) {
      var path = new RacePath();

      if (i === 0) {        
        path.length = pathLength;
        path.routeDesign = RaceDesignEnum.Regular;
        paths.push(path);
        continue;
      }

      if (i === totalRoutes - 1) {        
        path.length = totalLegLengthRemaining;
        path.routeDesign = RaceDesignEnum.Regular;
        paths.push(path);
        continue;
      }

      if (totalLegLengthRemaining > pathLength)
        path.length = pathLength;
      else
        path.length = totalLegLengthRemaining;

      totalLegLengthRemaining -= path.length;

      if (totalLegLengthRemaining < 0)
        totalLegLengthRemaining = 0;

      if (!lastRouteSpecial)
        path.routeDesign = this.GetSpecialRoute(leg.courseType);
      else
        path.routeDesign = RaceDesignEnum.Regular;

      if (path.routeDesign !== RaceDesignEnum.Regular)
        lastRouteSpecial = true;
      else
        lastRouteSpecial = false;

      paths.push(path);
    }

    return paths;
  }

  GetSpecialRoute(courseType: RaceCourseTypeEnum): RaceDesignEnum {
    var specialRoute = RaceDesignEnum.Regular;
    var totalLandDesigns = 3;

    var routeType = this.utilityService.getRandomInteger(1, totalLandDesigns);

    if (routeType === 1) {
      return specialRoute;
    }
    else if (routeType === 2) {
      if (courseType === RaceCourseTypeEnum.FlatLand)
        specialRoute = RaceDesignEnum.S;
    }
    else if (routeType === 3) {
      if (courseType === RaceCourseTypeEnum.FlatLand)
        specialRoute = RaceDesignEnum.Bumps;
    }    
    
    return specialRoute;
  }
}
