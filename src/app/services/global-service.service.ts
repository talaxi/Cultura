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
import { Barn } from '../models/barns/barn.model';
import { InitializeService } from './utility/initialize.service';
import { ShopSection } from '../models/shop/shop-section.model';
import { ShopItem } from '../models/shop/shop-item.model';
import { ShopItemTypeEnum } from '../models/shop-item-type-enum.model';
import { FacilitySizeEnum } from '../models/facility-size-enum.model';
import { AnimalDeck } from '../models/animals/animal-deck.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  globalVar = new GlobalVariables();

  constructor(private utilityService: UtilityService, private initializeService: InitializeService) { }

  initializeGlobalVariables(): void {
    //pull global from localStorage
    //below is for testing purposes on the model
    this.globalVar.animals = [];
    this.globalVar.trainingOptions = [];
    this.globalVar.circuitRaces = [];
    this.globalVar.resources = [];
    this.globalVar.modifiers = [];
    this.globalVar.animalDecks = [];

    //Initialize modifiers
    this.InitializeModifiers();

    this.InitializeAnimals();

    this.InitializeAnimalDecks();

    //Initialize training options
    this.InitializeGlobalTrainingOptions();

    this.InitializeShop();

    //Initialize barns
    this.InitializeBarns();

    //Initialize circuit race information
    this.globalVar.circuitRank = "W";
    this.GenerateCircuitRaces();

    //Initialize local race information

    //Initialize resources
    this.globalVar.resources.push(new ResourceValue("Money", 5000));

  }

  InitializeModifiers(): void {
    this.globalVar.modifiers.push(new StringNumberPair(.2, "staminaModifier"));

    var baseMaxSpeedModifier = .3;
    var baseAccelerationModifier = .1;
    var baseStaminaModifier = 10;
    var basePowerModifier = .05;
    var baseFocusModifier = 5;
    var baseAdaptabilityModifier = 5;

    var minorImprovement = 1.025;
    var mediumImprovement = 1.05;
    var majorImprovement = 1.1;
    var minorDetriment = .975;
    var mediumDetriment = .95;
    var majorDetriment = .9;

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * minorImprovement, "horseDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "horseDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * majorImprovement, "horseDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier, "horseDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * mediumDetriment, "horseDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "horseDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * mediumImprovement, "cheetahDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * majorImprovement, "cheetahDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * majorDetriment, "cheetahDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier, "cheetahDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier, "cheetahDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * minorDetriment, "cheetahDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier, "monkeyDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * mediumDetriment, "monkeyDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier, "monkeyDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * majorImprovement, "monkeyDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * mediumImprovement, "monkeyDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "monkeyDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier, "goatDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * minorImprovement, "goatDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * minorImprovement, "goatDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorDetriment, "goatDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * minorDetriment, "goatDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * majorImprovement, "goatDefaultAdaptabilityModifier"));
  }

  InitializeAnimals(): void {
    //Initialize animals
    var horse = new Horse();
    horse.name = "John";
    horse.isAvailable = true;
    this.calculateAnimalRacingStats(horse);

    var monkey = new Monkey();
    monkey.name = "Monkey";
    this.calculateAnimalRacingStats(monkey);

    var cheetah = new Cheetah();
    cheetah.name = "Cheetah";
    this.calculateAnimalRacingStats(cheetah);

    var goat = new Goat();
    goat.name = "Goat";
    this.calculateAnimalRacingStats(goat);

    this.globalVar.animals.push(horse);
    this.globalVar.animals.push(cheetah);
    this.globalVar.animals.push(goat);
    this.globalVar.animals.push(monkey);
  }

  InitializeAnimalDecks(): void {
    var deck = new AnimalDeck();    
    deck.isPrimaryDeck = true;
    deck.isAvailable = true;
    deck.name = "Animal Deck 1";

    var horse = this.globalVar.animals.find(item => item.getAnimalType() === "Horse");
    if (horse !== undefined)
      deck.selectedAnimals.push(horse);

    this.globalVar.animalDecks.push(deck);
  }

  InitializeShop(): void {
    this.globalVar.shop = [];

    var animalShopSection = new ShopSection();
    var animalShopItems: ShopItem[] = [];

    var cheetah = new ShopItem();
    cheetah.name = "Cheetah";
    cheetah.description = "The cheetah is a flat land racing animal that prioritizes quickness over stamina.";
    cheetah.purchasePrice = 500;
    cheetah.canHaveMultiples = false;
    cheetah.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(cheetah);

    var monkey = new ShopItem();
    monkey.name = "Monkey";
    monkey.description = "The monkey is a rock climbing animal that can use its considerable strength to drop rocks on its opponents.";
    monkey.purchasePrice = 500;
    monkey.canHaveMultiples = false;
    monkey.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(monkey);

    var goat = new ShopItem();
    goat.name = "Goat";
    goat.description = "The goat is a rock climbing animal that can nimbly travel terrain.";
    goat.purchasePrice = 500;
    goat.canHaveMultiples = false;
    goat.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(goat);

    animalShopSection.name = "Animals";
    animalShopSection.itemList = animalShopItems;
    this.globalVar.shop.push(animalShopSection);


    var foodShopSection = new ShopSection();
    var foodShopItems: ShopItem[] = [];

    var apple = new ShopItem();
    apple.name = "Apple";
    apple.description = "+1 Acceleration to a single animal";
    apple.purchasePrice = 50;
    apple.canHaveMultiples = true;
    apple.type = ShopItemTypeEnum.Food;
    foodShopItems.push(apple);

    var banana = new ShopItem();
    banana.name = "Banana";
    banana.description = "+1 Top Speed to a single animal";
    banana.purchasePrice = 50;
    banana.canHaveMultiples = true;
    banana.type = ShopItemTypeEnum.Food;
    foodShopItems.push(banana);

    var strawberry = new ShopItem();
    strawberry.name = "Strawberry";
    strawberry.description = "+1 Focus to a single animal";
    strawberry.purchasePrice = 50;
    strawberry.canHaveMultiples = true;
    strawberry.type = ShopItemTypeEnum.Food;
    foodShopItems.push(strawberry);

    var carrot = new ShopItem();
    carrot.name = "Carrot";
    carrot.description = "+1 Power to a single animal";
    carrot.purchasePrice = 50;
    carrot.canHaveMultiples = true;
    carrot.type = ShopItemTypeEnum.Food;
    foodShopItems.push(carrot);

    foodShopSection.name = "Food";
    foodShopSection.itemList = foodShopItems;
    this.globalVar.shop.push(foodShopSection);
  }

  InitializeBarns(): void {
    if (this.globalVar.barns === null || this.globalVar.barns === undefined ||
      this.globalVar.barns.length === 0) {

      this.globalVar.barns = [];
      var barn1 = new Barn();
      barn1.barnNumber = 1;
      barn1.isLocked = false;
      barn1.purchasePrice = 0;

      if (this.globalVar.animals !== null && this.globalVar.animals !== undefined &&
        this.globalVar.animals.length > 0) {
        var horse = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Horse);
        if (horse !== null && horse !== undefined)
          horse.associatedBarnNumber = barn1.barnNumber;
      }
      else {
        console.log("Can't find horse");
        //TODO: throw error, can't find default animal. initialize animal first
      }

      this.globalVar.barns.push(barn1);

      for (var i = 2; i <= 9; i++) {
        var newBarn = new Barn();
        newBarn.barnNumber = i;
        newBarn.isLocked = true;
        newBarn.purchasePrice = 500 * i;

        this.globalVar.barns.push(newBarn);
      }
    }
  }

  InitializeGlobalTrainingOptions(): void {
    var shortTrackRunning = new TrainingOption();
    shortTrackRunning.trainingName = "Short Track Running";
    shortTrackRunning.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    shortTrackRunning.timeToComplete = 30;
    shortTrackRunning.trainingType = TrainingOptionsEnum.ShortTrackRunning;
    shortTrackRunning.trainingCourseType = RaceCourseTypeEnum.Flatland;
    shortTrackRunning.statGain = 1;
    shortTrackRunning.affectedStatRatios = new AnimalStats(1, 0, 0, 0, 0, 0);
    this.globalVar.trainingOptions.push(shortTrackRunning);

    var sprints = new TrainingOption();
    sprints.trainingName = "Sprints";
    sprints.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    sprints.timeToComplete = 20;
    sprints.trainingType = TrainingOptionsEnum.Sprints;
    sprints.trainingCourseType = RaceCourseTypeEnum.Flatland;
    sprints.statGain = 1;
    sprints.affectedStatRatios = new AnimalStats(0, 1, 0, 0, 0, 0);
    this.globalVar.trainingOptions.push(sprints);

    var trailRunning = new TrainingOption();
    trailRunning.trainingName = "Trail Running";
    trailRunning.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    trailRunning.timeToComplete = 60;
    trailRunning.trainingType = TrainingOptionsEnum.TrailRunning;
    trailRunning.trainingCourseType = RaceCourseTypeEnum.Flatland;
    trailRunning.statGain = 1;
    trailRunning.affectedStatRatios = new AnimalStats(.5, 0, 1, 0, 0, 0);
    this.globalVar.trainingOptions.push(trailRunning);

    var moveLogs = new TrainingOption();
    moveLogs.trainingName = "Move Logs";
    moveLogs.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    moveLogs.timeToComplete = 30;
    moveLogs.trainingType = TrainingOptionsEnum.MoveLogs;
    moveLogs.trainingCourseType = RaceCourseTypeEnum.Flatland;
    moveLogs.statGain = 1;
    moveLogs.affectedStatRatios = new AnimalStats(0, 0, 0, 1, 0, 0);
    this.globalVar.trainingOptions.push(moveLogs);

    var footwork = new TrainingOption();
    footwork.trainingName = "Footwork";
    footwork.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    footwork.timeToComplete = 45;
    footwork.trainingType = TrainingOptionsEnum.Footwork;
    footwork.trainingCourseType = RaceCourseTypeEnum.Flatland;
    footwork.statGain = 1;
    footwork.affectedStatRatios = new AnimalStats(0, .5, 0, 0, 0, 1);
    this.globalVar.trainingOptions.push(footwork);

    var practiceCommands = new TrainingOption();
    practiceCommands.trainingName = "Practice Commands";
    practiceCommands.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    practiceCommands.timeToComplete = 60;
    practiceCommands.trainingType = TrainingOptionsEnum.PracticeCommands;
    practiceCommands.trainingCourseType = RaceCourseTypeEnum.Flatland;
    practiceCommands.statGain = 1;
    practiceCommands.affectedStatRatios = new AnimalStats(0, 0, 0, 0, 1, .25);
    this.globalVar.trainingOptions.push(practiceCommands);

    var scentTraining = new TrainingOption();
    scentTraining.trainingName = "Scent Training";
    scentTraining.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    scentTraining.timeToComplete = 45;
    scentTraining.trainingType = TrainingOptionsEnum.ScentTraining;
    scentTraining.trainingCourseType = RaceCourseTypeEnum.Flatland;
    scentTraining.statGain = 1;
    scentTraining.affectedStatRatios = new AnimalStats(0, 0, .5, 0, 1, 0);
    this.globalVar.trainingOptions.push(scentTraining);

    var smallWagonTow = new TrainingOption();
    smallWagonTow.trainingName = "Small Wagon Tow";
    smallWagonTow.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    smallWagonTow.timeToComplete = 45;
    smallWagonTow.trainingType = TrainingOptionsEnum.SmallWagonTow;
    smallWagonTow.trainingCourseType = RaceCourseTypeEnum.Flatland;
    smallWagonTow.statGain = 1;
    smallWagonTow.affectedStatRatios = new AnimalStats(0, 0, 0, 1.5, .25, 0);
    this.globalVar.trainingOptions.push(smallWagonTow);

    var sidestep = new TrainingOption();
    sidestep.trainingName = "Sidestep";
    sidestep.isAvailable = true;
    shortTrackRunning.facilitySize = FacilitySizeEnum.Small;
    sidestep.timeToComplete = 35;
    sidestep.trainingType = TrainingOptionsEnum.Sidestep;
    sidestep.trainingCourseType = RaceCourseTypeEnum.Flatland;
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
          leg.courseType = RaceCourseTypeEnum.Flatland;
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
            leg1.courseType = RaceCourseTypeEnum.Flatland;
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
          leg.courseType = RaceCourseTypeEnum.Flatland;
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
      if (courseType === RaceCourseTypeEnum.Flatland)
        specialRoute = RaceDesignEnum.S;
    }
    else if (routeType === 3) {
      if (courseType === RaceCourseTypeEnum.Flatland)
        specialRoute = RaceDesignEnum.Bumps;
    }

    return specialRoute;
  }

  calculateAnimalRacingStats(animal: Animal): void {
    //intialize variables    
    var totalMaxSpeedModifier = animal.currentStats.defaultMaxSpeedModifier;
    var totalAccelerationModifier = animal.currentStats.defaultAccelerationModifier;
    var totalStaminaModifier = animal.currentStats.defaultStaminaModifier;
    var totalPowerModifier = animal.currentStats.defaultPowerModifier;
    var totalFocusModifier = animal.currentStats.defaultFocusModifier;
    var totalAdaptabilityModifier = animal.currentStats.defaultAdaptabilityModifier;
    var animalTypeName = animal.getAnimalType().toLowerCase();

    //get modifiers, replace original variables if they are found
    var animalMaxSpeedModifier = this.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultMaxSpeedModifier");
    var animalAccelerationModifier = this.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultAccelerationModifier");
    var animalStaminaModifier = this.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultStaminaModifier");
    var animalPowerModifier = this.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultPowerModifier");
    var animalFocusModifier = this.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultFocusModifier");
    var animalAdaptabilityModifier = this.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultAdaptabilityModifier");

    if (animalMaxSpeedModifier !== undefined && animalMaxSpeedModifier !== null)
      totalMaxSpeedModifier = animalMaxSpeedModifier.value;
    if (animalAccelerationModifier !== undefined && animalAccelerationModifier !== null)
      totalAccelerationModifier = animalAccelerationModifier.value;
    if (animalStaminaModifier !== undefined && animalStaminaModifier !== null)
      totalStaminaModifier = animalStaminaModifier.value;
    if (animalPowerModifier !== undefined && animalPowerModifier !== null)
      totalPowerModifier = animalPowerModifier.value;
    if (animalFocusModifier !== undefined && animalFocusModifier !== null)
      totalFocusModifier = animalFocusModifier.value;
    if (animalAdaptabilityModifier !== undefined && animalAdaptabilityModifier !== null)
      totalAdaptabilityModifier = animalAdaptabilityModifier.value;

    //leave space to adjust modifiers with other items or anything

    //do the calculations  
    animal.currentStats.maxSpeedMs = animal.currentStats.topSpeed * totalMaxSpeedModifier;
    animal.currentStats.accelerationMs = animal.currentStats.acceleration * totalAccelerationModifier;
    animal.currentStats.stamina = animal.currentStats.endurance * totalStaminaModifier;
    animal.currentStats.powerMs = animal.currentStats.power * totalPowerModifier;
    animal.currentStats.focusMs = animal.currentStats.focus * totalFocusModifier;
    animal.currentStats.adaptabilityMs = animal.currentStats.adaptability * totalAdaptabilityModifier;

  }
}
