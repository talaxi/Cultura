import { Injectable } from '@angular/core';
import { GlobalVariables } from '../models/global/global-variables.model';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalStats } from '../models/animals/animal-stats.model';
import { Animal, Caribou, Cheetah, Dolphin, Fox, Gecko, Goat, Hare, Horse, Monkey, Octopus, Penguin, Salamander, Shark } from '../models/animals/animal.model';
import { RaceCourseTypeEnum } from '../models/race-course-type-enum.model';
import { TrainingOptionsEnum } from '../models/training-options-enum.model';
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
import { EquipmentEnum } from '../models/equipment-enum.model';
import { ThemeService } from '../theme/theme.service';
import { Incubator } from '../models/incubator.model';
import { AnimalStatEnum } from '../models/animal-stat-enum.model';
import { Settings } from '../models/utility/settings.model';
import { Unlockables } from '../models/utility/unlockables.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  globalVar = new GlobalVariables();

  constructor(private utilityService: UtilityService, private initializeService: InitializeService, private themeService: ThemeService) { }

  initializeGlobalVariables(): void {
    //this.themeService.setNightTheme();

    this.globalVar.animals = [];
    this.globalVar.trainingOptions = [];
    this.globalVar.circuitRaces = [];
    this.globalVar.localRaces = [];
    this.globalVar.resources = [];
    this.globalVar.modifiers = [];
    this.globalVar.animalDecks = [];
    this.globalVar.barns = [];
    this.globalVar.settings = new Settings();
    this.globalVar.unlockables = new Unlockables();
    this.globalVar.incubator = new Incubator();
    this.globalVar.tutorialCompleted = false;
    this.globalVar.currentTutorialId = 1;
    this.globalVar.nationalRaceCountdown = 0;
    this.globalVar.freeRaceCounter = 0;
    this.globalVar.freeRaceTimePeriodCounter = 0;    
    
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
    //this.GenerateCircuitRaces();
    this.GenerateCircuitRacesForRank(this.globalVar.circuitRank);
    this.checkCircuitRankRewards();

    //Initialize local race information
    this.globalVar.monoRank = "Z";
    this.globalVar.duoRank = "Z";
    this.globalVar.rainbowRank = "Z";
    this.GenerateLocalRaces();

    //Initialize resources
    this.InitializeResources();

    //Initialize settings
    this.InitializeSettings();

    //Initialize unlockables
    this.InitializeUnlockables();

    //console.log(this.globalVar);
  }

  InitializeModifiers(): void {
    this.globalVar.modifiers.push(new StringNumberPair(.2, "staminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.9, "exhaustionStatLossModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "trainingBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "circuitBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(1, "localBreedGaugeIncrease"));

    this.globalVar.modifiers.push(new StringNumberPair(.02, "breedLevelStatModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(5, "breedGaugeMaxIncreaseModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "facilityLevelModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.02, "animalHandlerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.01, "stopwatchModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.1, "racerMapsModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "nationalRacesToMedalModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(5, "internationalRacesToMedalModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.75, "moneyMarkPaceModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.25, "moneyMarkRewardModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(.05, "breedingGroundsSpecializationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(60, "attractionTimeToCollectModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "attractionAmountModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.05, "researchCenterIncrementsModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.45, "researchCenterTrainingAnimalModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.25, "researchCenterStudyingAnimalModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.75, "researchCenterMaxStatGainModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(3, "headbandEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1, "quickSnackEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.5, "blindersEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.9, "pendantEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.1, "redBatonEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.1, "blueBatonEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.1, "orangeBatonEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.1, "greenBatonEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.1, "yellowBatonEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.1, "violetBatonEquipmentModifier"));

    //below in seconds
    this.globalVar.modifiers.push(new StringNumberPair((2 * 60 * 60), "smallBarnTrainingTimeModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((4 * 60 * 60), "mediumBarnTrainingTimeModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((8 * 60 * 60), "largeBarnTrainingTimeModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(10, "freeRacesPerTimePeriodModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((15 * 60), "freeRacesTimePeriodModifier"));

    //ability modifiers
    this.globalVar.modifiers.push(new StringNumberPair(1.5, "feedingFrenzyPositiveModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.9, "feedingFrenzyNegativeModifier"));

    var baseMaxSpeedModifier = .3;
    var baseAccelerationModifier = .1;
    var baseStaminaModifier = 7.5;
    var basePowerModifier = .1;
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

    //TODO: don't forget the other animals
  }

  InitializeAnimals(): void {
    //Initialize animals
    var horse = new Horse();
    horse.name = "Horse";
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

    var octopus = new Octopus();
    octopus.name = "Octopus";
    this.calculateAnimalRacingStats(octopus);

    var penguin = new Penguin();
    penguin.name = "Penguin";
    this.calculateAnimalRacingStats(penguin);

    var caribou = new Caribou();
    caribou.name = "Caribou";
    this.calculateAnimalRacingStats(caribou);

    var salamander = new Salamander();
    salamander.name = "Salamander";
    this.calculateAnimalRacingStats(salamander);

    var fox = new Fox();
    fox.name = "Fox";
    this.calculateAnimalRacingStats(fox);

    this.globalVar.animals.push(horse);
    this.globalVar.animals.push(cheetah);
    this.globalVar.animals.push(hare);
    this.globalVar.animals.push(goat);
    this.globalVar.animals.push(monkey);
    this.globalVar.animals.push(gecko);
    this.globalVar.animals.push(dolphin);
    this.globalVar.animals.push(shark);
    this.globalVar.animals.push(octopus);
    this.globalVar.animals.push(penguin);
    this.globalVar.animals.push(caribou);
    this.globalVar.animals.push(salamander);
    this.globalVar.animals.push(fox);
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
    var baseAnimalPrice = 3000;

    var cheetah = new ShopItem();
    cheetah.name = "Cheetah";
    cheetah.shortDescription = "The cheetah is a flat land racing animal that prioritizes quickness over stamina.";
    cheetah.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    cheetah.canHaveMultiples = false;
    cheetah.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(cheetah);

    var hare = new ShopItem();
    hare.name = "Hare";
    hare.shortDescription = "Hare TODO";
    hare.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    hare.canHaveMultiples = false;
    hare.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(hare);

    var goat = new ShopItem();
    goat.name = "Goat";
    goat.shortDescription = "The goat is a mountain climbing animal that can nimbly travel terrain.";
    goat.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    goat.canHaveMultiples = false;
    goat.type = ShopItemTypeEnum.Animal;
    goat.isAvailable = false;
    animalShopItems.push(goat);

    var gecko = new ShopItem();
    gecko.name = "Gecko";
    gecko.shortDescription = "Gecko TODO";
    gecko.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    gecko.canHaveMultiples = false;
    gecko.type = ShopItemTypeEnum.Animal;
    gecko.isAvailable = false;
    animalShopItems.push(gecko);

    var shark = new ShopItem();
    shark.name = "Shark";
    shark.shortDescription = "Shark TODO";
    shark.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    shark.canHaveMultiples = false;
    shark.type = ShopItemTypeEnum.Animal;
    shark.isAvailable = false;
    animalShopItems.push(shark);

    var octopus = new ShopItem();
    octopus.name = "Octopus";
    octopus.shortDescription = "Octopus TODO";
    octopus.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    octopus.canHaveMultiples = false;
    octopus.type = ShopItemTypeEnum.Animal;
    octopus.isAvailable = false;
    animalShopItems.push(octopus);

    var caribou = new ShopItem();
    caribou.name = "Caribou";
    caribou.shortDescription = "Caribou TODO";
    caribou.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    caribou.canHaveMultiples = false;
    caribou.type = ShopItemTypeEnum.Animal;
    caribou.isAvailable = false;
    animalShopItems.push(caribou);

    var fox = new ShopItem();
    fox.name = "Fox";
    fox.shortDescription = "Fox TODO";
    fox.purchasePrice.push(new ResourceValue("Coins", baseAnimalPrice));
    fox.canHaveMultiples = false;
    fox.type = ShopItemTypeEnum.Animal;
    fox.isAvailable = false;
    animalShopItems.push(fox);

    animalShopSection.name = "Animals";
    animalShopSection.itemList = animalShopItems;
    this.globalVar.shop.push(animalShopSection);

    var foodShopSection = new ShopSection();
    var foodShopItems: ShopItem[] = [];
    var baseFoodPrice = 50;

    var apple = new ShopItem();
    apple.name = "Apple";
    apple.shortDescription = "+1 Acceleration to a single animal";
    apple.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    apple.canHaveMultiples = true;
    apple.type = ShopItemTypeEnum.Food;
    apple.infiniteAmount = true;
    foodShopItems.push(apple);

    var banana = new ShopItem();
    banana.name = "Banana";
    banana.shortDescription = "+1 Top Speed to a single animal";
    banana.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    banana.canHaveMultiples = true;
    banana.type = ShopItemTypeEnum.Food;
    banana.infiniteAmount = true;
    foodShopItems.push(banana);

    var strawberry = new ShopItem();
    strawberry.name = "Strawberry";
    strawberry.shortDescription = "+1 Endurance to a single animal";
    strawberry.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    strawberry.canHaveMultiples = true;
    strawberry.type = ShopItemTypeEnum.Food;
    strawberry.infiniteAmount = true;
    foodShopItems.push(strawberry);

    var carrot = new ShopItem();
    carrot.name = "Carrot";
    carrot.shortDescription = "+1 Power to a single animal";
    carrot.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    carrot.canHaveMultiples = true;
    carrot.type = ShopItemTypeEnum.Food;
    carrot.infiniteAmount = true;
    foodShopItems.push(carrot);

    var turnip = new ShopItem();
    turnip.name = "Turnip";
    turnip.shortDescription = "+1 Focus to a single animal";
    turnip.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    turnip.canHaveMultiples = true;
    turnip.type = ShopItemTypeEnum.Food;
    turnip.infiniteAmount = true;
    foodShopItems.push(turnip);

    var orange = new ShopItem();
    orange.name = "Orange";
    orange.shortDescription = "+1 Adaptability to a single animal";
    orange.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
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
      purchasableTraining.purchasePrice.push(new ResourceValue("Coins", item.purchasePrice));
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
          purchasableAbility.purchasePrice.push(new ResourceValue("Coins", ability.purchasePrice));
          purchasableAbility.canHaveMultiples = false;
          purchasableAbility.type = ShopItemTypeEnum.Ability;
          purchasableAbility.additionalIdentifier = ability.name;
          purchasableAbility.isAvailable = animal.isAvailable;
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
    stopwatch.quantityMultiplier = 2.5;
    stopwatch.totalShopQuantity = 2;
    stopwatch.canHaveMultiples = true;
    stopwatch.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(stopwatch);

    var animalHandler = new ShopItem();
    animalHandler.name = "Animal Handler";
    animalHandler.shortDescription = "Retain 2% of trained stats after breeding";
    animalHandler.purchasePrice.push(this.getCoinsResourceValue(2000));
    animalHandler.quantityMultiplier = 2;
    animalHandler.totalShopQuantity = 20;
    animalHandler.canHaveMultiples = true;
    animalHandler.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(animalHandler);

    var raceMaps = new ShopItem();
    raceMaps.name = "Course Maps";
    raceMaps.shortDescription = "Increase your chance to burst during special routes by 10%";
    raceMaps.purchasePrice.push(this.getMedalResourceValue(2));
    raceMaps.quantityMultiplier = 2;
    raceMaps.totalShopQuantity = 5;
    raceMaps.canHaveMultiples = true;
    raceMaps.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(raceMaps);

    var stockbreeder = new ShopItem();
    stockbreeder.name = "Stockbreeder";
    stockbreeder.shortDescription = "Add option to auto breed when Breed XP is full";
    stockbreeder.purchasePrice.push(this.getCoinsResourceValue(1000));
    stockbreeder.canHaveMultiples = false;
    stockbreeder.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(stockbreeder);

    /*var jockey = new ShopItem();
    jockey.name = "Jockey";
    jockey.shortDescription = "Add option for a deck to automatically run local races";
    jockey.purchasePrice.push(this.getCoinsResourceValue(1000));
    jockey.canHaveMultiples = false;
    jockey.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(jockey);*/

    var scouts = new ShopItem();
    scouts.name = "Scouts";
    scouts.shortDescription = "You can choose the order of race legs for each animal deck";
    scouts.purchasePrice.push(this.getCoinsResourceValue(10000));
    scouts.canHaveMultiples = false;
    scouts.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(scouts);

    var moneyMark = new ShopItem();
    moneyMark.name = "Money Mark";
    moneyMark.shortDescription = "Add new indicator to race, beat its time to gain increased coins";
    moneyMark.purchasePrice.push(this.getCoinsResourceValue(1000));
    moneyMark.canHaveMultiples = false;
    moneyMark.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(moneyMark);

    var nationalRace = new ShopItem();
    nationalRace.name = "National Races";
    nationalRace.shortDescription = "Gain 1 medal for every 10 free races you complete";
    nationalRace.purchasePrice.push(this.getCoinsResourceValue(10000));
    nationalRace.canHaveMultiples = false;
    nationalRace.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(nationalRace);

    var internationalRace = new ShopItem();
    internationalRace.name = "International Races";
    internationalRace.shortDescription = "Gain 1 medal for every 5 free races you complete";
    internationalRace.purchasePrice.push(this.getCoinsResourceValue(50000));
    internationalRace.canHaveMultiples = false;
    internationalRace.isAvailable = false;
    internationalRace.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(internationalRace);

    specialtyShopSection.name = "Specialty";
    specialtyShopSection.itemList = specialtyShopItems;
    this.globalVar.shop.push(specialtyShopSection);

    var equipmentShopSection = new ShopSection();
    var equipmentShopItems: ShopItem[] = [];

    var headband = new ShopItem();
    headband.name = this.getEquipmentName(EquipmentEnum.headband);
    headband.shortDescription = this.getEquipmentDescription(headband.name);
    headband.purchasePrice.push(this.getCoinsResourceValue(1000));
    headband.canHaveMultiples = true;
    headband.infiniteAmount = true;
    headband.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(headband);

    var pendant = new ShopItem();
    pendant.name = this.getEquipmentName(EquipmentEnum.pendant);
    pendant.shortDescription = this.getEquipmentDescription(pendant.name);
    pendant.purchasePrice.push(this.getCoinsResourceValue(1000));
    pendant.canHaveMultiples = true;
    pendant.infiniteAmount = true;
    pendant.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(pendant);

    var blinders = new ShopItem();
    blinders.name = this.getEquipmentName(EquipmentEnum.blinders);
    blinders.shortDescription = this.getEquipmentDescription(blinders.name);
    blinders.purchasePrice.push(this.getCoinsResourceValue(1000));
    blinders.canHaveMultiples = true;
    blinders.infiniteAmount = true;
    blinders.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(blinders);

    var quickSnack = new ShopItem();
    quickSnack.name = this.getEquipmentName(EquipmentEnum.quickSnack);
    quickSnack.shortDescription = this.getEquipmentDescription(quickSnack.name);
    quickSnack.purchasePrice.push(this.getCoinsResourceValue(1000));
    quickSnack.canHaveMultiples = true;
    quickSnack.infiniteAmount = true;
    quickSnack.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(quickSnack);

    //tier 2
    var redBaton = new ShopItem();
    redBaton.name = this.getEquipmentName(EquipmentEnum.redBaton);
    redBaton.shortDescription = this.getEquipmentDescription(redBaton.name);
    redBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    redBaton.canHaveMultiples = true;
    redBaton.infiniteAmount = true;
    redBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(redBaton);

    var blueBaton = new ShopItem();
    blueBaton.name = this.getEquipmentName(EquipmentEnum.blueBaton);
    blueBaton.shortDescription = this.getEquipmentDescription(blueBaton.name);
    blueBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    blueBaton.canHaveMultiples = true;
    blueBaton.infiniteAmount = true;
    blueBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(blueBaton);

    var violetBaton = new ShopItem();
    violetBaton.name = this.getEquipmentName(EquipmentEnum.violetBaton);
    violetBaton.shortDescription = this.getEquipmentDescription(violetBaton.name);
    violetBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    violetBaton.canHaveMultiples = true;
    violetBaton.infiniteAmount = true;
    violetBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(violetBaton);

    var orangeBaton = new ShopItem();
    orangeBaton.name = this.getEquipmentName(EquipmentEnum.orangeBaton);
    orangeBaton.shortDescription = this.getEquipmentDescription(orangeBaton.name);
    orangeBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    orangeBaton.canHaveMultiples = true;
    orangeBaton.infiniteAmount = true;
    orangeBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(orangeBaton);

    var greenBaton = new ShopItem();
    greenBaton.name = this.getEquipmentName(EquipmentEnum.greenBaton);
    greenBaton.shortDescription = this.getEquipmentDescription(greenBaton.name);
    greenBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    greenBaton.canHaveMultiples = true;
    greenBaton.infiniteAmount = true;
    greenBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(greenBaton);

    var yellowBaton = new ShopItem();
    yellowBaton.name = this.getEquipmentName(EquipmentEnum.yellowBaton);
    yellowBaton.shortDescription = this.getEquipmentDescription(yellowBaton.name);
    yellowBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    yellowBaton.canHaveMultiples = true;
    yellowBaton.infiniteAmount = true;
    yellowBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(yellowBaton);

    equipmentShopSection.name = "Equipment";
    equipmentShopSection.itemList = equipmentShopItems;
    this.globalVar.shop.push(equipmentShopSection);

  }

  getEquipmentName(equip: EquipmentEnum) {
    if (equip === EquipmentEnum.headband)
      return "Headband";
    if (equip === EquipmentEnum.pendant)
      return "Pendant";
    if (equip === EquipmentEnum.blinders)
      return "Blinders";
    if (equip === EquipmentEnum.quickSnack)
      return "Quick Snack";
    if (equip === EquipmentEnum.carrotOnAStick)
      return "Carrot on a Stick";
    if (equip === EquipmentEnum.redBaton)
      return "Red Baton";
    if (equip === EquipmentEnum.blueBaton)
      return "Blue Baton";
    if (equip === EquipmentEnum.violetBaton)
      return "Violet Baton";
    if (equip === EquipmentEnum.yellowBaton)
      return "Yellow Baton";
    if (equip === EquipmentEnum.greenBaton)
      return "Green Baton";
    if (equip === EquipmentEnum.orangeBaton)
      return "Orange Baton";

    return "";
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
    this.globalVar.trainingOptions.push(this.initializeService.initializeTraining(TrainingOptionsEnum.LateralVerticalDrill));
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

  IncreaseCircuitRank() {
    var currentCircuitRank = this.globalVar.circuitRank;

    var nextCircuitRank = currentCircuitRank.replace(/([A-Z])[^A-Z]*$/, function (a) {
      var c = a.charCodeAt(0);
      switch (c) {
        case 65: return String.fromCharCode(c) + 'Z';
        default: return String.fromCharCode(--c);
      }
    });

    this.globalVar.circuitRank = nextCircuitRank;
    var gainedRewardValue = this.checkCircuitRankRewards();
    this.GenerateCircuitRacesForRank(this.globalVar.circuitRank);

    return gainedRewardValue;
  }

  IncreaseLocalRaceRank(raceType: LocalRaceTypeEnum): void {
    var currentRank = "";
    if (raceType === LocalRaceTypeEnum.Mono)
      currentRank = this.globalVar.monoRank;
    if (raceType === LocalRaceTypeEnum.Duo)
      currentRank = this.globalVar.duoRank;
    if (raceType === LocalRaceTypeEnum.Rainbow)
      currentRank = this.globalVar.rainbowRank;

    var nextRank = currentRank.replace(/([A-Z])[^A-Z]*$/, function (a) {
      var c = a.charCodeAt(0);
      switch (c) {
        case 65: return String.fromCharCode(c) + 'Z';
        default: return String.fromCharCode(--c);
      }
    });

    if (raceType === LocalRaceTypeEnum.Mono) {
      this.globalVar.monoRank = nextRank;
      this.GenerateMonoRaces(this.globalVar.monoRank);
    }
    if (raceType === LocalRaceTypeEnum.Duo) {
      this.globalVar.duoRank = nextRank;
      this.GenerateDuoRaces(this.globalVar.duoRank);
    }
    if (raceType === LocalRaceTypeEnum.Rainbow) {
      this.globalVar.rainbowRank = nextRank;
      this.GenerateRainbowRaces(this.globalVar.rainbowRank);
    }
  }

  getRewardReceiveText(numericValue: number) {
    return "Reach circuit rank " + this.utilityService.getCircuitRankFromNumericValue(numericValue) + " to receive: \n";
  }

  //TODO: Make some sort of checkup that says if circuitrank is > 3 then make sure monkey is available?
  checkCircuitRankRewards() {
    var numericValue = this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank);
    var returnVal: [string, string] = ["", ""]; //name, description

    if (numericValue === 1)
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(2) + "Mono Races";

    if (numericValue === 2) {
      this.globalVar.unlockables.set("monoRace", true);
      returnVal = ["Mono Race", "A new race type has been unlocked." +
        " Take part in a Mono Race where you run an extended race as only one course type. Progressing through this race type " +
        "generates new interest in your facility, giving you a good reason to make upgrades. Gain Facility Level points that increase your diminishing returns max value."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(3) + "Monkey";
    }
    if (numericValue === 3) {
      var monkey = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey);
      if (monkey !== undefined && monkey !== null) {
        monkey.isAvailable = true;
        this.unlockAnimalAbilities(monkey);
        this.unlockOtherRaceCourseTypeAnimals(monkey.raceCourseType);

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

      returnVal = ["Monkey", "The Monkey is a powerful Mountain climbing animal capable of slowing its competitors."];

      var amount = 500;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(5) + amount + " Coins";
    }
    else if (numericValue === 5) {
      var amount = 500;
      var resource = this.globalVar.resources.find(item => item.name === "Coins");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Coins", amount));
      else
        resource.amount += amount;

      returnVal = [amount + " Coins", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(7) + "Barn Specializations";
    }
    else if (numericValue === 7) {
      this.globalVar.unlockables.set("barnSpecializations", true);

      returnVal = ["Barn Specializations", "As your training facility grows, so should your barns. At barn level 10, choose what direction you want your barn to progress in. Each option benefits your animals in different ways, so choose carefully."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(10) + "Dolphin";
    }
    else if (numericValue === 10) {
      var dolphin = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Dolphin);
      if (dolphin !== undefined && dolphin !== null) {
        dolphin.isAvailable = true;
        this.unlockAnimalAbilities(dolphin);
        this.unlockOtherRaceCourseTypeAnimals(dolphin.raceCourseType);

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

      returnVal = ["Dolphin", "The Monkey is a powerful Mountain climbing animal capable of slowing its competitors."];

      var amount = 5;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(12) + amount + " Apples";
    }
    else if (numericValue === 12) {
      var appleAmount = 5;
      var appleResource = this.globalVar.resources.find(item => item.name === "Apples");
      if (appleResource === null || appleResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Apples", appleAmount));
      else
        appleResource.amount += appleAmount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(15) + "Attraction Specialization";
    }
    else if (numericValue === 15) {
      this.globalVar.unlockables.set("attractionSpecialization", true);

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(18) + "Barn Row 2";
    }
    else if (numericValue === 18) {
      this.globalVar.unlockables.set("barnRow2", true);

      var renownAmount = 1;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(20) + renownAmount + " Renown";
    }
    else if (numericValue === 20) {
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
    else if (numericValue === 25) {
      this.globalVar.unlockables.set("researchCenterSpecialization", true);

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(27) + "Duo Races";
    }
    else if (numericValue === 27) {
      this.globalVar.unlockables.set("duoRace", true);

      var CoinsAmount = 5000;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(30) + CoinsAmount + " Coins";
    }
    else if (numericValue === 30) {
      var CoinsAmount = 5000;
      var resource = this.globalVar.resources.find(item => item.name === "Coins");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Coins", CoinsAmount));
      else
        resource.amount += CoinsAmount;

      var turnipAmount = 15;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(33) + turnipAmount + " Turnips";
    }
    else if (numericValue === 33) {
      var turnipAmount = 15;
      var resource = this.globalVar.resources.find(item => item.name === "Turnips");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Turnips", turnipAmount));
      else
        resource.amount += turnipAmount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(35) + "Penguin";
    }
    else if (numericValue === 35) {
      var penguin = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Penguin);
      if (penguin !== undefined && penguin !== null) {
        penguin.isAvailable = true;
        this.unlockAnimalAbilities(penguin);
        this.unlockOtherRaceCourseTypeAnimals(penguin.raceCourseType);

        var primaryAnimalDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
        if (primaryAnimalDeck !== null && primaryAnimalDeck !== undefined) {
          var typeFound = false;
          primaryAnimalDeck.selectedAnimals.forEach(item => {
            if (item.raceCourseType === penguin?.raceCourseType)
              typeFound = true;
          });

          if (!typeFound)
            primaryAnimalDeck.selectedAnimals.push(penguin);
        }
      }

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(38) + "5 Medals";
    }
    else if (numericValue === 38) {
      var medalsAmount = 5;
      var resource = this.globalVar.resources.find(item => item.name === "Medals");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Medals", medalsAmount));
      else
        resource.amount += medalsAmount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(40) + "Barn Row 3";
    }
    else if (numericValue === 40) {
      this.globalVar.unlockables.set("barnRow3", true);

      var amount = 20;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(43) + amount + " Carrots";
    }
    else if (numericValue === 43) {
      var amount = 20;
      var resource = this.globalVar.resources.find(item => item.name === "Carrots");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Carrots", amount));
      else
        resource.amount += amount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(45) + "Salamander";
    }
    else if (numericValue === 45) {
      var salamander = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Salamander);
      if (salamander !== undefined && salamander !== null) {
        salamander.isAvailable = true;
        this.unlockAnimalAbilities(salamander);
        this.unlockOtherRaceCourseTypeAnimals(salamander.raceCourseType);

        var primaryAnimalDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
        if (primaryAnimalDeck !== null && primaryAnimalDeck !== undefined) {
          var typeFound = false;
          primaryAnimalDeck.selectedAnimals.forEach(item => {
            if (item.raceCourseType === salamander?.raceCourseType)
              typeFound = true;
          });

          if (!typeFound)
            primaryAnimalDeck.selectedAnimals.push(salamander);
        }
      }

      var renownAmount = 1;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(47) + renownAmount + " Renown";
    }
    else if (numericValue === 47) {
      var renownAmount = 1;
      var renownResource = this.globalVar.resources.find(item => item.name === "Renown");
      if (renownResource === null || renownResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Renown", renownAmount));
      else
        renownResource.amount += renownAmount;

      var coinsAmount = 15000;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(50) + coinsAmount + " Coins";
    }
    else if (numericValue === 50) {
      var CoinsAmount = 15000;
      var resource = this.globalVar.resources.find(item => item.name === "Coins");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Coins", CoinsAmount));
      else
        resource.amount += CoinsAmount;

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(53) + "Rainbow Races";
    }
    else if (numericValue === 53) {
      this.globalVar.unlockables.set("rainbowRace", true);
      returnVal = ["Rainbow Race", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(1000) + "More to come in a future update";
    }

    return returnVal;
  }

  GenerateCircuitRacesForRank(circuitRank: string): void {
    this.globalVar.circuitRaces = [];
    var i = this.utilityService.getNumericValueOfCircuitRank(circuitRank);
    var raceIndex = 1;
    var timeToComplete = 60;
    var legLengthCutoff = timeToComplete / 4; //a leg cannot be any shorter than this as a percentage

    var baseMeters = 100;
    var factor = 1.12;
    var additiveValue = 75 * i;

    var maxRandomFactor = 1.1;
    var minRandomFactor = 0.9;

    var legMinimumDistance = 20; //as a percentage of 100
    var legMaximumDistance = 80; //as a percentage of 100

    var circuitRaces = 3;
    if (circuitRank === "Z")
      circuitRaces = 1;
    else if (circuitRank == "Y")
      circuitRaces = 2;
    for (var j = 0; j < circuitRaces; j++) {
      var raceLegs: RaceLeg[] = [];
      var seedValue = 'C' + i + j;

      if (i <= 2) //make these breakpoints configurable, figure out your time horizon on new races
      {
        additiveValue = 0;

        var leg = new RaceLeg();
        leg.courseType = RaceCourseTypeEnum.Flatland;
        if (i === 2) {
          if (j === 0)
            leg.terrain = new Terrain(TerrainTypeEnum.Sunny);
          else if (j === 1)
            leg.terrain = new Terrain(TerrainTypeEnum.Rainy);
        }
        else
          leg.terrain = new Terrain(TerrainTypeEnum.Sunny);

        leg.distance = Math.round((baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue));
        raceLegs.push(leg);
      }
      else if (i <= 9) {
        var additiveValue = 40 * i;
        var availableCourses: RaceCourseTypeEnum[] = [];
        availableCourses.push(RaceCourseTypeEnum.Flatland);
        availableCourses.push(RaceCourseTypeEnum.Mountain);
        var randomizedCourseList = this.getCourseTypeInRandomOrderSeeded(availableCourses, seedValue + "cl1");

        var leg1Distance = this.utilityService.getRandomSeededNumber(legMinimumDistance, legMaximumDistance, seedValue + "l1d");
        var leg2Distance = this.utilityService.getRandomSeededNumber(legMinimumDistance, legMaximumDistance, seedValue + "l2d");
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
          leg1.distance = ((Math.round(baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue + "l1r")) * (leg1Normalized / timeToComplete));
          leg1.terrain = this.getRandomTerrain(leg1.courseType, seedValue + "lt1d");
          raceLegs.push(leg1);
        }

        if (leg2Normalized > 0) {
          var leg2 = new RaceLeg();
          leg2.courseType = randomizedCourseList[1];
          leg2.distance = ((Math.round(baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue + "l2r")) * (leg2Normalized / timeToComplete));
          leg2.terrain = this.getRandomTerrain(leg2.courseType, seedValue + "lt2d");
          raceLegs.push(leg2);
        }
      }
      else {
        legLengthCutoff = timeToComplete / 6;

        var availableCourses: RaceCourseTypeEnum[] = [];
        if (i <= 53) {
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
        var randomizedCourseList = this.getCourseTypeInRandomOrderSeeded(availableCourses, seedValue + "courses1");

        var leg1Distance = this.utilityService.getRandomSeededNumber(legMinimumDistance, legMaximumDistance, seedValue + "l1d");
        var leg2Distance = this.utilityService.getRandomSeededNumber(legMinimumDistance, legMaximumDistance, seedValue + "l2d");
        var leg3Distance = this.utilityService.getRandomSeededNumber(legMinimumDistance, legMaximumDistance, seedValue + "l3d");
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
          leg1.distance = ((Math.round(baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue + "l1r")) * (leg1Normalized / timeToComplete));
          leg1.terrain = this.getRandomTerrain(leg1.courseType, seedValue + "lt1d");
          raceLegs.push(leg1);
        }

        if (leg2Normalized > 0) {
          var leg2 = new RaceLeg();
          leg2.courseType = randomizedCourseList[1];
          leg2.distance = ((Math.round(baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue + "l2r")) * (leg2Normalized / timeToComplete));
          leg2.terrain = this.getRandomTerrain(leg2.courseType, seedValue + "lt2d");
          raceLegs.push(leg2);
        }

        if (leg3Normalized > 0) {
          var leg3 = new RaceLeg();
          leg3.courseType = randomizedCourseList[2];
          leg3.distance = ((Math.round(baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue + "l3r")) * (leg3Normalized / timeToComplete));
          leg3.terrain = this.getRandomTerrain(leg3.courseType, seedValue + "lt3d");
          raceLegs.push(leg3);
        }
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
  }

  reorganizeLegsByDeckOrder(raceLegs: RaceLeg[], selectedDeck: AnimalDeck) {
    if (!selectedDeck.isCourseOrderActive)
    return raceLegs;

    return raceLegs.sort((a, b) => selectedDeck.courseTypeOrder.indexOf(a.courseType) - selectedDeck.courseTypeOrder.indexOf(b.courseType));
  }

  getCourseTypeInRandomOrder(courseList: RaceCourseTypeEnum[]) {
    var randomizedList: RaceCourseTypeEnum[] = [];
    var length = courseList.length;
    for (var i = 0; i < length; i++) {
      var rng = this.utilityService.getRandomInteger(1, courseList.length);
      randomizedList.push(courseList[rng - 1]);
      courseList = courseList.filter(item => item !== courseList[rng - 1]);
    }

    return randomizedList;
  }

  getCourseTypeInRandomOrderSeeded(courseList: RaceCourseTypeEnum[], seedValue: string = "seeded") {
    var randomizedList: RaceCourseTypeEnum[] = [];
    var length = courseList.length;
    for (var i = 0; i < length; i++) {
      var rng = this.utilityService.getRandomSeededInteger(1, courseList.length, seedValue);
      randomizedList.push(courseList[rng - 1]);
      courseList = courseList.filter(item => item !== courseList[rng - 1]);
    }

    return randomizedList;
  }

  getRandomTerrain(raceCourseType: RaceCourseTypeEnum, seed?: string) {
    var availableTerrainsList: TerrainTypeEnum[] = [];

    if (raceCourseType === RaceCourseTypeEnum.Flatland) {
      availableTerrainsList.push(TerrainTypeEnum.Sunny);
      availableTerrainsList.push(TerrainTypeEnum.Rainy);
      availableTerrainsList.push(TerrainTypeEnum.Stormy);
      availableTerrainsList.push(TerrainTypeEnum.Torrid);
      availableTerrainsList.push(TerrainTypeEnum.Snowfall);
    }
    else if (raceCourseType === RaceCourseTypeEnum.Mountain) {
      availableTerrainsList.push(TerrainTypeEnum.Sunny);
      availableTerrainsList.push(TerrainTypeEnum.Rainy);
      availableTerrainsList.push(TerrainTypeEnum.Stormy);
      availableTerrainsList.push(TerrainTypeEnum.Torrid);
      availableTerrainsList.push(TerrainTypeEnum.Snowfall);
    }
    else if (raceCourseType === RaceCourseTypeEnum.Ocean) {
      availableTerrainsList.push(TerrainTypeEnum.Sunny);
      availableTerrainsList.push(TerrainTypeEnum.Maelstrom);
      availableTerrainsList.push(TerrainTypeEnum.Stormy);
      availableTerrainsList.push(TerrainTypeEnum.Snowfall);
    }
    else if (raceCourseType === RaceCourseTypeEnum.Tundra) {
      availableTerrainsList.push(TerrainTypeEnum.Sunny);
      availableTerrainsList.push(TerrainTypeEnum.Hailstorm);
      availableTerrainsList.push(TerrainTypeEnum.Stormy);
      availableTerrainsList.push(TerrainTypeEnum.Snowfall);
    }
    else if (raceCourseType === RaceCourseTypeEnum.Volcanic) {
      availableTerrainsList.push(TerrainTypeEnum.Sunny);
      availableTerrainsList.push(TerrainTypeEnum.Ashfall);
      availableTerrainsList.push(TerrainTypeEnum.Stormy);
      availableTerrainsList.push(TerrainTypeEnum.Torrid);
    }

    var rng = 0;
    if (seed !== null && seed !== undefined)
      rng = this.utilityService.getRandomSeededInteger(1, availableTerrainsList.length, seed);
    else
      rng = this.utilityService.getRandomInteger(1, availableTerrainsList.length);

    return new Terrain(availableTerrainsList[rng - 1]);
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
    var CoinsFactor = 1.01;
    var baseCoins = 50;

    var baseRenown = 1.03;
    var renownFactor = 1.03;

    var rewards: ResourceValue[] = [];

    var currentRenownResource = this.globalVar.resources.find(item => item.name === "Renown");
    var currentRenown = 1;

    if (currentRenownResource !== undefined)
      currentRenown = currentRenownResource.amount;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));
    return rewards;
  }

  GenerateLocalRaceRewards(circuitRank: string): ResourceValue[] {
    var numericRank = this.GetCircuitRankValue(circuitRank);
    var CoinsFactor = 1.005;
    var baseCoins = 10;

    var baseRenown = 1.01;
    var renownFactor = 1.03;

    var rewards: ResourceValue[] = [];

    var currentRenownResource = this.globalVar.resources.find(item => item.name === "Renown");
    var currentRenown = 1;

    if (currentRenownResource !== undefined)
      currentRenown = currentRenownResource.amount;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));

    var internationalRaceItem = this.globalVar.resources.find(item => item.name === "International Races");
    var nationalRaceItem = this.globalVar.resources.find(item => item.name === "National Races");
    if (internationalRaceItem !== undefined && internationalRaceItem !== null && internationalRaceItem.amount > 0) {
      var internationalRaceCountNeeded = 5;
      var internationalRaceCountNeededModifier = this.globalVar.modifiers.find(item => item.text === "internationalRacesToMedalModifier");
      if (internationalRaceCountNeededModifier !== undefined && internationalRaceCountNeededModifier !== null)
        internationalRaceCountNeeded = internationalRaceCountNeededModifier.value;

      if (this.globalVar.nationalRaceCountdown >= internationalRaceCountNeeded) {
        rewards.push(new ResourceValue("Medals", 1));
        this.globalVar.nationalRaceCountdown = 0;
      }
    }
    else if (nationalRaceItem !== undefined && nationalRaceItem !== null && nationalRaceItem.amount > 0) {
      var nationalRaceCountNeeded = 10;
      var nationalRaceCountNeededModifier = this.globalVar.modifiers.find(item => item.text === "nationalRacesToMedalModifier");
      if (nationalRaceCountNeededModifier !== undefined && nationalRaceCountNeededModifier !== null)
        nationalRaceCountNeeded = nationalRaceCountNeededModifier.value;

      if (this.globalVar.nationalRaceCountdown >= nationalRaceCountNeeded) {
        rewards.push(new ResourceValue("Medals", 1));
        this.globalVar.nationalRaceCountdown = 0;
      }
    }

    return rewards;
  }

  GenerateMonoRaceRewards(monoRank: string): ResourceValue[] {
    var rewards: ResourceValue[] = [];
    rewards.push(new ResourceValue("Facility Level", 1));

    var numericRank = this.GetCircuitRankValue(monoRank);
    var CoinsFactor = 1.01;
    var baseCoins = 30;

    var baseRenown = 1.1;
    var renownFactor = 1.03;

    var currentRenownResource = this.globalVar.resources.find(item => item.name === "Renown");
    var currentRenown = 1;

    if (currentRenownResource !== undefined)
      currentRenown = currentRenownResource.amount;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));

    return rewards;
  }

  GenerateDuoRaceRewards(duoRank: string): ResourceValue[] {
    var rewards: ResourceValue[] = [];
    rewards.push(new ResourceValue("Research Level", 1));

    var numericRank = this.GetCircuitRankValue(duoRank);
    var CoinsFactor = 1.01;
    var baseCoins = 100;

    var baseRenown = 1.1;
    var renownFactor = 1.03;

    var currentRenownResource = this.globalVar.resources.find(item => item.name === "Renown");
    var currentRenown = 1;

    if (currentRenownResource !== undefined)
      currentRenown = currentRenownResource.amount;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));

    return rewards;
  }

  GenerateRainbowRaceRewards(): ResourceValue[] {
    var rewards: ResourceValue[] = [];
    rewards.push(new ResourceValue("Facility Level", 1));
    return rewards;
  }

  GenerateLocalRaces(): void {
    this.GenerateMonoRaces(this.globalVar.monoRank);
    this.GenerateDuoRaces(this.globalVar.duoRank);
    this.GenerateRainbowRaces(this.globalVar.rainbowRank);
  }

  GenerateMonoRaces(monoRank: string): void {
    var i = this.utilityService.getNumericValueOfCircuitRank(monoRank);
    this.globalVar.localRaces = this.globalVar.localRaces.filter(item => item.localRaceType !== LocalRaceTypeEnum.Mono);

    if (i >= this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank))
      return;

    var raceIndex = 1;
    var timeToComplete = 90;

    var baseMeters = 140;
    var factor = 1.14;
    var additiveValue = 75 * i;

    var maxRandomFactor = 1.1;
    var minRandomFactor = 0.9;

    var raceLegs: RaceLeg[] = [];

    var leg = new RaceLeg();
    if (i === 1)
      leg.courseType = RaceCourseTypeEnum.Flatland;
    else {
      var availableCourses: RaceCourseTypeEnum[] = [];
      if (i < 9) {
        availableCourses.push(RaceCourseTypeEnum.Flatland);
        availableCourses.push(RaceCourseTypeEnum.Mountain);
      }
      else {
        availableCourses.push(RaceCourseTypeEnum.Flatland);
        availableCourses.push(RaceCourseTypeEnum.Mountain);
        availableCourses.push(RaceCourseTypeEnum.Ocean);
      }

      if (this.globalVar.lastMonoRaceCourseType !== null && this.globalVar.lastMonoRaceCourseType !== undefined && i > 2)
        availableCourses = availableCourses.filter(item => item !== this.globalVar.lastMonoRaceCourseType);

      var randomizedCourseList = this.getCourseTypeInRandomOrderSeeded(availableCourses, 'monoseed' + monoRank + i);
      leg.courseType = randomizedCourseList[0];
    }
    leg.terrain = this.getRandomTerrain(leg.courseType, 'monoseed' + monoRank + i);
    leg.distance = Math.round((baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor));
    raceLegs.push(leg);

    var totalDistance = leg.distance;

    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
    });

    this.globalVar.localRaces.push(new Race(raceLegs, monoRank, false, raceIndex, totalDistance, timeToComplete, this.GenerateMonoRaceRewards(monoRank), LocalRaceTypeEnum.Mono));
    //console.log(this.globalVar.localRaces.filter(item => item.localRaceType === LocalRaceTypeEnum.Mono));
    raceIndex += 1;
  }

  GenerateDuoRaces(duoRank: string): void {
    var i = this.utilityService.getNumericValueOfCircuitRank(duoRank);
    this.globalVar.localRaces = this.globalVar.localRaces.filter(item => item.localRaceType !== LocalRaceTypeEnum.Duo);

    if (i >= this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank))
      return;

    var raceIndex = 1;
    var timeToComplete = 80;

    var baseMeters = 1500;
    var factor = 1.135;

    var maxRandomFactor = 1.2;
    var minRandomFactor = 0.8;
    var raceLegs: RaceLeg[] = [];

    var availableCourses: RaceCourseTypeEnum[] = [];
    if (i == 1) {
      availableCourses.push(RaceCourseTypeEnum.Mountain);
      availableCourses.push(RaceCourseTypeEnum.Flatland);
    }
    else if (i < 15) {
      availableCourses.push(RaceCourseTypeEnum.Flatland);
      availableCourses.push(RaceCourseTypeEnum.Mountain);
      availableCourses.push(RaceCourseTypeEnum.Ocean);      
    }
    else if (i < 20) {
      availableCourses.push(RaceCourseTypeEnum.Flatland);
      availableCourses.push(RaceCourseTypeEnum.Mountain);
      availableCourses.push(RaceCourseTypeEnum.Ocean); 
      availableCourses.push(RaceCourseTypeEnum.Tundra);
    }
    else {      
      availableCourses.push(RaceCourseTypeEnum.Flatland);
      availableCourses.push(RaceCourseTypeEnum.Mountain);
      availableCourses.push(RaceCourseTypeEnum.Ocean); 
      availableCourses.push(RaceCourseTypeEnum.Tundra);
      availableCourses.push(RaceCourseTypeEnum.Volcanic);
    }

    var randomizedCourseList = this.getCourseTypeInRandomOrderSeeded(availableCourses, 'duoseed' + duoRank + i);

    var randomFactor = this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor);
    var leg1 = new RaceLeg();
    leg1.courseType = randomizedCourseList[0];
    leg1.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) / 2));
    leg1.terrain = this.getRandomTerrain(leg1.courseType, 'duoseedl1' + duoRank + i);
    raceLegs.push(leg1);

    var leg2 = new RaceLeg();
    leg2.courseType = randomizedCourseList[1];
    leg2.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) / 2));
    leg2.terrain = this.getRandomTerrain(leg2.courseType, 'duoseedl2' + duoRank + i);
    raceLegs.push(leg2);

    var totalDistance = leg1.distance + leg2.distance;

    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
    });

    this.globalVar.localRaces.push(new Race(raceLegs, duoRank, false, raceIndex, totalDistance, timeToComplete, this.GenerateDuoRaceRewards(duoRank), LocalRaceTypeEnum.Duo));

    raceIndex += 1;
  }

  GenerateRainbowRaces(circuitRank: string): void {

  }

  GenerateRaceLegPaths(leg: RaceLeg, totalDistance: number): RacePath[] {
    var paths: RacePath[] = [];
    var totalLegLengthRemaining = leg.distance;
    var pathLength = totalDistance / 20;
    var totalRoutes = Math.round(totalLegLengthRemaining / pathLength);
    var lastRouteSpecial = false;
    var lastPathRoute = RaceDesignEnum.Regular;

    for (var i = 0; i < totalRoutes; i++) {
      var path = new RacePath();

      if (i === 0) {
        path.length = pathLength;
        if (leg.courseType === RaceCourseTypeEnum.Volcanic)
          path.routeDesign = RaceDesignEnum.FirstRegular;
        else
          path.routeDesign = RaceDesignEnum.Regular;
        path.setStumbleFields();
        paths.push(path);
        totalLegLengthRemaining -= path.length;
        lastPathRoute = path.routeDesign;
        continue;
      }

      if (i === totalRoutes - 1) {
        path.length = totalLegLengthRemaining;
        if (leg.courseType === RaceCourseTypeEnum.Volcanic)
          path.routeDesign = RaceDesignEnum.LastRegular;
        else
          path.routeDesign = RaceDesignEnum.Regular;
        path.setStumbleFields();
        paths.push(path);
        lastPathRoute = path.routeDesign;
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
        var consecutivePathsAvailable = (i + 2 < totalRoutes);

        path.routeDesign = this.GetSpecialRoute(leg.courseType, consecutivePathsAvailable, lastPathRoute);
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

      lastPathRoute = path.routeDesign;
    }

    return paths;
  }

  GetSpecialRoute(courseType: RaceCourseTypeEnum, consecutivePathsAvailable: boolean, lastPathRoute: RaceDesignEnum): RaceDesignEnum {
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
      else if (courseType === RaceCourseTypeEnum.Ocean)
        specialRoute = RaceDesignEnum.Waves;
      else if (courseType === RaceCourseTypeEnum.Tundra)
        specialRoute = RaceDesignEnum.Cavern;
    }
    else if (routeType === 3) {
      if (courseType === RaceCourseTypeEnum.Flatland)
        specialRoute = RaceDesignEnum.Bumps;
      else if (courseType === RaceCourseTypeEnum.Mountain)
        specialRoute = RaceDesignEnum.Gaps;
      else if (courseType === RaceCourseTypeEnum.Ocean)
        specialRoute = RaceDesignEnum.Dive;
      else if (courseType === RaceCourseTypeEnum.Tundra)
        specialRoute = RaceDesignEnum.Hills;
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

    var traitMaxSpeedModifier = this.getTraitModifier(animal, AnimalStatEnum.topSpeed);
    var traitAccelerationModifier = this.getTraitModifier(animal, AnimalStatEnum.acceleration);
    var traitEnduranceModifier = this.getTraitModifier(animal, AnimalStatEnum.endurance);
    var traitPowerModifier = this.getTraitModifier(animal, AnimalStatEnum.power);
    var traitFocusModifier = this.getTraitModifier(animal, AnimalStatEnum.focus);
    var traitAdaptabilityModifier = this.getTraitModifier(animal, AnimalStatEnum.adaptability);

    //leave space to adjust modifiers with other items or anything
    var breedLevelStatModifier = this.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var diminishingReturnsThreshold = this.GetAnimalDiminishingReturns(animal);

    //do the calculations      
    animal.currentStats.maxSpeedMs = animal.currentStats.calculateMaxSpeed(totalMaxSpeedModifier * breedLevelStatModifierValue * traitMaxSpeedModifier, diminishingReturnsThreshold);
    animal.currentStats.accelerationMs = animal.currentStats.calculateTrueAcceleration(totalAccelerationModifier * breedLevelStatModifierValue * traitAccelerationModifier, diminishingReturnsThreshold);
    animal.currentStats.stamina = animal.currentStats.calculateStamina(totalStaminaModifier * breedLevelStatModifierValue * traitEnduranceModifier, diminishingReturnsThreshold);
    animal.currentStats.powerMs = animal.currentStats.calculateTruePower(totalPowerModifier * breedLevelStatModifierValue * traitPowerModifier, diminishingReturnsThreshold);
    animal.currentStats.focusMs = animal.currentStats.calculateTrueFocus(totalFocusModifier * breedLevelStatModifierValue * traitFocusModifier, diminishingReturnsThreshold);
    animal.currentStats.adaptabilityMs = animal.currentStats.calculateTrueAdaptability(totalAdaptabilityModifier * breedLevelStatModifierValue * traitAdaptabilityModifier, diminishingReturnsThreshold);
    animal.currentStats.burstChance = animal.currentStats.calculateBurstChance();
    animal.currentStats.burstDistance = animal.currentStats.calculateBurstDistance();
  }

  getTraitModifier(animal: Animal, stat: AnimalStatEnum) {
    var statMultiplier = 1;

    if (animal.trait !== undefined && animal.trait !== null) {
      if (animal.trait.positiveStatGain === stat)
        statMultiplier += animal.trait.researchLevel / 100;
      if (animal.trait.negativeStatGain === stat)
        statMultiplier -= animal.trait.researchLevel / 100;
    }
    return statMultiplier;
  }

  GetAnimalDiminishingReturns(animal: Animal) {
    var diminishingReturnsThreshold = animal.currentStats.diminishingReturnsDefaultStatThreshold;
    var facilityLevelModifier = this.globalVar.modifiers.find(item => item.text === "facilityLevelModifier");
    var facilityLevel = this.globalVar.resources.find(item => item.name === "Facility Level");
    if (facilityLevelModifier !== undefined && facilityLevel !== undefined)
      diminishingReturnsThreshold += facilityLevel.amount * facilityLevelModifier.value;

    return diminishingReturnsThreshold;
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

    var breedMaxIncrease = 5;
    var breedMaxIncreaseModifier = this.globalVar.modifiers.find(item => item.text === "breedGaugeMaxIncreaseModifier");
    if (breedMaxIncreaseModifier !== null && breedMaxIncreaseModifier !== undefined)
      breedMaxIncrease = breedMaxIncreaseModifier.value;

    animal.breedLevel += 1;
    animal.breedGaugeXp = 0;
    animal.breedGaugeMax += breedMaxIncrease;
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
    this.globalVar.resources.push(this.initializeService.initializeResource("Coins", 500));
    this.globalVar.resources.push(this.initializeService.initializeResource("Renown", 1));
  }

  InitializeSettings() {
    this.globalVar.settings.set("theme", this.themeService.getActiveTheme());
    this.globalVar.settings.set("skipDrawRace", false);
    this.globalVar.settings.set("finishTrainingBeforeSwitching", false);
  }

  InitializeUnlockables() {
    this.globalVar.unlockables.set("monoRace", false);
    this.globalVar.unlockables.set("duoRace", false);
    this.globalVar.unlockables.set("rainbowRace", false);
    this.globalVar.unlockables.set("barnRow2", false);
    this.globalVar.unlockables.set("barnRow3", false);
    this.globalVar.unlockables.set("barnSpecializations", false);
    this.globalVar.unlockables.set("attractionSpecialization", false);
    this.globalVar.unlockables.set("researchCenterSpecialization", false);
  }

  getCoinsResourceValue(amount: number) {
    return new ResourceValue("Coins", amount);
  }

  getMedalResourceValue(amount: number) {
    return new ResourceValue("Medals", amount);
  }

  unlockAnimalAbilities(animal: Animal) {
    var associatedAbilitySection = this.globalVar.shop.find(item => item.name === "Abilities");
    if (associatedAbilitySection !== undefined && associatedAbilitySection !== null) {
      var associatedAbilities = associatedAbilitySection.itemList.filter(item => item.name.split(' ')[0] === animal?.getAnimalType());
      if (associatedAbilities !== undefined && associatedAbilities !== null && associatedAbilities.length > 0) {
        associatedAbilities.forEach(ability => {
          ability.isAvailable = true;
        })
      }
    }
  }

  unlockOtherRaceCourseTypeAnimals(courseType: RaceCourseTypeEnum) {
    var associatedAnimalSection = this.globalVar.shop.find(item => item.name === "Animals");
    if (associatedAnimalSection !== undefined && associatedAnimalSection !== null) {
      var associatedAnimals: ShopItem[] = [];
      associatedAnimalSection.itemList.forEach(item => {//.filter(item => item.name === animal?.getAnimalType());
        var globalAnimal = this.globalVar.animals.find(animal => animal.getAnimalType() === item.name);
        if (globalAnimal !== undefined && globalAnimal !== null && globalAnimal.raceCourseType === courseType)
          associatedAnimals.push(item);
      });
      if (associatedAnimals !== undefined && associatedAnimals !== null && associatedAnimals.length > 0) {
        associatedAnimals.forEach(animal => {
          animal.isAvailable = true;
        })
      }
    }
  }

  getEquipmentDescription(name: string) {
    var returnVal = "";
    if (name === "Headband")
      returnVal = "The first three stumbles you would have are ignored";
    if (name === "Pendant")
      returnVal = "Reduce your ability cooldown by 10%";
    if (name === "Blinders")
      returnVal = "Negative terrain effects are cut in half";
    if (name === "Quick Snack")
      returnVal = "Gain 100% of Stamina back after running out";
    if (name === "Red Baton")
      returnVal = "Increase next racer's Top Speed by 10% on Relay";
    if (name === "Blue Baton")
      returnVal = "Increase next racer's Focus by 10% on Relay";
    if (name === "Violet Baton")
      returnVal = "Increase next racer's Power by 10% on Relay";
    if (name === "Green Baton")
      returnVal = "Increase next racer's Adaptability by 10% on Relay";
    if (name === "Orange Baton")
      returnVal = "Increase next racer's Acceleration by 10% on Relay";
    if (name === "Yellow Baton")
      returnVal = "Increase next racer's Endurance by 10% on Relay";

    return returnVal;
  }

  getItemDescription(name: string) {
    if (name === "Apple")
      return "+1 Acceleration to a single animal";
    if (name === "Banana")
      return "+1 Top Speed to a single animal";
    if (name === "Strawberry")
      return "+1 Endurance to a single animal";
    if (name === "Carrot")
      return "+1 Power to a single animal";
    if (name === "Turnip")
      return "+1 Focus to a single animal";
    if (name === "Orange")
      return "+1 Adaptability to a single animal";

    return "";
  }

  devModeInitialize(circuitRankNumeric: number) {
    var Coins = this.globalVar.resources.find(item => item.name === "Coins");
    if (Coins !== undefined)
      Coins.amount = 30000;
    this.globalVar.resources.push(this.initializeService.initializeResource("Medals", 15));
    //this.globalVar.resources.push(this.initializeService.initializeResource("Facility Level", 50));
    //this.globalVar.resources.push(this.initializeService.initializeResource("Research Level", 50));

    for (var i = 1; i <= circuitRankNumeric; i++) {
      var rank = this.utilityService.getCircuitRankFromNumericValue(i);
      this.globalVar.circuitRank = rank;
      this.checkCircuitRankRewards();
      this.GenerateCircuitRacesForRank(this.globalVar.circuitRank);
    }

    var horse = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Horse);
    if (horse !== undefined) {
      horse.currentStats.topSpeed = 20000;
      horse.currentStats.acceleration = 20000;
      horse.currentStats.endurance = 20000;
      horse.currentStats.power = 20000;
      horse.currentStats.focus = 20000;
      horse.currentStats.adaptability = 20000;
      horse.breedLevel = 20000;
      this.calculateAnimalRacingStats(horse);

      //horse.breedGaugeMax = 5;
      //horse.breedGaugeXp = 5;
    }

    var cheetah = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Cheetah);
    if (cheetah !== undefined) {
      cheetah.currentStats.topSpeed = 30;
      cheetah.currentStats.acceleration = 8;
      this.calculateAnimalRacingStats(cheetah);
    }

    var monkey = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey);
    if (monkey !== undefined) {
      monkey.currentStats.topSpeed = 20000;
      monkey.currentStats.acceleration = 20000;
      monkey.currentStats.endurance = 20000;
      monkey.currentStats.power = 20000;
      monkey.currentStats.focus = 20000;
      monkey.currentStats.adaptability = 20000;
      monkey.breedLevel = 20000;
      this.calculateAnimalRacingStats(monkey);

      //monkey.breedGaugeMax = 5;
      //monkey.breedGaugeXp = 5;
    }

    var goat = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Goat);
    if (goat !== undefined) {
      goat.currentStats.topSpeed = 300;
      goat.currentStats.acceleration = 2000;
      goat.currentStats.adaptability = 100;
      goat.currentStats.endurance = 100;
      goat.currentStats.power = 100;
      this.calculateAnimalRacingStats(goat);
    }

    var dolphin = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Dolphin);
    if (dolphin !== undefined) {
      dolphin.currentStats.topSpeed = 20000;
      dolphin.currentStats.acceleration = 20000;
      dolphin.currentStats.endurance = 20000;
      dolphin.currentStats.power = 20000;
      dolphin.currentStats.focus = 20000;
      dolphin.currentStats.adaptability = 20000;
      dolphin.breedLevel = 20000;
      this.calculateAnimalRacingStats(dolphin);
    }

    var shark = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Shark);
    if (shark !== undefined) {
      shark.currentStats.topSpeed = 300;
      shark.currentStats.acceleration = 30;
      shark.currentStats.focus = 30;
      shark.currentStats.power = 300;
      this.calculateAnimalRacingStats(shark);
    }

    var penguin = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Penguin);
    if (penguin !== undefined) {
      penguin.currentStats.topSpeed = 30;
      penguin.currentStats.acceleration = 8;
      penguin.currentStats.focus = 100;
      this.calculateAnimalRacingStats(penguin);
    }

    var salamander = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Salamander);
    if (salamander !== undefined) {
      salamander.currentStats.topSpeed = 30;
      salamander.currentStats.acceleration = 8;
      this.calculateAnimalRacingStats(salamander);
    }
  }
}
