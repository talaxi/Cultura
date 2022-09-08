import { Injectable } from '@angular/core';
import { GlobalVariables } from '../models/global/global-variables.model';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalStats } from '../models/animals/animal-stats.model';
import { Animal, Caribou, Cheetah, Dolphin, Fox, Gecko, Goat, Hare, Horse, Monkey, Octopus, Penguin, Salamander, Shark, Warthog, Whale } from '../models/animals/animal.model';
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
import { RaceDisplayInfoEnum } from '../models/race-display-info-enum.model';
import { TrackedStats } from '../models/utility/tracked-stats.model';
import { TrackRaceTypeEnum } from '../models/track-race-type-enum.model';
import { OrbStats } from '../models/animals/orb-stats.model';
import { Tutorials } from '../models/tutorials.model';
import { GrandPrixData } from '../models/races/event-race-data.model';
import { RaceTypeEnum } from '../models/race-type-enum.model';
import { EventRaceTypeEnum } from '../models/event-race-type-enum.model';
import { AnimalEventRaceData } from '../models/animals/animal-event-race-data.model';
import { Notifications } from '../models/utility/notifications.model';
import { WeatherEnum } from '../models/weather-enum.model';
import { TalentTreeTypeEnum } from '../models/talent-tree-type-enum.model';
import { DrawnRaceObject } from '../models/races/drawn-race-objects.model';
import { DrawnRaceObjectEnum } from '../models/drawn-race-object-enum.model';
import { OrbTypeEnum } from '../models/orb-type-enum.model';
import { Orb } from '../models/animals/orb.model';
import { EasyPinnacleConditionsEnum, HardPinnacleConditionsEnum, MediumPinnacleConditionsEnum } from '../models/pinnacle-conditions-enum.model';
import { PinnacleConditions } from '../models/races/pinnacle-conditions.model';

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
    this.globalVar.redeemedCodes = [];
    this.globalVar.settings = new Settings();
    this.globalVar.unlockables = new Unlockables();
    this.globalVar.incubator = new Incubator();
    this.globalVar.trackedStats = new TrackedStats();
    this.globalVar.orbStats = new OrbStats();
    this.globalVar.tutorials = new Tutorials();
    this.globalVar.previousEventRewards = [];
    this.globalVar.eventRaceData = new GrandPrixData();
    this.globalVar.pinnacleHistory = new PinnacleConditions();
    this.globalVar.currentPinnacleConditions = undefined;
    this.globalVar.userIsRacing = false;
    this.globalVar.nationalRaceCountdown = 0;
    this.globalVar.autoFreeRaceCounter = 0;
    this.globalVar.freeRaceCounter = 0;
    this.globalVar.freeRaceTimePeriodCounter = 0;
    this.globalVar.lastTimeStamp = Date.now();
    this.globalVar.currentVersion = 1.17; //TODO: this needs to be automatically increased or something, too easy to forget
    this.globalVar.startingVersion = 1.17;
    this.globalVar.startDate = new Date();
    this.globalVar.notifications = new Notifications();
    this.globalVar.relayEnergyFloor = 50;
    this.globalVar.doNotRelayBelowEnergyFloor = false;

    //Initialize modifiers
    this.InitializeModifiers();

    this.InitializeAnimals();

    this.InitializeRelayTeams();

    //Initialize training options
    this.InitializeGlobalTrainingOptions();

    this.InitializeShop();

    this.InitializeTokenShop();

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
    this.globalVar.pinnacleFloor = "Z";
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
    this.globalVar.modifiers.push(new StringNumberPair(.3, "exhaustionStatLossMinimumModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "trainingBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "circuitBreedGaugeIncrease"));
    this.globalVar.modifiers.push(new StringNumberPair(1, "localBreedGaugeIncrease"));

    this.globalVar.modifiers.push(new StringNumberPair(.50, "trainingTrackPaceModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(.05, "breedLevelStatModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "breedGaugeMaxIncreaseModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.001, "incubatorUpgradeIncreaseModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "facilityLevelModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.02, "animalHandlerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.01, "stopwatchModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.1, "racerMapsModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(50, "freeRacesToMedalModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(25, "nationalRacesToMedalModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "internationalRacesToMedalModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.75, "moneyMarkPaceModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.25, "moneyMarkRewardModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(5, "whistleModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(10, "goldenWhistleModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(.10, "breedingGroundsSpecializationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((5 * 60), "attractionTimeToCollectModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(20, "attractionAmountModifier"));
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
    this.globalVar.modifiers.push(new StringNumberPair(2, "scaryMaskEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(1.2, "runningShoesEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.9, "incenseEquipmentModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.5, "athleticTapeEquipmentModifier"));

    //below in seconds
    this.globalVar.modifiers.push(new StringNumberPair((4 * 60 * 60), "smallBarnTrainingTimeModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((8 * 60 * 60), "mediumBarnTrainingTimeModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((12 * 60 * 60), "largeBarnTrainingTimeModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(5, "freeRacesPerTimePeriodModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((5 * 60), "freeRacesTimePeriodModifier"));
    this.globalVar.modifiers.push(new StringNumberPair((8 * 60 * 60), "autoFreeRacesMaxIdleTimePeriodModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(2500000, "metersPerCoinsGrandPrixModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(20000000, "metersPerRenownGrandPrixModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(100, "grandPrixCoinRewardModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(3, "grandPrixRenownRewardModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(50000000, "grandPrixToken1MeterModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(100000000, "grandPrixToken2MeterModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(250000000, "grandPrixToken3MeterModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(500000000, "grandPrixToken4MeterModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(5 * 60, "exhaustionGainTimerCapGrandPrixModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.02, "exhaustionGainGrandPrixModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(2 * 60 * 60, "weatherClusterTimerCapGrandPrixModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(25, "grandPrixBreedLevelRequiredModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.5, "weatherMoraleBoostModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.03, "focusMoraleLossModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.02, "burstMoraleBoostModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.01, "stumbleMoraleLossModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.1, "segmentCompleteMoraleBoostModifier"));

    //ability modifiers
    this.globalVar.modifiers.push(new StringNumberPair(25, "abilityLevelCapModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(1.5, "feedingFrenzyPositiveModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(.9, "feedingFrenzyNegativeModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(20, "maxDriftAmountModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(4, "relayAbilityXpGainModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(25, "maximumTraitNegativePercentModifier"));

    var baseMaxSpeedModifier = .3;
    var baseAccelerationModifier = .1;
    var baseStaminaModifier = 5;
    var basePowerModifier = 1;
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

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier, "hareDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * mediumImprovement, "hareDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier, "hareDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "hareDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * mediumDetriment, "hareDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "hareDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * minorImprovement, "warthogDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "warthogDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * mediumImprovement, "warthogDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "warthogDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * minorDetriment, "warthogDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * mediumDetriment, "warthogDefaultAdaptabilityModifier"));

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

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * minorDetriment, "octopusDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * mediumDetriment, "octopusDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier, "octopusDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * majorImprovement, "octopusDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * minorImprovement, "octopusDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "octopusDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * majorDetriment, "whaleDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "whaleDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * mediumImprovement, "whaleDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * mediumImprovement, "whaleDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * majorImprovement, "whaleDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * mediumDetriment, "whaleDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * mediumDetriment, "penguinDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "penguinDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier, "penguinDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "penguinDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier, "penguinDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * mediumImprovement, "penguinDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * minorDetriment, "caribouDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * mediumDetriment, "caribouDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * majorImprovement, "caribouDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "caribouDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * mediumImprovement, "caribouDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "caribouDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier, "salamanderDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier * minorImprovement, "salamanderDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * mediumDetriment, "salamanderDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier, "salamanderDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * mediumImprovement, "salamanderDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier, "salamanderDefaultAdaptabilityModifier"));

    this.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * mediumImprovement, "foxDefaultMaxSpeedModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "foxDefaultAccelerationModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * minorDetriment, "foxDefaultStaminaModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "foxDefaultPowerModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * majorDetriment, "foxDefaultFocusModifier"));
    this.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * mediumImprovement, "foxDefaultAdaptabilityModifier"));

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

    var warthog = new Warthog();
    warthog.name = "Warthog";
    this.calculateAnimalRacingStats(warthog);

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

    var whale = new Whale();
    whale.name = "Whale";
    this.calculateAnimalRacingStats(whale);

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
    this.globalVar.animals.push(warthog);
    this.globalVar.animals.push(whale);
  }

  InitializeRelayTeams(): void {
    var deck = new AnimalDeck();
    deck.isPrimaryDeck = true;
    deck.isAvailable = true;
    deck.name = "Relay Team 1";
    deck.deckNumber = 1;

    var horse = this.globalVar.animals.find(item => item.getAnimalType() === "Horse");
    if (horse !== undefined)
      deck.selectedAnimals.push(horse);

    this.globalVar.animalDecks.push(deck);

    for (var i = 0; i < 3; i++) {
      var emptyDeck = new AnimalDeck();
      emptyDeck.isAvailable = true;
      emptyDeck.deckNumber = i + 2;
      emptyDeck.name = "Relay Team " + emptyDeck.deckNumber;
      this.globalVar.animalDecks.push(emptyDeck);
    }
  }

  InitializeTokenShop(): void {
    this.globalVar.tokenShop = [];

    var tier1ShopSection = new ShopSection();
    var tier1ShopItems: ShopItem[] = [];
    var foodAmount = 10;

    var apple = new ShopItem();
    apple.name = "Apples";
    apple.purchasePrice.push(this.getTokenResourceValue(1));
    apple.basePurchasePrice.push(this.getTokenResourceValue(1));
    apple.shortDescription = "+1 Acceleration to a single animal";
    apple.numberPurchasing = foodAmount;
    apple.canHaveMultiples = true;
    apple.type = ShopItemTypeEnum.Food;
    apple.infiniteAmount = true;
    tier1ShopItems.push(apple);

    var banana = new ShopItem();
    banana.name = "Bananas";
    banana.shortDescription = "+1 Speed to a single animal";
    banana.purchasePrice.push(this.getTokenResourceValue(1));
    banana.basePurchasePrice.push(this.getTokenResourceValue(1));
    banana.canHaveMultiples = true;
    banana.numberPurchasing = foodAmount;
    banana.type = ShopItemTypeEnum.Food;
    banana.infiniteAmount = true;
    tier1ShopItems.push(banana);

    var strawberry = new ShopItem();
    strawberry.name = "Strawberries";
    strawberry.shortDescription = "+1 Endurance to a single animal";
    strawberry.purchasePrice.push(this.getTokenResourceValue(1));
    strawberry.basePurchasePrice.push(this.getTokenResourceValue(1));
    strawberry.canHaveMultiples = true;
    strawberry.numberPurchasing = foodAmount;
    strawberry.type = ShopItemTypeEnum.Food;
    strawberry.infiniteAmount = true;
    tier1ShopItems.push(strawberry);

    var carrot = new ShopItem();
    carrot.name = "Carrots";
    carrot.shortDescription = "+1 Power to a single animal";
    carrot.purchasePrice.push(this.getTokenResourceValue(1));
    carrot.basePurchasePrice.push(this.getTokenResourceValue(1));
    carrot.canHaveMultiples = true;
    carrot.numberPurchasing = foodAmount;
    carrot.type = ShopItemTypeEnum.Food;
    carrot.infiniteAmount = true;
    tier1ShopItems.push(carrot);

    var turnip = new ShopItem();
    turnip.name = "Turnips";
    turnip.shortDescription = "+1 Focus to a single animal";
    turnip.purchasePrice.push(this.getTokenResourceValue(1));
    turnip.basePurchasePrice.push(this.getTokenResourceValue(1));
    turnip.canHaveMultiples = true;
    turnip.numberPurchasing = foodAmount;
    turnip.type = ShopItemTypeEnum.Food;
    turnip.infiniteAmount = true;
    tier1ShopItems.push(turnip);

    var orange = new ShopItem();
    orange.name = "Oranges";
    orange.shortDescription = "+1 Adaptability to a single animal";
    orange.purchasePrice.push(this.getTokenResourceValue(1));
    orange.basePurchasePrice.push(this.getTokenResourceValue(1));
    orange.canHaveMultiples = true;
    orange.numberPurchasing = foodAmount;
    orange.type = ShopItemTypeEnum.Food;
    orange.infiniteAmount = true;
    tier1ShopItems.push(orange);

    var circuitBonusBreedXp = new ShopItem();
    circuitBonusBreedXp.name = "Circuit Race Breed XP Gain Certificate";
    circuitBonusBreedXp.shortDescription = this.getItemDescription(circuitBonusBreedXp.name);
    circuitBonusBreedXp.purchasePrice.push(this.getTokenResourceValue(1));
    circuitBonusBreedXp.basePurchasePrice.push(this.getTokenResourceValue(1));
    circuitBonusBreedXp.canHaveMultiples = true;
    circuitBonusBreedXp.type = ShopItemTypeEnum.Consumable;
    circuitBonusBreedXp.infiniteAmount = true;
    tier1ShopItems.push(circuitBonusBreedXp);

    var freeBonusBreedXp = new ShopItem();
    freeBonusBreedXp.name = "Free Race Breed XP Gain Certificate";
    freeBonusBreedXp.shortDescription = this.getItemDescription(freeBonusBreedXp.name);
    freeBonusBreedXp.purchasePrice.push(this.getTokenResourceValue(1));
    freeBonusBreedXp.basePurchasePrice.push(this.getTokenResourceValue(1));
    freeBonusBreedXp.canHaveMultiples = true;
    freeBonusBreedXp.type = ShopItemTypeEnum.Consumable;
    freeBonusBreedXp.infiniteAmount = true;
    tier1ShopItems.push(freeBonusBreedXp);

    tier1ShopSection.name = "Tier 1";
    tier1ShopSection.itemList = tier1ShopItems;
    this.globalVar.tokenShop.push(tier1ShopSection);

    var tier2ShopSection = new ShopSection();
    var tier2ShopItems: ShopItem[] = [];

    var mango = new ShopItem();
    mango.name = "Mangoes";
    mango.shortDescription = "+1 Breed Level to a single animal";
    mango.purchasePrice.push(this.getTokenResourceValue(1));
    mango.basePurchasePrice.push(this.getTokenResourceValue(1));
    mango.canHaveMultiples = true;
    mango.numberPurchasing = 2;
    mango.type = ShopItemTypeEnum.Food;
    mango.infiniteAmount = true;
    tier2ShopItems.push(mango);

    var coins = new ShopItem();
    coins.name = "Coins";
    coins.shortDescription = "";
    coins.purchasePrice.push(this.getTokenResourceValue(1));
    coins.basePurchasePrice.push(this.getTokenResourceValue(1));
    coins.canHaveMultiples = true;
    coins.numberPurchasing = 5000;
    coins.type = ShopItemTypeEnum.Resources;
    coins.infiniteAmount = true;
    tier2ShopItems.push(coins);

    var diminishingReturnsIncrease = new ShopItem();
    diminishingReturnsIncrease.name = "Diminishing Returns Increase Certificate";
    diminishingReturnsIncrease.shortDescription = this.getItemDescription(diminishingReturnsIncrease.name);
    diminishingReturnsIncrease.purchasePrice.push(this.getTokenResourceValue(4));
    diminishingReturnsIncrease.basePurchasePrice.push(this.getTokenResourceValue(4));
    diminishingReturnsIncrease.canHaveMultiples = true;
    diminishingReturnsIncrease.type = ShopItemTypeEnum.Consumable;
    diminishingReturnsIncrease.infiniteAmount = true;
    tier2ShopItems.push(diminishingReturnsIncrease);

    var trainingBonusBreedXp = new ShopItem();
    trainingBonusBreedXp.name = "Training Breed XP Gain Certificate";
    trainingBonusBreedXp.shortDescription = this.getItemDescription(trainingBonusBreedXp.name);
    trainingBonusBreedXp.purchasePrice.push(this.getTokenResourceValue(2));
    trainingBonusBreedXp.basePurchasePrice.push(this.getTokenResourceValue(2));
    trainingBonusBreedXp.canHaveMultiples = true;
    trainingBonusBreedXp.type = ShopItemTypeEnum.Consumable;
    trainingBonusBreedXp.infiniteAmount = true;
    tier2ShopItems.push(trainingBonusBreedXp);

    tier2ShopSection.name = "Tier 2";
    tier2ShopSection.itemList = tier2ShopItems;
    this.globalVar.tokenShop.push(tier2ShopSection);

    var tier3ShopSection = new ShopSection();
    var tier3ShopItems: ShopItem[] = [];

    var scaryMask = new ShopItem();
    scaryMask.name = this.getEquipmentName(EquipmentEnum.scaryMask);
    scaryMask.shortDescription = this.getEquipmentDescription(scaryMask.name);
    scaryMask.purchasePrice.push(this.getTokenResourceValue(7));
    scaryMask.canHaveMultiples = true;
    scaryMask.infiniteAmount = true;
    scaryMask.type = ShopItemTypeEnum.Equipment;
    tier3ShopItems.push(scaryMask);

    var runningShoes = new ShopItem();
    runningShoes.name = this.getEquipmentName(EquipmentEnum.runningShoes);
    runningShoes.shortDescription = this.getEquipmentDescription(runningShoes.name);
    runningShoes.purchasePrice.push(this.getTokenResourceValue(7));
    runningShoes.canHaveMultiples = true;
    runningShoes.infiniteAmount = true;
    runningShoes.type = ShopItemTypeEnum.Equipment;
    tier3ShopItems.push(runningShoes);

    var incense = new ShopItem();
    incense.name = this.getEquipmentName(EquipmentEnum.incense);
    incense.shortDescription = this.getEquipmentDescription(incense.name);
    incense.purchasePrice.push(this.getTokenResourceValue(7));
    incense.canHaveMultiples = true;
    incense.infiniteAmount = true;
    incense.type = ShopItemTypeEnum.Equipment;
    tier3ShopItems.push(incense);

    var athleticTape = new ShopItem();
    athleticTape.name = this.getEquipmentName(EquipmentEnum.athleticTape);
    athleticTape.shortDescription = this.getEquipmentDescription(athleticTape.name);
    athleticTape.purchasePrice.push(this.getTokenResourceValue(7));
    athleticTape.canHaveMultiples = true;
    athleticTape.infiniteAmount = true;
    athleticTape.type = ShopItemTypeEnum.Equipment;
    tier3ShopItems.push(athleticTape);

    tier3ShopSection.name = "Tier 3";
    tier3ShopSection.itemList = tier3ShopItems;
    this.globalVar.tokenShop.push(tier3ShopSection);
  }

  InitializeShop(): void {
    this.globalVar.shop = [];

    var animalShopSection = new ShopSection();
    var animalShopItems: ShopItem[] = [];
    var baseAnimalPrice = 1000;
    var flatlandAnimalPrice = baseAnimalPrice;
    var mountainAnimalPrice = 2.5 * baseAnimalPrice;
    var oceanAnimalPrice = 5 * baseAnimalPrice;
    var tundraAnimalPrice = 10 * baseAnimalPrice;
    var volcanicAnimalPrice = 10 * baseAnimalPrice;

    var cheetah = new ShopItem();
    cheetah.name = "Cheetah";
    //cheetah.shortDescription = "The Cheetah is a Flatland racing animal that prioritizes quickness over stamina.";
    cheetah.purchasePrice.push(new ResourceValue("Coins", flatlandAnimalPrice));
    cheetah.canHaveMultiples = false;
    cheetah.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(cheetah);

    /*var hare = new ShopItem();
    hare.name = "Hare";
    //hare.shortDescription = "The Hare is a Flatland racing animal with various ways to increase acceleration and focus.";
    hare.purchasePrice.push(new ResourceValue("Coins", flatlandAnimalPrice));
    hare.canHaveMultiples = false;
    hare.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(hare);*/

    var warthog = new ShopItem();
    warthog.name = "Warthog";
    //cheetah.shortDescription = "The Cheetah is a Flatland racing animal that prioritizes quickness over stamina.";
    warthog.purchasePrice.push(new ResourceValue("Coins", flatlandAnimalPrice));
    warthog.canHaveMultiples = false;
    warthog.type = ShopItemTypeEnum.Animal;
    animalShopItems.push(warthog);

    var goat = new ShopItem();
    goat.name = "Goat";
    //goat.shortDescription = "The Goat is a Mountain climbing animal that can nimbly travel terrain and increase stamina.";
    goat.purchasePrice.push(new ResourceValue("Coins", mountainAnimalPrice));
    goat.canHaveMultiples = false;
    goat.type = ShopItemTypeEnum.Animal;
    goat.isAvailable = false;
    animalShopItems.push(goat);

    var gecko = new ShopItem();
    gecko.name = "Gecko";
    //gecko.shortDescription = "The Gecko is a Mountain climbing animal that can increase speed based on focus and can increase other racers' velocity.";
    gecko.purchasePrice.push(new ResourceValue("Coins", mountainAnimalPrice));
    gecko.canHaveMultiples = false;
    gecko.type = ShopItemTypeEnum.Animal;
    gecko.isAvailable = false;
    animalShopItems.push(gecko);

    var shark = new ShopItem();
    shark.name = "Shark";
    //shark.shortDescription = "The Shark is an Ocean swimming animal that can slow competitors and increase its own stats at the cost of your other racers.";
    shark.purchasePrice.push(new ResourceValue("Coins", oceanAnimalPrice));
    shark.canHaveMultiples = false;
    shark.type = ShopItemTypeEnum.Animal;
    shark.isAvailable = false;
    animalShopItems.push(shark);

    var octopus = new ShopItem();
    octopus.name = "Octopus";
    //octopus.shortDescription = "The Octopus is an Ocean swimming animal that can increase your coin rewards from races and increase power of other racers.";
    octopus.purchasePrice.push(new ResourceValue("Coins", oceanAnimalPrice));
    octopus.canHaveMultiples = false;
    octopus.type = ShopItemTypeEnum.Animal;
    octopus.isAvailable = false;
    animalShopItems.push(octopus);

    var caribou = new ShopItem();
    caribou.name = "Caribou";
    //caribou.shortDescription = "The Caribou is a Tundra racing animal that boosts other racers based on stamina.";
    caribou.purchasePrice.push(new ResourceValue("Coins", tundraAnimalPrice));
    caribou.canHaveMultiples = false;
    caribou.type = ShopItemTypeEnum.Animal;
    caribou.isAvailable = false;
    animalShopItems.push(caribou);

    var fox = new ShopItem();
    fox.name = "Fox";
    //fox.shortDescription = "The Fox is a Volcanic racing animal that can increase stats at random.";
    fox.purchasePrice.push(new ResourceValue("Coins", volcanicAnimalPrice));
    fox.canHaveMultiples = false;
    fox.type = ShopItemTypeEnum.Animal;
    fox.isAvailable = false;
    animalShopItems.push(fox);

    animalShopSection.name = "Animals";
    animalShopSection.itemList = animalShopItems;
    this.globalVar.shop.push(animalShopSection);

    var foodShopSection = new ShopSection();
    var foodShopItems: ShopItem[] = [];
    var baseFoodPrice = 10;

    var apple = new ShopItem();
    apple.name = "Apples";
    //apple.shortDescription = "+1 Acceleration to a single animal";
    apple.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    apple.canHaveMultiples = true;
    apple.type = ShopItemTypeEnum.Food;
    apple.infiniteAmount = true;
    foodShopItems.push(apple);

    var banana = new ShopItem();
    banana.name = "Bananas";
    //banana.shortDescription = "+1 Speed to a single animal";
    banana.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    banana.canHaveMultiples = true;
    banana.type = ShopItemTypeEnum.Food;
    banana.infiniteAmount = true;
    foodShopItems.push(banana);

    var strawberry = new ShopItem();
    strawberry.name = "Strawberries";
    //strawberry.shortDescription = "+1 Endurance to a single animal";
    strawberry.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    strawberry.canHaveMultiples = true;
    strawberry.type = ShopItemTypeEnum.Food;
    strawberry.infiniteAmount = true;
    foodShopItems.push(strawberry);

    var carrot = new ShopItem();
    carrot.name = "Carrots";
    //carrot.shortDescription = "+1 Power to a single animal";
    carrot.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    carrot.canHaveMultiples = true;
    carrot.type = ShopItemTypeEnum.Food;
    carrot.infiniteAmount = true;
    foodShopItems.push(carrot);

    var turnip = new ShopItem();
    turnip.name = "Turnips";
    //turnip.shortDescription = "+1 Focus to a single animal";
    turnip.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    turnip.canHaveMultiples = true;
    turnip.type = ShopItemTypeEnum.Food;
    turnip.infiniteAmount = true;
    foodShopItems.push(turnip);

    var orange = new ShopItem();
    orange.name = "Oranges";
    //orange.shortDescription = "+1 Adaptability to a single animal";
    orange.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
    orange.canHaveMultiples = true;
    orange.type = ShopItemTypeEnum.Food;
    orange.infiniteAmount = true;
    foodShopItems.push(orange);

    var mango = new ShopItem();
    mango.name = "Mangoes";
    //mango.shortDescription = "+1 Breed Level to a single animal";
    mango.purchasePrice.push(new ResourceValue("Coins", 10 * baseFoodPrice));
    mango.canHaveMultiples = true;
    mango.type = ShopItemTypeEnum.Food;
    mango.infiniteAmount = true;
    foodShopItems.push(mango);

    var gingkoLeaf = new ShopItem();
    gingkoLeaf.name = "Gingko Leaves";
    //gingkoLeaf.shortDescription = "Reset Breed Level for a single animal back to 1 and remove all incubator upgrade gains. Increase Breed XP Gain by 900% until Breed Level returns to what it was.";
    gingkoLeaf.purchasePrice.push(new ResourceValue("Coins", 3500));
    gingkoLeaf.canHaveMultiples = true;
    gingkoLeaf.type = ShopItemTypeEnum.Food;
    gingkoLeaf.infiniteAmount = true;
    gingkoLeaf.isAvailable = false;
    foodShopItems.push(gingkoLeaf);

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
      if (item.facilitySize === FacilitySizeEnum.Medium || item.facilitySize === FacilitySizeEnum.Large) {
        purchasableTraining.isAvailable = false;
        purchasableTraining.additionalIdentifier = item.facilitySize.toString();
      }
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
    stopwatch.purchasePrice.push(this.getMedalResourceValue(10));
    stopwatch.basePurchasePrice.push(this.getMedalResourceValue(10));
    stopwatch.quantityMultiplier = 2.5;
    stopwatch.totalShopQuantity = 2;
    stopwatch.canHaveMultiples = true;
    stopwatch.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(stopwatch);

    var animalHandler = new ShopItem();
    animalHandler.name = "Animal Handler";
    animalHandler.purchasePrice.push(this.getCoinsResourceValue(2000));
    animalHandler.basePurchasePrice.push(this.getCoinsResourceValue(2000));
    animalHandler.quantityAdditive = 2000;
    animalHandler.totalShopQuantity = 20;
    animalHandler.canHaveMultiples = true;
    animalHandler.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(animalHandler);

    var raceMaps = new ShopItem();
    raceMaps.name = "Course Maps";
    raceMaps.purchasePrice.push(this.getMedalResourceValue(2));
    raceMaps.basePurchasePrice.push(this.getMedalResourceValue(2));
    raceMaps.quantityMultiplier = 2;
    raceMaps.totalShopQuantity = 5;
    raceMaps.isAvailable = false;
    raceMaps.canHaveMultiples = true;
    raceMaps.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(raceMaps);

    var stockbreeder = new ShopItem();
    stockbreeder.name = "Stockbreeder";
    stockbreeder.purchasePrice.push(this.getCoinsResourceValue(500));
    stockbreeder.basePurchasePrice.push(this.getCoinsResourceValue(500));
    stockbreeder.canHaveMultiples = false;
    stockbreeder.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(stockbreeder);

    var teamManager = new ShopItem();
    teamManager.name = "Team Manager";
    teamManager.purchasePrice.push(this.getMedalResourceValue(3));
    teamManager.basePurchasePrice.push(this.getMedalResourceValue(3));
    teamManager.canHaveMultiples = true;
    teamManager.quantityMultiplier = 2;
    teamManager.totalShopQuantity = 19;
    teamManager.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(teamManager);

    var scouts = new ShopItem();
    scouts.name = "Scouts";
    scouts.purchasePrice.push(this.getCoinsResourceValue(10000));
    scouts.basePurchasePrice.push(this.getCoinsResourceValue(10000));
    scouts.canHaveMultiples = false;
    scouts.isAvailable = false;
    scouts.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(scouts);

    var moneyMark = new ShopItem();
    moneyMark.name = "Money Mark";
    moneyMark.purchasePrice.push(this.getCoinsResourceValue(500));
    moneyMark.basePurchasePrice.push(this.getCoinsResourceValue(500));
    moneyMark.canHaveMultiples = false;
    moneyMark.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(moneyMark);

    var nationalRace = new ShopItem();
    nationalRace.name = "National Races";
    nationalRace.purchasePrice.push(this.getCoinsResourceValue(10000));
    nationalRace.basePurchasePrice.push(this.getCoinsResourceValue(10000));
    nationalRace.canHaveMultiples = false;
    nationalRace.isAvailable = false;
    nationalRace.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(nationalRace);

    var internationalRace = new ShopItem();
    internationalRace.name = "International Races";
    internationalRace.purchasePrice.push(this.getCoinsResourceValue(50000));
    internationalRace.basePurchasePrice.push(this.getCoinsResourceValue(50000));
    internationalRace.canHaveMultiples = false;
    internationalRace.isAvailable = false;
    internationalRace.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(internationalRace);

    var incubatorUpgrade = new ShopItem();
    incubatorUpgrade.name = "Incubator Upgrade Lv1";
    incubatorUpgrade.purchasePrice.push(this.getCoinsResourceValue(5000));
    incubatorUpgrade.basePurchasePrice.push(this.getCoinsResourceValue(5000));
    incubatorUpgrade.canHaveMultiples = false;
    incubatorUpgrade.isAvailable = false;
    incubatorUpgrade.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(incubatorUpgrade);

    var incubatorUpgrade = new ShopItem();
    incubatorUpgrade.name = "Incubator Upgrade Lv2";
    incubatorUpgrade.purchasePrice.push(this.getCoinsResourceValue(25000));
    incubatorUpgrade.basePurchasePrice.push(this.getCoinsResourceValue(25000));
    incubatorUpgrade.canHaveMultiples = false;
    incubatorUpgrade.isAvailable = false;
    incubatorUpgrade.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(incubatorUpgrade);

    var incubatorUpgrade = new ShopItem();
    incubatorUpgrade.name = "Incubator Upgrade Lv3";
    incubatorUpgrade.purchasePrice.push(this.getCoinsResourceValue(100000));
    incubatorUpgrade.basePurchasePrice.push(this.getCoinsResourceValue(100000));
    incubatorUpgrade.canHaveMultiples = false;
    incubatorUpgrade.isAvailable = false;
    incubatorUpgrade.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(incubatorUpgrade);

    var incubatorUpgrade = new ShopItem();
    incubatorUpgrade.name = "Incubator Upgrade Lv4";
    incubatorUpgrade.purchasePrice.push(this.getCoinsResourceValue(1000000));
    incubatorUpgrade.basePurchasePrice.push(this.getCoinsResourceValue(1000000));
    incubatorUpgrade.canHaveMultiples = false;
    incubatorUpgrade.isAvailable = false;
    incubatorUpgrade.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(incubatorUpgrade);

    var whistle = new ShopItem();
    whistle.name = "Whistle";
    whistle.purchasePrice.push(this.getCoinsResourceValue(2500));
    whistle.basePurchasePrice.push(this.getCoinsResourceValue(2500));
    whistle.totalShopQuantity = 1;
    whistle.canHaveMultiples = false;
    whistle.isAvailable = false;
    whistle.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(whistle);

    var goldenWhistle = new ShopItem();
    goldenWhistle.name = "Golden Whistle";
    goldenWhistle.purchasePrice.push(this.getCoinsResourceValue(15000));
    goldenWhistle.basePurchasePrice.push(this.getCoinsResourceValue(15000));
    goldenWhistle.totalShopQuantity = 1;
    goldenWhistle.canHaveMultiples = false;
    goldenWhistle.isAvailable = false;
    goldenWhistle.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(goldenWhistle);

    var talentPoints = new ShopItem();
    talentPoints.name = "Talent Point Voucher";
    talentPoints.purchasePrice.push(this.getMedalResourceValue(25));
    talentPoints.basePurchasePrice.push(this.getMedalResourceValue(25));
    talentPoints.infiniteAmount = true;
    talentPoints.canHaveMultiples = true;
    talentPoints.quantityAdditive = 25;
    talentPoints.isAvailable = false;
    talentPoints.type = ShopItemTypeEnum.Specialty;
    specialtyShopItems.push(talentPoints);

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
    redBaton.isAvailable = false;
    redBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(redBaton);

    var blueBaton = new ShopItem();
    blueBaton.name = this.getEquipmentName(EquipmentEnum.blueBaton);
    blueBaton.shortDescription = this.getEquipmentDescription(blueBaton.name);
    blueBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    blueBaton.canHaveMultiples = true;
    blueBaton.infiniteAmount = true;
    blueBaton.isAvailable = false;
    blueBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(blueBaton);

    var violetBaton = new ShopItem();
    violetBaton.name = this.getEquipmentName(EquipmentEnum.violetBaton);
    violetBaton.shortDescription = this.getEquipmentDescription(violetBaton.name);
    violetBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    violetBaton.canHaveMultiples = true;
    violetBaton.infiniteAmount = true;
    violetBaton.isAvailable = false;
    violetBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(violetBaton);

    var orangeBaton = new ShopItem();
    orangeBaton.name = this.getEquipmentName(EquipmentEnum.orangeBaton);
    orangeBaton.shortDescription = this.getEquipmentDescription(orangeBaton.name);
    orangeBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    orangeBaton.canHaveMultiples = true;
    orangeBaton.infiniteAmount = true;
    orangeBaton.isAvailable = false;
    orangeBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(orangeBaton);

    var greenBaton = new ShopItem();
    greenBaton.name = this.getEquipmentName(EquipmentEnum.greenBaton);
    greenBaton.shortDescription = this.getEquipmentDescription(greenBaton.name);
    greenBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    greenBaton.canHaveMultiples = true;
    greenBaton.infiniteAmount = true;
    greenBaton.isAvailable = false;
    greenBaton.type = ShopItemTypeEnum.Equipment;
    equipmentShopItems.push(greenBaton);

    var yellowBaton = new ShopItem();
    yellowBaton.name = this.getEquipmentName(EquipmentEnum.yellowBaton);
    yellowBaton.shortDescription = this.getEquipmentDescription(yellowBaton.name);
    yellowBaton.purchasePrice.push(this.getCoinsResourceValue(2500));
    yellowBaton.canHaveMultiples = true;
    yellowBaton.infiniteAmount = true;
    yellowBaton.isAvailable = false;
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
    if (equip === EquipmentEnum.scaryMask)
      return "Scary Mask";
    if (equip === EquipmentEnum.runningShoes)
      return "Running Shoes";
    if (equip === EquipmentEnum.incense)
      return "Incense";
    if (equip === EquipmentEnum.athleticTape)
      return "Athletic Tape";

    return "";
  }

  getEquipmentEnum(equip: string) {
    if (equip === "Headband")
      return EquipmentEnum.headband;
    if (equip === "Pendant")
      return EquipmentEnum.pendant;
    if (equip === "Blinders")
      return EquipmentEnum.blinders;
    if (equip === "Quick Snack")
      return EquipmentEnum.quickSnack;
    if (equip === "Carrot on a Stick")
      return EquipmentEnum.carrotOnAStick;
    if (equip === "Red Baton")
      return EquipmentEnum.redBaton;
    if (equip === "Blue Baton")
      return EquipmentEnum.blueBaton;
    if (equip === "Violet Baton")
      return EquipmentEnum.violetBaton;
    if (equip === "Yellow Baton")
      return EquipmentEnum.yellowBaton;
    if (equip === "Green Baton")
      return EquipmentEnum.greenBaton;
    if (equip === "Orange Baton")
      return EquipmentEnum.orangeBaton;
    if (equip === "Scary Mask")
      return EquipmentEnum.scaryMask;
    if (equip === "Running Shoes")
      return EquipmentEnum.runningShoes;
    if (equip === "Incense")
      return EquipmentEnum.incense;
    if (equip === "Athletic Tape")
      return EquipmentEnum.athleticTape;


    return EquipmentEnum.none;
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
        //console.log("Can't find horse");
        alert("You've run into an error! Please try again. If you have the time, please export your data under the Settings tab and send me the data and any relevant info at CulturaIdle@gmail.com. Thank you!");
      }

      this.globalVar.barns.push(barn1);

      for (var i = 2; i <= 15; i++) {
        var newBarn = new Barn();
        newBarn.barnNumber = i;
        newBarn.isLocked = true;
        newBarn.purchasePrice = 500 * (i - 1);
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

    var showNewSpecialRaceNotification = false;
    var monoRank = this.utilityService.getNumericValueOfCircuitRank(this.globalVar.monoRank);
    if (monoRank >= this.utilityService.getNumericValueOfCircuitRank(currentCircuitRank))
      showNewSpecialRaceNotification = true;
    var duoRank = this.utilityService.getNumericValueOfCircuitRank(this.globalVar.duoRank);
    if (duoRank >= this.utilityService.getNumericValueOfCircuitRank(currentCircuitRank))
      showNewSpecialRaceNotification = true;
    var rainbowRank = this.utilityService.getNumericValueOfCircuitRank(this.globalVar.rainbowRank);
    if (rainbowRank >= this.utilityService.getNumericValueOfCircuitRank(currentCircuitRank))
      showNewSpecialRaceNotification = true;

    if (showNewSpecialRaceNotification)
      this.globalVar.notifications.isNewSpecialRaceAvailable = true;

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
    if (raceType === LocalRaceTypeEnum.Pinnacle)
      currentRank = this.globalVar.pinnacleFloor;

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
    if (raceType === LocalRaceTypeEnum.Pinnacle) {
      this.globalVar.pinnacleFloor = nextRank;
      this.GeneratePinnacleRaces(this.globalVar.pinnacleFloor);
    }
  }

  increaseGrandPrixRaceRank(): void {
    if (this.globalVar.eventRaceData === undefined || this.globalVar.eventRaceData === null)
      return;

    var currentRank = this.globalVar.eventRaceData.rank;

    var nextRank = currentRank.replace(/([A-Z])[^A-Z]*$/, function (a) {
      var c = a.charCodeAt(0);
      switch (c) {
        case 65: return String.fromCharCode(c) + 'Z';
        default: return String.fromCharCode(--c);
      }
    });

    this.globalVar.eventRaceData.rank = nextRank;

    if (this.utilityService.getNumericValueOfCircuitRank(this.globalVar.eventRaceData.rank) % 5 === 0) {
      this.globalVar.eventRaceData.rankDistanceMultiplier *= 2;
    }
    else {
      var increase = Math.ceil(this.utilityService.getNumericValueOfCircuitRank(this.globalVar.eventRaceData.rank) / 5);
      this.globalVar.eventRaceData.rankDistanceMultiplier += increase;
    }

    this.initialGrandPrixSetup(this.globalVar.eventRaceData.rank, this.globalVar.eventRaceData.rankDistanceMultiplier);
    this.globalVar.eventRaceData.initialSetupComplete = true;
    this.globalVar.notifications.isEventRaceNowActive = true;
  }

  getRewardReceiveText(numericValue: number) {
    if (this.globalVar.settings.get("useNumbersForCircuitRank"))
      return "Reach circuit rank " + numericValue + " to receive: \n";
    else
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
      this.globalVar.notifications.isNewSpecialRaceAvailable = true;

      returnVal = ["Mono Race", this.utilityService.getSanitizedHtml("A new race type has been unlocked!" +
        " Take part in a Mono Race where you run an extended race as only one course type. Progressing through this race type " +
        "generates new interest in your facility, which means it's time to make some upgrades. Gain Facility Level points from winning these races that increase your Diminishing Returns max value. <br/> <br/>" +
        "<em>Select this race and others like it by choosing the 'Special Race' option from the 'Races' menu.</em>")];

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

      returnVal = ["Monkey", this.getAnimalDescription("Monkey")];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(4) + "Coaching";
    }
    else if (numericValue === 4) {
      this.globalVar.unlockables.set("coaching", true);

      //unlock whistle upgrade from shop
      var specialtyShop = this.globalVar.shop.find(item => item.name === "Specialty");
      if (specialtyShop !== null && specialtyShop !== undefined) {
        var whistle = specialtyShop.itemList.find(item => item.name === "Whistle");
        if (whistle !== null && whistle !== undefined)
          whistle.isAvailable = true;
      }

      returnVal = ["Coaching", "Take charge of your animal's training by giving them some coaching yourself. Visit a barn with an animal assigned and select 'Coach' to get started."];

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

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(6) + "1 Team Manager";
    }
    else if (numericValue === 6) {
      var amount = 1;
      var resource = this.globalVar.resources.find(item => item.name === "Team Manager");
      if (resource === null || resource === undefined) {
        this.globalVar.resources.push(new ResourceValue("Team Manager", amount, ShopItemTypeEnum.Specialty));

        var primaryDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
        if (primaryDeck !== null && primaryDeck !== undefined) {
          primaryDeck.autoRunFreeRace = true;
        }
      }
      else
        resource.amount += amount;

      returnVal = [amount + " Team Manager", "As your popularity has grown, you've attracted some new faces to your racing facility. Each Team Manager you receive will automatically run 1 free race per reset period. Buy more from the Shop."];

      var coinAmount = 1000;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(7) + "Barn Specializations";
    }
    else if (numericValue === 7) {
      this.globalVar.unlockables.set("barnSpecializations", true);

      returnVal = ["Barn Specializations", "As your training facility grows, so should your barns. At barn upgrade level 10, choose what direction you want your barn to progress in. Each option benefits your animals in different ways, so choose carefully."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(8) + "Headband";
    }
    else if (numericValue === 8) {
      var amount = 1;
      var resource = this.globalVar.resources.find(item => item.name === "Headband");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Headband", amount, ShopItemTypeEnum.Equipment));
      else
        resource.amount += amount;

      returnVal = [amount + " Headband", "Equipment can be handled when viewing an animal from the Animals tab."];

      var coinAmount = 1000;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(9) + coinAmount + " Coins";
    }
    else if (numericValue === 9) {
      var amount = 1000;
      var resource = this.globalVar.resources.find(item => item.name === "Coins");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Coins", amount));
      else
        resource.amount += amount;

      returnVal = [amount + " Coins", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(10) + "Hare";
    }
    else if (numericValue === 10) {
      var hare = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Hare);
      if (hare !== undefined && hare !== null) {
        hare.isAvailable = true;
        this.unlockAnimalAbilities(hare);
      }

      this.sortAnimalOrder();
      returnVal = ["Hare", this.getAnimalDescription("Hare")];

      var amount = 20;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(12) + amount + " Stat Increasing Food";
    }
    else if (numericValue === 12) {
      var amount = 20;
      this.increaseAllFood(amount);

      returnVal = [amount + " Stat Increasing Food", amount + " Apples, Bananas, Oranges, Turnips, Carrots, and Strawberries"];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(13) + "Barn Row 2";
    }
    else if (numericValue === 13) {
      this.globalVar.unlockables.set("barnRow2", true);

      returnVal = ["Barn Row 2", ""];

      var renownAmount = 1;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(14) + "Attraction Specialization";
    }
    else if (numericValue === 14) {
      this.globalVar.unlockables.set("attractionSpecialization", true);

      returnVal = ["Attraction Specialization", this.getSpecializationDescription("Attraction") + "<br/><br/><em>Barn Specializations are available to select once you upgrade a barn to level 10.</em>"];
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(15) + "Dolphin";
    }
    else if (numericValue === 15) {
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

      this.sortAnimalOrder();

      returnVal = ["Dolphin", this.getAnimalDescription("Dolphin")];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(16) + "1 Pendant";
    }
    else if (numericValue === 16) {
      var amount = 1;
      var resource = this.globalVar.resources.find(item => item.name === "Pendant");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Pendant", amount, ShopItemTypeEnum.Equipment));
      else
        resource.amount += amount;

      returnVal = [amount + " Pendant", "Equipment can be handled when viewing an animal from the Animals tab."];

      var amount = 5;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(18) + amount + " Renown";
    }
    else if (numericValue === 18) {
      var renownAmount = 5;
      var renownResource = this.globalVar.resources.find(item => item.name === "Renown");
      if (renownResource === null || renownResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Renown", renownAmount));
      else
        renownResource.amount += renownAmount;

      returnVal = [renownAmount + " Renown", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(20) + "Grand Prix";
    }
    else if (numericValue === 20) {
      this.globalVar.unlockables.set("grandPrix", true);
      var primaryDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (primaryDeck !== null && primaryDeck !== undefined) {
        primaryDeck.isEventDeck = true;
      }

      returnVal = ["Grand Prix", "Now that you've climbed the ranks and your racing team has turned some heads, you've received an invite to the Grand Prix invitational. Twice per week, a marathon style race runs over multiple days. Check the 'Event Races' tab to see more info."];

      var amount = 50;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(22) + amount + " Stat Increasing Food";
    }
    else if (numericValue === 22) {
      var amount = 50;
      this.increaseAllFood(amount);

      returnVal = [amount + " Stat Increasing Food", amount + " Apples, Bananas, Oranges, Turnips, Carrots, and Strawberries"];

      var coinAmount = 1500;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(23) + coinAmount + " Coins";
    }
    else if (numericValue === 23) {
      var amount = 1500;
      var resource = this.globalVar.resources.find(item => item.name === "Coins");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Coins", amount));
      else
        resource.amount += amount;

      returnVal = [amount + " Coins", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(25) + "Whale";
    }
    if (numericValue === 25) {
      var whale = this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Whale);
      if (whale !== undefined && whale !== null) {
        whale.isAvailable = true;
        this.unlockAnimalAbilities(whale);
      }

      this.sortAnimalOrder();
      returnVal = ["Whale", this.getAnimalDescription("Whale")];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(27) + "Duo Races";
    }
    else if (numericValue === 27) {
      this.globalVar.unlockables.set("duoRace", true);
      this.globalVar.notifications.isNewSpecialRaceAvailable = true;
      this.unlockTier2ShopItems();

      returnVal = ["Duo Races", "A new race type has been unlocked! Race in pairs to complete this long distance race. Success here will generate more interest for your facility, this time drawing in curious researchers. Gain Research Levels that improve incubator results."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(29) + "Barn Row 3";
    }
    else if (numericValue === 29) {
      this.globalVar.unlockables.set("barnRow3", true);

      returnVal = ["Barn Row 3", ""];

      var CoinsAmount = 2500;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(30) + CoinsAmount + " Coins";
    }
    else if (numericValue === 30) {
      var coinsAmount = 2500;
      var resource = this.globalVar.resources.find(item => item.name === "Coins");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Coins", coinsAmount));
      else
        resource.amount += coinsAmount;

      returnVal = [coinsAmount + " Coins", ""];

      var amount = 20;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(32) + "1 Blue Baton";
    }
    else if (numericValue === 32) {
      var amount = 1;
      var resource = this.globalVar.resources.find(item => item.name === "Blue Baton");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Blue Baton", amount, ShopItemTypeEnum.Equipment));
      else
        resource.amount += amount;

      returnVal = [amount + " Blue Baton", "Equipment can be handled when viewing an animal from the Animals tab."];

      var mangoAmount = 20;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(33) + mangoAmount + " Mangoes";
    }
    else if (numericValue === 33) {
      var amount = 20;
      var resource = this.globalVar.resources.find(item => item.name === "Mangoes");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Mangoes", amount, ShopItemTypeEnum.Food));
      else
        resource.amount += amount;

      returnVal = [amount + " Mangoes", ""];

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

      this.sortAnimalOrder();

      returnVal = ["Penguin", this.getAnimalDescription("Penguin") + "<br/><br/>" +
        this.utilityService.getSanitizedHtml("<em>" + this.getTundraDescription() + "</em>")];

      var CoinsAmount = 3500;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(37) + CoinsAmount + " Coins";
    }
    else if (numericValue === 37) {
      var coinsAmount = 3500;
      var resource = this.globalVar.resources.find(item => item.name === "Coins");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Coins", coinsAmount));
      else
        resource.amount += coinsAmount;

      returnVal = [coinsAmount + " Coins", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(38) + "5 Medals";
    }
    else if (numericValue === 38) {
      var medalsAmount = 5;
      var resource = this.globalVar.resources.find(item => item.name === "Medals");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Medals", medalsAmount));
      else
        resource.amount += medalsAmount;

      returnVal = [medalsAmount + " Medals", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(40) + "Barn Row 4";
    }
    else if (numericValue === 40) {
      this.globalVar.unlockables.set("barnRow4", true);

      returnVal = ["Barn Row 4", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(41) + "Research Center Specialization";
    }
    else if (numericValue === 41) {
      this.globalVar.unlockables.set("researchCenterSpecialization", true);

      returnVal = ["Research Center Specialization", this.getSpecializationDescription("Research Center")];

      var amount = 250;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(43) + amount + " Stat Increasing Food";
    }
    else if (numericValue === 43) {
      var amount = 250;
      this.increaseAllFood(amount);

      returnVal = [amount + " Stat Increasing Food", amount + " Apples, Bananas, Oranges, Turnips, Carrots, and Strawberries"];

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
      this.sortAnimalOrder();

      returnVal = ["Salamander", this.getAnimalDescription("Salamander") + "<br/><br/>" +
        this.utilityService.getSanitizedHtml("<em>" + this.getVolcanicDescription() + "</em>")];

      var renownAmount = 10;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(47) + renownAmount + " Renown";
    }
    else if (numericValue === 47) {
      var renownAmount = 10;
      var renownResource = this.globalVar.resources.find(item => item.name === "Renown");
      if (renownResource === null || renownResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Renown", renownAmount));
      else
        renownResource.amount += renownAmount;

      returnVal = [renownAmount + " Renown", ""];

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

      returnVal = [CoinsAmount + " Coins", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(53) + "Rainbow Races";
    }
    else if (numericValue === 53) {
      this.globalVar.unlockables.set("rainbowRace", true);
      this.globalVar.notifications.isNewSpecialRaceAvailable = true;

      //unlock talent point voucher upgrade from shop
      var specialtyShop = this.globalVar.shop.find(item => item.name === "Specialty");
      if (specialtyShop !== null && specialtyShop !== undefined) {
        var talentPoints = specialtyShop.itemList.find(item => item.name === "Talent Point Voucher");
        if (talentPoints !== null && talentPoints !== undefined)
          talentPoints.isAvailable = true;
      }

      returnVal = ["Rainbow Race", "A new race type has been unlocked! This race requires a full team effort spanning all five course types. Your team of researchers are on hand for these races, coming up with more efficient ways to win. Gain Talent Tree Points that can be spent to improve various course types."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(55) + "Amethyst Orb";
    }
    else if (numericValue === 55) {
      this.globalVar.resources.push(new ResourceValue("Amethyst Orb", 1, ShopItemTypeEnum.Equipment));
      this.globalVar.unlockables.set("orbs", true);

      returnVal = ["Amethyst Orb", "You receive a glowing violet orb. What it is for is a mystery, but you feel faster while you hold it."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(58) + "Barn Row 5";
    }
    else if (numericValue === 58) {
      this.globalVar.unlockables.set("barnRow5", true);

      returnVal = ["Barn Row 5", ""];

      var renownAmount = 1;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(60) + "Sapphire Orb";
    }
    else if (numericValue === 60) {
      this.globalVar.resources.push(new ResourceValue("Sapphire Orb", 1, ShopItemTypeEnum.Equipment));

      returnVal = ["Sapphire Orb", "You receive a glowing blue orb. What it is for is a mystery, but you feel faster while you hold it.."];

      var amount = 100;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(62) + amount + " Mangoes";
    }
    else if (numericValue === 62) {
      var amount = 100;
      var resource = this.globalVar.resources.find(item => item.name === "Mangoes");
      if (resource === null || resource === undefined)
        this.globalVar.resources.push(new ResourceValue("Mangoes", amount, ShopItemTypeEnum.Food));
      else
        resource.amount += amount;

      returnVal = [amount + " Mangoes", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(65) + "Amber Orb";
    }
    else if (numericValue === 65) {
      this.globalVar.resources.push(new ResourceValue("Amber Orb", 1, ShopItemTypeEnum.Equipment));

      returnVal = ["Amber Orb", "You receive a glowing orange orb. What it is for is a mystery, but you feel faster while you hold it.."];

      var amount = 25;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(67) + amount + " Renown";
    }
    else if (numericValue === 67) {
      var renownAmount = 25;
      var renownResource = this.globalVar.resources.find(item => item.name === "Renown");
      if (renownResource === null || renownResource === undefined)
        this.globalVar.resources.push(new ResourceValue("Renown", renownAmount));
      else
        renownResource.amount += renownAmount;

      returnVal = [renownAmount + " Renown", ""];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(70) + "Topaz Orb";
    }
    else if (numericValue === 70) {
      this.globalVar.resources.push(new ResourceValue("Topaz Orb", 1, ShopItemTypeEnum.Equipment));

      returnVal = ["Topaz Orb", "You receive a glowing yellow orb. What it is for is a mystery, but you feel faster while you hold it.."];

      var amount = 500;
      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(73) + amount + " Stat Increasing Food Items";
    }
    else if (numericValue === 73) {
      var amount = 500;
      this.increaseAllFood(amount);

      returnVal = [amount + " Stat Increasing Food", amount + " Apples, Bananas, Oranges, Turnips, Carrots, and Strawberries"];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(75) + "Emerald Orb";
    }
    else if (numericValue === 75) {
      this.globalVar.resources.push(new ResourceValue("Emerald Orb", 1, ShopItemTypeEnum.Equipment));

      returnVal = ["Emerald Orb", "You receive a glowing green orb. What it is for is a mystery, but you feel faster while you hold it.."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(78) + "Ruby Orb";
    }
    else if (numericValue === 78) {
      this.globalVar.resources.push(new ResourceValue("Ruby Orb", 1, ShopItemTypeEnum.Equipment));

      returnVal = ["Ruby Orb", "You receive a glowing red orb. What it is for is a mystery, but you feel faster while you hold it.."];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(79) + "The Pinnacle";
    }
    else if (numericValue === 79) {
      this.globalVar.unlockables.set("thePinnacle", true);
      this.globalVar.notifications.isNewSpecialRaceAvailable = true;

      returnVal = ["The Pinnacle", this.utilityService.getSanitizedHtml("A new race type has been unlocked!" +
        " The Pinnacle is an old and mysterious fortress. Researchers have struggled to map out its interior due to the ever changing terrain and constantly shifting weather. Your team has been contracted out to help map the area out. <br/>" +
        " As you race through each floor, you notice that you can insert the Orbs you have received into braziers to activate them. This increases your Orb level, allowing you to further power them up. <br/> <br/>" +
        "<em>Select this race and others like it by choosing the 'Special Race' option from the 'Races' menu. </em>")];

      this.globalVar.circuitRankUpRewardDescription = this.getRewardReceiveText(80) + "More Coming Soon!";
    }

    return returnVal;
  }

  increaseAllFood(amount: number) {
    var appleResource = this.globalVar.resources.find(item => item.name === "Apples");
    if (appleResource === null || appleResource === undefined)
      this.globalVar.resources.push(new ResourceValue("Apples", amount, ShopItemTypeEnum.Food));
    else
      appleResource.amount += amount;

    var bananaResource = this.globalVar.resources.find(item => item.name === "Bananas");
    if (bananaResource === null || bananaResource === undefined)
      this.globalVar.resources.push(new ResourceValue("Bananas", amount, ShopItemTypeEnum.Food));
    else
      bananaResource.amount += amount;

    var orangeResource = this.globalVar.resources.find(item => item.name === "Oranges");
    if (orangeResource === null || orangeResource === undefined)
      this.globalVar.resources.push(new ResourceValue("Oranges", amount, ShopItemTypeEnum.Food));
    else
      orangeResource.amount += amount;

    var strawberryResource = this.globalVar.resources.find(item => item.name === "Strawberries");
    if (strawberryResource === null || strawberryResource === undefined)
      this.globalVar.resources.push(new ResourceValue("Strawberries", amount, ShopItemTypeEnum.Food));
    else
      strawberryResource.amount += amount;

    var carrotResource = this.globalVar.resources.find(item => item.name === "Carrots");
    if (carrotResource === null || carrotResource === undefined)
      this.globalVar.resources.push(new ResourceValue("Carrots", amount, ShopItemTypeEnum.Food));
    else
      carrotResource.amount += amount;

    var turnipResource = this.globalVar.resources.find(item => item.name === "Turnips");
    if (turnipResource === null || turnipResource === undefined)
      this.globalVar.resources.push(new ResourceValue("Turnips", amount, ShopItemTypeEnum.Food));
    else
      turnipResource.amount += amount;
  }

  GenerateCircuitRacesForRank(circuitRank: string): void {
    this.globalVar.circuitRaces = [];
    var i = this.utilityService.getNumericValueOfCircuitRank(circuitRank);
    var raceIndex = 1;
    var timeToComplete = 60;
    var legLengthCutoff = timeToComplete / 4; //a leg cannot be any shorter than this as a percentage

    var baseMeters = 100;
    var factor = 1.125;
    var additiveValue = 80 * i;

    var maxRandomFactor = 1.1;
    var minRandomFactor = 0.9;

    var legMinimumDistance = 20; //as a percentage of 100
    var legMaximumDistance = 80; //as a percentage of 100

    if (this.utilityService.getNumericValueOfCircuitRank(circuitRank) >= 53) //traits unlocked
      baseMeters = 110;
    if (this.utilityService.getNumericValueOfCircuitRank(circuitRank) >= 53) //talents unlocked
      baseMeters = 125;
    if (this.utilityService.getNumericValueOfCircuitRank(circuitRank) >= 79) //orbs unlocked
      baseMeters = 150;

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
        additiveValue = -37;

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

        leg.distance = Math.round((baseMeters * (factor ** i) + additiveValue));
        raceLegs.push(leg);
      }
      else if (i <= 14) {
        if (i === 3)
          additiveValue = 5 * i;
        else
          additiveValue = 35 * i;

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

        if (i === 15)
          additiveValue = 50 * i;
        else if (i === 16)
          additiveValue = 60 * i;

        var availableCourses: RaceCourseTypeEnum[] = [];
        if (i <= 43) {
          availableCourses.push(RaceCourseTypeEnum.Flatland);
          availableCourses.push(RaceCourseTypeEnum.Mountain);
          availableCourses.push(RaceCourseTypeEnum.Ocean);
        }
        else if (i <= 51) {
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
          leg1.terrain = this.getRandomTerrain(leg1.courseType, seedValue + "tl1d");
          raceLegs.push(leg1);
        }

        if (leg2Normalized > 0) {
          var leg2 = new RaceLeg();
          leg2.courseType = randomizedCourseList[1];
          leg2.distance = ((Math.round(baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue + "l2r")) * (leg2Normalized / timeToComplete));
          leg2.terrain = this.getRandomTerrain(leg2.courseType, seedValue + "tl2d");
          raceLegs.push(leg2);
        }

        if (leg3Normalized > 0) {
          var leg3 = new RaceLeg();
          leg3.courseType = randomizedCourseList[2];
          leg3.distance = ((Math.round(baseMeters * (factor ** i) + additiveValue) * this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor, seedValue + "l3r")) * (leg3Normalized / timeToComplete));
          leg3.terrain = this.getRandomTerrain(leg3.courseType, seedValue + "tl3d");
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

      this.globalVar.circuitRaces.push(new Race(raceLegs, circuitRank, true, raceIndex, totalDistance, timeToComplete, this.GenerateCircuitRaceRewards(circuitRank), undefined, undefined, RaceTypeEnum.circuit));

      raceIndex += 1;
    }
  }

  reorganizeLegsByDeckOrder(raceLegs: RaceLeg[], selectedDeck: AnimalDeck) {
    if (!selectedDeck.isCourseOrderActive)
      return raceLegs;

    return raceLegs.sort((a, b) => selectedDeck.courseTypeOrder.indexOf(a.courseType) - selectedDeck.courseTypeOrder.indexOf(b.courseType));
  }

  reorganizeAnimalsByDeckOrder(animals: Animal[], selectedDeck: AnimalDeck) {
    if (!selectedDeck.isCourseOrderActive)
      return animals;

    return animals.sort((a, b) => selectedDeck.courseTypeOrder.indexOf(a.raceCourseType) - selectedDeck.courseTypeOrder.indexOf(b.raceCourseType));
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

  getRandomTerrain(raceCourseType: RaceCourseTypeEnum, seed?: string, pinnacleConditions?: PinnacleConditions) {
    var availableTerrainsList: TerrainTypeEnum[] = [];

    if (pinnacleConditions !== undefined &&
      pinnacleConditions.containsCondition(MediumPinnacleConditionsEnum[MediumPinnacleConditionsEnum.harshTerrain])) {      
      if (raceCourseType === RaceCourseTypeEnum.Flatland || raceCourseType === RaceCourseTypeEnum.Mountain) {
        return new Terrain(TerrainTypeEnum.Snowfall);
      }
      if (raceCourseType === RaceCourseTypeEnum.Volcanic) {
        return new Terrain(TerrainTypeEnum.Ashfall);
      }
      if (raceCourseType === RaceCourseTypeEnum.Tundra) {
        return new Terrain(TerrainTypeEnum.Hailstorm);
      }
      if (raceCourseType === RaceCourseTypeEnum.Ocean) {
        return new Terrain(TerrainTypeEnum.Maelstrom);
      }
    }

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

  getRandomOrbListOrder(orbList: OrbTypeEnum[], seedValue: string = "seeded") {
    var randomizedList: OrbTypeEnum[] = [];
    var length = orbList.length;
    for (var i = 0; i < length; i++) {
      var rng = this.utilityService.getRandomSeededInteger(1, orbList.length, seedValue);
      randomizedList.push(orbList[rng - 1]);
      orbList = orbList.filter(item => item !== orbList[rng - 1]);
    }

    return randomizedList;
  }

  getAnimalStatLossFromExhaustionEventRace(animal: Animal) {
    if (this.globalVar.eventRaceData.animalData === null || this.globalVar.eventRaceData.animalData === undefined ||
      this.globalVar.eventRaceData.animalData.length === 0)
      return 0;

    var associatedAnimalData = this.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return 0;

    var exhaustionLevel = associatedAnimalData.exhaustionStatReduction;

    return exhaustionLevel;
  }

  getRandomGrandPrixWeatherCluster(seed?: string, previousWeather?: WeatherEnum) {
    var availableClusterList: WeatherEnum[] = [];

    availableClusterList.push(WeatherEnum.clearSkies);
    availableClusterList.push(WeatherEnum.coldSpell);
    availableClusterList.push(WeatherEnum.inclementWeather);

    var rng = 0;
    if (seed !== null && seed !== undefined)
      rng = this.utilityService.getRandomSeededInteger(1, availableClusterList.length, seed);
    else
      rng = this.utilityService.getRandomInteger(1, availableClusterList.length);

    var selectedWeather = availableClusterList[rng - 1];

    if (this.globalVar.eventRaceData.animalData.length > 0) {
      var weatherMoraleBoostModifierValue = .2;
      var weatherMoraleBoostModifier = this.globalVar.modifiers.find(item => item.text === "weatherMoraleBoostModifier");
      if (weatherMoraleBoostModifier !== undefined)
        weatherMoraleBoostModifierValue = weatherMoraleBoostModifier.value;


      this.globalVar.eventRaceData.animalData.forEach(animal => {
        var globalAnimal = this.globalVar.animals.find(item => item.type === animal.associatedAnimalType);
        if (globalAnimal !== undefined) {
          if (previousWeather !== undefined) {
            if (this.animalGainsMoraleBoostFromWeather(globalAnimal.raceCourseType, previousWeather)) {
              this.changeGrandPrixMorale(globalAnimal.type, -weatherMoraleBoostModifierValue);
            }
          }

          if (this.animalGainsMoraleBoostFromWeather(globalAnimal.raceCourseType, selectedWeather)) {
            this.changeGrandPrixMorale(globalAnimal.type, weatherMoraleBoostModifierValue);
          }
        }
      });
    }

    return selectedWeather;
  }

  changeGrandPrixMorale(type: AnimalTypeEnum, change: number) {
    if (this.globalVar.eventRaceData === undefined || this.globalVar.eventRaceData === null ||
      this.globalVar.eventRaceData.animalData === undefined || this.globalVar.eventRaceData.animalData === null ||
      this.globalVar.eventRaceData.animalData.length === 0)
      return;

    var affectedAnimalData = this.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === type);
    if (affectedAnimalData === null || affectedAnimalData === undefined)
      return;

    affectedAnimalData.morale += change;

    if (affectedAnimalData.morale >= 3)
      affectedAnimalData.morale = 3;

    if (affectedAnimalData.morale <= .5)
      affectedAnimalData.morale = .5;
  }

  animalGainsMoraleBoostFromWeather(type: RaceCourseTypeEnum, weather: WeatherEnum) {
    var gainsMoraleBoost = false;

    if (weather === WeatherEnum.clearSkies && (type === RaceCourseTypeEnum.Volcanic || type === RaceCourseTypeEnum.Flatland))
      gainsMoraleBoost = true;
    else if (weather === WeatherEnum.inclementWeather && type === RaceCourseTypeEnum.Ocean)
      gainsMoraleBoost = true;
    else if (weather === WeatherEnum.coldSpell && (type === RaceCourseTypeEnum.Tundra || type === RaceCourseTypeEnum.Mountain))
      gainsMoraleBoost = true;

    return gainsMoraleBoost;
  }

  getRandomGrandPrixTerrainFromWeatherCluster(weather: WeatherEnum, animalCourseType: RaceCourseTypeEnum, seed?: string) {
    var availableTerrainsList: TerrainTypeEnum[] = [];

    if (weather === WeatherEnum.clearSkies) {
      availableTerrainsList.push(TerrainTypeEnum.Sunny);
      availableTerrainsList.push(TerrainTypeEnum.Torrid);
      availableTerrainsList.push(TerrainTypeEnum.Ashfall);
    }
    else if (weather === WeatherEnum.coldSpell) {
      availableTerrainsList.push(TerrainTypeEnum.Snowfall);
      availableTerrainsList.push(TerrainTypeEnum.Hailstorm);
      availableTerrainsList.push(TerrainTypeEnum.Sunny);
    }
    else if (weather === WeatherEnum.inclementWeather) {
      availableTerrainsList.push(TerrainTypeEnum.Rainy);
      availableTerrainsList.push(TerrainTypeEnum.Stormy);
      availableTerrainsList.push(TerrainTypeEnum.Maelstrom);
      availableTerrainsList.push(TerrainTypeEnum.Hailstorm);
    }

    if (animalCourseType === RaceCourseTypeEnum.Flatland) {
      availableTerrainsList = availableTerrainsList.filter(item => item !== TerrainTypeEnum.Ashfall && item !== TerrainTypeEnum.Hailstorm && item !== TerrainTypeEnum.Maelstrom);
    }
    if (animalCourseType === RaceCourseTypeEnum.Mountain) {
      availableTerrainsList = availableTerrainsList.filter(item => item !== TerrainTypeEnum.Ashfall && item !== TerrainTypeEnum.Hailstorm && item !== TerrainTypeEnum.Maelstrom);
    }
    if (animalCourseType === RaceCourseTypeEnum.Ocean) {
      availableTerrainsList = availableTerrainsList.filter(item => item !== TerrainTypeEnum.Ashfall && item !== TerrainTypeEnum.Hailstorm && item !== TerrainTypeEnum.Rainy && item !== TerrainTypeEnum.Torrid);
    }
    if (animalCourseType === RaceCourseTypeEnum.Tundra) {
      availableTerrainsList = availableTerrainsList.filter(item => item !== TerrainTypeEnum.Ashfall && item !== TerrainTypeEnum.Rainy && item !== TerrainTypeEnum.Maelstrom && item !== TerrainTypeEnum.Torrid);
    }
    if (animalCourseType === RaceCourseTypeEnum.Volcanic) {
      availableTerrainsList = availableTerrainsList.filter(item => item !== TerrainTypeEnum.Snowfall && item !== TerrainTypeEnum.Hailstorm && item !== TerrainTypeEnum.Maelstrom);
    }

    var rng = 0;
    if (seed !== null && seed !== undefined)
      rng = this.utilityService.getRandomSeededInteger(1, availableTerrainsList.length, seed);
    else
      rng = this.utilityService.getRandomInteger(1, availableTerrainsList.length);

    return new Terrain(availableTerrainsList[rng - 1]);
  }

  stopGrandPrixRace() {
    if (this.globalVar.eventRaceData !== null && this.globalVar.eventRaceData !== undefined) {
      this.globalVar.eventRaceData.animalData.forEach(item => {
        item.isCurrentlyRacing = false;
        item.isSetToRelay = false;
      });

      this.globalVar.eventRaceData.isLoading = false;
      this.globalVar.eventRaceData.animalAlreadyPrepped = false;
      this.globalVar.eventRaceData.isRunning = false;
      this.globalVar.eventRaceData.isCatchingUp = false;
      this.globalVar.eventRaceData.overallTimeCounter -= this.globalVar.eventRaceData.segmentTimeCounter;
      this.globalVar.eventRaceData.segmentTimeCounter = 0;
      if (this.globalVar.eventRaceData.currentRaceSegment !== undefined)
        this.globalVar.eventRaceData.currentRaceSegment.reduceExportSize();
    }
  }

  unlockTier2ShopItems() {
    //unlock incubator upgrade from shop
    var specialtyShop = this.globalVar.shop.find(item => item.name === "Specialty");
    if (specialtyShop !== null && specialtyShop !== undefined) {
      var incubatorUpgrade = specialtyShop.itemList.find(item => item.name === "Incubator Upgrade Lv1");
      if (incubatorUpgrade !== null && incubatorUpgrade !== undefined)
        incubatorUpgrade.isAvailable = true;

      var nationalRaces = specialtyShop.itemList.find(item => item.name === "National Races");
      if (nationalRaces !== null && nationalRaces !== undefined)
        nationalRaces.isAvailable = true;

      var scouts = specialtyShop.itemList.find(item => item.name === "Scouts");
      if (scouts !== null && scouts !== undefined)
        scouts.isAvailable = true;

      var courseMaps = specialtyShop.itemList.find(item => item.name === "Course Maps");
      if (courseMaps !== null && courseMaps !== undefined)
        courseMaps.isAvailable = true;
    }

    var equipmentShop = this.globalVar.shop.find(item => item.name === "Equipment");
    if (equipmentShop !== null && equipmentShop !== undefined) {
      var redBaton = equipmentShop.itemList.find(item => item.name === "Red Baton");
      if (redBaton !== null && redBaton !== undefined)
        redBaton.isAvailable = true;

      var orangeBaton = equipmentShop.itemList.find(item => item.name === "Orange Baton");
      if (orangeBaton !== null && orangeBaton !== undefined)
        orangeBaton.isAvailable = true;

      var greenBaton = equipmentShop.itemList.find(item => item.name === "Green Baton");
      if (greenBaton !== null && greenBaton !== undefined)
        greenBaton.isAvailable = true;

      var yellowBaton = equipmentShop.itemList.find(item => item.name === "Yellow Baton");
      if (yellowBaton !== null && yellowBaton !== undefined)
        yellowBaton.isAvailable = true;

      var blueBaton = equipmentShop.itemList.find(item => item.name === "Blue Baton");
      if (blueBaton !== null && blueBaton !== undefined)
        blueBaton.isAvailable = true;

      var violetBaton = equipmentShop.itemList.find(item => item.name === "Violet Baton");
      if (violetBaton !== null && violetBaton !== undefined)
        violetBaton.isAvailable = true;
    }

    var foodShop = this.globalVar.shop.find(item => item.name === "Food");
    if (foodShop !== null && foodShop !== undefined) {
      var gingkoLeaves = foodShop.itemList.find(item => item.name === "Gingko Leaves");
      if (gingkoLeaves !== null && gingkoLeaves !== undefined)
        gingkoLeaves.isAvailable = true;
    }
  }

  lockTier2ShopItems() {
    //unlock incubator upgrade from shop
    var specialtyShop = this.globalVar.shop.find(item => item.name === "Specialty");
    if (specialtyShop !== null && specialtyShop !== undefined) {
      var incubatorUpgrade = specialtyShop.itemList.find(item => item.name === "Incubator Upgrade Lv1");
      if (incubatorUpgrade !== null && incubatorUpgrade !== undefined)
        incubatorUpgrade.isAvailable = false;

      var nationalRaces = specialtyShop.itemList.find(item => item.name === "National Races");
      if (nationalRaces !== null && nationalRaces !== undefined)
        nationalRaces.isAvailable = false;

      var scouts = specialtyShop.itemList.find(item => item.name === "Scouts");
      if (scouts !== null && scouts !== undefined)
        scouts.isAvailable = false;

      var courseMaps = specialtyShop.itemList.find(item => item.name === "Course Maps");
      if (courseMaps !== null && courseMaps !== undefined)
        courseMaps.isAvailable = false;
    }

    var equipmentShop = this.globalVar.shop.find(item => item.name === "Equipment");
    if (equipmentShop !== null && equipmentShop !== undefined) {
      var redBaton = equipmentShop.itemList.find(item => item.name === "Red Baton");
      if (redBaton !== null && redBaton !== undefined)
        redBaton.isAvailable = false;

      var orangeBaton = equipmentShop.itemList.find(item => item.name === "Orange Baton");
      if (orangeBaton !== null && orangeBaton !== undefined)
        orangeBaton.isAvailable = false;

      var greenBaton = equipmentShop.itemList.find(item => item.name === "Green Baton");
      if (greenBaton !== null && greenBaton !== undefined)
        greenBaton.isAvailable = false;

      var yellowBaton = equipmentShop.itemList.find(item => item.name === "Yellow Baton");
      if (yellowBaton !== null && yellowBaton !== undefined)
        yellowBaton.isAvailable = false;

      var blueBaton = equipmentShop.itemList.find(item => item.name === "Blue Baton");
      if (blueBaton !== null && blueBaton !== undefined)
        blueBaton.isAvailable = false;

      var violetBaton = equipmentShop.itemList.find(item => item.name === "Violet Baton");
      if (violetBaton !== null && violetBaton !== undefined)
        violetBaton.isAvailable = false;
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
    var CoinsFactor = 1.0135;
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
    var CoinsFactor = 1.013;
    var baseCoins = 10;

    var baseRenown = 1.01;
    var renownFactor = 1.015;

    var rewards: ResourceValue[] = [];

    var currentRenownResource = this.globalVar.resources.find(item => item.name === "Renown");
    var currentRenown = 1;

    if (currentRenownResource !== undefined)
      currentRenown = currentRenownResource.amount;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));

    return rewards;
  }

  GenerateMonoRaceRewards(monoRank: string): ResourceValue[] {
    var rewards: ResourceValue[] = [];
    rewards.push(new ResourceValue("Facility Level", 1, ShopItemTypeEnum.Progression));

    var numericRank = this.GetCircuitRankValue(monoRank);
    var CoinsFactor = 1.0135;
    var baseCoins = 60;

    var baseRenown = 1.1;
    var renownFactor = 1.03;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));

    return rewards;
  }

  GenerateDuoRaceRewards(duoRank: string): ResourceValue[] {
    var rewards: ResourceValue[] = [];
    rewards.push(new ResourceValue("Research Level", 1, ShopItemTypeEnum.Progression));

    var numericRank = this.GetCircuitRankValue(duoRank);
    var CoinsFactor = 1.0135;
    var baseCoins = 125;

    var baseRenown = 1.1;
    var renownFactor = 1.03;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));

    return rewards;
  }

  GenerateRainbowRaceRewards(rainbowRank: string): ResourceValue[] {
    var rewards: ResourceValue[] = [];
    rewards.push(new ResourceValue("Talent Points", 1, ShopItemTypeEnum.Progression));

    var numericRank = this.GetCircuitRankValue(rainbowRank);
    var CoinsFactor = 1.012;
    var baseCoins = 250;

    var baseRenown = 1.1;
    var renownFactor = 1.03;

    rewards.push(new ResourceValue("Coins", Math.round(baseCoins * (CoinsFactor ** numericRank))));
    rewards.push(new ResourceValue("Renown", parseFloat(((baseRenown * (renownFactor ** numericRank)) / 100).toFixed(3))));

    return rewards;
  }

  GenerateLocalRaces(): void {
    this.GenerateMonoRaces(this.globalVar.monoRank);
    this.GenerateDuoRaces(this.globalVar.duoRank);
    this.GenerateRainbowRaces(this.globalVar.rainbowRank);
    this.GeneratePinnacleRaces(this.globalVar.pinnacleFloor);
  }

  GenerateMonoRaces(monoRank: string): void {
    var i = this.utilityService.getNumericValueOfCircuitRank(monoRank);
    this.globalVar.localRaces = this.globalVar.localRaces.filter(item => item.localRaceType !== LocalRaceTypeEnum.Mono);

    if (i >= this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank))
      return;

    var raceIndex = 1;
    var timeToComplete = 90;

    var baseMeters = 155;
    var factor = 1.145;
    var additiveValue = 100 * i;

    var maxRandomFactor = 1.1;
    var minRandomFactor = 0.9;

    var raceLegs: RaceLeg[] = [];

    var leg = new RaceLeg();
    if (i === 1)
      leg.courseType = RaceCourseTypeEnum.Flatland;
    else {
      var availableCourses: RaceCourseTypeEnum[] = [];
      if (i < 14) {
        availableCourses.push(RaceCourseTypeEnum.Flatland);
        availableCourses.push(RaceCourseTypeEnum.Mountain);
      }
      else if (i < 40) {
        availableCourses.push(RaceCourseTypeEnum.Flatland);
        availableCourses.push(RaceCourseTypeEnum.Mountain);
        availableCourses.push(RaceCourseTypeEnum.Ocean);
      }
      else if (i < 50) {
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

    this.globalVar.localRaces.push(new Race(raceLegs, monoRank, false, raceIndex, totalDistance, timeToComplete, this.GenerateMonoRaceRewards(monoRank), LocalRaceTypeEnum.Mono, undefined, RaceTypeEnum.special));
    raceIndex += 1;
  }

  GenerateDuoRaces(duoRank: string): void {
    var i = this.utilityService.getNumericValueOfCircuitRank(duoRank);
    this.globalVar.localRaces = this.globalVar.localRaces.filter(item => item.localRaceType !== LocalRaceTypeEnum.Duo);

    if (i >= this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank))
      return;

    var raceIndex = 1;
    var timeToComplete = 80;

    var baseMeters = 6500;
    var factor = 1.14;

    var maxRandomFactor = 1.2;
    var minRandomFactor = 0.8;
    var raceLegs: RaceLeg[] = [];

    var availableCourses: RaceCourseTypeEnum[] = [];
    if (i <= 10) {
      availableCourses.push(RaceCourseTypeEnum.Flatland);
      availableCourses.push(RaceCourseTypeEnum.Mountain);
      availableCourses.push(RaceCourseTypeEnum.Ocean);
    }
    else if (i <= 20) {
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

    var randomizedCourseList = this.getCourseTypeInRandomOrderSeeded(availableCourses, 'duooseed' + duoRank + i);

    var randomFactor = this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor);
    var leg1 = new RaceLeg();
    leg1.courseType = randomizedCourseList[0];
    leg1.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) * .5));
    leg1.terrain = this.getRandomTerrain(leg1.courseType, 'duoseedl1' + duoRank + i);
    raceLegs.push(leg1);

    var leg2 = new RaceLeg();
    leg2.courseType = randomizedCourseList[1];
    leg2.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) * .5));
    leg2.terrain = this.getRandomTerrain(leg2.courseType, 'duoseedl2' + duoRank + i);
    raceLegs.push(leg2);

    var totalDistance = leg1.distance + leg2.distance;

    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
    });

    this.globalVar.localRaces.push(new Race(raceLegs, duoRank, false, raceIndex, totalDistance, timeToComplete, this.GenerateDuoRaceRewards(duoRank), LocalRaceTypeEnum.Duo, undefined, RaceTypeEnum.special));

    raceIndex += 1;
  }

  GenerateRainbowRaces(rainbowRank: string): void {
    var i = this.utilityService.getNumericValueOfCircuitRank(rainbowRank);
    this.globalVar.localRaces = this.globalVar.localRaces.filter(item => item.localRaceType !== LocalRaceTypeEnum.Rainbow);

    if (i >= this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank))
      return;

    var raceIndex = 1;
    var timeToComplete = 120;

    var baseMeters = 125000;
    var factor = 1.17;

    var maxRandomFactor = 1.2;
    var minRandomFactor = 0.8;
    var raceLegs: RaceLeg[] = [];

    var availableCourses: RaceCourseTypeEnum[] = [];
    availableCourses.push(RaceCourseTypeEnum.Flatland);
    availableCourses.push(RaceCourseTypeEnum.Mountain);
    availableCourses.push(RaceCourseTypeEnum.Ocean);
    availableCourses.push(RaceCourseTypeEnum.Tundra);
    availableCourses.push(RaceCourseTypeEnum.Volcanic);

    var randomizedCourseList = this.getCourseTypeInRandomOrderSeeded(availableCourses, 'rainbow' + rainbowRank + i);

    var randomFactor = this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor);
    var leg1 = new RaceLeg();
    leg1.courseType = randomizedCourseList[0];
    leg1.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) * .2));
    leg1.terrain = this.getRandomTerrain(leg1.courseType, 'rainbowl1' + rainbowRank + i);
    raceLegs.push(leg1);

    var leg2 = new RaceLeg();
    leg2.courseType = randomizedCourseList[1];
    leg2.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) * .2));
    leg2.terrain = this.getRandomTerrain(leg2.courseType, 'rainbowl2' + rainbowRank + i);
    raceLegs.push(leg2);

    var leg3 = new RaceLeg();
    leg3.courseType = randomizedCourseList[2];
    leg3.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) * .2));
    leg3.terrain = this.getRandomTerrain(leg3.courseType, 'rainbowl3' + rainbowRank + i);
    raceLegs.push(leg3);

    var leg4 = new RaceLeg();
    leg4.courseType = randomizedCourseList[3];
    leg4.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) * .2));
    leg4.terrain = this.getRandomTerrain(leg4.courseType, 'rainbowl4' + rainbowRank + i);
    raceLegs.push(leg4);

    var leg5 = new RaceLeg();
    leg5.courseType = randomizedCourseList[4];
    leg5.distance = (Math.round((baseMeters * (factor ** i) * randomFactor) * .2));
    leg5.terrain = this.getRandomTerrain(leg5.courseType, 'rainbowl5' + rainbowRank + i);
    raceLegs.push(leg5);

    var totalDistance = leg1.distance + leg2.distance + leg3.distance + leg4.distance + leg5.distance;

    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
    });

    this.globalVar.localRaces.push(new Race(raceLegs, rainbowRank, false, raceIndex, totalDistance, timeToComplete, this.GenerateRainbowRaceRewards(rainbowRank), LocalRaceTypeEnum.Rainbow, undefined, RaceTypeEnum.special));

    raceIndex += 1;
  }

  GeneratePinnacleRaces(pinnacleFloor: string): void {
    var i = this.utilityService.getNumericValueOfCircuitRank(pinnacleFloor);
    this.globalVar.localRaces = this.globalVar.localRaces.filter(item => item.localRaceType !== LocalRaceTypeEnum.Pinnacle);

    if (i >= this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank))
      return;

    var raceIndex = 1;
    var timeToComplete = 180;

    var baseMeters = 2750000;
    var factor = 1.17;
    var legLengthModifier = 1; //depending on condition, leg may need to shift in size

    //get condition
    var pinnacleCondition = this.getRandomPinnacleCondition(i, 'pinnaclel1' + pinnacleFloor + i);

    if (pinnacleCondition.containsCondition(EasyPinnacleConditionsEnum[EasyPinnacleConditionsEnum.threeHundredSecondRace])) {
      legLengthModifier = 1.75;
    }

    if (pinnacleCondition.containsCondition(MediumPinnacleConditionsEnum[MediumPinnacleConditionsEnum.thirtySecondRace])) {
      legLengthModifier = .25;
    }

    var maxRandomFactor = 1.2;
    var minRandomFactor = 0.8;
    var raceLegs: RaceLeg[] = [];
    var randomFactor = this.utilityService.getRandomSeededNumber(minRandomFactor, maxRandomFactor);

    var primaryDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (primaryDeck === undefined)
      return;

    var first4Animals = primaryDeck.selectedAnimals.slice(0, 4);

    if (pinnacleCondition.containsCondition(EasyPinnacleConditionsEnum[EasyPinnacleConditionsEnum.twoRacersOnly])) {
      first4Animals = primaryDeck.selectedAnimals.slice(0, 2);
    }
    if (pinnacleCondition.containsCondition(EasyPinnacleConditionsEnum[EasyPinnacleConditionsEnum.threeRacersOnly])) {
      first4Animals = primaryDeck.selectedAnimals.slice(0, 3);
    }


    var totalDistance = (Math.round((baseMeters * (factor ** i) * randomFactor * legLengthModifier)));

    for (var j = 0; j < first4Animals.length; j++) {
      var percentOfRace = 1 / first4Animals.length;

      var leg = new RaceLeg();
      leg.courseType = first4Animals[j].raceCourseType;
      leg.distance = percentOfRace * totalDistance;
      leg.terrain = this.getRandomTerrain(leg.courseType, 'pinnaclel' + pinnacleFloor + i + j, pinnacleCondition);
      raceLegs.push(leg);
    }

    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
    });

    //randomize list
    var orbList: OrbTypeEnum[] = [];
    orbList.push(OrbTypeEnum.amber);
    orbList.push(OrbTypeEnum.amethyst);
    orbList.push(OrbTypeEnum.ruby);
    orbList.push(OrbTypeEnum.emerald);
    orbList.push(OrbTypeEnum.sapphire);
    orbList.push(OrbTypeEnum.topaz);
    var randomizedList = this.getRandomOrbListOrder(orbList, 'pinnaclel1' + pinnacleFloor + i);
    var brazierDistanceCounter = 0;
    var objectList: DrawnRaceObject[] = [];
    randomizedList.forEach(item => {
      brazierDistanceCounter += 1;      
      var drawnObject = new DrawnRaceObject(this.getBrazierFromOrbType(item), totalDistance * (brazierDistanceCounter / (randomizedList.length + 1)));      
      objectList.push(drawnObject);
    });

    //console.log(objectList);

    var race = new Race(raceLegs, pinnacleFloor, false, raceIndex, totalDistance, timeToComplete, [], LocalRaceTypeEnum.Pinnacle, undefined, RaceTypeEnum.special, undefined, objectList);
    race.pinnacleConditions = pinnacleCondition;

    if (pinnacleCondition.containsCondition(EasyPinnacleConditionsEnum[EasyPinnacleConditionsEnum.threeHundredSecondRace])) {
      race.timeToComplete = 300;
    }

    if (pinnacleCondition.containsCondition(MediumPinnacleConditionsEnum[MediumPinnacleConditionsEnum.thirtySecondRace])) {
      race.timeToComplete = 30;
    }

    this.globalVar.localRaces.push(race);

    raceIndex += 1;
  }

  addToPinnacleHistory(newConditions: PinnacleConditions) {
    if (newConditions.easyConditions.length > 0) {
      newConditions.easyConditions.forEach(condition => {
        this.globalVar.pinnacleHistory.easyConditions.push(condition);
        if (this.globalVar.pinnacleHistory.easyConditions.length > 3) {
          this.globalVar.pinnacleHistory.easyConditions = this.globalVar.pinnacleHistory.easyConditions.filter(item => item !== this.globalVar.pinnacleHistory.easyConditions[0]);
        }
      });
    }

    if (newConditions.mediumConditions.length > 0) {
      newConditions.mediumConditions.forEach(condition => {
        this.globalVar.pinnacleHistory.mediumConditions.push(condition);
        if (this.globalVar.pinnacleHistory.mediumConditions.length > 3) {
          this.globalVar.pinnacleHistory.mediumConditions = this.globalVar.pinnacleHistory.mediumConditions.filter(item => item !== this.globalVar.pinnacleHistory.mediumConditions[0]);
        }
      });
    }

    if (newConditions.hardConditions.length > 0) {
      newConditions.hardConditions.forEach(condition => {
        this.globalVar.pinnacleHistory.hardConditions.push(condition);
        if (this.globalVar.pinnacleHistory.hardConditions.length > 3) {
          this.globalVar.pinnacleHistory.hardConditions = this.globalVar.pinnacleHistory.hardConditions.filter(item => item !== this.globalVar.pinnacleHistory.hardConditions[0]);
        }
      });
    }
  }

  getRandomPinnacleCondition(floor: number, seedValue: string = "seeded") {
    var pinnacleConditions = new PinnacleConditions();

    if (this.globalVar.currentPinnacleConditions !== undefined)
      return this.globalVar.currentPinnacleConditions;

    //console.log(floor);
    if (floor <= 10) {
      if (floor === 1)
        pinnacleConditions.easyConditions.push(EasyPinnacleConditionsEnum.threeRacersOnly);        
      if (floor === 2)
        pinnacleConditions.easyConditions.push(EasyPinnacleConditionsEnum.threeHundredSecondRace);
      if (floor === 3)
        pinnacleConditions.mediumConditions.push(MediumPinnacleConditionsEnum.brokenFloorboards);
      if (floor === 4)
        pinnacleConditions.mediumConditions.push(MediumPinnacleConditionsEnum.longCooldowns);
      if (floor === 5)
        pinnacleConditions.hardConditions.push(HardPinnacleConditionsEnum.noBurst);
      if (floor === 6)
        pinnacleConditions.easyConditions.push(EasyPinnacleConditionsEnum.noRelayEffects);
      if (floor === 7)
        pinnacleConditions.easyConditions.push(EasyPinnacleConditionsEnum.twoRacersOnly);
      if (floor === 8)
        pinnacleConditions.mediumConditions.push(MediumPinnacleConditionsEnum.thirtySecondRace);
      if (floor === 9)
        pinnacleConditions.mediumConditions.push(MediumPinnacleConditionsEnum.sticky);
      if (floor === 10)
        pinnacleConditions.hardConditions.push(HardPinnacleConditionsEnum.exhaustionPenaltyIncreased);

      this.globalVar.currentPinnacleConditions = pinnacleConditions;
      this.addToPinnacleHistory(pinnacleConditions);      
      return pinnacleConditions;
    }

    var mod5 = floor % 5;

    if (mod5 === 1 || mod5 === 2) //easy floor
    {
      var allEasyConditions = this.getAllEasyPinnacleConditions();
      var rng = this.utilityService.getRandomSeededInteger(1, allEasyConditions.length - 1, seedValue);
      pinnacleConditions.easyConditions.push(allEasyConditions[rng]);
    }
    else if (mod5 === 3 || mod5 === 4) //medium floor
    {
      var allMediumConditions = this.getAllMediumPinnacleConditions();
      var rng = this.utilityService.getRandomSeededInteger(1, allMediumConditions.length - 1, seedValue);
      pinnacleConditions.mediumConditions.push(allMediumConditions[rng]);
    }
    else if (mod5 === 0) //hard floor
    {
      var allHardConditions = this.getAllHardPinnacleConditions();
      var rng = this.utilityService.getRandomSeededInteger(1, allHardConditions.length - 1, seedValue);
      pinnacleConditions.hardConditions.push(allHardConditions[rng]);
    }

    //start having 2 easy conditions at once
    if (floor >= 15) {
      if (mod5 === 1 || mod5 === 2) {
        var allEasyConditions = this.getAllEasyPinnacleConditions(pinnacleConditions);
        var rng = this.utilityService.getRandomSeededInteger(1, allEasyConditions.length - 1, seedValue);
        pinnacleConditions.easyConditions.push(allEasyConditions[rng]);
      }
    }

    //add easy condition to medium floors
    if (floor >= 20) {
      if (mod5 === 3 || mod5 === 4) {
        var allEasyConditions = this.getAllEasyPinnacleConditions(pinnacleConditions);
        var rng = this.utilityService.getRandomSeededInteger(1, allEasyConditions.length - 1, seedValue);
        pinnacleConditions.easyConditions.push(allEasyConditions[rng]);
      }
    }

    //add easy condition to hard floors
    if (floor >= 24) {
      if (mod5 === 0) {
        var allEasyConditions = this.getAllEasyPinnacleConditions(pinnacleConditions);
        var rng = this.utilityService.getRandomSeededInteger(1, allEasyConditions.length - 1, seedValue);
        pinnacleConditions.easyConditions.push(allEasyConditions[rng]);
      }
    }

    //add medium condition to hard floors
    if (floor >= 53) {
      if (mod5 === 0) {
        var allMediumConditions = this.getAllMediumPinnacleConditions(pinnacleConditions);
        var rng = this.utilityService.getRandomSeededInteger(1, allMediumConditions.length - 1, seedValue);
        pinnacleConditions.mediumConditions.push(allMediumConditions[rng]);
      }
    }

    this.globalVar.currentPinnacleConditions = pinnacleConditions;
    this.addToPinnacleHistory(pinnacleConditions);
    return pinnacleConditions;
  }

  getAllEasyPinnacleConditions(existingList?: PinnacleConditions) {
    var list: EasyPinnacleConditionsEnum[] = [];

    list.push(EasyPinnacleConditionsEnum.noRelayEffects);
    list.push(EasyPinnacleConditionsEnum.steamy);
    list.push(EasyPinnacleConditionsEnum.threeHundredSecondRace);
    list.push(EasyPinnacleConditionsEnum.threeRacersOnly);
    list.push(EasyPinnacleConditionsEnum.twoRacersOnly);
    list.push(EasyPinnacleConditionsEnum.burstIncreaseStaminaLoss);
    list.push(EasyPinnacleConditionsEnum.cold);
    list.push(EasyPinnacleConditionsEnum.hot);
    list.push(EasyPinnacleConditionsEnum.slick);
    list.push(EasyPinnacleConditionsEnum.strongWinds);

    this.globalVar.pinnacleHistory.easyConditions.forEach(condition => {
      list = list.filter(item => item !== condition);
    });

    if (existingList !== undefined) {
      existingList.easyConditions.forEach(condition => {
        list = list.filter(item => item !== condition);
      });

      if (existingList.easyConditions.some(condition => condition === EasyPinnacleConditionsEnum.twoRacersOnly))
        list = list.filter(item => item !== EasyPinnacleConditionsEnum.threeRacersOnly);

      if (existingList.easyConditions.some(condition => condition === EasyPinnacleConditionsEnum.threeRacersOnly))
        list = list.filter(item => item !== EasyPinnacleConditionsEnum.twoRacersOnly);

      if (existingList.mediumConditions.some(condition => condition === MediumPinnacleConditionsEnum.fourRacersOnly))
        list = list.filter(item => item !== EasyPinnacleConditionsEnum.threeRacersOnly && item !== EasyPinnacleConditionsEnum.twoRacersOnly);

        if (existingList.mediumConditions.some(condition => condition === MediumPinnacleConditionsEnum.thirtySecondRace))
        list = list.filter(item => item !== EasyPinnacleConditionsEnum.threeHundredSecondRace);

        if (existingList.hardConditions.some(condition => condition === HardPinnacleConditionsEnum.noBurst))
        list = list.filter(item => item !== EasyPinnacleConditionsEnum.burstIncreaseStaminaLoss);
    }

    return list;
  }

  getAllMediumPinnacleConditions(existingList?: PinnacleConditions) {
    var list: MediumPinnacleConditionsEnum[] = [];

    list.push(MediumPinnacleConditionsEnum.brokenFloorboards);
    list.push(MediumPinnacleConditionsEnum.fourRacersOnly);
    list.push(MediumPinnacleConditionsEnum.longCooldowns);
    list.push(MediumPinnacleConditionsEnum.sticky);
    list.push(MediumPinnacleConditionsEnum.thirtySecondRace);
    list.push(MediumPinnacleConditionsEnum.harshTerrain);
    list.push(MediumPinnacleConditionsEnum.highSpeedLowAcceleration);
    list.push(MediumPinnacleConditionsEnum.unfocused);

    this.globalVar.pinnacleHistory.mediumConditions.forEach(condition => {
      list = list.filter(item => item !== condition);
    });

    if (existingList !== undefined) {
      existingList.mediumConditions.forEach(condition => {
        list = list.filter(item => item !== condition);
      });

      if (existingList.easyConditions.some(condition => condition === EasyPinnacleConditionsEnum.twoRacersOnly || condition === EasyPinnacleConditionsEnum.threeRacersOnly))
      list = list.filter(item => item !== MediumPinnacleConditionsEnum.fourRacersOnly);

      if (existingList.easyConditions.some(condition => condition === EasyPinnacleConditionsEnum.threeHundredSecondRace))
      list = list.filter(item => item !== MediumPinnacleConditionsEnum.thirtySecondRace);
    }

    return list;
  }

  getAllHardPinnacleConditions(existingList?: PinnacleConditions) {
    var list: HardPinnacleConditionsEnum[] = [];

    list.push(HardPinnacleConditionsEnum.exhaustionPenaltyIncreased);
    list.push(HardPinnacleConditionsEnum.lowStaminaRelay);
    list.push(HardPinnacleConditionsEnum.noBurst);
    list.push(HardPinnacleConditionsEnum.reduceSpeedOnRelay);
    list.push(HardPinnacleConditionsEnum.reduceAbilityEfficiency);

    this.globalVar.pinnacleHistory.hardConditions.forEach(condition => {
      list = list.filter(item => item !== condition);
    });

    if (existingList !== undefined) {
      existingList.hardConditions.forEach(condition => {
        list = list.filter(item => item !== condition);
      });
    }

    return list;
  }

  getPinnacleFloorConditionDescription(conditionList: PinnacleConditions) {
    var description = "";
    if (conditionList.easyConditions.length > 0) {
      conditionList.easyConditions.forEach(item => {
        if (item === EasyPinnacleConditionsEnum.noRelayEffects)
          description += "<strong>Dark</strong> - No relay effects <br/>";
        if (item === EasyPinnacleConditionsEnum.steamy)
          description += "<strong>Steamy</strong> - Stamina Loss increased by 100%<br/>";
        if (item === EasyPinnacleConditionsEnum.threeHundredSecondRace)
          description += "<strong>Maze</strong> - Race timer increased to 300 seconds<br/>";
        if (item === EasyPinnacleConditionsEnum.threeRacersOnly)
          description += "<strong>Trios</strong> - 3 racers only<br/>";
        if (item === EasyPinnacleConditionsEnum.twoRacersOnly)
          description += "<strong>Duos</strong> - 2 racers only<br/>";
        //if (item === EasyPinnacleConditionsEnum.pathStatLoss)
        //description = "When entering a new path, reduce a random stat by 25% during that path";
        if (item === EasyPinnacleConditionsEnum.slick)
          description += "<strong>Slick</strong> - Flatland, Mountain, and Volcanic Adaptability Distance reduced by 50%<br/>";
        if (item === EasyPinnacleConditionsEnum.strongWinds)
          description += "<strong>Strong Winds</strong> - Ocean and Tundra Acceleration Rate reduced by 50%<br/>";
        if (item === EasyPinnacleConditionsEnum.cold)
          description += "<strong>Cold</strong> - Volcanic lava falls 25% slower, Tundra max drift is 30%<br/>";
        if (item === EasyPinnacleConditionsEnum.hot)
          description += "<strong>Hot</strong> - Volcanic lava falls 25% faster, Tundra max drift is 10%<br/>";
        if (item === EasyPinnacleConditionsEnum.burstIncreaseStaminaLoss)
          description += "<strong>Humid</strong> - Lose three times as much stamina while bursting<br/>";
      });
    }

    if (conditionList.mediumConditions.length > 0) {
      conditionList.mediumConditions.forEach(item => {
        if (item === MediumPinnacleConditionsEnum.fourRacersOnly)
          description += "<strong>Quartet</strong> - 4 racers only";
        if (item === MediumPinnacleConditionsEnum.brokenFloorboards)
          description += "<strong>Broken Floorboards</strong> - Every path has an adaptability check";
        if (item === MediumPinnacleConditionsEnum.longCooldowns)
          description += "<strong>Unusual Aroma</strong> - Ability cooldowns are twice as long";
        if (item === MediumPinnacleConditionsEnum.sticky)
          description += "<strong>Sticky</strong> - Acceleration reduces as you go further in the race";
        if (item === MediumPinnacleConditionsEnum.thirtySecondRace)
          description += "<strong>Lockdown</strong> - Race timer reduced to 30 seconds";
        if (item === MediumPinnacleConditionsEnum.harshTerrain)
          description += "<strong>Harsh Terrain</strong> - Terrain is always Maelstrom, Snowfall, Hailstorm, or Ashfall";
        if (item === MediumPinnacleConditionsEnum.highSpeedLowAcceleration)
          description += "<strong>Straight Shot</strong> - Acceleration Rate reduced to 10%, Max Speed increased to 500%";
        if (item === MediumPinnacleConditionsEnum.unfocused)
          description += "<strong>Distracting</strong> - After losing focus, reduce Focus Distance by 25% for the rest of the race";
      });
    }

    if (conditionList.hardConditions.length > 0) {
      conditionList.hardConditions.forEach(item => {
        if (item === HardPinnacleConditionsEnum.exhaustionPenaltyIncreased)
          description += "<strong>Low Energy</strong> - Stamina starts at 50%, stat loss from running out of stamina doubled";
        if (item === HardPinnacleConditionsEnum.lowStaminaRelay)
          description += "<strong>Trudging</strong> - When your racer reaches 50% stamina, immediately relay or end the race if there are no animals remaining";
        if (item === HardPinnacleConditionsEnum.noBurst)
          description += "<strong>Shifting Corridors</strong> - No bursts";
        if (item === HardPinnacleConditionsEnum.reduceSpeedOnRelay)
          description += "<strong>Quicksand</strong> - On Relay, reduce your next racer's max speed by 20%. Every subsequent Relay reduces by an additional 20%.";
        if (item === HardPinnacleConditionsEnum.reduceAbilityEfficiency)
          description += "<strong>Tight Quarters</strong> - Ability efficiency reduced by 99%";
      });
    }

    return description;
  }

  getBrazierFromOrbType(orbType: OrbTypeEnum) {
    if (orbType === OrbTypeEnum.amber)
      return DrawnRaceObjectEnum.amberBrazier;
    if (orbType === OrbTypeEnum.amethyst)
      return DrawnRaceObjectEnum.amethystBrazier;
    if (orbType === OrbTypeEnum.ruby)
      return DrawnRaceObjectEnum.rubyBrazier;
    if (orbType === OrbTypeEnum.topaz)
      return DrawnRaceObjectEnum.topazBrazier;
    if (orbType === OrbTypeEnum.emerald)
      return DrawnRaceObjectEnum.emeraldBrazier;
    if (orbType === OrbTypeEnum.sapphire)
      return DrawnRaceObjectEnum.sapphireBrazier;

    return undefined;
  }

  getOrbTypeFromBrazier(brazierType: DrawnRaceObjectEnum) {
    if (brazierType === DrawnRaceObjectEnum.amberBrazier)
      return OrbTypeEnum.amber;
    if (brazierType === DrawnRaceObjectEnum.amethystBrazier)
      return OrbTypeEnum.amethyst;
    if (brazierType === DrawnRaceObjectEnum.rubyBrazier)
      return OrbTypeEnum.ruby;
    if (brazierType === DrawnRaceObjectEnum.topazBrazier)
      return OrbTypeEnum.topaz;
    if (brazierType === DrawnRaceObjectEnum.emeraldBrazier)
      return OrbTypeEnum.emerald;
    if (brazierType === DrawnRaceObjectEnum.sapphireBrazier)
      return OrbTypeEnum.sapphire;

    return undefined;
  }

  getOrbTypeFromResource(resource: ResourceValue) {
    var orbType = OrbTypeEnum.none;

    if (resource.name === "Amber Orb")
      orbType = OrbTypeEnum.amber;
    if (resource.name === "Amethyst Orb")
      orbType = OrbTypeEnum.amethyst;
    if (resource.name === "Emerald Orb")
      orbType = OrbTypeEnum.emerald;
    if (resource.name === "Ruby Orb")
      orbType = OrbTypeEnum.ruby;
    if (resource.name === "Sapphire Orb")
      orbType = OrbTypeEnum.sapphire;
    if (resource.name === "Topaz Orb")
      orbType = OrbTypeEnum.topaz;

    return orbType;
  }

  getOrbDetailsFromType(type: OrbTypeEnum) {
    var orb: Orb | undefined;

    orb = this.globalVar.orbStats.allOrbs.find(item => item.type === type);

    return orb;
  }

  getOrbDescription(orbType: OrbTypeEnum) {
    var description = "";

    if (orbType === OrbTypeEnum.amber) {
      description = "Increase the Acceleration Rate of the user by " + ((this.globalVar.orbStats.getAccelerationIncrease(1) - 1) * 100).toFixed(0) + "%. Gain orb experience for every meter covered while below your max speed.";
    }
    if (orbType === OrbTypeEnum.amethyst) {
      description = "Increase the Power Efficiency of the user by " + ((this.globalVar.orbStats.getPowerIncrease(1) - 1) * 100).toFixed(0) + "%. Gain orb experience for every ability use.";
    }
    if (orbType === OrbTypeEnum.emerald) {
      description = "Increase the Adaptability Distance of the user by " + ((this.globalVar.orbStats.getAdaptabilityIncrease(1) - 1) * 100).toFixed(0) + "%. Gain orb experience for every meter covered during a special path without stumbling.";
    }
    if (orbType === OrbTypeEnum.ruby) {
      description = "Increase the Max Speed of the user by " + ((this.globalVar.orbStats.getMaxSpeedIncrease(1) - 1) * 100).toFixed(0) + "%.  Gain orb experience for every meter covered while at or above your max speed.";
    }
    if (orbType === OrbTypeEnum.sapphire) {
      description = "Increase the Focus Distance of the user by " + ((this.globalVar.orbStats.getFocusIncrease(1) - 1) * 100).toFixed(0) + "%.  Gain orb experience for every meter covered prior to losing focus.";
    }
    if (orbType === OrbTypeEnum.topaz) {
      description = "Increase the Stamina of the user by " + ((this.globalVar.orbStats.getEnduranceIncrease(1) - 1) * 100).toFixed(0) + "%.  Gain orb experience for every meter covered prior to running out of stamina.";
    }

    return description;
  }

  getOrbNameFromType(orbType: OrbTypeEnum) {
    var name = "";

    if (orbType === OrbTypeEnum.amber)
      return "Amber Orb";
    if (orbType === OrbTypeEnum.amethyst)
      return "Amethyst Orb";
    if (orbType === OrbTypeEnum.ruby)
      return "Ruby Orb";
    if (orbType === OrbTypeEnum.topaz)
      return "Topaz Orb";
    if (orbType === OrbTypeEnum.emerald)
      return "Emerald Orb";
    if (orbType === OrbTypeEnum.sapphire)
      return "Sapphire Orb";

    return name;
  }

  increaseOrbLevel(orb: Orb) {
    orb.level += 1;
    orb.xp -= orb.xpNeededForLevel;

    var baseXp = 10000;
    var factor = 1.09;
    var additive = 1500;

    orb.xpNeededForLevel = baseXp * (factor ** orb.level) + (additive * (orb.level - 1));
  }

  //pass in meters spent not at max speed
  increaseAmberOrbXp(meters: number) {
    var factor = .00005;
    var exp = meters * factor;

    var orb = this.getOrbDetailsFromType(OrbTypeEnum.amber);
    if (orb !== undefined) {
      if (orb.level < orb.maxLevel) {
        orb.xp += exp;

        if (orb.xp >= orb.xpNeededForLevel && orb.level < orb.maxLevel)
          this.increaseOrbLevel(orb);
      }
      else if (orb.level === orb.maxLevel)
        orb.xp = 0;
    }
  }

  //call after every ability use
  increaseAmethystOrbXp() {
    var factor = 2;
    var exp = factor;
    //console.log("Amethyst XP Gain: " + exp);

    var orb = this.getOrbDetailsFromType(OrbTypeEnum.amethyst);
    if (orb !== undefined) {
      if (orb.level < orb.maxLevel) {
        orb.xp += exp;

        if (orb.xp >= orb.xpNeededForLevel && orb.level < orb.maxLevel)
          this.increaseOrbLevel(orb);
      }
      else if (orb.level === orb.maxLevel)
        orb.xp = 0;
    }
  }

  //pass in meters through a special path before stumbling
  increaseEmeraldOrbXp(meters: number) {
    var factor = .00008;
    var exp = meters * factor;
    //console.log("Emerald Meters: " + meters + " XP Gain: " + exp);

    var orb = this.getOrbDetailsFromType(OrbTypeEnum.emerald);
    if (orb !== undefined) {
      if (orb.level < orb.maxLevel) {
        orb.xp += exp;

        if (orb.xp >= orb.xpNeededForLevel && orb.level < orb.maxLevel)
          this.increaseOrbLevel(orb);
      }
      else if (orb.level === orb.maxLevel)
        orb.xp = 0;
    }
  }

  //pass in meters spent at max speed
  increaseRubyOrbXp(meters: number) {
    var factor = .0003;
    var exp = meters * factor;
    //console.log("Ruby Meters: " + meters + " XP Gain: " + exp);

    var orb = this.getOrbDetailsFromType(OrbTypeEnum.ruby);
    if (orb !== undefined) {
      if (orb.level < orb.maxLevel) {
        //console.log("XP Gain: " + exp + " New XP: " + orb.xp);
        orb.xp += exp;

        if (orb.xp >= orb.xpNeededForLevel && orb.level < orb.maxLevel)
          this.increaseOrbLevel(orb);
      }
      else if (orb.level === orb.maxLevel)
        orb.xp = 0;
    }
  }

  //pass in meters spent before losing focus
  increaseSapphireOrbXp(meters: number) {
    var factor = .000025;
    var exp = meters * factor;
    //console.log("Sapphire Meters: " + meters + " XP Gain: " + exp);

    var orb = this.getOrbDetailsFromType(OrbTypeEnum.sapphire);
    if (orb !== undefined) {
      //console.log(orb.level + " vs " + orb.maxLevel);
      if (orb.level < orb.maxLevel) {
        orb.xp += exp;

        if (orb.xp >= orb.xpNeededForLevel && orb.level < orb.maxLevel)
          this.increaseOrbLevel(orb);
      }
      else if (orb.level === orb.maxLevel)
        orb.xp = 0;
    }
  }

  //pass in meters before stamina reaches 0
  increaseTopazOrbXp(meters: number) {
    var factor = .000025;
    var exp = meters * factor;
    //console.log("Topaz Meters: " + meters + " XP Gain: " + exp);

    var orb = this.getOrbDetailsFromType(OrbTypeEnum.topaz);
    if (orb !== undefined) {
      if (orb.level < orb.maxLevel) {
        orb.xp += exp;

        if (orb.xp >= orb.xpNeededForLevel && orb.level < orb.maxLevel)
          this.increaseOrbLevel(orb);
      }
      else if (orb.level === orb.maxLevel)
        orb.xp = 0;
    }
  }

  getAverageStumbleFrequencyForCourseType(courseType: RaceCourseTypeEnum) {
    var stumbleFrequency = 0;

    if (courseType === RaceCourseTypeEnum.Flatland) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Bumps).frequencyOfStumble + new RacePath(RaceDesignEnum.S).frequencyOfStumble) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Mountain) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Gaps).frequencyOfStumble + new RacePath(RaceDesignEnum.Crevasse).frequencyOfStumble) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Ocean) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Dive).frequencyOfStumble + new RacePath(RaceDesignEnum.Waves).frequencyOfStumble) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Tundra) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Cavern).frequencyOfStumble + new RacePath(RaceDesignEnum.Hills).frequencyOfStumble) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Volcanic) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.FirstRegular).frequencyOfStumble + new RacePath(RaceDesignEnum.SteppingStones).frequencyOfStumble) / 2;
    }

    return stumbleFrequency;
  }

  getAverageStumbleOpportunitiesForCourseType(courseType: RaceCourseTypeEnum) {
    var stumbleFrequency = 0;

    if (courseType === RaceCourseTypeEnum.Flatland) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Bumps).stumbleOpportunities + new RacePath(RaceDesignEnum.S).stumbleOpportunities) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Mountain) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Gaps).stumbleOpportunities + new RacePath(RaceDesignEnum.Crevasse).stumbleOpportunities) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Ocean) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Dive).stumbleOpportunities + new RacePath(RaceDesignEnum.Waves).stumbleOpportunities) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Tundra) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.Cavern).stumbleOpportunities + new RacePath(RaceDesignEnum.Hills).stumbleOpportunities) / 2;
    }
    if (courseType === RaceCourseTypeEnum.Volcanic) {
      stumbleFrequency = (new RacePath(RaceDesignEnum.FirstRegular).stumbleOpportunities + new RacePath(RaceDesignEnum.SteppingStones).stumbleOpportunities) / 2;
    }

    return stumbleFrequency;
  }

  generateFreeRace() {
    var numericalRank = this.utilityService.getNumericValueOfCircuitRank(this.globalVar.circuitRank);
    var timeToComplete = 60;
    var legLengthCutoff = timeToComplete / 4; //a leg cannot be any shorter than this as a percentage

    var baseMeters = 90;
    var factor = 1.125;
    var additiveAmount = 12 * numericalRank;
    if (numericalRank >= 15)
      additiveAmount = 50 * numericalRank;

    var maxRandomFactor = 1.05;
    var minRandomFactor = 0.8;

    var legMinimumDistance = 10; //as a percentage of 100
    var legMaximumDistance = 90; //as a percentage of 100

    var raceLegs: RaceLeg[] = [];

    if (numericalRank <= 2) {
      var leg = new RaceLeg();
      leg.courseType = RaceCourseTypeEnum.Flatland;
      leg.terrain = this.getRandomTerrain(leg.courseType);
      leg.distance = Math.round((baseMeters * (factor ** numericalRank) + additiveAmount) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor));
      raceLegs.push(leg);
    }
    else if (numericalRank <= 15) {
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
        leg1.distance = (Math.round((baseMeters * (factor ** numericalRank) + additiveAmount) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
        leg1.terrain = this.getRandomTerrain(leg1.courseType);
        raceLegs.push(leg1);
      }

      if (leg2Normalized > 0) {
        var leg2 = new RaceLeg();
        leg2.courseType = randomizedCourseList[1];
        leg2.distance = (Math.round((baseMeters * (factor ** numericalRank) + additiveAmount) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
        leg2.terrain = this.getRandomTerrain(leg2.courseType);
        raceLegs.push(leg2);
      }
    }
    else {
      legLengthCutoff = timeToComplete / 6;

      var availableCourses: RaceCourseTypeEnum[] = [];
      if (numericalRank < 45) {
        availableCourses.push(RaceCourseTypeEnum.Flatland);
        availableCourses.push(RaceCourseTypeEnum.Mountain);
        availableCourses.push(RaceCourseTypeEnum.Ocean);
      }
      else if (numericalRank < 53) {
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
        leg1.distance = (Math.round((baseMeters * (factor ** numericalRank) + additiveAmount) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg1Normalized / timeToComplete));
        leg1.terrain = this.getRandomTerrain(leg1.courseType);
        raceLegs.push(leg1);
      }

      if (leg2Normalized > 0) {
        var leg2 = new RaceLeg();
        leg2.courseType = randomizedCourseList[1];
        leg2.distance = (Math.round((baseMeters * (factor ** numericalRank) + additiveAmount) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg2Normalized / timeToComplete));
        leg2.terrain = this.getRandomTerrain(leg2.courseType);
        raceLegs.push(leg2);
      }

      if (leg3Normalized > 0) {
        var leg3 = new RaceLeg();
        leg3.courseType = randomizedCourseList[2];
        leg3.distance = (Math.round((baseMeters * (factor ** numericalRank) + additiveAmount) * this.utilityService.getRandomNumber(minRandomFactor, maxRandomFactor)) * (leg3Normalized / timeToComplete));
        leg3.terrain = this.getRandomTerrain(leg3.courseType);
        raceLegs.push(leg3);
      }
    }

    var totalDistance = 0;

    var primaryDeck = this.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (primaryDeck !== undefined)
      raceLegs = this.reorganizeLegsByDeckOrder(raceLegs, primaryDeck);

    raceLegs.forEach(leg => {
      totalDistance += leg.distance;
    });

    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance);
    });

    return new Race(raceLegs, this.globalVar.circuitRank, false,
      1, totalDistance, timeToComplete, this.GenerateLocalRaceRewards(this.globalVar.circuitRank), LocalRaceTypeEnum.Free, undefined, RaceTypeEnum.circuit, undefined);
  }

  getTotalSegments(totalDistance: number) {
    var totalSegments = 0;
    //get expected race distance by segment    
    if (this.globalVar.circuitRaces === null || this.globalVar.circuitRaces === undefined || this.globalVar.circuitRaces.length === 0)
      this.GenerateCircuitRacesForRank(this.globalVar.circuitRank);

    //TODO: if doing holiday event, need to reconsider using grandprix variables
    var expectedSegmentTotals = Math.ceil(this.globalVar.eventRaceData.grandPrixTimeLength / this.globalVar.eventRaceData.segmentTime);
    var expectedSegmentDistance = totalDistance / expectedSegmentTotals;
    var smoothnessModifier = 1; //if the distance is particularly low, make the segment feel longer and vice versa. range from .75 to 1.25 maybe        

    var circuitRaceDistance = this.globalVar.circuitRaces[0].length;
    var circuitRaceTimeLength = this.globalVar.circuitRaces[0].timeToComplete;
    var timeToCompleteModifier = this.globalVar.eventRaceData.segmentTime / circuitRaceTimeLength;
    var adjustedCircuitRaceDistance = circuitRaceDistance * timeToCompleteModifier;

    //TODO: implement smoothness after making sure it works fine without it
    /*
    if (expectedSegmentDistance < adjustedCircuitRaceDistance)
      smoothnessModifier = 1.25;
    else if (expectedSegmentDistance > adjustedCircuitRaceDistance)
      smoothnessModifier = .75;

    adjustedCircuitRaceDistance *= smoothnessModifier;*/

    //want to make segments roughly adjustedcircuitracedistance length
    //console.log("Adj Circuit Race Distance: " + adjustedCircuitRaceDistance + " Total Distance: " + totalDistance);
    //adjust length so that segment is an integer
    var segmentLength = this.utilityService.getClosestWholeNumber(adjustedCircuitRaceDistance, totalDistance);

    totalSegments = totalDistance / segmentLength;

    //adjust based on desired segment time
    //get closest whole number segment based on that (maybe round it up to nearest X000 or something, if number greater than total distance return 1)
    return totalSegments;
  }

  initialGrandPrixSetup(rank: string, rankDistanceMultiplier: number) {
    this.globalVar.eventRaceData = new GrandPrixData();
    this.globalVar.eventRaceData.rank = rank;
    var numericRankValue = this.utilityService.getNumericValueOfCircuitRank(rank);
    this.globalVar.eventRaceData.rankDistanceMultiplier = rankDistanceMultiplier;

    this.globalVar.eventRaceData.totalDistance = 500000000 * this.globalVar.eventRaceData.rankDistanceMultiplier; //numericRankValue;
    this.globalVar.eventRaceData.currentRaceSegmentCount = 0;
    this.globalVar.eventRaceData.segmentTimeCounter = 0;
    this.globalVar.eventRaceData.totalSegments = this.getTotalSegments(this.globalVar.eventRaceData.totalDistance);
    this.globalVar.eventRaceData.remainingRewards = this.globalVar.eventRaceData.totalRewards = this.getGrandPrixRewardCount();

    this.globalVar.eventRaceData.animalData = [];
    this.globalVar.animals.forEach(animal => {
      this.globalVar.eventRaceData.animalData.push(new AnimalEventRaceData(animal.type));
    });

    this.globalVar.eventRaceData.weatherCluster = this.getRandomGrandPrixWeatherCluster();
    this.globalVar.previousEventRewards = [];
  }

  animalCanRaceGrandPrix(animal: Animal) {
    var canRaceGrandPrix = true;

    var requiredBreedLevel = this.getBreedLevelRequiredForGrandPrix();
    if (animal.breedLevel < requiredBreedLevel)
      canRaceGrandPrix = false;

    var associatedData = this.globalVar.eventRaceData.animalData.find(data => data.associatedAnimalType === animal.type);

    if (associatedData !== undefined && associatedData !== null && associatedData.exhaustionStatReduction < .5)
      canRaceGrandPrix = false;

    return canRaceGrandPrix;
  }

  getGrandPrixRacingAnimal() {
    var racingAnimal = new Animal();
    var eventDeck = this.globalVar.animalDecks.find(item => item.isEventDeck);

    if (eventDeck !== undefined) {
      var availableOptions = [];
      if (eventDeck.isCourseOrderActive) {
        for (var i = 0; i < eventDeck.selectedAnimals.length; i++) {
          if (eventDeck.courseTypeOrder.length > i) {
            var type = eventDeck.courseTypeOrder[i];
            var matchingAnimal = eventDeck.selectedAnimals.find(animal => animal.raceCourseType === type);
            if (matchingAnimal !== undefined)
              availableOptions.push(matchingAnimal);
          }
        }
      }
      else {
        eventDeck.selectedAnimals.forEach(item => {
          availableOptions.push(item);
        });
      }

      availableOptions = availableOptions.filter(item => this.animalCanRaceGrandPrix(item));
      if (this.globalVar.eventRaceData.isCatchingUp)
        availableOptions = availableOptions.filter(item => !this.shouldShowSlowSegmentWarning(item));

      if (availableOptions.length > 0) {
        racingAnimal = availableOptions[0];
      }
    }

    this.globalVar.eventRaceData.animalData.forEach(animal => {
      if (animal.isCurrentlyRacing) {
        var globalAnimal = this.globalVar.animals.find(item => item.type === animal.associatedAnimalType);
        if (globalAnimal !== undefined)
          racingAnimal = globalAnimal.makeCopy(globalAnimal);
      }
    });

    return racingAnimal;
  }

  getCurrentlyActiveGrandPrixRacingAnimal() {
    var racingAnimal = new Animal();
    if (!this.globalVar.eventRaceData.isRunning)
      return racingAnimal;

    this.globalVar.eventRaceData.animalData.forEach(animal => {
      if (animal.isCurrentlyRacing) {
        var globalAnimal = this.globalVar.animals.find(item => item.type === animal.associatedAnimalType);
        if (globalAnimal !== undefined)
          racingAnimal = globalAnimal.makeCopy(globalAnimal);
      }
    });

    return racingAnimal;
  }

  //Exhaustion = Energy
  getExhaustionOfAnimal(type: AnimalTypeEnum) {
    return this.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === type)?.exhaustionStatReduction;
  }

  getMoraleOfAnimal(type: AnimalTypeEnum) {
    return this.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === type)?.morale;
  }

  generateGrandPrixSegment(racingAnimal: Animal, catchUpTime?: number) {
    var eventData = this.globalVar.eventRaceData;
    //var numericalRank = this.utilityService.getNumericValueOfCircuitRank(eventData.rank);
    var remainingRaceTime = this.getRemainingEventRaceTime();
    if (catchUpTime !== undefined && (remainingRaceTime === 0 || remainingRaceTime === undefined || remainingRaceTime === null))
      remainingRaceTime = catchUpTime;

    var segmentMeters = eventData.totalDistance / eventData.totalSegments;

    var raceLegs: RaceLeg[] = [];

    var leg = new RaceLeg();
    leg.courseType = racingAnimal.raceCourseType;
    leg.terrain = this.getRandomGrandPrixTerrainFromWeatherCluster(this.globalVar.eventRaceData.weatherCluster, leg.courseType, this.getEventStartDateTime().toString() + this.getEventTimePer5Min().toString());
    leg.distance = segmentMeters;

    raceLegs.push(leg);
    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, segmentMeters);
    });

    return new Race(raceLegs, this.globalVar.circuitRank, false,
      1, segmentMeters, remainingRaceTime, undefined, undefined, undefined, RaceTypeEnum.event, EventRaceTypeEnum.grandPrix);
  }

  getGrandPrixRewardCount() {
    var numericalRank = this.globalVar.eventRaceData.rankDistanceMultiplier; //this.utilityService.getNumericValueOfCircuitRank(this.globalVar.eventRaceData.rank);

    var metersPerCoinsGrandPrixModifierValue = 5;
    var metersPerCoinsGrandPrixModifier = this.globalVar.modifiers.find(item => item.text === "metersPerCoinsGrandPrixModifier");
    if (metersPerCoinsGrandPrixModifier !== undefined)
      metersPerCoinsGrandPrixModifierValue = metersPerCoinsGrandPrixModifier.value;

    var metersPerRenownGrandPrixModifierValue = 5;
    var metersPerRenownGrandPrixModifier = this.globalVar.modifiers.find(item => item.text === "metersPerRenownGrandPrixModifier");
    if (metersPerRenownGrandPrixModifier !== undefined)
      metersPerRenownGrandPrixModifierValue = metersPerRenownGrandPrixModifier.value;

    var totalCoinRewards = this.globalVar.eventRaceData.totalDistance / (metersPerCoinsGrandPrixModifierValue * numericalRank);
    var totalRenownRewards = this.globalVar.eventRaceData.totalDistance / (metersPerRenownGrandPrixModifierValue * numericalRank);
    var totalTokenRewards = 4;
    var totalFoodRewards = 8;

    if (numericalRank > 1)
      totalFoodRewards = 0;

    return totalCoinRewards + totalRenownRewards + totalTokenRewards + totalFoodRewards;
  }

  getEventStartDateTime() {
    var currentDate = new Date();

    var currentDay = currentDate.getDay();
    var currentHour = currentDate.getHours();
    var eventData = this.globalVar.eventRaceData;

    var event1StartDate = new Date();
    var event1EndDate = new Date();
    var event2StartDate = new Date();
    var event2EndDate = new Date();

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekStartDay));
    else
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekStartDay));
    event1StartDate.setHours(event1StartDate.getHours() - currentHour + eventData.weekStartHour);
    event1StartDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekEndDay));
    else
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekEndDay));
    event1EndDate.setHours(event1EndDate.getHours() - currentHour + eventData.weekEndHour);
    event1EndDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekendStartDay));
    else
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendStartDay));
    event2StartDate.setHours(event2StartDate.getHours() - currentHour + eventData.weekendStartHour);
    event2StartDate.setMinutes(0, 0, 0);
    //need to move into next week since sunday is first of the week

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendEndDay));
    else
      event2EndDate = new Date(new Date().setDate(new Date().getDate() + 7 - currentDay + eventData.weekendEndDay));
    event2EndDate.setHours(event2EndDate.getHours() - currentHour + eventData.weekendEndHour);
    event2EndDate.setMinutes(0, 0, 0);

    if ((currentDate >= event1StartDate && currentDate <= event1EndDate) ||
      (currentDate >= event2StartDate && currentDate <= event2EndDate)) {
      return 0;
    }

    if (currentDate > event1EndDate) {
      return event2StartDate;
    }
    else {
      return event1StartDate;
    }
  }

  getCurrentEventStartEndDateTime(getEndDate: boolean) {
    var currentDate = new Date();

    var currentDay = currentDate.getDay();
    var currentHour = currentDate.getHours();
    var eventData = this.globalVar.eventRaceData;

    var event1StartDate = new Date();
    var event1EndDate = new Date();
    var event2StartDate = new Date();
    var event2EndDate = new Date();

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekStartDay));
    else
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekStartDay));
    event1StartDate.setHours(event1StartDate.getHours() - currentHour + eventData.weekStartHour);
    event1StartDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekEndDay));
    else
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekEndDay));
    event1EndDate.setHours(event1EndDate.getHours() - currentHour + eventData.weekEndHour);
    event1EndDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekendStartDay));
    else
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendStartDay));
    event2StartDate.setHours(event2StartDate.getHours() - currentHour + eventData.weekendStartHour);
    event2StartDate.setMinutes(0, 0, 0);
    //need to move into next week since sunday is first of the week

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendEndDay));
    else
      event2EndDate = new Date(new Date().setDate(new Date().getDate() + 7 - currentDay + eventData.weekendEndDay));
    event2EndDate.setHours(event2EndDate.getHours() - currentHour + eventData.weekendEndHour);
    event2EndDate.setMinutes(0, 0, 0);

    if (currentDate >= event1StartDate && currentDate <= event1EndDate) {
      if (getEndDate)
        return event1EndDate;
      else
        return event1StartDate;
    }
    else if (currentDate >= event2StartDate && currentDate <= event2EndDate) {
      if (getEndDate)
        return event2EndDate;
      else
        return event2StartDate;
    }

    return 0;
  }

  //return time in seconds to next event
  getTimeToEventRace() {
    var currentDate = new Date();
    //var currentDate = new Date(new Date().setDate(new Date().getDate() + 6));//new Date();    
    //currentDate.setHours(23);
    //console.log(currentDate);
    var currentDay = currentDate.getDay();
    var currentHour = currentDate.getHours();
    var eventData = this.globalVar.eventRaceData;

    var event1StartDate = new Date();
    var event1EndDate = new Date();
    var event2StartDate = new Date();
    var event2EndDate = new Date();

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekStartDay));
    else
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekStartDay));
    event1StartDate.setHours(event1StartDate.getHours() - currentHour + eventData.weekStartHour);
    event1StartDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekEndDay));
    else
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekEndDay));
    event1EndDate.setHours(event1EndDate.getHours() - currentHour + eventData.weekEndHour);
    event1EndDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekendStartDay));
    else
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendStartDay));
    event2StartDate.setHours(event2StartDate.getHours() - currentHour + eventData.weekendStartHour);
    event2StartDate.setMinutes(0, 0, 0);
    //need to move into next week since sunday is first of the week

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendEndDay));
    else
      event2EndDate = new Date(new Date().setDate(new Date().getDate() + 7 - currentDay + eventData.weekendEndDay));
    event2EndDate.setHours(event2EndDate.getHours() - currentHour + eventData.weekendEndHour);
    event2EndDate.setMinutes(0, 0, 0);

    if ((currentDate >= event1StartDate && currentDate <= event1EndDate) ||
      (currentDate >= event2StartDate && currentDate <= event2EndDate)) {
      return 0;
    }

    if (currentDate > event1EndDate) {
      return (event2StartDate.getTime() - currentDate.getTime()) / 1000;
    }
    else {
      return (event1StartDate.getTime() - currentDate.getTime()) / 1000;
    }
  }

  getRemainingEventRaceTime() {
    var currentDate = new Date();
    //var currentDate = new Date(new Date().setDate(new Date().getDate() + 6));//new Date();    
    //currentDate.setHours(23);
    //console.log(currentDate);
    var currentDay = currentDate.getDay();
    var currentHour = currentDate.getHours();
    var eventData = this.globalVar.eventRaceData;

    var event1StartDate = new Date();
    var event1EndDate = new Date();
    var event2StartDate = new Date();
    var event2EndDate = new Date();

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekStartDay));
    else
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekStartDay));
    event1StartDate.setHours(event1StartDate.getHours() - currentHour + eventData.weekStartHour);
    event1StartDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekEndDay));
    else
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekEndDay));
    event1EndDate.setHours(event1EndDate.getHours() - currentHour + eventData.weekEndHour);
    event1EndDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekendStartDay));
    else
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendStartDay));
    event2StartDate.setHours(event2StartDate.getHours() - currentHour + eventData.weekendStartHour);
    event2StartDate.setMinutes(0, 0, 0);
    //need to move into next week since sunday is first of the week

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendEndDay));
    else
      event2EndDate = new Date(new Date().setDate(new Date().getDate() + 7 - currentDay + eventData.weekendEndDay));
    event2EndDate.setHours(event2EndDate.getHours() - currentHour + eventData.weekendEndHour);
    event2EndDate.setMinutes(0, 0, 0);

    if ((currentDate >= event1StartDate && currentDate <= event1EndDate) ||
      (currentDate >= event2StartDate && currentDate <= event2EndDate)) {
      if (currentDate > event2StartDate) {
        return (event2EndDate.getTime() - currentDate.getTime()) / 1000;
      }
      else {
        return (event1EndDate.getTime() - currentDate.getTime()) / 1000;
      }
    }

    return 0;
  }

  /*getTimeSinceEventRaceEnded() {
    var currentDate = new Date();

    var currentDay = currentDate.getDay();
    var currentHour = currentDate.getHours();
    var eventData = this.globalVar.eventRaceData;

    var event1StartDate = new Date();
    var event1EndDate = new Date();
    var event2StartDate = new Date();
    var event2EndDate = new Date();

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekStartDay));
    else
      event1StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekStartDay));
    event1StartDate.setHours(event1StartDate.getHours() - currentHour + eventData.weekStartHour);
    event1StartDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekEndDay));
    else
      event1EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekEndDay));
    event1EndDate.setHours(event1EndDate.getHours() - currentHour + eventData.weekEndHour);
    event1EndDate.setMinutes(0, 0, 0);

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - 7 - currentDay + eventData.weekendStartDay));
    else
      event2StartDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendStartDay));
    event2StartDate.setHours(event2StartDate.getHours() - currentHour + eventData.weekendStartHour);
    event2StartDate.setMinutes(0, 0, 0);
    //need to move into next week since sunday is first of the week

    if (currentDate.getDay() === 0 && currentHour < eventData.weekendEndHour)
      event2EndDate = new Date(new Date().setDate(new Date().getDate() - currentDay + eventData.weekendEndDay));
    else
      event2EndDate = new Date(new Date().setDate(new Date().getDate() + 7 - currentDay + eventData.weekendEndDay));
    event2EndDate.setHours(event2EndDate.getHours() - currentHour + eventData.weekendEndHour);
    event2EndDate.setMinutes(0, 0, 0);

    if ((currentDate >= event1StartDate && currentDate <= event1EndDate) ||
      (currentDate >= event2StartDate && currentDate <= event2EndDate)) {
      return 0;
    }

    if (currentDate > event1EndDate) {
      return (event2StartDate.getTime() - currentDate.getTime()) / 1000;
    }
    else {
      return (event1StartDate.getTime() - currentDate.getTime()) / 1000;
    }
  }*/

  getEventTimePer5Min() {
    var remainingEventTime = this.getRemainingEventRaceTime();
    var inMinutes = remainingEventTime / 60;
    var per5 = Math.floor(inMinutes / 5);
    return per5;
  }

  generateTrackRace(animal: Animal, type: TrackRaceTypeEnum) {
    var timeToComplete = 60;

    var raceLegs: RaceLeg[] = [];
    var leg = new RaceLeg();
    leg.courseType = animal.raceCourseType;

    if (type === TrackRaceTypeEnum.practice) {
      timeToComplete = 45;
      leg.distance = 100;
      leg.terrain = new Terrain(TerrainTypeEnum.Stormy);
    }
    else if (type === TrackRaceTypeEnum.novice) {
      timeToComplete = 60;
      leg.distance = 1000;
      leg.terrain = new Terrain(TerrainTypeEnum.Stormy);
    }
    else if (type === TrackRaceTypeEnum.intermediate) {
      timeToComplete = 80;
      leg.distance = 10000;
      leg.terrain = new Terrain(TerrainTypeEnum.Stormy);
    }
    else if (type === TrackRaceTypeEnum.master) {
      timeToComplete = 100;
      leg.distance = 100000;
      leg.terrain = new Terrain(TerrainTypeEnum.Stormy);
    }

    raceLegs.push(leg);

    var totalDistance = 0;

    raceLegs.forEach(leg => {
      totalDistance += leg.distance;
    });

    raceLegs.forEach(leg => {
      leg.pathData = this.GenerateRaceLegPaths(leg, totalDistance, type);
    });

    return new Race(raceLegs, this.globalVar.circuitRank, false, 1, totalDistance, timeToComplete, undefined, LocalRaceTypeEnum.Track, type, RaceTypeEnum.trainingTrack);
  }

  GenerateRaceLegPaths(leg: RaceLeg, totalDistance: number, trackRaceType?: TrackRaceTypeEnum): RacePath[] {
    var totalRacePaths = 20;

    /*if (trackRaceType !== undefined)
    {
      if (trackRaceType === TrackRaceTypeEnum.Practice)
        totalRacePaths = 5;
      if (trackRaceType === TrackRaceTypeEnum.Novice)
        totalRacePaths = 7;
      if (trackRaceType === TrackRaceTypeEnum.Intermediate)
        totalRacePaths = 14;
    }*/

    var paths: RacePath[] = [];
    var totalLegLengthRemaining = leg.distance;
    var pathLength = totalDistance / totalRacePaths;
    var totalRoutes = Math.round(totalLegLengthRemaining / pathLength);
    var lastRouteSpecial = false;
    var lastPathRoute = RaceDesignEnum.Regular;

    var truePathLength = totalLegLengthRemaining / totalRoutes;
    for (var i = 0; i < totalRoutes; i++) {
      var path = new RacePath();

      if (i === 0) {
        path.length = truePathLength;
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

      if (totalLegLengthRemaining > truePathLength)
        path.length = truePathLength;
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
      else if (courseType === RaceCourseTypeEnum.Volcanic)
        specialRoute = RaceDesignEnum.Regular;
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
      else if (courseType === RaceCourseTypeEnum.Volcanic)
        specialRoute = RaceDesignEnum.SteppingStones;
    }

    return specialRoute;
  }

  calculateAnimalRacingStats(animal: Animal, racingAnimals?: Animal[]): void {
    //intialize variables    
    var totalMaxSpeedModifier = animal.currentStats.defaultMaxSpeedModifier;
    var totalAccelerationModifier = animal.currentStats.defaultAccelerationModifier;
    var totalStaminaModifier = animal.currentStats.defaultStaminaModifier;
    var totalPowerModifier = animal.currentStats.defaultPowerModifier;
    var totalFocusModifier = animal.currentStats.defaultFocusModifier;
    var totalAdaptabilityModifier = animal.currentStats.defaultAdaptabilityModifier;
    var breedLevelStatModifierValue = .02;

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

    //orb modifier
    var numberOfRubyOrbHolders = racingAnimals === undefined ? 1 : racingAnimals?.filter(item => item.equippedOrb !== null && this.getOrbTypeFromResource(item.equippedOrb) === OrbTypeEnum.ruby).length;
    var numberOfAmberOrbHolders = racingAnimals === undefined ? 1 : racingAnimals?.filter(item => item.equippedOrb !== null && this.getOrbTypeFromResource(item.equippedOrb) === OrbTypeEnum.amber).length;
    var numberOfTopazOrbHolders = racingAnimals === undefined ? 1 : racingAnimals?.filter(item => item.equippedOrb !== null && this.getOrbTypeFromResource(item.equippedOrb) === OrbTypeEnum.topaz).length;
    var numberOfAmethystOrbHolders = racingAnimals === undefined ? 1 : racingAnimals?.filter(item => item.equippedOrb !== null && this.getOrbTypeFromResource(item.equippedOrb) === OrbTypeEnum.amethyst).length;
    var numberOfSapphireOrbHolders = racingAnimals === undefined ? 1 : racingAnimals?.filter(item => item.equippedOrb !== null && this.getOrbTypeFromResource(item.equippedOrb) === OrbTypeEnum.sapphire).length;
    var numberOfEmeraldOrbHolders = racingAnimals === undefined ? 1 : racingAnimals?.filter(item => item.equippedOrb !== null && this.getOrbTypeFromResource(item.equippedOrb) === OrbTypeEnum.emerald).length;

    var animalMaxSpeedOrbModifier = animal.equippedOrb !== null && animal.equippedOrb.name === "Ruby Orb" ? this.globalVar.orbStats.getMaxSpeedIncrease(numberOfRubyOrbHolders) : 1;
    var animalAccelerationOrbModifier = animal.equippedOrb !== null && animal.equippedOrb.name === "Amber Orb" ? this.globalVar.orbStats.getAccelerationIncrease(numberOfAmberOrbHolders) : 1;
    var animalStaminaOrbModifier = animal.equippedOrb !== null && animal.equippedOrb.name === "Topaz Orb" ? this.globalVar.orbStats.getEnduranceIncrease(numberOfTopazOrbHolders) : 1;
    var animalPowerOrbModifier = animal.equippedOrb !== null && animal.equippedOrb.name === "Amethyst Orb" ? this.globalVar.orbStats.getPowerIncrease(numberOfAmethystOrbHolders) : 1;
    var animalFocusOrbModifier = animal.equippedOrb !== null && animal.equippedOrb.name === "Sapphire Orb" ? this.globalVar.orbStats.getFocusIncrease(numberOfSapphireOrbHolders) : 1;
    var animalAdaptabilityOrbModifier = animal.equippedOrb !== null && animal.equippedOrb.name === "Emerald Orb" ? this.globalVar.orbStats.getAdaptabilityIncrease(numberOfEmeraldOrbHolders) : 1;

    //leave space to adjust modifiers with other items or anything
    var breedLevelStatModifier = this.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    //talents
    var topSpeedTalentModifier = 1;
    var accelerationTalentModifier = 1;
    var enduranceTalentModifier = 1;
    var powerTalentModifier = 1;
    var focusTalentModifier = 1;
    var adaptabilityTalentModifier = 1;

    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
      adaptabilityTalentModifier = 1 + (animal.talentTree.column1Row3Points / 100);
      accelerationTalentModifier = 1 + (animal.talentTree.column2Row3Points / 100);
      powerTalentModifier = 1 + (animal.talentTree.column3Row3Points / 100);
    }
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
      focusTalentModifier = 1 + (animal.talentTree.column1Row3Points / 100);
      topSpeedTalentModifier = 1 + (animal.talentTree.column2Row3Points / 100);
      enduranceTalentModifier = 1 + (animal.talentTree.column3Row3Points / 100);
    }

    var diminishingReturnsThreshold = this.GetAnimalDiminishingReturns(animal);

    //do the calculations       
    animal.currentStats.maxSpeedMs = animal.currentStats.calculateMaxSpeed(totalMaxSpeedModifier * breedLevelStatModifierValue * traitMaxSpeedModifier * animal.incubatorStatUpgrades.maxSpeedModifier * topSpeedTalentModifier, diminishingReturnsThreshold, animalMaxSpeedOrbModifier);
    animal.currentStats.accelerationMs = animal.currentStats.calculateTrueAcceleration(totalAccelerationModifier * breedLevelStatModifierValue * traitAccelerationModifier * animal.incubatorStatUpgrades.accelerationModifier * accelerationTalentModifier, diminishingReturnsThreshold, animalAccelerationOrbModifier);
    animal.currentStats.stamina = animal.currentStats.calculateStamina(totalStaminaModifier * breedLevelStatModifierValue * traitEnduranceModifier * animal.incubatorStatUpgrades.staminaModifier * enduranceTalentModifier, diminishingReturnsThreshold, animalStaminaOrbModifier);
    animal.currentStats.powerMs = animal.currentStats.calculateTruePower(totalPowerModifier * breedLevelStatModifierValue * traitPowerModifier * animal.incubatorStatUpgrades.powerModifier * powerTalentModifier, diminishingReturnsThreshold, animalPowerOrbModifier);
    animal.currentStats.focusMs = animal.currentStats.calculateTrueFocus(totalFocusModifier * breedLevelStatModifierValue * traitFocusModifier * animal.incubatorStatUpgrades.focusModifier * focusTalentModifier, diminishingReturnsThreshold, animalFocusOrbModifier);
    animal.currentStats.adaptabilityMs = animal.currentStats.calculateTrueAdaptability(totalAdaptabilityModifier * breedLevelStatModifierValue * traitAdaptabilityModifier * animal.incubatorStatUpgrades.adaptabilityModifier * adaptabilityTalentModifier, diminishingReturnsThreshold, animalAdaptabilityOrbModifier);
    animal.currentStats.burstChance = animal.currentStats.calculateBurstChance(breedLevelStatModifierValue);
    animal.currentStats.burstDistance = animal.currentStats.calculateBurstDistance(breedLevelStatModifierValue);

    this.updateTrackedMaxStats(animal);
  }

  getTraitModifier(animal: Animal, stat: AnimalStatEnum) {
    var statMultiplier = 1;

    if (animal.trait !== undefined && animal.trait !== null) {
      var positivePercent = animal.trait.researchLevel;
      var negativePercent = animal.trait.researchLevel;
      var negativePercentModifier = this.globalVar.modifiers.find(item => item.text === "maximumTraitNegativePercentModifier");
      if (negativePercentModifier !== undefined && negativePercent > negativePercentModifier.value)
        negativePercent = negativePercentModifier.value;

      if (animal.trait.positiveStatGain === stat)
        statMultiplier += positivePercent / 100;
      if (animal.trait.negativeStatGain === stat)
        statMultiplier -= negativePercent / 100;
    }
    return statMultiplier;
  }

  GetAnimalDiminishingReturns(animal: Animal) {
    var diminishingReturnsThreshold = animal.currentStats.diminishingReturnsDefaultStatThreshold;
    var facilityLevel = this.globalVar.resources.find(item => item.name === "Facility Level");
    if (facilityLevel === undefined || facilityLevel === null)
      return diminishingReturnsThreshold;

    var facilityLevelModifierValue = 5;
    var facilityLevelModifier = this.globalVar.modifiers.find(item => item.text === "facilityLevelModifier");
    if (facilityLevelModifier !== undefined)
      facilityLevelModifierValue = facilityLevelModifier.value;

    diminishingReturnsThreshold += facilityLevel.amount * (facilityLevelModifierValue + animal.miscStats.diminishingReturnsBonus);

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

  getBreedLevelRequiredForGrandPrix() {
    var grandPrixBreedLevelRequired = 50;
    var grandPrixBreedLevelRequiredPair = this.globalVar.modifiers.find(item => item.text === "grandPrixBreedLevelRequiredModifier");
    if (grandPrixBreedLevelRequiredPair !== null && grandPrixBreedLevelRequiredPair !== undefined)
      grandPrixBreedLevelRequired = grandPrixBreedLevelRequiredPair.value;

    return grandPrixBreedLevelRequired;
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


    var incubatorUpgrade = this.globalVar.resources.find(item => item.name.includes("Incubator Upgrade"));
    if (incubatorUpgrade !== null && incubatorUpgrade !== undefined && animal.trait !== null && animal.trait !== undefined) {
      var incubatorUpgradeIncrease = .001;
      var incubatorUpgradeIncreaseModifier = this.globalVar.modifiers.find(item => item.text === "incubatorUpgradeIncreaseModifier");
      if (incubatorUpgradeIncreaseModifier !== null && incubatorUpgradeIncreaseModifier !== undefined)
        incubatorUpgradeIncrease = incubatorUpgradeIncreaseModifier.value;

      var increasedAmount = animal.trait.researchLevel * incubatorUpgradeIncrease;

      var incubatorUpgradeLv1 = this.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv1");
      var incubatorUpgradeLv2 = this.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv2");
      var incubatorUpgradeLv3 = this.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv3");
      var incubatorUpgradeLv4 = this.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv4");

      if (incubatorUpgradeLv4 !== null && incubatorUpgradeLv4 !== undefined) {
        if (increasedAmount > .1)
          increasedAmount = .1;
      }
      else if (incubatorUpgradeLv3 !== null && incubatorUpgradeLv3 !== undefined) {
        if (increasedAmount > .05)
          increasedAmount = .05;
      }
      else if (incubatorUpgradeLv2 !== null && incubatorUpgradeLv2 !== undefined) {
        if (increasedAmount > .025)
          increasedAmount = .025;
      }
      else if (incubatorUpgradeLv1 !== null && incubatorUpgradeLv1 !== undefined) {
        if (increasedAmount > .01)
          increasedAmount = .01;
      }

      if (animal.trait.positiveStatGain === AnimalStatEnum.topSpeed)
        animal.incubatorStatUpgrades.maxSpeedModifier += increasedAmount;
      if (animal.trait.positiveStatGain === AnimalStatEnum.acceleration)
        animal.incubatorStatUpgrades.accelerationModifier += increasedAmount;
      if (animal.trait.positiveStatGain === AnimalStatEnum.endurance)
        animal.incubatorStatUpgrades.staminaModifier += increasedAmount;
      if (animal.trait.positiveStatGain === AnimalStatEnum.power)
        animal.incubatorStatUpgrades.powerModifier += increasedAmount;
      if (animal.trait.positiveStatGain === AnimalStatEnum.focus)
        animal.incubatorStatUpgrades.focusModifier += increasedAmount;
      if (animal.trait.positiveStatGain === AnimalStatEnum.adaptability)
        animal.incubatorStatUpgrades.adaptabilityModifier += increasedAmount;
    }

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
    this.globalVar.trackedStats.totalBreeds += 1;
  }

  increaseAbilityXp(animal: Animal, xpAmount?: number, isTrainingTrack?: boolean) {
    //also increase power orb xp if in use
    if (animal.equippedOrb !== undefined && animal.equippedOrb !== null && !isTrainingTrack && this.getOrbTypeFromResource(animal.equippedOrb) === OrbTypeEnum.amethyst) {
      this.increaseAmethystOrbXp();
    }

    var abilityLevelCap = 25;
    var abilityLevelCapModifier = this.globalVar.modifiers.find(item => item.text === "abilityLevelCapModifier");
    if (abilityLevelCapModifier !== null && abilityLevelCapModifier !== undefined)
      abilityLevelCap = abilityLevelCapModifier.value;

    if (animal.ability.abilityLevel > animal.breedLevel + abilityLevelCap)
      return;

    var xpGain = 1;
    if (xpAmount !== null && xpAmount !== undefined && xpAmount > 1)
      xpGain = xpAmount;

    animal.ability.abilityXp += xpGain;

    if (animal.ability.abilityXp >= animal.ability.abilityMaxXp) {
      animal.ability.abilityXp = 0;
      animal.ability.abilityLevel += 1;
      if (animal.ability.abilityLevel % 10 === 0)
        animal.ability.abilityMaxXp += 5;
    }

    var availableAbilityItem = animal.availableAbilities.find(item => item.name === animal.ability.name);
    if (availableAbilityItem !== null && availableAbilityItem !== undefined) {
      availableAbilityItem.abilityXp = animal.ability.abilityXp;
      availableAbilityItem.abilityLevel = animal.ability.abilityLevel;
      availableAbilityItem.abilityMaxXp = animal.ability.abilityMaxXp;
    }
  }

  InitializeResources() {
    this.globalVar.resources.push(this.initializeService.initializeResource("Coins", 500, ShopItemTypeEnum.Resources));
    this.globalVar.resources.push(this.initializeService.initializeResource("Renown", 1, ShopItemTypeEnum.Progression));
  }

  InitializeSettings() {
    this.themeService.setLightTheme();
    this.globalVar.settings.set("theme", this.themeService.getActiveTheme());
    this.globalVar.settings.set("skipDrawRace", false);
    this.globalVar.settings.set("finishTrainingBeforeSwitching", true);
    this.globalVar.settings.set("hideTips", false);
    this.globalVar.settings.set("useNumbersForCircuitRank", false);
    this.globalVar.settings.set("raceDisplayInfo", RaceDisplayInfoEnum.both);
    this.globalVar.settings.set("autoStartEventRace", false);
    this.globalVar.settings.set("quickViewBarnMode", false);

    this.globalVar.settings.set("monoRaceToggled", false);
    this.globalVar.settings.set("duoRaceToggled", false);
    this.globalVar.settings.set("rainbowRaceToggled", false);
    this.globalVar.settings.set("pinnacleRaceToggled", false);
    this.globalVar.settings.set("noviceTrainingTrackToggled", false);
    this.globalVar.settings.set("intermediateTrainingTrackToggled", false);
    this.globalVar.settings.set("masterTrainingTrackToggled", false);
    this.globalVar.settings.set("amberOrbToggled", false);
    this.globalVar.settings.set("amethystOrbToggled", false);
    this.globalVar.settings.set("emeraldOrbToggled", false);
    this.globalVar.settings.set("rubyOrbToggled", false);
    this.globalVar.settings.set("sapphireOrbToggled", false);
    this.globalVar.settings.set("topazOrbToggled", false);
  }

  InitializeUnlockables() {
    this.globalVar.unlockables.set("monoRace", false);
    this.globalVar.unlockables.set("duoRace", false);
    this.globalVar.unlockables.set("rainbowRace", false);
    this.globalVar.unlockables.set("thePinnacle", false);
    this.globalVar.unlockables.set("grandPrix", false);
    this.globalVar.unlockables.set("orbs", false);
    this.globalVar.unlockables.set("barnRow2", false);
    this.globalVar.unlockables.set("barnRow3", false);
    this.globalVar.unlockables.set("barnRow4", false);
    this.globalVar.unlockables.set("barnRow5", false);
    this.globalVar.unlockables.set("coaching", false);
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

  getTokenResourceValue(amount: number) {
    return new ResourceValue("Tokens", amount);
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

  getAnimalDescription(name: string) {
    var description = "";

    if (name === "Horse") {
      description = "The Horse is a Flatland racing animal capable of running without losing stamina and increasing the max speed of relay racers.";
    }
    else if (name === "Cheetah") {
      description = "The Cheetah is a Flatland racing animal that prioritizes quickness over stamina.";
    }
    else if (name === "Hare") {
      description = "The Hare is a Flatland racing animal that can instantly enter Burst and increase adaptability and focus.";
    }
    else if (name === "Warthog") {
      description = "The Warthog is a Flatland racing animal that can increase stats at random and increase Burst Chance after losing focus.";
    }
    else if (name === "Monkey") {
      description = "The Monkey is a Mountain climbing animal capable of slowing its competitors and leaping to victory.";
    }
    else if (name === "Goat") {
      description = "The Goat is a Mountain climbing animal that can nimbly travel terrain and increase stamina.";
    }
    else if (name === "Gecko") {
      description = "The Gecko is a Mountain climbing animal that can increase speed based on focus and can increase other racers' starting velocity.";
    }
    else if (name === "Dolphin") {
      description = "The Dolphin is an Ocean swimming animal capable of ignoring detrimental terrain effects and supporting teammates on relay.";
    }
    else if (name === "Shark") {
      description = "The Shark is an Ocean swimming animal that can slow competitors and increase its own stats at the cost of your other racers.";
    }
    else if (name === "Octopus") {
      description = "The Octopus is an Ocean swimming animal that can increase your coin rewards from races and increase power of other racers.";
    }
    else if (name === "Whale") {
      description = "The Whale is an Ocean swimming animal that can set a velocity floor and becomes increasingly faster as the race goes on.";
    }
    else if (name === "Penguin") {
      description = "The Penguin is a Tundra racing animal that can slide carefully or recklessly.";
    }
    else if (name === "Caribou") {
      description = "The Caribou is a Tundra racing animal that boosts other racers based on stamina.";
    }
    else if (name === "Salamander") {
      description = "The Salamander is a Volcanic racing animal that can burrow underground to avoid lava and continously increase acceleration.";
    }
    else if (name === "Fox") {
      description = "The Fox is a Volcanic racing animal that can increase stats at random.";
    }

    return description;
  }

  sortAnimalOrder() {
    this.globalVar.animals.sort((a, b) => a.raceCourseType - b.raceCourseType);

    /*var sortedAnimals = [];
    var existingAnimals = this.globalVar.animals;

    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Horse));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Hare));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Cheetah));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Warthog));

    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Monkey));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Goat));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Gecko));

    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Dolphin));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Whale));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Shark));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Octopus));

    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Penguin));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Caribou));

    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Salamander));
    sortedAnimals.push(existingAnimals.find(item => item.type === AnimalTypeEnum.Fox));

    if (sortedAnimals.length === existingAnimals.length && 
      !sortedAnimals.some(item => item === undefined || item === null || item.type === undefined || item.type === null))
      this.globalVar.animals = existingAnimals;*/
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
      returnVal = "Increase next racer's Speed by 10% on Relay";
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
    if (name === "Amethyst Orb")
      returnVal = "Increase your Power Efficiency by " + ((this.globalVar.orbStats.getPowerIncrease(1) - 1) * 100).toFixed(0) + "%.";
    if (name === "Sapphire Orb")
      returnVal = "Increase your Focus Distance by " + ((this.globalVar.orbStats.getFocusIncrease(1) - 1) * 100).toFixed(0) + "%.";
    if (name === "Amber Orb")
      returnVal = "Increase your Acceleration Rate by " + ((this.globalVar.orbStats.getAccelerationIncrease(1) - 1) * 100).toFixed(0) + "%.";
    if (name === "Topaz Orb")
      returnVal = "Increase your Stamina by " + ((this.globalVar.orbStats.getEnduranceIncrease(1) - 1) * 100).toFixed(0) + "%.";
    if (name === "Emerald Orb")
      returnVal = "Increase your Adaptability Distance by " + ((this.globalVar.orbStats.getAdaptabilityIncrease(1) - 1) * 100).toFixed(0) + "%.";
    if (name === "Ruby Orb")
      returnVal = "Increase your Max Speed by " + ((this.globalVar.orbStats.getMaxSpeedIncrease(1) - 1) * 100).toFixed(0) + "%.";
    if (name === "Scary Mask")
      returnVal = "Cause a distraction the first time you lose focus while ahead of competition, slowing competitors by 2 seconds.";
    if (name === "Running Shoes")
      returnVal = "After each Burst during a race, increase subsequent Burst distance by 20%.";
    if (name === "Incense")
      returnVal = "When your velocity is at least 90% of your Max Speed, immediately set velocity to 100% of your Max Speed.";
    if (name === "Athletic Tape")
      returnVal = "While Bursting, decrease Acceleration Rate by 50% but increase Focus Distance and Adaptability Distance by 50%.";

    return returnVal;
  }

  getItemDescription(name: string) {
    var description = "";

    if (name === "Apples")
      description = "+1 Acceleration to a single animal";
    if (name === "Bananas")
      description = "+1 Speed to a single animal";
    if (name === "Strawberries")
      description = "+1 Endurance to a single animal";
    if (name === "Carrots")
      description = "+1 Power to a single animal";
    if (name === "Turnips")
      description = "+1 Focus to a single animal";
    if (name === "Oranges")
      description = "+1 Adaptability to a single animal";
    if (name === "Mangoes")
      description = "+1 Breed Level to a single animal";
    if (name === "Gingko Leaves")
      description = "Reset Breed Level for a single animal back to 1 and remove all incubator upgrade gains. Increase Breed XP Gain by 900% until Breed Level returns to what it was.";
    if (name === "Circuit Race Breed XP Gain Certificate")
      description = "Give an animal +2 Bonus Breed XP Gain from Circuit Races. Can use up to 30 of these certificates on any individual animal.";
    if (name === "Free Race Breed XP Gain Certificate")
      description = "Give an animal +1 Bonus Breed XP Gain from Free Races. Can use up to 30 of these certificates on any individual animal.";
    if (name === "Training Breed XP Gain Certificate")
      description = "Give an animal +1 Bonus Breed XP Gain from Training. Can use up to 30 of these certificates on any individual animal.";
    if (name === "Diminishing Returns Increase Certificate")
      description = "Give an animal +1 Diminishing Returns per Facility Level. Can use up to 30 of these certificates on any individual animal.";

    return description;
  }

  getSpecializationDescription(specializationName: string) {
    var description = "";

    if (specializationName === "Breeding Grounds") {
      description = "Turn your barn into a habitat based around the optimal breeding environment for your animals. As you progress, your animals will gain more breeding XP from their training.";
    }
    else if (specializationName === "Training Facility") {
      description = "Pull out all the stops giving your animals the best environment to improve. As you progress, your animals will train faster and gain stats from training at a higher rate.";
    }
    else if (specializationName === "Attraction") {
      description = "Give the people what they want and turn your barn into a tourist attraction. As you progress, your barn will provide passive income at a steady rate while training.";
    }
    else if (specializationName === "Research Center") {
      description = "Bring in the top names in animal research to optimize your training process. As you progress, your animal will gain reduced stats from training but split its improvements with other animals."
    }

    return description;
  }

  getTundraDescription() {
    var description = "When racing in the Tundra, your racer will slide all over the race course as they move forward. The higher your Adaptability stat, the better control your racer will have and the less likely they will slide. You lose a percentage of max speed while sliding, and if you slide too much you may hit a wall and come to a complete stop!";

    return description;
  }

  getVolcanicDescription() {
    var description = "Volcanic racers make their way while a Volcano ominously looms in the background. As you race, the Volcano will erupt making it impossible to proceed if you get stuck behind the lava flow. If you stay ahead of the average pace for the Volcanic leg of the race, you should have no problem speeding past the lava so make sure your Max Speed and Acceleration are up to the challenge.";

    return description;
  }

  updateTrackedMaxStats(animal: Animal) {
    if (!animal.isAvailable)
      return;

    if (this.globalVar.trackedStats.highestMaxSpeed === "")
      this.globalVar.trackedStats.highestMaxSpeed = animal.currentStats.maxSpeedMs.toLocaleString("en-US") + " m/s (" + animal.name + ")";
    else {
      var highestMaxSpeedValue = parseFloat(this.globalVar.trackedStats.highestMaxSpeed.replaceAll(",", "").substring(0, this.globalVar.trackedStats.highestMaxSpeed.replaceAll(",", "").indexOf(' ')));
      if (animal.currentStats.maxSpeedMs > highestMaxSpeedValue)
        this.globalVar.trackedStats.highestMaxSpeed = animal.currentStats.maxSpeedMs.toLocaleString("en-US") + " m/s (" + animal.name + ")";
    }

    if (this.globalVar.trackedStats.highestAccelerationRate === "")
      this.globalVar.trackedStats.highestAccelerationRate = animal.currentStats.accelerationMs.toLocaleString("en-US") + " m/s (" + animal.name + ")";
    else {
      var highestAccelerationRateValue = parseFloat(this.globalVar.trackedStats.highestAccelerationRate.replaceAll(",", "").substring(0, this.globalVar.trackedStats.highestAccelerationRate.replaceAll(",", "").indexOf(' ')));
      if (animal.currentStats.accelerationMs > highestAccelerationRateValue)
        this.globalVar.trackedStats.highestAccelerationRate = animal.currentStats.accelerationMs.toLocaleString("en-US") + " m/s (" + animal.name + ")";
    }

    if (this.globalVar.trackedStats.highestStamina === "") {
      this.globalVar.trackedStats.highestStamina = animal.currentStats.stamina.toLocaleString("en-US") + " (" + animal.name + ")";
    }
    else {
      var highestStaminaValue = parseFloat(this.globalVar.trackedStats.highestStamina.replaceAll(",", "").substring(0, this.globalVar.trackedStats.highestStamina.replaceAll(",", "").indexOf(' ')));
      if (animal.currentStats.stamina > highestStaminaValue)
        this.globalVar.trackedStats.highestStamina = animal.currentStats.stamina.toLocaleString("en-US") + " (" + animal.name + ")";
    }

    if (this.globalVar.trackedStats.highestPowerEfficiency === "")
      this.globalVar.trackedStats.highestPowerEfficiency = animal.currentStats.powerMs.toLocaleString("en-US") + "% (" + animal.name + ")";
    else {
      var highestPowerEfficiencyValue = parseFloat(this.globalVar.trackedStats.highestPowerEfficiency.replaceAll(",", "").substring(0, this.globalVar.trackedStats.highestPowerEfficiency.replaceAll(",", "").indexOf(' ')));
      if (animal.currentStats.powerMs > highestPowerEfficiencyValue)
        this.globalVar.trackedStats.highestPowerEfficiency = animal.currentStats.powerMs.toLocaleString("en-US") + "% (" + animal.name + ")";
    }

    if (this.globalVar.trackedStats.highestFocusDistance === "")
      this.globalVar.trackedStats.highestFocusDistance = animal.currentStats.focusMs.toLocaleString("en-US") + " m (" + animal.name + ")";
    else {
      var highestFocusDistanceValue = parseFloat(this.globalVar.trackedStats.highestFocusDistance.replaceAll(",", "").substring(0, this.globalVar.trackedStats.highestFocusDistance.replaceAll(",", "").indexOf(' ')));
      if (animal.currentStats.focusMs > highestFocusDistanceValue)
        this.globalVar.trackedStats.highestFocusDistance = animal.currentStats.focusMs.toLocaleString("en-US") + " m (" + animal.name + ")";
    }

    if (this.globalVar.trackedStats.highestAdaptabilityDistance === "")
      this.globalVar.trackedStats.highestAdaptabilityDistance = animal.currentStats.adaptabilityMs.toLocaleString("en-US") + " m (" + animal.name + ")";
    else {
      var highestAdaptabilityDistanceValue = parseFloat(this.globalVar.trackedStats.highestAdaptabilityDistance.replaceAll(",", "").substring(0, this.globalVar.trackedStats.highestAdaptabilityDistance.replaceAll(",", "").indexOf(' ')));
      if (animal.currentStats.focusMs > highestAdaptabilityDistanceValue)
        this.globalVar.trackedStats.highestAdaptabilityDistance = animal.currentStats.adaptabilityMs.toLocaleString("en-US") + " m (" + animal.name + ")";
    }
  }

  shouldShowSlowSegmentWarning(animal?: Animal) {
    var tooSlow = false;

    if (animal === undefined)
      return tooSlow;

    if (animal.currentStats.acceleration <= 10 || animal.currentStats.topSpeed <= 10 ||
      animal.currentStats.endurance <= 10 || animal.currentStats.power <= 10 ||
      animal.currentStats.focus <= 10 || animal.currentStats.adaptability <= 10) {
      console.log("Stats too low: " + animal.currentStats.acceleration + " " + animal.currentStats.topSpeed + " " +
        animal.currentStats.endurance + " " + animal.currentStats.power + " " + animal.currentStats.focus + " " +
        animal.currentStats.adaptability);
      tooSlow = true;
    }

    if (this.globalVar.eventRaceData !== undefined && this.globalVar.eventRaceData !== null) {
      var segmentMeters = this.globalVar.eventRaceData.totalDistance / this.globalVar.eventRaceData.totalSegments;
      var expectedRaceMperS = segmentMeters / this.globalVar.eventRaceData.segmentTime;

      if (expectedRaceMperS > animal.currentStats.maxSpeedMs * 3) {
        console.log("Max Speed Too Low: " + expectedRaceMperS + " > " + animal.currentStats.maxSpeedMs * 3);
        tooSlow = true;
      }
      if (animal.currentStats.focusMs < expectedRaceMperS / 5) {
        console.log("Not Focused Enough: " + animal.currentStats.focusMs + " < " + expectedRaceMperS / 30);
        tooSlow = true;
      }
    }

    return tooSlow;
  }

  devModeInitialize(circuitRankNumeric: number, progressionSetting: number) {
    var Coins = this.globalVar.resources.find(item => item.name === "Coins");
    if (Coins !== undefined)
      Coins.amount = 100000000000;
    if (this.globalVar.resources.some(item => item.name === "Medals")) {
      var medals = this.globalVar.resources.find(item => item.name === "Medals");
      if (medals !== undefined)
        medals.amount += circuitRankNumeric + 10000000;
    }
    else
      this.globalVar.resources.push(this.initializeService.initializeResource("Medals", circuitRankNumeric + 100000, ShopItemTypeEnum.Resources));

    this.globalVar.resources.push(this.initializeService.initializeResource("Talent Points", 1000, ShopItemTypeEnum.Resources));
    this.globalVar.resources.push(this.initializeService.initializeResource("Tokens", 1000, ShopItemTypeEnum.Resources));

    if (this.globalVar.resources.some(item => item.name === "Renown")) {
      var renown = this.globalVar.resources.find(item => item.name === "Renown");
      if (renown !== undefined)
        renown.amount += 50000;
    }
    else
      this.globalVar.resources.push(this.initializeService.initializeResource("Renown", 50000, ShopItemTypeEnum.Resources));

    this.globalVar.resources.push(this.initializeService.initializeResource("Facility Level", 1000, ShopItemTypeEnum.Progression));
    this.globalVar.resources.push(this.initializeService.initializeResource("Research Level", circuitRankNumeric, ShopItemTypeEnum.Progression));

    this.globalVar.monoRank = "AAAZ";
    this.globalVar.duoRank = "AAZ";
    this.globalVar.rainbowRank = "AZ";

    for (var i = 1; i <= circuitRankNumeric; i++) {
      var rank = this.utilityService.getCircuitRankFromNumericValue(i);
      this.globalVar.circuitRank = rank;
      this.checkCircuitRankRewards();
      this.GenerateCircuitRacesForRank(this.globalVar.circuitRank);
    }

    this.globalVar.animalDecks.find(item => item.deckNumber === 2)?.selectedAnimals.push(this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Horse)!);
    this.globalVar.animalDecks.find(item => item.deckNumber === 2)?.selectedAnimals.push(this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Goat)!);
    this.globalVar.animalDecks.find(item => item.deckNumber === 2)?.selectedAnimals.push(this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Whale)!);
    this.globalVar.animalDecks.find(item => item.deckNumber === 2)?.selectedAnimals.push(this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Caribou)!);
    this.globalVar.animalDecks.find(item => item.deckNumber === 2)?.selectedAnimals.push(this.globalVar.animals.find(item => item.type === AnimalTypeEnum.Salamander)!);
    this.globalVar.animalDecks.find(item => item.deckNumber === 2)!.isPrimaryDeck = true;
    this.globalVar.animalDecks.find(item => item.deckNumber === 2)!.isEventDeck = true;
    this.globalVar.animalDecks.find(item => item.deckNumber === 1)!.isPrimaryDeck = false;
    this.globalVar.animalDecks.find(item => item.deckNumber === 1)!.isEventDeck = false;

    var trainingStatValue = 5;
    var breedLevel = 1;
    var incubatorUpgradeValue = 1;
    var talentCount = 0;

    //breed level 50, relatively early game
    if (progressionSetting === 1) {
      trainingStatValue = 50;
      breedLevel = 50;
    }
    else if (progressionSetting === 2) {
      trainingStatValue = 100;
      breedLevel = 250;
      incubatorUpgradeValue = 3;
    }
    else if (progressionSetting === 3) {
      trainingStatValue = 750;
      breedLevel = 750;
      incubatorUpgradeValue = 7;
      talentCount = 10;
    }
    else if (progressionSetting === 4) {
      trainingStatValue = 1000;
      breedLevel = 12500;
      incubatorUpgradeValue = 12.5;
      talentCount = 60;
    }

    this.globalVar.animals.forEach(animal => {
      if (animal.type === AnimalTypeEnum.Goat || animal.type === AnimalTypeEnum.Caribou ||
        animal.type === AnimalTypeEnum.Octopus)
        {
          animal.isAvailable = true;
          animal.availableAbilities.forEach(item => {
            item.isAbilityPurchased = true;

            if (item.name === "Deep Breathing" || item.name === "Special Delivery" || item.name === "Big Brain")
            animal.ability = item;
          })
        }

      animal.currentStats.topSpeed = trainingStatValue;
      animal.currentStats.acceleration = trainingStatValue;
      animal.currentStats.endurance = trainingStatValue;
      animal.currentStats.power = trainingStatValue;
      animal.currentStats.focus = trainingStatValue;
      animal.currentStats.adaptability = trainingStatValue;

      animal.breedLevel = breedLevel;

      animal.incubatorStatUpgrades.maxSpeedModifier = incubatorUpgradeValue;
      animal.incubatorStatUpgrades.accelerationModifier = incubatorUpgradeValue;
      animal.incubatorStatUpgrades.staminaModifier = incubatorUpgradeValue;
      animal.incubatorStatUpgrades.powerModifier = incubatorUpgradeValue;
      animal.incubatorStatUpgrades.focusModifier = incubatorUpgradeValue;
      animal.incubatorStatUpgrades.adaptabilityModifier = incubatorUpgradeValue;

      animal.ability.abilityLevel = animal.breedLevel + 25;
      animal.availableAbilities.forEach(ability => {
        ability.abilityLevel = animal.breedLevel + 25;
      });

      if (progressionSetting >= 4) {
        var randomTalentTree = this.utilityService.getRandomInteger(1, 3);
        if (randomTalentTree === 1)
          animal.talentTree.talentTreeType = TalentTreeTypeEnum.sprint;
        if (randomTalentTree === 2)
          animal.talentTree.talentTreeType = TalentTreeTypeEnum.support;
        if (randomTalentTree === 3)
          animal.talentTree.talentTreeType = TalentTreeTypeEnum.longDistance;

        animal.talentTree.column1Row1Points = 10;
        animal.talentTree.column1Row2Points = 10;
        animal.talentTree.column1Row3Points = 10;
        animal.talentTree.column1Row4Points = 10;

        animal.talentTree.column2Row1Points = 10;
        animal.talentTree.column2Row2Points = 10;
        animal.talentTree.column2Row3Points = 10;
        animal.talentTree.column2Row4Points = 10;

        animal.talentTree.column3Row1Points = 10;
        animal.talentTree.column3Row2Points = 10;
        animal.talentTree.column3Row3Points = 10;
        animal.talentTree.column3Row4Points = 10;
      }

      if (progressionSetting >= 3 && circuitRankNumeric >= 79) {
        animal.canEquipOrb = true;

        if (animal.type === AnimalTypeEnum.Horse)
          animal.equippedOrb = this.globalVar.resources.find(item => item.name === "Sapphire Orb")!;
        if (animal.type === AnimalTypeEnum.Monkey)
          animal.equippedOrb = this.globalVar.resources.find(item => item.name === "Ruby Orb")!;
        if (animal.type === AnimalTypeEnum.Dolphin)
          animal.equippedOrb = this.globalVar.resources.find(item => item.name === "Topaz Orb")!;
        if (animal.type === AnimalTypeEnum.Penguin)
          animal.equippedOrb = this.globalVar.resources.find(item => item.name === "Emerald Orb")!;
        if (animal.type === AnimalTypeEnum.Salamander)
          animal.equippedOrb = this.globalVar.resources.find(item => item.name === "Amber Orb")!;
      }
      this.calculateAnimalRacingStats(animal);
    });
  }
}
