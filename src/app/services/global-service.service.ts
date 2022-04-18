import { Injectable } from '@angular/core';
import { GlobalVariables } from '../models/global/global-variables.model';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalStats } from '../models/animals/animal-stats.model';
import { Animal, Cheetah, Dolphin, Gecko, Goat, Hare, Horse, Monkey, Shark } from '../models/animals/animal.model';
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
import { LocalRaceTypeEnum } from '../models/local-race-type-enum.model';

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
    this.globalVar.localRaces = [];
    this.globalVar.resources = [];
    this.globalVar.modifiers = [];
    this.globalVar.animalDecks = [];
    this.globalVar.barns = [];
    this.globalVar.settings = new Map<string, boolean>();
    this.globalVar.unlockables = new Map<string, boolean>();
    this.globalVar.tutorialCompleted = false;
    this.globalVar.currentTutorialId = 1;

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
    this.globalVar.circuitRank = "Z";
    this.GenerateCircuitRaces();
    this.checkCircuitRankRewards();

    //Initialize local race information
    this.GenerateLocalRaces();

    //Initialize resources
    this.InitializeResources();

    //Initialize settings
    this.InitializeSettings();

    //Initialize settings
    this.InitializeUnlockables();

    console.log(this.globalVar);
  }

  InitializeModifiers(): void {
    this.globalVar.modifiers.push(new StringNumberPair(.2, "staminaModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "trainingBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "circuitBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(1, "localBreedGaugeIncrease"));

    this.globalVar.modifiers.push(new StringNumberPair(.01, "breedLevelStatModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "facilityLevelModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.02, "animalHandlerModifier"));

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

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier, "hareDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * mediumImprovement, "hareDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier, "hareDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "hareDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * mediumDetriment, "hareDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "hareDefaultAdaptabilityModifier"));

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

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * mediumDetriment, "geckoDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "geckoDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * mediumImprovement, "geckoDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier, "geckoDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * majorImprovement, "geckoDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "geckoDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * minorDetriment, "dolphinDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * minorImprovement, "dolphinDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier, "dolphinDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * majorImprovement, "dolphinDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier, "dolphinDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * minorDetriment, "dolphinDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * majorImprovement, "sharkDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "sharkDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * minorDetriment, "sharkDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "sharkDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * mediumDetriment, "sharkDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * mediumDetriment, "sharkDefaultAdaptabilityModifier"));
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
    
    var hare = new Hare();
    hare.name = "Hare";
    this.calculateAnimalRacingStats(hare);

    var cheetah = new Cheetah();
    cheetah.name = "Cheetah";
    this.calculateAnimalRacingStats(cheetah);

    var goat = new Goat();
    goat.name = "Goat";
    this.calculateAnimalRacingStats(goat);
    
    var gecko = new Gecko();
    gecko.name = "Gecko";
    this.calculateAnimalRacingStats(gecko);
    
    var dolphin = new Dolphin();
    dolphin.name = "Dolphin";
    this.calculateAnimalRacingStats(dolphin);
    
    var shark = new Shark();
    shark.name = "Shark";
    this.calculateAnimalRacingStats(shark);

    this.globalVar.animals.push(horse);
    this.globalVar.animals.push(cheetah);
    this.globalVar.animals.push(hare);
    this.globalVar.animals.push(goat);
    this.globalVar.animals.push(monkey);
    this.globalVar.animals.push(gecko);
    this.globalVar.animals.push(dolphin);
    this.globalVar.animals.push(shark);
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
      emptyDeck.deckNumber = i + 2;
      emptyDeck.name = "Animal Deck " + emptyDeck.deckNumber;
      this.globalVar.animalDecks.push(emptyDeck);
    }
  }

  //TODO: Move descriptions out of here and into lookup service so that this doesn't have to be stored in storage
  InitializeShop(): void {
    this.globalVar.shop = [];

    var animalShopSection = new ShopSection();
    var animalShopItems: ShopItem[] = [];
    var baseAnimalPrice = 5000;

    var cheetah = new ShopItem();
    cheetah.name = "Cheetah";
    cheetah.shortDescription = "The cheetah is a flat land racing animal that prioritizes quickness over stamina.";
    cheetah.purchasePrice.push(new ResourceValue("Money", baseAnimalPrice));
    cheetah.canHaveMultiples = false;
    cheetah.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(cheetah);

    var goat = new ShopItem();
    goat.name = "Goat";
    goat.shortDescription = "The goat is a mountain climbing animal that can nimbly travel terrain.";
    goat.purchasePrice.push(new ResourceValue("Money", baseAnimalPrice));
    goat.canHaveMultiples = false;
    goat.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(goat);

    animalShopSection.name = "Animals";
    animalShopSection.itemList = animalShopItems;
    this.globalVar.shop.push(animalShopSection);

    var foodShopSection = new ShopSection();
    var foodShopItems: ShopItem[] = [];
    var baseFoodPrice = 50;

    var apple = new ShopItem();
    apple.name = "Apple";
    apple.shortDescription = "+1 Acceleration to a single animal";
    apple.purchasePrice.push(new ResourceValue("Money", baseFoodPrice));
    apple.canHaveMultiples = true;
    apple.type = ShopItemTypeEnum.Food;
    apple.infiniteAmount = true;
    foodShopItems.push(apple);

    var banana = new ShopItem();
    banana.name = "Banana";
    banana.shortDescription = "+1 Top Speed to a single animal";
    banana.purchasePrice.push(new ResourceValue("Money", baseFoodPrice));
    banana.canHaveMultiples = true;
    banana.type = ShopItemTypeEnum.Food;
    banana.infiniteAmount = true;
    foodShopItems.push(banana);

    var strawberry = new ShopItem();
    strawberry.name = "Strawberry";
    strawberry.shortDescription = "+1 Endurance to a single animal";
    strawberry.purchasePrice.push(new ResourceValue("Money", baseFoodPrice));
    strawberry.canHaveMultiples = true;
    strawberry.type = ShopItemTypeEnum.Food;
    strawberry.infiniteAmount = true;
    foodShopItems.push(strawberry);

    var carrot = new ShopItem();
    carrot.name = "Carrot";
    carrot.shortDescription = "+1 Power to a single animal";
    carrot.purchasePrice.push(new ResourceValue("Money", baseFoodPrice));
    carrot.canHaveMultiples = true;
    carrot.type = ShopItemTypeEnum.Food;
    carrot.infiniteAmount = true;
    foodShopItems.push(carrot);

    var turnip = new ShopItem();
    turnip.name = "Turnip";
    turnip.shortDescription = "+1 Focus to a single animal";
    turnip.purchasePrice.push(new ResourceValue("Money", baseFoodPrice));
    turnip.canHaveMultiples = true;
    turnip.type = ShopItemTypeEnum.Food;
    turnip.infiniteAmount = true;
    foodShopItems.push(turnip);

    var orange = new ShopItem();
    orange.name = "Orange";
    orange.shortDescription = "+1 Adaptability to a single animal";
    orange.purchasePrice.push(new ResourceValue("Money", baseFoodPrice));
    orange.canHaveMultiples = true;
    orange.type = ShopItemTypeEnum.Food;
    orange.infiniteAmount = true;
    foodShopItems.push(orange);

    foodShopSection.name = "Food";
    foodShopSection.itemList = foodShopItems;
    this.globalVar.shop.push(foodShopSection);

    var trainingShopSection = new ShopSection();
    var trainingShopItems: ShopItem[] = [];

    this.globalVar.trainingOptions.filter(item => !item.isAvailable).forEach(item => {
      var purchasableTraining = new ShopItem();
      purchasableTraining.name = item.trainingName;
      purchasableTraining.shortDescription = item.getStatGainDescription();
      purchasableTraining.purchasePrice.push(new ResourceValue("Money", item.purchasePrice));
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
          purchasableAbility.purchasePrice.push(new ResourceValue("Money", ability.purchasePrice));
          purchasableAbility.canHaveMultiples = false;
          purchasableAbility.type = ShopItemTypeEnum.Ability;
          purchasableAbility.additionalIdentifier = ability.name;
          abilityShopItems.push(purchasableAbility);
        }
      });
    });

    abilityShopSection.name = "Abilities";
    abilityShopSection.itemList = abilityShopItems;
    this.globalVar.shop.push(abilityShopSection);

    var specialtyShopSection = new ShopSection();
    var specialtyShopItems: ShopItem[] = [];

    var stopwatch = new ShopItem();
    stopwatch.name = "Stopwatch";
    stopwatch.shortDescription = "Reduce training time by 5%";
    stopwatch.purchasePrice.push(this.getMedalResourceValue(10));
    stopwatch.quantityMultiplier = 10;
    stopwatch.totalShopQuantity = 2;
    stopwatch.canHaveMultiples = true;
    stopwatch.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(stopwatch);

    var animalHandler = new ShopItem();
    animalHandler.name = "Animal Handler";
    animalHandler.shortDescription = "Retain 2% of trained stats after breeding";
    animalHandler.purchasePrice.push(this.getMoneyResourceValue(2000));
    animalHandler.quantityMultiplier = 2;
    animalHandler.totalShopQuantity = 20;
    animalHandler.canHaveMultiples = true;
    animalHandler.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(animalHandler);

    var raceMaps = new ShopItem();
    raceMaps.name = "Race Maps";
    raceMaps.shortDescription = "Increase your chance to burst during special routes by 25%";
    raceMaps.purchasePrice.push(this.getMedalResourceValue(2));
    raceMaps.quantityMultiplier = 2;
    raceMaps.totalShopQuantity = 4;
    raceMaps.canHaveMultiples = true;
    raceMaps.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(raceMaps);

    var stockbreeder = new ShopItem();
    stockbreeder.name = "Stockbreeder";
    stockbreeder.shortDescription = "Add option to auto breed when Breed XP is full";
    stockbreeder.purchasePrice.push(this.getMoneyResourceValue(5000));
    stockbreeder.canHaveMultiples = false;
    stockbreeder.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(stockbreeder);

    specialtyShopSection.name = "Specialty";
    specialtyShopSection.itemList = specialtyShopItems;
    this.globalVar.shop.push(specialtyShopSection);

  }

  InitializeBarns(): void {
    if (this.globalVar.barns === null || this.globalVar.barns === undefined ||
      this.globalVar.barns.length === 0) {
      var facilityUpgradePrice = 500;


      this.globalVar.barns = [];
      var barn1 = new Barn();
      barn1.barnNumber = 1;
      barn1.isLocked = false;
      barn1.size = FacilitySizeEnum.Small;
      barn1.purchasePrice = 0;
      barn1.facilityUpgradePrice = facilityUpgradePrice;
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
        newBarn.facilityUpgradePrice = facilityUpgradePrice;
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
    this.checkCircuitRankRewards();
  }

  getRewardReceiveText(numericValue: number) {    
    return "Reach circuit rank " + this.utilityService.getCircuitRankFromNumericValue(numericValue) + " to receive: \n";
  }

  //TODO: Make some sort of checkup that says if circuitrank is > 3 then make sure monkey is available?
  checkCircuitRankRewards(): void {
    var numericValue = this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank);

    if (numericValue === 1)
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(2) + "Mono Races";

    if (numericValue === 2) {
      this.globalVar.unlockables.set("monoRace", true);

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(3) + "Monkey";
    }
    if (numericValue === 3) {
      var monkey = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey);
      if (monkey !== undefined && monkey !== null) {
        monkey.isAvailable = true;

        var primaryAnimalDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
        if (primaryAnimalDeck !== null && primaryAnimalDeck !== undefined) {
          var typeFound = false;
          primaryAnimalDeck.selectedAnimals.forEach(item => {
            if (item.raceCourseType === monkey?.raceCourseType)
              typeFound = true;
          });

          if (!typeFound)
            primaryAnimalDeck.selectedAnimals.push(monkey);
        }
      }

      var renownAmount = 1;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(5) + renownAmount + " Renown";
    }
    else if (numericValue === 5)
    {
      var renownAmount = 1;
      var renownResource = this.globalVar.resources.find(item => item.name === "Renown");
      if (renownResource === null || renownResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Renown", renownAmount));
      else
        renownResource.amount += renownAmount;

      var appleAmount = 5;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(7) + appleAmount + " Apples";
    }
    else if (numericValue === 7) {
      var appleAmount = 1;
      var appleResource = this.globalVar.resources.find(item => item.name === "Apples");
      if (appleResource === null || appleResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Apples", appleAmount));
      else
        appleResource.amount += appleAmount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(10) + "Dolphin";
    }
    else if (numericValue === 10) //10
    {
      var dolphin = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Dolphin);
      if (dolphin !== undefined && dolphin !== null) {
        dolphin.isAvailable = true;

        var primaryAnimalDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
        if (primaryAnimalDeck !== null && primaryAnimalDeck !== undefined) {
          var typeFound = false;
          primaryAnimalDeck.selectedAnimals.forEach(item => {
            if (item.raceCourseType === dolphin?.raceCourseType)
              typeFound = true;
          });

          if (!typeFound)
            primaryAnimalDeck.selectedAnimals.push(dolphin);
        }
      }

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(12) + "Attraction Specialization";
    }
    else if (numericValue === 12)
    {
      this.globalVar.unlockables.set("attractionSpecialization", true);

      var moneyAmount = 1500;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(15) + moneyAmount + " Money";
    }
    else if (numericValue === 15)
    {
      var moneyAmount = 1500;
      var resource = this.globalVar.resources.find(item => item.name === "Money");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Money", moneyAmount));
      else
        resource.amount += moneyAmount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(18) + "Barn Row 2";
    }
    else if (numericValue === 18)
    {
      this.globalVar.unlockables.set("barnRow2", true);

      var renownAmount = 1;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(20) + renownAmount + " Renown";
    }
    else if (numericValue === 20)
    {
      var renownAmount = 1;
      var renownResource = this.globalVar.resources.find(item => item.name === "Renown");
      if (renownResource === null || renownResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Renown", renownAmount));
      else
        renownResource.amount += renownAmount;

      var orangeAmount = 5;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(22) + orangeAmount + " Oranges";
    }
    else if (numericValue === 22) {
      var orangeAmount = 1;
      var resource = this.globalVar.resources.find(item => item.name === "Oranges");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Oranges", orangeAmount));
      else
      resource.amount += orangeAmount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(25) + "Research Facility Specialization";
    }
    else if (numericValue === 25)
    {
      this.globalVar.unlockables.set("researchFacilitySpecialization", true);

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(27) + "Rainbow Races";
    }
    else if (numericValue === 27)
    {
      this.globalVar.unlockables.set("rainbowRace", true);

      var moneyAmount = 5000;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(30) + moneyAmount + " Money";
    }
    else if (numericValue === 30)
    {
      var moneyAmount = 5000;
      var resource = this.globalVar.resources.find(item => item.name === "Money");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Money", moneyAmount));
      else
        resource.amount += moneyAmount;

      var turnipAmount = 15;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(33) + turnipAmount + " Turnips";
    }
  }

  //TODO: tweak progression as needed
  GenerateCircuitRaces(): void {
    //TODO: do this once and store it so everyone has the same races
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
      var circuitRaces = 3;
      if (i === 0)
        circuitRaces = 1;
      else if (i == 1)
        circuitRaces = 2;
      for (var j = 0; j < circuitRaces; j++) {
        var raceLegs: RaceLeg[] = [];

        if (i < 2) //make these breakpoints configurable, figure out your time horizon on new races
        {
          var leg = new RaceLeg();
          leg.courseType = RaceCourseTypeEnum.Flatland;
          if (i === 1) {
            if (j === 0)
              leg.terrain = new Terrain(TerrainTypeEnum.Sunny);
            else if (j === 1)
              leg.terrain = new Terrain(TerrainTypeEnum.Rainy);
          }
          else
            leg.terrain = new Terrain(TerrainTypeEnum.Sunny);

          leg.distance = Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
          raceLegs.push(leg);
        }
        else if (i < 9) {
          var availableCourses: RaceCourseTypeEnum[] = [];
          availableCourses.push(RaceCourseTypeEnum.Flatland);
          availableCourses.push(RaceCourseTypeEnum.Mountain);
          var randomizedCourseList = this.getCourseTypeInRandomOrder(availableCourses);

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
            leg1.distance = (Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
            leg1.terrain = this.getRandomTerrain(leg1.courseType);
            raceLegs.push(leg1);
          }

          if (leg2Normalized > 0) {
            var leg2 = new RaceLeg();
            leg2.courseType = randomizedCourseList[1];
            leg2.distance = (Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
            leg2.terrain = this.getRandomTerrain(leg2.courseType);
            raceLegs.push(leg2);
          }
        }
        else if (i < 26) {
          legLengthCutoff = timeToComplete / 6;

          var availableCourses: RaceCourseTypeEnum[] = [];
          availableCourses.push(RaceCourseTypeEnum.Flatland);
          availableCourses.push(RaceCourseTypeEnum.Mountain);
          availableCourses.push(RaceCourseTypeEnum.Water);
          var randomizedCourseList = this.getCourseTypeInRandomOrder(availableCourses);
          
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
            leg1.distance = (Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
            leg1.terrain = this.getRandomTerrain(leg1.courseType);
            raceLegs.push(leg1);
          }

          if (leg2Normalized > 0) {
            var leg2 = new RaceLeg();
            leg2.courseType = randomizedCourseList[1];            
            leg2.distance = (Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
            leg2.terrain = this.getRandomTerrain(leg2.courseType);
            raceLegs.push(leg2);
          }

          if (leg3Normalized > 0) {
            var leg3 = new RaceLeg();
            leg3.courseType = randomizedCourseList[2];
            leg3.distance = (Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg3Normalized / timeToComplete));
            leg3.terrain = this.getRandomTerrain(leg3.courseType);
            raceLegs.push(leg3);
          }
          console.log(raceLegs);
        }
        

        var totalDistance = 0;

        raceLegs.forEach(leg => {
          totalDistance += leg.distance;
        });

        raceLegs.forEach(leg => {
          leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
        });

        this.globalVar.circuitRaces.push(new Race(raceLegs, circuitRank, true, raceIndex, totalDistance, timeToComplete, this.GenerateCircuitRaceRewards(circuitRank)));

        raceIndex += 1;
      }

      var charCode = circuitRank.charCodeAt(0);
      circuitRank = String.fromCharCode(--charCode);
    }
  }

  getCourseTypeInRandomOrder(courseList: RaceCourseTypeEnum[])
  {
    var randomizedList: RaceCourseTypeEnum[] = [];
    var length = courseList.length;
    for (var i = 0; i < length; i++)
    {
      var rng = this.utilityService.getRandomInteger(1, courseList.length);      
      randomizedList.push(courseList[rng-1]);
      courseList = courseList.filter(item => item !== courseList[rng-1]);
    }
   
    return randomizedList;
  }

  getRandomTerrain(raceCourseType: RaceCourseTypeEnum) {
    var availableTerrainsList: TerrainTypeEnum[] = [];

    if (raceCourseType === RaceCourseTypeEnum.Flatland)
    {
        availableTerrainsList.push(TerrainTypeEnum.Sunny);
        availableTerrainsList.push(TerrainTypeEnum.Rainy);
        availableTerrainsList.push(TerrainTypeEnum.Stormy);
        availableTerrainsList.push(TerrainTypeEnum.Torrid); 
        availableTerrainsList.push(TerrainTypeEnum.Snow);                       
    }
    else if (raceCourseType === RaceCourseTypeEnum.Mountain)
    {
        availableTerrainsList.push(TerrainTypeEnum.Sunny);
        availableTerrainsList.push(TerrainTypeEnum.Rainy);
        availableTerrainsList.push(TerrainTypeEnum.Stormy);
        availableTerrainsList.push(TerrainTypeEnum.Torrid); 
        availableTerrainsList.push(TerrainTypeEnum.Snow);                               
    } 
    else if (raceCourseType === RaceCourseTypeEnum.Water)
    {
        availableTerrainsList.push(TerrainTypeEnum.Sunny);
        availableTerrainsList.push(TerrainTypeEnum.Maelstrom);
        availableTerrainsList.push(TerrainTypeEnum.Stormy);
        availableTerrainsList.push(TerrainTypeEnum.Snow);                       
    }

    var rng = this.utilityService.getRandomInteger(1, availableTerrainsList.length);
    return new Terrain(availableTerrainsList[rng-1]);
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

    rewards.push(new ResourceValue("Money", Math.round(baseMoney * (moneyFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));
    return rewards;
  }

  GenerateMonoRaceRewards(): ResourceValue[] {
    var rewards: ResourceValue[] = [];
    rewards.push(new ResourceValue("Facility Level", 1));
    return rewards;
  }

  GenerateLocalRaces(): void {
    this.GenerateMonoRaces();
  }

  GenerateMonoRaces(): void {
    var raceIndex = 1;
    var timeToComplete = 90;

    var baseMeters = 140;
    var factor = 1.175;

    var maxRandomFactor = 1.1;
    var minRandomFactor = 0.9;
    var circuitRank = "Y";

    for (var i = 0; i < 25; i++) //Circuit rank Z-A
    {
      var raceLegs: RaceLeg[] = [];

      var leg = new RaceLeg();
      if (i === 1)
        leg.courseType = RaceCourseTypeEnum.Flatland;
      else
        leg.courseType = this.utilityService.getRandomRaceCourseType();
      leg.terrain = new Terrain(this.utilityService.getRandomTerrain());
      leg.distance = Math.round(baseMeters * (factor ** i) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
      raceLegs.push(leg);

      var totalDistance = leg.distance;

      raceLegs.forEach(leg => {
        leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
      });

      this.globalVar.localRaces.push(new Race(raceLegs, circuitRank, false, raceIndex, totalDistance, timeToComplete, this.GenerateMonoRaceRewards(), LocalRaceTypeEnum.Mono));

      raceIndex += 1;

      var charCode = circuitRank.charCodeAt(0);
      circuitRank = String.fromCharCode(--charCode);
    }
  }

  GenerateRaceLegPaths(leg: RaceLeg, totalDistance: number): RacePath[] {
    var paths: RacePath[] = [];
    var totalLegLengthRemaining = leg.distance;
    var pathLength = totalDistance / 20;
    var totalRoutes = Math.round(totalLegLengthRemaining / pathLength);
    var lastRouteSpecial = false;

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

    var diminishingReturnsThreshold = animal.currentStats.diminishingReturnsDefaultStatThreshold;
    var facilityLevelModifier = this.globalVar.modifiers.find(item => item.text === "facilityLevelModifier");
    var facilityLevel = this.globalVar.resources.find(item => item.name === "Facility Level");
    if (facilityLevelModifier !== undefined && facilityLevel !== undefined)
      diminishingReturnsThreshold += facilityLevel.amount * facilityLevelModifier.value;

    //do the calculations      
    animal.currentStats.maxSpeedMs = animal.currentStats.calculateMaxSpeed(totalMaxSpeedModifier * breedLevelStatModifierValue, diminishingReturnsThreshold);
    animal.currentStats.accelerationMs = animal.currentStats.calculateTrueAcceleration(totalAccelerationModifier * breedLevelStatModifierValue, diminishingReturnsThreshold);
    animal.currentStats.stamina = animal.currentStats.calculateStamina(totalStaminaModifier * breedLevelStatModifierValue, diminishingReturnsThreshold);
    animal.currentStats.powerMs = animal.currentStats.calculateTruePower(totalPowerModifier * breedLevelStatModifierValue, diminishingReturnsThreshold);
    animal.currentStats.focusMs = animal.currentStats.calculateTrueFocus(totalFocusModifier * breedLevelStatModifierValue, diminishingReturnsThreshold);
    animal.currentStats.adaptabilityMs = animal.currentStats.calculateTrueAdaptability(totalAdaptabilityModifier * breedLevelStatModifierValue, diminishingReturnsThreshold);
    animal.currentStats.burstChance = animal.currentStats.calculateBurstChance();
    animal.currentStats.burstDistance = animal.currentStats.calculateBurstDistance();
  }

  IncreaseAnimalBreedGauge(animal: Animal, amount: number) {
    animal.breedGaugeXp += amount;

    if (animal.breedGaugeXp >= animal.breedGaugeMax) {
      animal.breedGaugeXp = animal.breedGaugeMax;

      if (animal.autoBreedActive)
        this.BreedAnimal(animal);
    }
  }

  BreedAnimal(animal: Animal) {
    if (animal.breedGaugeXp < animal.breedGaugeMax)
      return;

    animal.breedLevel += 1;
    animal.breedGaugeXp = 0;
    //increase max total

    var handlers = this.globalVar.resources.find(item => item.name === "Animal Handler");
    var handlerModifier = this.globalVar.modifiers.find(item => item.text === "animalHandlerModifier");
    if (handlers !== null && handlers !== undefined && handlerModifier !== undefined && handlerModifier != null && handlers.amount > 0) {
      var statRetainPercent = handlers.amount * handlerModifier.value;
      var retainedTopSpeed = Math.round((animal.currentStats.topSpeed - animal.baseStats.topSpeed) * statRetainPercent);
      var retainedAcceleration = Math.round((animal.currentStats.acceleration - animal.baseStats.acceleration) * statRetainPercent);
      var retainedEndurance = Math.round((animal.currentStats.endurance - animal.baseStats.endurance) * statRetainPercent);
      var retainedPower = Math.round((animal.currentStats.power - animal.baseStats.power) * statRetainPercent);
      var retainedFocus = Math.round((animal.currentStats.focus - animal.baseStats.focus) * statRetainPercent);
      var retainedAdaptability = Math.round((animal.currentStats.adaptability - animal.baseStats.adaptability) * statRetainPercent);

      animal.currentStats = new AnimalStats(animal.baseStats.topSpeed + retainedTopSpeed,
        animal.baseStats.acceleration + retainedAcceleration, animal.baseStats.endurance + retainedEndurance,
        animal.baseStats.power + retainedPower, animal.baseStats.focus + retainedFocus,
        animal.baseStats.adaptability + retainedAdaptability);
    }
    else {
      animal.currentStats = new AnimalStats(animal.baseStats.topSpeed, animal.baseStats.acceleration, animal.baseStats.endurance,
        animal.baseStats.power, animal.baseStats.focus, animal.baseStats.adaptability);
    }
    this.calculateAnimalRacingStats(animal);
  }

  InitializeResources() {
    this.globalVar.resources.push(this.initializeService.initializeResource("Money", 500));
  }

  InitializeSettings() {
    this.globalVar.settings.set("skipDrawRace", false);
  }

  InitializeUnlockables() {
    this.globalVar.unlockables.set("monoRace", false);
    this.globalVar.unlockables.set("duoRace", false);
    this.globalVar.unlockables.set("rainbowRace", false);
    this.globalVar.unlockables.set("barnRow2", false);
    this.globalVar.unlockables.set("barnRow3", false);
    this.globalVar.unlockables.set("attractionSpecialization", false);
    this.globalVar.unlockables.set("researchFacilitySpecialization", false);
  }

  getMoneyResourceValue(amount: number) {
    return new ResourceValue("Money", amount);
  }

  getMedalResourceValue(amount: number) {
    return new ResourceValue("Medals", amount);
  }

  devModeInitialize(circuitRankNumeric: number) {
    var money = this.globalVar.resources.find(item => item.name === "Money");
    if (money !== undefined)
      money.amount = 50000;
    this.globalVar.resources.push(this.initializeService.initializeResource("Medals", 150));
    
    for (var i = 1; i <= circuitRankNumeric; i++)
    {
      var rank = this.utilityService.getCircuitRankFromNumericValue(i);
      this.globalVar.circuitRank = rank;
      this.checkCircuitRankRewards();
    }
  }
}
