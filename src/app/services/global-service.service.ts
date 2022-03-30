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
import { Terrain } from '../models/races/terrain.model';
import { TerrainTypeEnum } from '../models/terrain-type-enum.model';

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
    this.globalVar.barns = [];
    this.globalVar.settings = new Map<string, boolean>();

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
    this.globalVar.circuitRank = "X";
    this.GenerateCircuitRaces();

    //Initialize local race information

    //Initialize resources
    this.InitializeResources();

    //Initialize settings
    this.InitializeSettings();
  }

  InitializeModifiers(): void {
    this.globalVar.modifiers.push(new StringNumberPair(.2, "staminaModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "trainingBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "circuitBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(1, "localBreedGaugeIncrease"));

    this.globalVar.modifiers.push(new StringNumberPair(.01, "breedLevelStatModifier"));

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
    monkey.isAvailable = true;
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
    deck.deckNumber = 1;

    var horse = this.globalVar.animals.find(item => item.getAnimalType() === "Horse");
    if (horse !== undefined)
      deck.selectedAnimals.push(horse);

    this.globalVar.animalDecks.push(deck);

    for (var i = 0; i < 3; i++) {
      var emptyDeck = new AnimalDeck();
      emptyDeck.isAvailable = true;
      emptyDeck.deckNumber = i+2;
      emptyDeck.name = "Animal Deck " + emptyDeck.deckNumber;
      this.globalVar.animalDecks.push(emptyDeck);
    }
  }

  //TODO: Move descriptions out of here and into lookup service so that this doesn't have to be stored in storage
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
    monkey.description = "The monkey is a mountain climbing animal that can use its considerable strength to drop rocks on its opponents.";
    monkey.purchasePrice = 500;
    monkey.canHaveMultiples = false;
    monkey.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(monkey);

    var goat = new ShopItem();
    goat.name = "Goat";
    goat.description = "The goat is a mountain climbing animal that can nimbly travel terrain.";
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

    var turnip = new ShopItem();
    turnip.name = "Turnip";
    turnip.description = "+1 Focus to a single animal";
    turnip.purchasePrice = 50;
    turnip.canHaveMultiples = true;
    turnip.type = ShopItemTypeEnum.Food;
    foodShopItems.push(turnip);

    foodShopSection.name = "Food";
    foodShopSection.itemList = foodShopItems;
    this.globalVar.shop.push(foodShopSection);

    var trainingShopSection = new ShopSection();
    var trainingShopItems: ShopItem[] = [];

    this.globalVar.trainingOptions.filter(item => !item.isAvailable).forEach(item => {
      var purchasableTraining = new ShopItem();
      purchasableTraining.name = item.trainingName;
      purchasableTraining.description = item.getStatGainDescription();
      purchasableTraining.purchasePrice = item.purchasePrice;
      purchasableTraining.canHaveMultiples = false;
      purchasableTraining.type = ShopItemTypeEnum.Training;
      trainingShopItems.push(purchasableTraining);
    });

    trainingShopSection.name = "Trainings";
    trainingShopSection.itemList = trainingShopItems;
    this.globalVar.shop.push(trainingShopSection);

    var abilityShopSection = new ShopSection();
    var abilityShopItems: ShopItem[] = [];

    this.globalVar.animals.forEach(animal => {
      animal.availableAbilities.forEach(ability => {
        if (!ability.isAbilityPurchased) {
          var purchasableAbility = new ShopItem();
          purchasableAbility.name = animal.getAnimalType() + " Ability: " + ability.name;
          purchasableAbility.description = ability.description;
          purchasableAbility.purchasePrice = ability.purchasePrice;
          purchasableAbility.canHaveMultiples = false;
          purchasableAbility.type = ShopItemTypeEnum.Ability;
          abilityShopItems.push(purchasableAbility);
        }
      });
    });

    abilityShopSection.name = "Abilities";
    abilityShopSection.itemList = abilityShopItems;
    this.globalVar.shop.push(abilityShopSection);
  }

  InitializeBarns(): void {
    if (this.globalVar.barns === null || this.globalVar.barns === undefined ||
      this.globalVar.barns.length === 0) {

      this.globalVar.barns = [];
      var barn1 = new Barn();
      barn1.barnNumber = 1;
      barn1.isLocked = false;
      barn1.size = FacilitySizeEnum.Small;
      barn1.purchasePrice = 0;
      barn1.facilityUpgradePrice = 500;
      barn1.upgradePrice = 500;

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
        newBarn.size = FacilitySizeEnum.Small;

        this.globalVar.barns.push(newBarn);
      }
    }
  }

  InitializeGlobalTrainingOptions(): void {
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.ShortTrackRunning));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.Sprints));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.TrailRunning));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.MoveLogs));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.Footwork));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.PracticeCommands));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.ScentTraining));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.SmallWagonTow));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.Sidestep));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.MediumTrackRunning));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.UphillRun));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.Puzzles));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.MoveRocks));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.DodgeBall));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.BurstPractice));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.Acrobatics));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.LongTrackRunning));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.VehicleTow));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.LogJump));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.Meditation));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.WindSprints));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.GreenwayHike));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.Marathon));
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.AgilityCourse));
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
    var legLengthCutoff = timeToComplete / 4; //a leg cannot be any shorter than this as a percentage

    var baseMeters = 100;
    var factor = 1.15;

    var maxRandomFactor = 1.1;
    var minRandomFactor = 0.9;

    var legMinimumDistance = 20; //as a percentage of 100
    var legMaximumDistance = 80; //as a percentage of 100

    for (var i = 0; i < 26; i++) //Circuit rank Z-A
    {
      var circuitRaces = 5;
      if (i === 0)
        circuitRaces = 1;
      else if (i == 1)
        circuitRaces = 3;
      for (var j = 0; j < circuitRaces; j++) {
        var raceLegs: RaceLeg[] = [];
        var uniqueRacingTypes: RaceCourseTypeEnum[] = []; //if you're premaking these, you can't base it on the user's available animals at the time

        if (i < 2) //make these breakpoints configurable, figure out your time horizon on new races
        {
          var leg = new RaceLeg();
          leg.courseType = RaceCourseTypeEnum.Flatland;
          if (i === 1) {
            if (j === 0)
              leg.terrain = new Terrain(TerrainTypeEnum.Sunny);
            else if (j === 1)
              leg.terrain = new Terrain(TerrainTypeEnum.Rainy);
            else if (j === 2)
              leg.terrain = new Terrain(TerrainTypeEnum.Storms);
          }
          leg.distance = Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
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
            leg1.distance = (Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
            raceLegs.push(leg1);
          }

          if (leg2Normalized > 0) {
            var leg2 = new RaceLeg();
            leg2.courseType = RaceCourseTypeEnum.Mountain;
            leg2.distance = (Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
            raceLegs.push(leg2);
          }
        }
        else {
          //make it 3 race types but variable on what they are based on what the user has?
          var leg = new RaceLeg();
          leg.courseType = RaceCourseTypeEnum.Flatland;
          leg.distance = Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
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


        this.globalVar.circuitRaces.push(new Race(raceLegs, circuitRank, true, raceIndex, totalDistance, this.GenerateCircuitRaceRewards(circuitRank)));

        raceIndex += 1;
      }

      var charCode = circuitRank.charCodeAt(0);
      circuitRank = String.fromCharCode(--charCode);
    }
  }

  GetCircuitRankValue(circuitRank: string): number {
    var rankValue = 1;

    while (circuitRank.length > 1) {
      var currentLength = circuitRank.length;
      rankValue += 26;
      circuitRank = circuitRank.substring(1);

      if (circuitRank.length >= currentLength) //break while loop just in case there is an issue, I hate while loops
        circuitRank = '';
    }

    var charCode = circuitRank.charCodeAt(0);
    rankValue += 91 - charCode; //Z is 90

    return rankValue;
  }

  GenerateCircuitRaceRewards(circuitRank: string): ResourceValue[] {
    var numericRank = this.GetCircuitRankValue(circuitRank);
    var moneyFactor = 1.1;
    var baseMoney = 50;

    var baseRenown = 1.1;
    var renownFactor = 1.05;

    var rewards: ResourceValue[] = [];

    var currentRenownResource = this.globalVar.resources.find(item => item.name === "Renown");
    var currentRenown = 1;

    if (currentRenownResource !== undefined)
      currentRenown = currentRenownResource.amount;

    rewards.push(new ResourceValue("Money", Math.round(baseMoney * (moneyFactor ** numericRank)))); //you can't do the modifier here, your renown is fixed at the very beginning when you generate
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));
    return rewards;
  }

  GenerateRaceLegPaths(leg: RaceLeg, totalDistance: number): RacePath[] {
    var paths: RacePath[] = [];
    var totalLegLengthRemaining = leg.distance;
    var pathLength = totalDistance / 20;
    var totalRoutes = Math.round(totalLegLengthRemaining / pathLength);
    var lastRouteSpecial = false;

    //console.log("totalLegLengthRemaining: " + totalLegLengthRemaining);
    //console.log("pathLength: " + pathLength);
    //console.log("totalRoutes: " + totalRoutes);

    for (var i = 0; i < totalRoutes; i++) {
      var path = new RacePath();

      if (i === 0) {
        path.length = pathLength;
        path.routeDesign = RaceDesignEnum.Regular;
        path.setStumbleFields();
        paths.push(path);
        totalLegLengthRemaining -= path.length;
        continue;
      }

      if (i === totalRoutes - 1) {
        path.length = totalLegLengthRemaining;
        path.routeDesign = RaceDesignEnum.Regular;
        path.setStumbleFields();
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

      if (!lastRouteSpecial) {
        path.routeDesign = this.GetSpecialRoute(leg.courseType);
        leg.specialPathCount += 1;
        path.isSpecialPath = true;
      }
      else
        path.routeDesign = RaceDesignEnum.Regular;

      if (path.routeDesign !== RaceDesignEnum.Regular)
        lastRouteSpecial = true;
      else
        lastRouteSpecial = false;

      path.setStumbleFields();
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
      else if (courseType === RaceCourseTypeEnum.Mountain)
        specialRoute = RaceDesignEnum.Crevasse;
    }
    else if (routeType === 3) {
      if (courseType === RaceCourseTypeEnum.Flatland)
        specialRoute = RaceDesignEnum.Bumps;
      else if (courseType === RaceCourseTypeEnum.Mountain)
        specialRoute = RaceDesignEnum.Gaps;
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
    var breedLevelStatModifierValue = .01;
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
    var breedLevelStatModifier = this.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    //do the calculations      
    animal.currentStats.maxSpeedMs = animal.currentStats.calculateMaxSpeed(totalMaxSpeedModifier * breedLevelStatModifierValue);
    animal.currentStats.accelerationMs = animal.currentStats.calculateTrueAcceleration(totalAccelerationModifier * breedLevelStatModifierValue);
    animal.currentStats.stamina = animal.currentStats.calculateStamina(totalStaminaModifier * breedLevelStatModifierValue);
    animal.currentStats.powerMs = animal.currentStats.calculateTruePower(totalPowerModifier * breedLevelStatModifierValue);
    animal.currentStats.focusMs = animal.currentStats.calculateTrueFocus(totalFocusModifier * breedLevelStatModifierValue);
    animal.currentStats.adaptabilityMs = animal.currentStats.calculateTrueAdaptability(totalAdaptabilityModifier * breedLevelStatModifierValue);
    animal.currentStats.burstChance = animal.currentStats.calculateBurstChance();
    animal.currentStats.burstDistance = animal.currentStats.calculateBurstDistance();
  }

  IncreaseAnimalBreedGauge(animal: Animal, amount: number) {
    animal.breedGaugeXp += amount;

    if (animal.breedGaugeXp >= animal.breedGaugeMax) {
      animal.breedGaugeXp = animal.breedGaugeMax;
    }
  }

  BreedAnimal(animal: Animal) {
    if (animal.breedGaugeXp < animal.breedGaugeMax)
      return;

    animal.breedLevel += 1;
    animal.breedGaugeXp = 0;
    //increase max total

    animal.currentStats = new AnimalStats(animal.baseStats.topSpeed, animal.baseStats.acceleration, animal.baseStats.endurance,
      animal.baseStats.power, animal.baseStats.focus, animal.baseStats.adaptability);
    this.calculateAnimalRacingStats(animal);
  }

  InitializeResources() {
    this.globalVar.resources.push(this.initializeService.initializeResource("Money", 5000));
  }

  InitializeSettings() {
    this.globalVar.settings.set("skipDrawRace", false);
  }
}
