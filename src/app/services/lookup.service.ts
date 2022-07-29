import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AnimalStatEnum } from '../models/animal-stat-enum.model';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { Ability } from '../models/animals/ability.model';
import { AnimalDeck } from '../models/animals/animal-deck.model';
import { AnimalStats } from '../models/animals/animal-stats.model';
import { AnimalTraits } from '../models/animals/animal-traits.model';
import { Animal } from '../models/animals/animal.model';
import { BarnSpecializationEnum } from '../models/barn-specialization-enum.model';
import { BarnUpgrades } from '../models/barns/barn-upgrades.model';
import { Barn } from '../models/barns/barn.model';
import { LocalRaceTypeEnum } from '../models/local-race-type-enum.model';
import { RaceCourseTypeEnum } from '../models/race-course-type-enum.model';
import { GrandPrixData } from '../models/races/event-race-data.model';
import { RaceLeg } from '../models/races/race-leg.model';
import { Race } from '../models/races/race.model';
import { RelayEffect } from '../models/races/relay-effect.model';
import { Terrain } from '../models/races/terrain.model';
import { RelayEffectEnum } from '../models/relay-effect-enum.model';
import { ResourceValue } from '../models/resources/resource-value.model';
import { ShopItemTypeEnum } from '../models/shop-item-type-enum.model';
import { TalentTreeTypeEnum } from '../models/talent-tree-type-enum.model';
import { TerrainTypeEnum } from '../models/terrain-type-enum.model';
import { TrackRaceTypeEnum } from '../models/track-race-type-enum.model';
import { TrainingOption } from '../models/training/training-option.model';
import { WeatherEnum } from '../models/weather-enum.model';
import { GlobalService } from './global-service.service';
import { UtilityService } from './utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private globalService: GlobalService, private utilityService: UtilityService, private sanitizer: DomSanitizer) { }

  recalculateAllAnimalStats() {
    this.globalService.globalVar.animals.forEach(animal => {
      this.globalService.calculateAnimalRacingStats(animal);
    });
  }

  getAnimalsFromAnimalDeck(deck: AnimalDeck): Animal[] {
    var animals: Animal[] = [];

    if (deck === null || deck === undefined || deck.selectedAnimals === undefined || deck.selectedAnimals.length === 0)
      return animals;

    deck.selectedAnimals.forEach(animal => {
      var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === animal.type);
      if (globalAnimal !== undefined)
        animals.push(globalAnimal);
    });

    return animals;
  }

  getPrimaryDeck(): AnimalDeck | undefined {
    var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    return primaryDeck;
  }

  getResourceByName(name: string) {
    var resource = this.globalService.globalVar.resources.find(item => item.name === name);
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  spendResourceByName(name: string, amountSpent: number): void {
    var resource = this.globalService.globalVar.resources.find(item => item.name === name);
    if (resource !== undefined)
      resource.amount -= amountSpent;
  }

  gainResourceByName(name: string, amountGained: number) {
    var resource = this.globalService.globalVar.resources.find(item => item.name === name);
    if (resource !== undefined)
      resource.amount += amountGained;
  }

  getFacilityLevel(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Facility Level");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  getResearchLevel(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Research Level");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  getCoins(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Coins");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  spendCoins(amountSpent: number): void {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Coins");
    if (resource !== undefined)
      resource.amount -= amountSpent;
  }

  getMedals(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Medals");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  spendMedals(amountSpent: number): void {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Medals");
    if (resource !== undefined)
      resource.amount -= amountSpent;
  }

  getTokens(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Tokens");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  spendTokens(amountSpent: number): void {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Tokens");
    if (resource !== undefined)
      resource.amount -= amountSpent;
  }

  getRenown(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Renown");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  getStockbreeder(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Stockbreeder");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  getAnimalByType(type: AnimalTypeEnum): Animal | null {
    var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (globalAnimal !== undefined)
      return globalAnimal;
    else
      return null;
  }

  getMaxSpeedModifierByAnimalType(type: AnimalTypeEnum): number {
    var totalModifier = 0;
    var breedModifier = 0.01;
    var defaultModifier = 0;
    var animal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (animal !== null && animal !== undefined) {
      var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
      if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
        breedModifier = breedLevelStatModifier.value;

      breedModifier = 1 + (breedModifier * (animal.breedLevel - 1));

      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultMaxSpeedModifier");
      if (modifierPair !== null && modifierPair !== undefined)
        defaultModifier = modifierPair.value;

      var traitMaxSpeedModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.topSpeed);

      var speedTalentModifier = 1;
      if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
        speedTalentModifier = 1 + (animal.talentTree.column2Row3Points / 100);
      }

      totalModifier = defaultModifier * breedModifier * traitMaxSpeedModifier * animal.incubatorStatUpgrades.maxSpeedModifier * speedTalentModifier;
    }

    return totalModifier;
  }

  getAccelerationModifierByAnimalType(type: AnimalTypeEnum): number {
    var totalModifier = 0;
    var breedModifier = 0.01;
    var defaultModifier = 0;
    var animal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (animal !== null && animal !== undefined) {
      var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
      if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
        breedModifier = breedLevelStatModifier.value;

      breedModifier = 1 + (breedModifier * (animal.breedLevel - 1));

      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultAccelerationModifier");
      if (modifierPair !== null && modifierPair !== undefined)
        defaultModifier = modifierPair.value;

      var traitAccelerationModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.acceleration);

      var accelerationTalentModifier = 1;
      if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
        accelerationTalentModifier = 1 + (animal.talentTree.column2Row3Points / 100);
      }

      totalModifier = defaultModifier * breedModifier * traitAccelerationModifier * animal.incubatorStatUpgrades.accelerationModifier * accelerationTalentModifier;
    }

    return totalModifier;
  }

  getStaminaModifierByAnimalType(type: AnimalTypeEnum): number {
    var totalModifier = 0;
    var breedModifier = 0.01;
    var defaultModifier = 0;
    var animal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (animal !== null && animal !== undefined) {
      var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
      if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
        breedModifier = breedLevelStatModifier.value;

      breedModifier = 1 + (breedModifier * (animal.breedLevel - 1));

      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultStaminaModifier");
      if (modifierPair !== null && modifierPair !== undefined)
        defaultModifier = modifierPair.value;

      var traitEnduranceModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.endurance);

      var enduranceTalentModifier = 1;
      if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
        enduranceTalentModifier = 1 + (animal.talentTree.column3Row3Points / 100);
      }

      totalModifier = defaultModifier * breedModifier * traitEnduranceModifier * animal.incubatorStatUpgrades.staminaModifier * enduranceTalentModifier;
    }

    return totalModifier;
  }

  getPowerModifierByAnimalType(type: AnimalTypeEnum): number {
    var totalModifier = 0;
    var breedModifier = 0.01;
    var defaultModifier = 0;
    var animal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (animal !== null && animal !== undefined) {
      var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
      if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
        breedModifier = breedLevelStatModifier.value;

      breedModifier = 1 + (breedModifier * (animal.breedLevel - 1));


      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultPowerModifier");
      if (modifierPair !== null && modifierPair !== undefined)
        defaultModifier = modifierPair.value;

      var traitPowerModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.power);

      var powerTalentModifier = 1;
      if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
        powerTalentModifier = 1 + (animal.talentTree.column3Row3Points / 100);
      }

      totalModifier = defaultModifier * breedModifier * traitPowerModifier * animal.incubatorStatUpgrades.powerModifier * powerTalentModifier;
    }

    return totalModifier;
  }

  getFocusModifierByAnimalType(type: AnimalTypeEnum): number {
    var totalModifier = 0;
    var breedModifier = 0.01;
    var defaultModifier = 0;
    var animal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (animal !== null && animal !== undefined) {
      var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
      if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
        breedModifier = breedLevelStatModifier.value;

      breedModifier = 1 + (breedModifier * (animal.breedLevel - 1));

      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultFocusModifier");
      if (modifierPair !== null && modifierPair !== undefined)
        defaultModifier = modifierPair.value;

      var traitFocusModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.focus);

      var focusTalentModifier = 1;
      if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
        focusTalentModifier = 1 + (animal.talentTree.column1Row3Points / 100);
      }

      totalModifier = defaultModifier * breedModifier * traitFocusModifier * animal.incubatorStatUpgrades.focusModifier * focusTalentModifier;
    }

    return totalModifier;
  }

  getAdaptabilityModifierByAnimalType(type: AnimalTypeEnum): number {
    var totalModifier = 0;
    var breedModifier = 0.01;
    var defaultModifier = 0;
    var animal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (animal !== null && animal !== undefined) {
      var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
      if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
        breedModifier = breedLevelStatModifier.value;

      breedModifier = 1 + (breedModifier * (animal.breedLevel - 1));

      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultAdaptabilityModifier");
      if (modifierPair !== null && modifierPair !== undefined)
        defaultModifier = modifierPair.value;

      var traitAdaptabilityModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.adaptability);

      var adaptabilityTalentModifier = 1;
      if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
        adaptabilityTalentModifier = 1 + (animal.talentTree.column1Row3Points / 100);
      }

      totalModifier = defaultModifier * breedModifier * traitAdaptabilityModifier * animal.incubatorStatUpgrades.adaptabilityModifier * adaptabilityTalentModifier;
    }

    return totalModifier;
  }

  getTrainingBreedGaugeIncrease(breedingGroundsSpecializationLevel: number, animal: Animal): number {
    var increaseAmount = 0;
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingBreedGaugeIncrease");
    if (modifierPair !== null && modifierPair !== undefined)
      increaseAmount = modifierPair.value;

    if (animal.miscStats.bonusBreedXpGainFromTraining !== undefined && animal.miscStats.bonusBreedXpGainFromTraining !== null && animal.miscStats.bonusBreedXpGainFromTraining > 0)
      increaseAmount += animal.miscStats.bonusBreedXpGainFromTraining;

    if (breedingGroundsSpecializationLevel > 0) {
      var breedingGroundsModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "breedingGroundsSpecializationModifier");
      if (breedingGroundsModifierPair !== null && breedingGroundsModifierPair !== undefined) {
        increaseAmount *= 1 + (breedingGroundsSpecializationLevel * breedingGroundsModifierPair.value);
      }
    }

    return increaseAmount;
  }

  getCircuitBreedGaugeIncrease(animal: Animal): number {
    var increaseAmount = 0;
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "circuitBreedGaugeIncrease");
    if (modifierPair !== null && modifierPair !== undefined)
      increaseAmount = modifierPair.value;

    if (animal.miscStats.bonusBreedXpGainFromCircuitRaces !== undefined && animal.miscStats.bonusBreedXpGainFromCircuitRaces !== null && animal.miscStats.bonusBreedXpGainFromCircuitRaces > 0)
      increaseAmount += animal.miscStats.bonusBreedXpGainFromCircuitRaces;

    return increaseAmount;
  }

  getLocalBreedGaugeIncrease(animal: Animal): number {
    var increaseAmount = 0;
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "localBreedGaugeIncrease");
    if (modifierPair !== null && modifierPair !== undefined)
      increaseAmount = modifierPair.value;

    if (animal.miscStats.bonusBreedXpGainFromLocalRaces !== undefined && animal.miscStats.bonusBreedXpGainFromLocalRaces !== null && animal.miscStats.bonusBreedXpGainFromLocalRaces > 0)
      increaseAmount += animal.miscStats.bonusBreedXpGainFromLocalRaces;

    return increaseAmount;
  }

  getTotalRacersByRace(race: Race) {
    var totalRacers = 2;

    //don't forget to include 1 for yourself when doing this
    if (race.localRaceType === LocalRaceTypeEnum.Track) {
      totalRacers = 13;
    }
    else {
      var moneyMarkIsUnlocked = this.getResourceByName("Money Mark");
      if (moneyMarkIsUnlocked > 0)
        totalRacers += 1;
    }

    return totalRacers;
  }

  getDiminishingReturnsThreshold(animal?: Animal): number {
    var threshold = animal === null || animal === undefined ? 20 : animal.currentStats.diminishingReturnsDefaultStatThreshold;
    var facilityLevelModifier = this.globalService.globalVar.modifiers.find(item => item.text === "facilityLevelModifier");
    if (facilityLevelModifier !== undefined)
      threshold += this.getFacilityLevel() * facilityLevelModifier.value;

    return threshold;
  }

  getBreedLevelPopover(breedLevel: number) {
    var breedLevelModifier = 0.2;
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      breedLevelModifier = modifierPair.value;

    return "Increase racing stat gain from base stats by " + ((breedLevelModifier * (breedLevel - 1)) * 100).toFixed(0) + "%";
  }

  getResourcePopover(name: string, type: ShopItemTypeEnum) {
    if (name === "Coins")
      return "Good ol classic Coins. Gain from most actions and buy most things with this.";
    else if (name === "Medals")
      return "Rare currency gained from improving your circuit rank and winning certain special races.";
    else if (name === "Renown") {
      var currentRenown = this.getRenown();
      return "Increases Coins gained from races by " + currentRenown + "%. Increase total number of free races available per reset period by 1 for every 100 renown for a total of " + this.getTotalFreeRacesPerPeriod() + ". Complete circuit or free races to get your name out there and raise your renown.";
    }
    else if (name === "Facility Level") {
      var diminishingReturnsThreshold = this.getDiminishingReturnsThreshold();
      return "Increase Diminishing Returns value by 5 for each level for a total of " + diminishingReturnsThreshold + ". You can increase a base stat up to your Diminishing Returns value before that base stat starts to increase your racing stats less and less.";
    }
    else if (name === "Research Level") {
      var researchLevel = this.getResourceByName(name);
      return "Increase incubator trait values by " + researchLevel + "% and unlock new available traits.";
    }
    else if (name === "Apples" || name === "Bananas" || name === "Oranges" || name === "Strawberries" || name === "Turnips"
      || name === "Carrots" || name === "Mangoes") {
      return this.globalService.getItemDescription(name);
    }
    else if (type === ShopItemTypeEnum.Specialty)
      return this.getSpecialtyItemDescription(name);
    else if (type === ShopItemTypeEnum.Equipment)
      return this.globalService.getEquipmentDescription(name);

    return "";
  }

  getAllRaceCourseTypes() {
    var itemList = [];
    for (let item in RaceCourseTypeEnum) {
      if (isNaN(Number(item))) {
        itemList.push(item);
      }
    }

    return itemList;
  }

  getCourseTypeFromAnimalType(type: AnimalTypeEnum) {
    var animal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (animal !== undefined) {
      return animal.raceCourseType;
    }

    return -1;
  }

  getTalentTreeNameByEnum(talentTreeType: TalentTreeTypeEnum) {
    var talentTreeName = "";

    if (talentTreeType === TalentTreeTypeEnum.sprint)
      talentTreeName = "Sprint";
      if (talentTreeType === TalentTreeTypeEnum.support)
      talentTreeName = "Support";
      if (talentTreeType === TalentTreeTypeEnum.longDistance)
      talentTreeName = "Long Distance";

    return talentTreeName;
  }

  getAllBarnSpecializations() {
    var itemList = [];
    itemList.push("Breeding Grounds");
    itemList.push("Training Facility");
    if (this.isItemUnlocked("attractionSpecialization"))
      itemList.push("Attraction");
    if (this.isItemUnlocked("researchCenterSpecialization"))
      itemList.push("Research Center");
    return itemList;
  }

  getTrackRaceRewards(type: TrackRaceTypeEnum) {
    var rewards: string[] = [];

    if (type === TrackRaceTypeEnum.novice) {
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Training");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Free Races");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Training");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Free Races");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Training");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Free Races");
    }
    else if (type === TrackRaceTypeEnum.intermediate) {
      rewards.push("- 200 Coins");
      rewards.push("- +2 Bonus Breed XP Gain From Training");
      rewards.push("- 1 Medal");
      rewards.push("- +2 Diminishing Returns per Facility Level");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- +5 Bonus Breed XP Gain From Circuit Races");
      rewards.push("- 200 Coins");
      rewards.push("- +2 Bonus Breed XP Gain From Training");
      rewards.push("- 1 Medal");
      rewards.push("- +2 Bonus Breed XP Gain From Free Races");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- +3 Diminishing Returns per Facility Level");
    }
    else if (type === TrackRaceTypeEnum.master) {
      rewards.push("- +5 Bonus Breed XP Gain From Free Races");
      rewards.push("- +2 Diminishing Returns per Facility Level");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- 1000 Coins");
      rewards.push("- +3 Bonus Breed XP Gain From Training");
      rewards.push("- +2 Talents");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- 1000 Coins");
      rewards.push("- Orb Pendant");
      rewards.push("- +3 Diminishing Returns per Facility Level");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- +3 Talents");
    }

    return rewards;
  }

  getGrandPrixTokenRewards() {
    var rewards: string[] = [];
    var numericRankModifier = this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.eventRaceData.rank);
    var token1MeterCount = 50000000;
    var token1MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken1MeterModifier");
    if (token1MeterCountPair !== null && token1MeterCountPair !== undefined)
      token1MeterCount = token1MeterCountPair.value;

    var token2MeterCount = 50000000;
    var token2MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken2MeterModifier");
    if (token2MeterCountPair !== null && token2MeterCountPair !== undefined)
      token2MeterCount = token2MeterCountPair.value;

    var token3MeterCount = 50000000;
    var token3MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken3MeterModifier");
    if (token3MeterCountPair !== null && token3MeterCountPair !== undefined)
      token3MeterCount = token3MeterCountPair.value;

    var token4MeterCount = 50000000;
    var token4MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken4MeterModifier");
    if (token4MeterCountPair !== null && token4MeterCountPair !== undefined)
      token4MeterCount = token4MeterCountPair.value;
    
    var token1Gain = 1 * numericRankModifier;
    var token2Gain = 2 * numericRankModifier;
    var token3Gain = 3 * numericRankModifier;
    var token4Gain = 4 * numericRankModifier;

    rewards.push((token1MeterCount * numericRankModifier).toLocaleString() + " meters - +" + token1Gain + " Token" + (token1Gain > 1 ? "s" : ""));
    rewards.push((token2MeterCount * numericRankModifier).toLocaleString() + " meters - +" + token2Gain + " Tokens");
    rewards.push((token3MeterCount * numericRankModifier).toLocaleString() + " meters - +" + token3Gain + " Tokens");
    rewards.push((token4MeterCount * numericRankModifier).toLocaleString() + " meters - +" + token4Gain + " Tokens");

    return rewards;
  }

  getRenownRequiredForEventShopTier(tier: number) {
    if (tier === 1)
      return 0;
    if (tier === 2)
      return 200;
    else if (tier > 2)
      return (tier - 2) * 500;

    return -1;
  }

  getHighestEventShopTierUnlocked() {
    var tier = 1;
    var renown = this.getRenown();

    var renownPerTier = 500;

    if (renown > 200)
      tier = 2;

    if (renown > renownPerTier)
      tier = Math.floor(renown / renownPerTier) + 2;

    return tier;
  }

  isItemUnlocked(name: string) {
    var isUnlocked = false;

    var item = this.globalService.globalVar.unlockables.get(name);
    if (item !== undefined && item !== null)
      isUnlocked = item;

    return isUnlocked;
  }

  getAnimalsByRaceCourseType(type: string) {
    var itemList = [];
    if (type === "Flatland") {
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Horse]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Cheetah]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Hare]);
    }
    else if (type === "Mountain") {
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Monkey]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Goat]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Gecko]);
    }
    else if (type === "Ocean") {
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Dolphin]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Shark]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Octopus]);
    }
    else if (type === "Tundra") {
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Penguin]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Caribou]);
    }
    else if (type === "Volcanic") {
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Salamander]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Fox]);
    }

    return itemList;
  }

  GetAbilityEffectiveAmount(animal: Animal, terrainModifier?: number, statLossFromExhaustion?: number, ability?: Ability) {
    if (animal.ability === undefined || animal.ability === null ||
      animal.ability.name === undefined || animal.ability.name === null)
      return -1;

    if (terrainModifier === null || terrainModifier === undefined)
      terrainModifier = 1;

    if (statLossFromExhaustion === null || statLossFromExhaustion === undefined)
      statLossFromExhaustion = 1;

    var powerAbilityModifier = 1;
    if (animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Trickster" && animal.ability.tricksterStatLoss === "Power" && animal.ability.abilityInUse) {
      powerAbilityModifier *= .75;
    }
    if (animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Trickster" && animal.ability.tricksterStatGain === "Power" && animal.ability.abilityInUse) {
      powerAbilityModifier *= 1.5;
    }
    
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {         
      powerAbilityModifier *= 1 + (animal.talentTree.column3Row2Points * .05);      
    }

    var usedAbility = animal.ability;
    if (ability !== undefined && ability !== null)
      usedAbility = ability;

    var firstUseAbilityModifier = 1;
    if (animal.talentTree !== null && animal.talentTree !== undefined && animal.raceVariables !== null && animal.raceVariables !== undefined &&
      animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint && !animal.raceVariables.firstAbilityUseEffectApplied) {
      firstUseAbilityModifier *= 1 + (animal.talentTree.column3Row4Points * .05);
      animal.raceVariables.firstAbilityUseEffectApplied = true;
    }    

    var abilityEfficiencyRelayBonus = 1;
    if (animal.raceVariables !== undefined && animal.raceVariables !== null &&
      animal.raceVariables.relayEffects !== undefined && animal.raceVariables.relayEffects !== null) {
      var abilityEfficiencyRelayEffect = this.getRelayEffectFromListByType(animal.raceVariables.relayEffects, RelayEffectEnum.supportAbilityEfficiency);
      if (abilityEfficiencyRelayEffect !== undefined && abilityEfficiencyRelayEffect.additionalValue !== undefined) {
        abilityEfficiencyRelayBonus = abilityEfficiencyRelayEffect.additionalValue;
      }
    }

    var modifiedPower = (animal.currentStats.powerMs * powerAbilityModifier * terrainModifier * statLossFromExhaustion) / 100;
    var modifiedEfficiency = usedAbility.efficiency * abilityEfficiencyRelayBonus * firstUseAbilityModifier + (usedAbility.efficiency * ((usedAbility.abilityLevel - 1) * .01));

    return modifiedEfficiency * (1 + modifiedPower);
  }

  getAnimalAbilityDescription(shortDescription: boolean, abilityName: string, animal?: Animal) {
    if (shortDescription) {
      if (abilityName === "Second Wind") {
        return "Stamina does not go down for a short period";
      }
      if (abilityName === "Inspiration") {
        return "Increase next racer's max speed on relay";
      }
      if (abilityName === "Pacemaker") {
        return "Increase acceleration for a short period";
      }
      if (abilityName === "Sprint") {
        return "Increase max speed, acceleration, stamina cost for a short period";
      }
      if (abilityName === "Giving Chase") {
        return "Increase acceleration when behind competitors";
      }
      if (abilityName === "On The Hunt") {
        return "Gain max speed after each burst";
      }
      if (abilityName === "Awareness") {
        return "Increase adaptability, focus for a short period";
      }
      if (abilityName === "Prey Instinct") {
        return "Start in extended burst mode";
      }
      if (abilityName === "Nap") {
        return "Delay leg start, increase max speed and focus";
      }
      if (abilityName === "Landslide") {
        return "Delay competitors";
      }
      if (abilityName === "Frenzy") {
        return "Increase burst distance, cannot stumble or lose focus during burst";
      }
      if (abilityName === "Leap") {
        return "Jump to the finish line";
      }
      if (abilityName === "Echolocation") {
        return "Increase adaptability, ignore negative terrain effects for a short period";
      }
      if (abilityName === "Navigator") {
        return "Increase previous and next racer's adaptability";
      }
      if (abilityName === "Flowing Current") {
        return "Increase next racer's acceleration on relay";
      }
      if (abilityName === "Apex Predator") {
        return "Slow competitors if they pass you";
      }
      if (abilityName === "Feeding Frenzy") {
        return "Slow next and previous racers, increase max speed and acceleration for a distance";
      }
      if (abilityName === "Blood In The Water") {
        return "Increase max speed when ahead of competitors";
      }
      if (abilityName === "Propulsion") {
        return "Dash a short distance";
      }
      if (abilityName === "Buried Treasure") {
        return "Delay your start, increase coin gain for winning race";
      }
      if (abilityName === "Big Brain") {
        return "Increase power of other racers after bursting a certain number of times";
      }
      if (abilityName === "Sure-footed") {
        return "Increase adaptability after not stumbling through path";
      }
      if (abilityName === "Deep Breathing") {
        return "Regain stamina after burst, increase other racers' stamina";
      }
      if (abilityName === "In The Rhythm") {
        return "Increase burst speed bonus";
      }
      if (abilityName === "Sticky") {
        return "Cannot stumble for a short period";
      }
      if (abilityName === "Night Vision") {
        return "Increase max speed by keeping focused";
      }
      if (abilityName === "Camouflage") {
        return "Transfer velocity to next racer on relay";
      }
      if (abilityName === "Herd Mentality") {
        return "Grant next racer portion of your stamina, they start in burst mode";
      }
      if (abilityName === "Great Migration") {
        return "Sacrifice stamina for acceleration for a short period";
      }
      if (abilityName === "Special Delivery") {
        return "Increase other racers' burst max speed bonus based on stamina";
      }
      if (abilityName === "Careful Toboggan") {
        return "Increase adaptability for a short period";
      }
      if (abilityName === "Wild Toboggan") {
        return "Increase max drift penalty, acceleration based on drift";
      }
      if (abilityName === "Quick Toboggan") {
        return "Increase max speed if you do not drift";
      }
      if (abilityName === "Cold Blooded") {
        return "Increase stamina and focus for a short period based on distance in leg";
      }
      if (abilityName === "Burrow") {
        return "Avoid lava fall, prevent stumbles for a short period";
      }
      if (abilityName === "Heat Up") {
        return "Increase acceleration for a short period, gets stronger every use";
      }
      if (abilityName === "Trickster") {
        return "Decrease one random stat, increase a different random stat for a short period";
      }
      if (abilityName === "Fleeting Speed") {
        return "Increase max speed greatly, lose over time";
      }
      if (abilityName === "Nine Tails") {
        return "Increase random stat for a short period, effect can stack";
      }
    }
    else {
      var cooldownDisplay = "";
      var selectedAbility = undefined;
      if (animal === undefined || animal === null) {
        this.globalService.globalVar.animals.forEach(possibleAnimal => {
          possibleAnimal.availableAbilities.forEach(ability => {

            if (ability.name === abilityName) {
              animal = possibleAnimal;
              selectedAbility = ability;
              if (ability.cooldown !== undefined && ability.cooldown !== null)
                cooldownDisplay = ability.cooldown.toString();
            }
          });
        });
      }

      if (animal !== undefined && animal !== null) {
        var effectiveAmountDisplay = this.GetAbilityEffectiveAmount(animal, undefined, undefined, selectedAbility).toLocaleString(undefined, {minimumFractionDigits: 2});

        if (cooldownDisplay === "" && animal.ability.cooldown !== undefined && animal.ability.cooldown !== null)
          cooldownDisplay = animal.ability.cooldown.toString();

        var abilityDescription: string | null = "";
        var sanitizedDescription = "";
        if (abilityName === "Second Wind") {
          return "Stamina does not decrease for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Inspiration") {
          return "When the next racer starts, they gain 25% of your Max Speed for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Passive.";
        }
        if (abilityName === "Pacemaker") {
          return "Increase Acceleration Rate by 50% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Sprint") {
          return " Gain 35% Max Speed and Acceleration Rate for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters, but lose twice as much stamina as normal. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Giving Chase") {
          return "While you are behind the average pace, increase Acceleration Rate by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "On The Hunt") {
          return "Every time you Burst, increase your Max Speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.<br/><em>During Event Races:</em> Can trigger up to 25 times. Bonus lost after relaying.";
        }
        if (abilityName === "Awareness") {
          return "Boosts Focus Distance and Adaptability Distance by 40% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Prey Instinct") {
          return "Starts its leg in Burst mode that continues for an additional <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Passive.";
        }
        if (abilityName === "Nap") {
          return "Sleep until the competition has traveled a distance equal to <span class='keyword'>" + effectiveAmountDisplay + "</span> meters from the end of your leg. Max Speed and Focus Distance are then doubled. Passive.";
        }
        if (abilityName === "Landslide") {
          return "Drop rocks on competitors, delaying them <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Frenzy") {
          return "Increase Burst distance by <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. You do not stumble or lose focus while bursting. Passive.";
        }
        if (abilityName === "Leap") {
          return "When you are <span class='keyword'>" + effectiveAmountDisplay + "</span> meters from the finish line, leap straight to the end over .5 seconds. Passive.";
        }
        if (abilityName === "Sure-footed") {
          return "When you make it through a special path without stumbling, increase your Adaptability Distance by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.<br/><em>During Event Races:</em> Can trigger up to 25 times. Bonus lost after relaying.";
        }
        if (abilityName === "Deep Breathing") {
          return "Every time you Burst, regain <span class='keyword'>" + effectiveAmountDisplay + "</span>% of your stamina, up to 100%. If this amount exceeds 100% of your stamina, increase all other racers' stamina by the amount exceeded. Passive.<br/><em>During Event Races:</em> Relay effectiveness reduced to 25%. Can trigger up to 25 times. Effects remain for the duration of the race.";
        }
        if (abilityName === "In The Rhythm") {
          return "Increase your max speed bonus while Bursting by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Sticky") {
          return "Cannot stumble for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Night Vision") {
          return "Increase Max Speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>% for every path you complete without losing focus. If you lose focus, reset this bonus back to 0%. Passive.<br/><em>During Event Races:</em> Can trigger up to 25 times. Bonus lost after relaying.";
        }
        if (abilityName === "Camouflage") {
          return "The velocity you finish your leg at is given to your following racer on Relay. Decrease this amount to 0 evenly over <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. The following racer can break their max speed by up to 50% while this is active. Passive.";
        }
        if (abilityName === "Echolocation") {
          return "Increase your Adaptability Distance by 75% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters and ignore any negative effects from the terrain. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Navigator") {
          return "Assist the previous racer and next racer, boosting their Adaptability Distance by 25% of your max for the last and first <span class='keyword'>" + effectiveAmountDisplay + "</span> meters of their legs respectively. Passive.";
        }
        if (abilityName === "Flowing Current") {
          return "When relaying, increase the Acceleration Rate of your next racer by 25% of your Acceleration Rate for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Passive.";
        }
        if (abilityName === "Apex Predator") {
          return "If the competitors moving at the average pace pass the shark during its leg, immediately bite them, slowing their pace by 50% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Can only occur once. Passive.";
        }
        if (abilityName === "Feeding Frenzy") {
          return "Increase Max Speed and Acceleration Rate by 50% for the first and last <span class='keyword'>" + effectiveAmountDisplay + "</span> meters of your leg. Your next and previous racers have a 10% Max Speed reduction. Passive.";
        }
        if (abilityName === "Blood In The Water") {
          return "While you are ahead of the average pace, increase Max Speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Propulsion") {
          return "Dash <span class='keyword'>" + effectiveAmountDisplay + "</span> meters over .25 seconds. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Buried Treasure") {
          return "Delay your start by 8 seconds. If you still win the race, increase your Coin reward by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Big Brain") {
          return "After Bursting through one third of your race paths, increase Power Efficiency of all remaining racers by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.<br/><em>During Event Races:</em> Can trigger up to 5 times. Effects remain for the duration of the race.";
        }
        if (abilityName === "Herd Mentality") {
          return "After completing your leg, <span class='keyword'>" + effectiveAmountDisplay + "</span>% of your remaining Stamina is given to the next racer and they start their leg in Burst mode. This does not occur if you run out of Stamina during your leg. Passive.";
        }
        if (abilityName === "Great Migration") {
          return "Reduce stamina by 10%. For <span class='keyword'>" + effectiveAmountDisplay + "</span> meters, Acceleration Rate is increased by 25% of the amount of stamina lost. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Special Delivery") {
          return "Increase all remaining racers' Burst Max Speed Bonus by <span class='keyword'>" + effectiveAmountDisplay + "</span>% of your remaining Stamina percentage after completing your leg. This does not occur if you run out of Stamina during your leg. Passive.<br/><em>During Event Races:</em> Relay effectiveness reduced to 25%. Can trigger up to 25 times. Effects remain for the duration of the race.";
        }
        if (abilityName === "Careful Toboggan") {
          return "Increase Adaptability Distance by 60% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Wild Toboggan") {
          return "Double the maximum amount of drift per path. Increase Acceleration Rate by up to <span class='keyword'>" + effectiveAmountDisplay + "</span>% based on how much you drift. Passive.";
        }
        if (abilityName === "Quick Toboggan") {
          return "Every time you make it through a path without drifting, gain <span class='keyword'>" + effectiveAmountDisplay + "</span>% Max Speed. Passive.<br/><em>During Event Races:</em> Can trigger up to 25 times. Bonus lost after relaying.";
        }
        if (abilityName === "Cold Blooded") {
          return "Increase Stamina and Focus Distance by 0-30% depending on how close to the center of the volcano you are. Focus Distance boost lasts <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Burrow") {
          return "Go underground for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters, dodging lava fall and preventing stumbles. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Heat Up") {
          return "Increase Acceleration Rate by 15% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. This increase doubles every subsequent use this race. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Trickster") {
          return "When active, sacrifice 25% of one random stat for 50% of another random stat. Lasts <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Fleeting Speed") {
          return "Increase Max Speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Decrease this bonus by 2% for every percent of the leg you complete. Passive.";
        }
        if (abilityName === "Nine Tails") {
          return "At the start of each path, increase either Acceleration Rate, Max Speed, Focus Distance, or Adaptability Distance by 15% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. This effect can stack. Passive.";
        }

        abilityDescription = this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(abilityDescription));
        if (abilityDescription === null)
          abilityDescription = "";

        sanitizedDescription = abilityDescription;
        return sanitizedDescription;
      }
    }

    return "";
  }

  getBarnByBarnNumber(barnNumber: number) {
    return this.globalService.globalVar.barns.find(item => item.barnNumber === barnNumber);
  }

  getAvailableBarns() {
    var availableBarns = [];
    availableBarns.push(this.getBarnByBarnNumber(1));
    availableBarns.push(this.getBarnByBarnNumber(2));
    availableBarns.push(this.getBarnByBarnNumber(3));

    if (this.isItemUnlocked("barnRow2")) {
      availableBarns.push(this.getBarnByBarnNumber(4));
      availableBarns.push(this.getBarnByBarnNumber(5));
      availableBarns.push(this.getBarnByBarnNumber(6));
    }

    if (this.isItemUnlocked("barnRow3")) {
      availableBarns.push(this.getBarnByBarnNumber(7));
      availableBarns.push(this.getBarnByBarnNumber(8));
      availableBarns.push(this.getBarnByBarnNumber(9));
    }

    if (this.isItemUnlocked("barnRow4")) {
      availableBarns.push(this.getBarnByBarnNumber(10));
      availableBarns.push(this.getBarnByBarnNumber(11));
      availableBarns.push(this.getBarnByBarnNumber(12));
    }

    if (this.isItemUnlocked("barnRow5")) {
      availableBarns.push(this.getBarnByBarnNumber(13));
      availableBarns.push(this.getBarnByBarnNumber(14));
      availableBarns.push(this.getBarnByBarnNumber(15));
    }

    return availableBarns;
  }

  getResourcesForBarnUpgrade(currentLevel: number): ResourceValue[] {
    var allResourcesRequired: ResourceValue[] = [];
    var Coins = new ResourceValue("Coins", 100);
    Coins.amount *= (currentLevel + 1);
    allResourcesRequired.push(Coins);
    if (currentLevel % 10 === 9) {
      var medal = new ResourceValue("Medals", 1);
      allResourcesRequired.push(medal);
    }
    return allResourcesRequired;
  }

  getBarnName(barn: Barn) {
    var barnName = "";
    var barnSize = barn.getSize();

    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.None || barn.barnUpgrades.specialization === undefined ||
      barn.barnUpgrades.specialization === null)
      barnName = barnSize + " Barn " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.Attraction)
      barnName = barnSize + " Attraction " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.BreedingGrounds)
      barnName = barnSize + " Breeding Grounds " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.TrainingFacility)
      barnName = barnSize + " Training Facility " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.ResearchCenter)
      barnName = barnSize + " Research Center " + barn.barnNumber;

    return barnName;
  }

  getTerrainPopoverText(terrain: Terrain, raceLeg: RaceLeg) {
    var popoverText = "The terrain for the " + raceLeg.getCourseTypeName() + " leg is " + terrain.getTerrainType() + ":\n";

    /*if (terrain.staminaModifier !== null && terrain.staminaModifier !== undefined && terrain.staminaModifier !== 0) {
      popoverText += "+" + (terrain.staminaModifier * 100).toFixed(0) + "% stamina cost\n";
    }*/
    if (terrain.staminaModifier !== null && terrain.staminaModifier !== undefined && terrain.staminaModifier !== 1) {
      if (terrain.staminaModifier > 1)
        popoverText += "+" + ((terrain.staminaModifier - 1) * 100).toFixed(0) + "% stamina loss\n";
      else
        popoverText += "-" + ((1 - terrain.staminaModifier) * 100).toFixed(0) + "% stamina loss\n";
    }

    if (terrain.maxSpeedModifier !== null && terrain.maxSpeedModifier !== undefined && terrain.maxSpeedModifier !== 1) {
      if (terrain.maxSpeedModifier > 1)
        popoverText += "+" + ((terrain.maxSpeedModifier - 1) * 100).toFixed(0) + "% max speed\n";
      else
        popoverText += "-" + ((1 - terrain.maxSpeedModifier) * 100).toFixed(0) + "% max speed\n";
    }

    if (terrain.accelerationModifier !== null && terrain.accelerationModifier !== undefined && terrain.accelerationModifier !== 1) {
      if (terrain.accelerationModifier > 1)
        popoverText += "+" + ((terrain.accelerationModifier - 1) * 100).toFixed(0) + "% acceleration\n";
      else
        popoverText += "-" + ((1 - terrain.accelerationModifier) * 100).toFixed(0) + "% acceleration\n";
    }

    if (terrain.powerModifier !== null && terrain.powerModifier !== undefined && terrain.powerModifier !== 1) {
      if (terrain.powerModifier > 1)
        popoverText += "+" + ((terrain.powerModifier - 1) * 100).toFixed(0) + "% power efficiency\n";
      else
        popoverText += "-" + ((1 - terrain.powerModifier) * 100).toFixed(0) + "% power efficiency\n";
    }

    if (terrain.focusModifier !== null && terrain.focusModifier !== undefined && terrain.focusModifier !== 1) {
      if (terrain.focusModifier > 1)
        popoverText += "+" + ((terrain.focusModifier - 1) * 100).toFixed(0) + "% meters before losing focus\n";
      else
        popoverText += "-" + ((1 - terrain.focusModifier) * 100).toFixed(0) + "% meters before losing focus\n";
    }

    if (terrain.adaptabilityModifier !== null && terrain.adaptabilityModifier !== undefined && terrain.adaptabilityModifier !== 1) {
      if (terrain.adaptabilityModifier > 1)
        popoverText += "+" + ((terrain.adaptabilityModifier - 1) * 100).toFixed(0) + "% meters before stumbling\n";
      else
        popoverText += "-" + ((1 - terrain.adaptabilityModifier) * 100).toFixed(0) + "% meters before stumbling\n";
    }

    return popoverText;
  }

  getInDepthSpecializationDescription(specializationName: string) {
    var description = "";

    if (specializationName === "Breeding Grounds") {
      var increaseAmount = 0;
      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "breedingGroundsSpecializationModifier");
      if (modifierPair !== null && modifierPair !== undefined)
        increaseAmount = modifierPair.value;

      description = "For every 10 levels, gain " + (increaseAmount * 100) + "% additional breed XP when completing a training.";
    }
    else if (specializationName === "Training Facility") {
      description = "For every 10 levels up to level 200, gain 1% training time reduction. For every 10 levels after level 200, gain a .1 stat multiplier for every stat.";
    }
    else if (specializationName === "Attraction") {
      var timeToCollect = 60;
      var timeToCollectPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionTimeToCollectModifier");

      if (timeToCollectPair !== undefined && timeToCollectPair !== null)
        timeToCollect = timeToCollectPair.value;

      var amountEarned = 0;
      var amountEarnedPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionAmountModifier");

      if (amountEarnedPair !== undefined && amountEarnedPair !== null)
        amountEarned = amountEarnedPair.value;

      description = "For every 10 levels, gain " + amountEarned + " Coins every " + timeToCollect + " seconds while an animal trains in this barn.";
    }
    else if (specializationName === "Research Center") {
      var statGainIncrementsModifier = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterIncrementsModifier");
      var trainingAnimalDefaultModifier = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterTrainingAnimalModifier");
      var studyingAnimalDefaultModifier = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterStudyingAnimalModifier");
      var maxStatGainModifier = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterMaxStatGainModifier");

      var statGainIncrements = .05;
      var trainingAnimalDefault = .45;
      var studyingAnimalDefault = .25;
      var maxStatGain = .5;

      if (statGainIncrementsModifier !== undefined && statGainIncrementsModifier !== null)
        statGainIncrements = statGainIncrementsModifier.value;
      if (trainingAnimalDefaultModifier !== undefined && trainingAnimalDefaultModifier !== null)
        trainingAnimalDefault = trainingAnimalDefaultModifier.value;
      if (studyingAnimalDefaultModifier !== undefined && studyingAnimalDefaultModifier !== null)
        studyingAnimalDefault = studyingAnimalDefaultModifier.value;
      if (maxStatGainModifier !== undefined && maxStatGainModifier !== null)
        maxStatGain = maxStatGainModifier.value;

      description = "To start, the animal training only gains " + ((trainingAnimalDefault + statGainIncrements) * 100) + "% of the stats from their training. An animal at random will gain " + (studyingAnimalDefault * 100) + "% of the stats from training, prioritizing animals of the same course type. For every 10 levels, " + (statGainIncrements * 100) + "% additional stat gain will be distributed up to " + (maxStatGain * 100) + "% starting with the training animal. Additional animals will gain stats after maxing out the previous.";
    }

    return description;
  }

  //no lookups for string enums so gotta do it myself
  convertSpecializationNameToEnum(specializationName: string): BarnSpecializationEnum {
    if (specializationName === "Breeding Grounds")
      return BarnSpecializationEnum.BreedingGrounds;
    if (specializationName === "Training Facility")
      return BarnSpecializationEnum.TrainingFacility;
    if (specializationName === "Attraction")
      return BarnSpecializationEnum.Attraction;
    if (specializationName === "Research Center")
      return BarnSpecializationEnum.ResearchCenter;

    return BarnSpecializationEnum.None;
  }

  convertTalentTreeNameToEnum(talentTreeName: string): TalentTreeTypeEnum {
    if (talentTreeName === "Sprint")
      return TalentTreeTypeEnum.sprint;
    if (talentTreeName === "Support")
      return TalentTreeTypeEnum.support;
    if (talentTreeName === "Long Distance")
      return TalentTreeTypeEnum.longDistance;

    return TalentTreeTypeEnum.none;
  }

  convertSpecializationEnumToName(specializationEnum: BarnSpecializationEnum) {
    if (specializationEnum === BarnSpecializationEnum.BreedingGrounds)
      return "Breeding Grounds";
    if (specializationEnum === BarnSpecializationEnum.TrainingFacility)
      return "Training Facility";
    if (specializationEnum === BarnSpecializationEnum.Attraction)
      return "Attraction";
    if (specializationEnum === BarnSpecializationEnum.ResearchCenter)
      return "Research Center";

    return "None";
  }

  getTrainingTimeReductionFromTrainingFacility(barnUpgrades: BarnUpgrades) {
    if (barnUpgrades.specialization === BarnSpecializationEnum.TrainingFacility) {
      return barnUpgrades.specializationLevel * .01;
    }

    return 0;
  }

  getTrainingProgressionAnimationText(training: TrainingOption) {
    var text = "";
    if (training.affectedStatRatios.topSpeed > 0)
      text += "+SPD\n";
    if (training.affectedStatRatios.acceleration > 0)
      text += "+ACC\n";
    if (training.affectedStatRatios.endurance > 0)
      text += "+END\n";
    if (training.affectedStatRatios.power > 0)
      text += "+PWR\n";
    if (training.affectedStatRatios.focus > 0)
      text += "+FCS\n";
    if (training.affectedStatRatios.adaptability > 0)
      text += "+ADP\n";

    return text;
  }

  /*getEquipmentFromResource(resource: ResourceValue) {
    var equipmentName = resource.name;
    
  }*/

  relayEffectTypeStacksEffectiveness(type: RelayEffectEnum) {
    var stacks = false;
    if (type === RelayEffectEnum.bigBrain || type === RelayEffectEnum.herdMentality || type === RelayEffectEnum.deepBreathing ||  
      type === RelayEffectEnum.specialDelivery)
      stacks = true;

    return stacks;
  }

  relayEffectPersistsEventSegments(type: RelayEffectEnum) {
    var stacks = false;
    if (type === RelayEffectEnum.bigBrain || type === RelayEffectEnum.redBaton || type === RelayEffectEnum.blueBaton
      || type === RelayEffectEnum.greenBaton || type === RelayEffectEnum.orangeBaton || type === RelayEffectEnum.violetBaton
      || type === RelayEffectEnum.yellowBaton)
      stacks = true;

    return stacks;
  }

  getBreedLevelRequiredForGrandPrix() {
    var grandPrixBreedLevelRequired = 50;
    var grandPrixBreedLevelRequiredPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixBreedLevelRequiredModifier");
    if (grandPrixBreedLevelRequiredPair !== null && grandPrixBreedLevelRequiredPair !== undefined)
      grandPrixBreedLevelRequired = grandPrixBreedLevelRequiredPair.value;

    return grandPrixBreedLevelRequired;
  }

  canAnimalTrain(animal: Animal) {
    var canAnimalTrain = true;

    if (this.globalService.globalVar.incubator.assignedAnimal === animal)
      canAnimalTrain = false;

    var grandPrixRacingAnimal = this.globalService.getCurrentlyActiveGrandPrixRacingAnimal();
    if (animal.type === grandPrixRacingAnimal.type)
      canAnimalTrain = false;

    return canAnimalTrain;
  }

  canAnimalRace(animal: Animal) {
    var canAnimalTrain = true;

    var grandPrixRacingAnimal = this.globalService.getCurrentlyActiveGrandPrixRacingAnimal();

    if (animal.type === grandPrixRacingAnimal.type)
      canAnimalTrain = false;


    return canAnimalTrain;
  }

  getTraitStatGainDescription(trait: AnimalTraits) {
    var positiveStat = "";
    var negativeStat = "";

    if (trait.positiveStatGain === AnimalStatEnum.acceleration)
      positiveStat = "Acceleration";
    if (trait.positiveStatGain === AnimalStatEnum.adaptability)
      positiveStat = "Adaptability";
    if (trait.positiveStatGain === AnimalStatEnum.endurance)
      positiveStat = "Endurance";
    if (trait.positiveStatGain === AnimalStatEnum.focus)
      positiveStat = "Focus";
    if (trait.positiveStatGain === AnimalStatEnum.power)
      positiveStat = "Power";
    if (trait.positiveStatGain === AnimalStatEnum.topSpeed)
      positiveStat = "Speed";

    if (trait.negativeStatGain === AnimalStatEnum.acceleration)
      negativeStat = "Acceleration";
    if (trait.negativeStatGain === AnimalStatEnum.adaptability)
      negativeStat = "Adaptability";
    if (trait.negativeStatGain === AnimalStatEnum.endurance)
      negativeStat = "Endurance";
    if (trait.negativeStatGain === AnimalStatEnum.focus)
      negativeStat = "Focus";
    if (trait.negativeStatGain === AnimalStatEnum.power)
      negativeStat = "Power";
    if (trait.negativeStatGain === AnimalStatEnum.topSpeed)
      negativeStat = "Speed";

    return "+" + trait.researchLevel + "% " + positiveStat + ", -" + (trait.researchLevel > 25 ? 25 : trait.researchLevel) + "% " + negativeStat;
  }

  getSpecialtyItemDescription(itemName: string) {
    var description = ""

    var internationalRaceCountNeeded = 5;
    var internationalRaceCountNeededModifier = this.globalService.globalVar.modifiers.find(item => item.text === "internationalRacesToMedalModifier");
    if (internationalRaceCountNeededModifier !== undefined && internationalRaceCountNeededModifier !== null)
      internationalRaceCountNeeded = internationalRaceCountNeededModifier.value;

    var nationalRaceCountNeeded = 10;
    var nationalRaceCountNeededModifier = this.globalService.globalVar.modifiers.find(item => item.text === "nationalRacesToMedalModifier");
    if (nationalRaceCountNeededModifier !== undefined && nationalRaceCountNeededModifier !== null)
      nationalRaceCountNeeded = nationalRaceCountNeededModifier.value;

    var whistleStatGain = 5;
    var whistleStatGainModifier = this.globalService.globalVar.modifiers.find(item => item.text === "whistleModifier");
    if (whistleStatGainModifier !== undefined && whistleStatGainModifier !== null)
      whistleStatGain = whistleStatGainModifier.value;

    var goldenWhistleStatGain = 5;
    var goldenWhistleStatGainModifier = this.globalService.globalVar.modifiers.find(item => item.text === "goldenWhistleModifier");
    if (goldenWhistleStatGainModifier !== undefined && goldenWhistleStatGainModifier !== null)
      goldenWhistleStatGain = goldenWhistleStatGainModifier.value;


    if (itemName === "Stopwatch")
      description = "Reduce training time by 5%";
    else if (itemName === "Animal Handler")
      description = "Retain 2% of trained stats after breeding";
    else if (itemName === "Course Maps")
      description = "Increase your chance to burst during special routes by 10%";
    else if (itemName === "Stockbreeder")
      description = "Add option to auto breed when Breed XP is full";
    else if (itemName === "Scouts")
      description = "You can choose the order of race legs for each relay team";
    else if (itemName === "Money Mark")
      description = "Add new indicator to race, beat its time to gain increased coins";
    else if (itemName === "National Races")
      description = "Gain 1 medal for every " + nationalRaceCountNeeded + " free races you complete";
    else if (itemName === "International Races")
      description = "Gain 1 medal for every " + internationalRaceCountNeeded + " free races you complete";
    else if (itemName === "Team Manager")
      description = "Add option to automatically run 1 free race per reset period <em>(runs for 2 hours of idle time)</em>";
    else if (itemName === "Incubator Upgrade Lv1")
      description = "When breeding, permanently increase racing stat gain from base stat by .1% of positive trait value <em>(up to 10% trait value)</em>";
    else if (itemName === "Incubator Upgrade Lv2")
      description = "When breeding, permanently increase racing stat gain from base stat by .1% of positive trait value <em>(up to 25% trait value)</em>";
    else if (itemName === "Incubator Upgrade Lv3")
      description = "When breeding, permanently increase racing stat gain from base stat by .1% of positive trait value <em>(up to 50% trait value)</em>";
    else if (itemName === "Incubator Upgrade Lv4")
      description = "When breeding, permanently increase racing stat gain from base stat by .1% of positive trait value <em>(up to 100% trait value)</em>";
    else if (itemName === "Whistle")
      description = "Gain +" + whistleStatGain + " to a stat instead of +1 after a successful coaching attempt";
    else if (itemName === "Golden Whistle")
      description = "Gain +" + goldenWhistleStatGain + " to a stat instead of +" + whistleStatGain + " after a successful coaching attempt";

    var sanitized = this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(description));
    if (sanitized !== null)
      description = sanitized;
    return description;
  }

  getWeatherClusterFromEnum(weatherCluster: WeatherEnum) {
    var text = "";

    if (weatherCluster === WeatherEnum.clearSkies)
      text = "Clear Skies";
    else if (weatherCluster === WeatherEnum.inclementWeather)
      text = "Inclement Weather";
    else if (weatherCluster === WeatherEnum.coldSpell)
      text = "Cold Spell";

    return text;
  }

  getWeatherClusterDescription(weatherCluster: WeatherEnum) {
    var text = "";

    if (weatherCluster === WeatherEnum.clearSkies)
      text = "Race terrain shifts between Sunny, Torrid, and Ashfall. \n Flatland and Volcanic Morale increased by 20%.";
    else if (weatherCluster === WeatherEnum.inclementWeather)
      text = "Race terrain shifts between Rainy, Stormy, Maelstrom, and Hailstorm. \n Ocean Morale increased by 20%.";
    else if (weatherCluster === WeatherEnum.coldSpell)
      text = "Race terrain shifts between Sunny, Snowfall, and Hailstorm. \n Tundra and Mountain Morale increased by 20%.";

    return text;
  }

  topSpeedPopover(animal: Animal): string {
    var baseMaxSpeedModifier = animal.currentStats.defaultMaxSpeedModifier;
    var animalTypeName = animal.getAnimalType().toLowerCase();

    var animalMaxSpeedModifier = this.globalService.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultMaxSpeedModifier");

    if (animalMaxSpeedModifier !== undefined && animalMaxSpeedModifier !== null)
      baseMaxSpeedModifier = animalMaxSpeedModifier.value;

    var breedLevelStatModifierValue = .02;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var traitModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.topSpeed);

    var topSpeedTalentModifier = 1;
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
      topSpeedTalentModifier = 1 + (animal.talentTree.column2Row3Points / 100);
    }

    var popover = "Every stat point increases max speed by " + this.getMaxSpeedModifierByAnimalType(animal.type).toFixed(3) + "m/s up to diminishing returns. \n\n" +
      "Base: " + baseMaxSpeedModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.maxSpeedModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.maxSpeedModifier.toFixed(3) + "\n";

    if (topSpeedTalentModifier > 1)
      popover += "Long Distance Talents: *" + topSpeedTalentModifier.toFixed(2) + "\n";

    return popover;
  }

  accelerationPopover(animal: Animal): string {
    var baseAccelerationModifier = animal.currentStats.defaultAccelerationModifier;
    var animalTypeName = animal.getAnimalType().toLowerCase();

    var animalAccelerationModifier = this.globalService.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultAccelerationModifier");

    if (animalAccelerationModifier !== undefined && animalAccelerationModifier !== null)
      baseAccelerationModifier = animalAccelerationModifier.value;

    var breedLevelStatModifierValue = .02;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var traitModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.acceleration);

    var accelerationTalentModifier = 1;
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
      accelerationTalentModifier = 1 + (animal.talentTree.column2Row3Points / 100);
    }

    var popover = "Every stat point increases acceleration by " + this.getAccelerationModifierByAnimalType(animal.type).toFixed(3) + "m/s up to diminishing returns. \n\n" +
      "Base: " + baseAccelerationModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.accelerationModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.accelerationModifier.toFixed(3) + "\n";

    if (accelerationTalentModifier > 1)
      popover += "Sprint Talents: *" + accelerationTalentModifier.toFixed(2) + "\n";

    return popover;
  }

  endurancePopover(animal: Animal): string {
    var baseStaminaModifier = animal.currentStats.defaultStaminaModifier;
    var animalTypeName = animal.getAnimalType().toLowerCase();

    var animalStaminaModifier = this.globalService.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultStaminaModifier");

    if (animalStaminaModifier !== undefined && animalStaminaModifier !== null)
      baseStaminaModifier = animalStaminaModifier.value;

    var breedLevelStatModifierValue = .02;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var traitModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.endurance);

    var enduranceTalentModifier = 1;
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
      enduranceTalentModifier = 1 + (animal.talentTree.column3Row3Points / 100);
    }

    var popover = "Every stat point increases stamina by " + this.getStaminaModifierByAnimalType(animal.type).toFixed(3) + " up to diminishing returns. \n\n" +
      "Base: " + baseStaminaModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.staminaModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.staminaModifier.toFixed(3) + "\n";

    if (enduranceTalentModifier > 1)
      popover += "Long Distance Talents: *" + enduranceTalentModifier.toFixed(2) + "\n";

    return popover;
  }

  powerPopover(animal: Animal): string {
    var basePowerModifier = animal.currentStats.defaultPowerModifier;
    var animalTypeName = animal.getAnimalType().toLowerCase();

    var animalPowerModifier = this.globalService.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultPowerModifier");

    if (animalPowerModifier !== undefined && animalPowerModifier !== null)
      basePowerModifier = animalPowerModifier.value;

    var breedLevelStatModifierValue = .02;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var traitModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.power);

    var powerTalentModifier = 1;
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
      powerTalentModifier = 1 + (animal.talentTree.column3Row3Points / 100);
    }

    var popover = "Every stat point increases ability efficiency by " + this.getPowerModifierByAnimalType(animal.type).toFixed(3) + "% up to diminishing returns. \n\n" +
      "Base: " + basePowerModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.powerModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.powerModifier.toFixed(3) + "\n";

    if (powerTalentModifier > 1)
      popover += "Sprint Talents: *" + powerTalentModifier.toFixed(2) + "\n";

    return popover;
  }

  focusPopover(animal: Animal): string {
    var baseFocusModifier = animal.currentStats.defaultFocusModifier;
    var animalTypeName = animal.getAnimalType().toLowerCase();

    var animalFocusModifier = this.globalService.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultFocusModifier");

    if (animalFocusModifier !== undefined && animalFocusModifier !== null)
      baseFocusModifier = animalFocusModifier.value;

    var breedLevelStatModifierValue = .02;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var traitModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.focus);

    var focusTalentModifier = 1;
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
      focusTalentModifier = 1 + (animal.talentTree.column1Row3Points / 100);
    }

    var popover = "Every stat point increases focus distance by " + this.getFocusModifierByAnimalType(animal.type).toFixed(3) + " meters up to diminishing returns. \n\n" +
      "Base: " + baseFocusModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.focusModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.focusModifier.toFixed(3) + "\n";

    if (focusTalentModifier > 1)
      popover += "Long Distance Talents: *" + focusTalentModifier.toFixed(2) + "\n";

    return popover;
  }

  adaptabilityPopover(animal: Animal): string {
    var baseAdaptabilityModifier = animal.currentStats.defaultAdaptabilityModifier;
    var animalTypeName = animal.getAnimalType().toLowerCase();

    var animalAdaptabilityModifier = this.globalService.globalVar.modifiers.find(item => item.text === animalTypeName + "DefaultAdaptabilityModifier");

    if (animalAdaptabilityModifier !== undefined && animalAdaptabilityModifier !== null)
      baseAdaptabilityModifier = animalAdaptabilityModifier.value;

    var breedLevelStatModifierValue = .02;
    var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (breedLevelStatModifier !== undefined && breedLevelStatModifier !== null)
      breedLevelStatModifierValue = breedLevelStatModifier.value;
    breedLevelStatModifierValue = 1 + (breedLevelStatModifierValue * (animal.breedLevel - 1));

    var traitModifier = this.globalService.getTraitModifier(animal, AnimalStatEnum.adaptability);

    var adaptabilityTalentModifier = 1;
    if (animal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
      adaptabilityTalentModifier = 1 + (animal.talentTree.column1Row3Points / 100);
    }

    var popover = "Every stat point increases adaptability distance by " + this.getAdaptabilityModifierByAnimalType(animal.type).toFixed(3) + " meters up to diminishing returns. \n\n" +
      "Base: " + baseAdaptabilityModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.adaptabilityModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.adaptabilityModifier.toFixed(3) + "\n";

    if (adaptabilityTalentModifier > 1)
      popover += "Sprint Talents: *" + adaptabilityTalentModifier.toFixed(2) + "\n";

    return popover;
  }

  abilityPopover() {
    var abilityLevelCap = 25;
    var abilityLevelCapModifier = this.globalService.globalVar.modifiers.find(item => item.text === "abilityLevelCapModifier");
    if (abilityLevelCapModifier !== null && abilityLevelCapModifier !== undefined)
      abilityLevelCap = abilityLevelCapModifier.value;

    var popover = "Select from up to three different abilities by clicking on their names here. Using your ability during a race will award your ability XP which increases its effectiveness. Ability level cannot exceed your animal's breed level + " + abilityLevelCap + ".";

    return popover;
  }

  abilityLevelPopover(animal: Animal) {
    var popover = "Base Efficiency: " + animal.ability.efficiency + "\n";

    if (animal.ability.abilityLevel > 1)
      popover += "Level Efficiency Multiplier: " + (1 + (animal.ability.abilityLevel - 1) * .01);

    return popover;
  }

  bonusFreeRaceXpPopover(animal: Animal) {
    var popover = "";
    var trackRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusBreedXpFromFreeRaces();

    if (trackRaceBonus > 0)
      popover += "Track Race Rewards: " + trackRaceBonus + "\n";

    if (animal.miscStats.bonusLocalBreedXpCertificateCount > 0)
      popover += "Certificates Bonus: " + animal.miscStats.bonusLocalBreedXpCertificateCount + " (Certificates Used: " + animal.miscStats.bonusLocalBreedXpCertificateCount + "/" + animal.miscStats.certificateUseCap + ")" + "\n";

    return popover;
  }

  bonusCircuitRaceXpPopover(animal: Animal) {
    var popover = "";
    var trackRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusBreedXpFromCircuitRaces();

    if (trackRaceBonus > 0)
      popover += "Track Race Rewards: " + trackRaceBonus + "\n";

    if (animal.miscStats.bonusCircuitBreedXpCertificateCount > 0)
      popover += "Certificates Bonus: " + (2 * animal.miscStats.bonusCircuitBreedXpCertificateCount) + " (Certificates Used: " + animal.miscStats.bonusCircuitBreedXpCertificateCount + "/" + animal.miscStats.certificateUseCap + ")" + "\n";

    return popover;
  }

  bonusTrainingXpPopover(animal: Animal) {
    var popover = "";
    var trackRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusBreedXpFromTraining();

    if (trackRaceBonus > 0)
      popover += "Track Race Rewards: " + trackRaceBonus + "\n";

    if (animal.miscStats.bonusTrainingBreedXpCertificateCount > 0)
      popover += "Certificates Bonus: " + animal.miscStats.bonusTrainingBreedXpCertificateCount + " (Certificates Used: " + animal.miscStats.bonusTrainingBreedXpCertificateCount + "/" + animal.miscStats.certificateUseCap + ")" + "\n";

    return popover;
  }

  bonusDiminishingReturnsPerFacilityLevelPopover(animal: Animal) {
    var popover = "";
    var trackRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusDiminishingReturnsPerFacilityLevel();

    if (trackRaceBonus > 0)
      popover += "Track Race Rewards: " + trackRaceBonus + "\n";

    if (animal.miscStats.bonusDiminishingReturnsCertificateCount > 0)
      popover += "Certificates Bonus: " + animal.miscStats.bonusDiminishingReturnsCertificateCount + " (Certificates Used: " + animal.miscStats.bonusDiminishingReturnsCertificateCount + "/" + animal.miscStats.certificateUseCap + ")" + "\n";


    return popover;
  }

  bonusTrainingTimeReductionPopover(animal: Animal) {
    var popover = "";
    var trackRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusTrainingTimeReduction();

    if (trackRaceBonus > 0)
      popover += "Track Race Rewards: " + trackRaceBonus + "%" + "\n";

    return popover;
  }

  bonusTalentsPopover(animal: Animal) {
    var popover = "";
    var trackRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusTalents();

    if (trackRaceBonus > 0)
      popover += "Track Race Rewards: " + trackRaceBonus + "\n";

    return popover;
  }


  isAmountMoreThanCertificateCap(selectedAmount: number, selectedAnimal: Animal, certificateName: string) {
    var isAmountMoreThanCap = false;
    selectedAmount = +selectedAmount;

    if (certificateName === "Free Race Breed XP Gain Certificate") {
      if (selectedAnimal.miscStats.bonusLocalBreedXpCertificateCount + selectedAmount > selectedAnimal.miscStats.certificateUseCap) {
        isAmountMoreThanCap = true;
      }
    }
    if (certificateName === "Circuit Race Breed XP Gain Certificate") {
      if (selectedAnimal.miscStats.bonusCircuitBreedXpCertificateCount + selectedAmount > selectedAnimal.miscStats.certificateUseCap) {
        isAmountMoreThanCap = true;
      }
    }
    if (certificateName === "Training Breed XP Gain Certificate") {
      if (selectedAnimal.miscStats.bonusTrainingBreedXpCertificateCount + selectedAmount > selectedAnimal.miscStats.certificateUseCap) {
        isAmountMoreThanCap = true;
      }
    }
    if (certificateName === "Diminishing Returns Increase Certificate") {
      if (selectedAnimal.miscStats.bonusDiminishingReturnsCertificateCount + selectedAmount > selectedAnimal.miscStats.certificateUseCap) {
        isAmountMoreThanCap = true;
      }
    }

    return isAmountMoreThanCap;
  }

  getAnimalMorale(type: AnimalTypeEnum) {
    if (this.globalService.globalVar.eventRaceData === undefined || this.globalService.globalVar.eventRaceData === null ||
      this.globalService.globalVar.eventRaceData.animalData === undefined || this.globalService.globalVar.eventRaceData.animalData === null ||
      this.globalService.globalVar.eventRaceData.animalData.length === 0)
      return 0;

    var affectedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === type);
    if (affectedAnimalData === null || affectedAnimalData === undefined)
      return 0;

    return affectedAnimalData.morale;
  }

  changeGrandPrixMorale(type: AnimalTypeEnum, change: number) {
    if (this.globalService.globalVar.eventRaceData === undefined || this.globalService.globalVar.eventRaceData === null ||
      this.globalService.globalVar.eventRaceData.animalData === undefined || this.globalService.globalVar.eventRaceData.animalData === null ||
      this.globalService.globalVar.eventRaceData.animalData.length === 0)
      return;

    var affectedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === type);
    if (affectedAnimalData === null || affectedAnimalData === undefined)
      return;

    affectedAnimalData.morale += change;

    if (affectedAnimalData.morale >= 3)
      affectedAnimalData.morale = 3;

    if (affectedAnimalData.morale <= .5)
      affectedAnimalData.morale = .5;
  }

  getWeekDayGrandPrixTimeSpan() {
    var grandPrix = new GrandPrixData();

    var startTimeText = this.utilityService.getDayOfWeekFromNumber(grandPrix.weekStartDay) + " " + this.utilityService.get24HourFormat(grandPrix.weekStartHour) + " (" + this.utilityService.getAmPmTimeFromHours(grandPrix.weekStartHour) + ")"
      + " to " + this.utilityService.getDayOfWeekFromNumber(grandPrix.weekEndDay) + " " + this.utilityService.get24HourFormat(grandPrix.weekEndHour) + " (" + this.utilityService.getAmPmTimeFromHours(grandPrix.weekEndHour) + ")";

    return startTimeText;
  }

  getWeekEndGrandPrixTimeSpan() {
    var grandPrix = new GrandPrixData();

    var startTimeText = this.utilityService.getDayOfWeekFromNumber(grandPrix.weekendStartDay) + " " + this.utilityService.get24HourFormat(grandPrix.weekendStartHour) + " (" + this.utilityService.getAmPmTimeFromHours(grandPrix.weekendStartHour) + ")"
      + " to " + this.utilityService.getDayOfWeekFromNumber(grandPrix.weekendEndDay) + " " + this.utilityService.get24HourFormat(grandPrix.weekendEndHour) + " (" + this.utilityService.getAmPmTimeFromHours(grandPrix.weekendEndHour) + ")";

    return startTimeText;
  }

  getRandomTip() {
    var tip = "";
    var tipList = [];

    if (!this.globalService.globalVar.settings.get("hideTips")) {
      tipList.push("After upgrading training options, reselect them to gain their benefits!");
      tipList.push("Don't forget to export your save regularly!");
      tipList.push("Have to recite the alphabet to figure out what your next circuit rank is? You're not alone, go to the settings to use numbers instead!");
      tipList.push("Small barns allow training for 2 hours, medium for 4 hours, and large for 8 hours. Your animals will train even when the game is not active.");
      tipList.push("Each animal is predisposed to racing a certain way, meaning they may gain more or less racing stats from a base stat than other animals. Hover over each base stat in the Animals tab to see its modifier.");
      tipList.push("Can't quite finish a close race and don't want to breed? Burst Chance and Distance are not affected by Diminishing Returns, so you can continue to increase those stats to try and push you over the edge!")

      var rng = this.utilityService.getRandomInteger(0, tipList.length - 1);
      tip = tipList[rng];
    }

    return tip;
  }

  getTotalFreeRacesPerPeriod() {
    var freeRacePerTimePeriod = 10;
    var freeRacePerTimePeriodPair = this.globalService.globalVar.modifiers.find(item => item.text === "freeRacesPerTimePeriodModifier");
    if (freeRacePerTimePeriodPair !== undefined)
      freeRacePerTimePeriod = freeRacePerTimePeriodPair.value;

    var renown = this.getRenown();
    var renownBonusRaces = Math.floor(renown / 100);

    return freeRacePerTimePeriod + renownBonusRaces;
  }

  getRemainingFreeRacesPerPeriod() {
    return this.getTotalFreeRacesPerPeriod() - this.globalService.globalVar.freeRaceCounter;
  }

  getRelayEffectFromListByType(relayEffects: RelayEffect[], type: RelayEffectEnum) {
    if (relayEffects === undefined || relayEffects === null || relayEffects.length === 0)
      return undefined;

    return relayEffects.find(item => item.effectType === type);
  }

  isEquipmentItemAnOrb(name: string) {
    if (name === "Amethyst Orb" || name === "Sapphire Orb" || name === "Amber Orb" ||
      name === "Topaz Orb" || name === "Emerald Orb" || name === "Ruby Orb")
      return true;

    return false;
  }

  getStatGainDescription(affectedStatRatios: AnimalStats, statGain: number): string {
    var statGainDescription = "";

    if (affectedStatRatios.topSpeed > 0)
        statGainDescription += "+" + statGain * affectedStatRatios.topSpeed + " Speed\n";
    if (affectedStatRatios.acceleration > 0)
        statGainDescription += "+" + statGain * affectedStatRatios.acceleration + " Acceleration\n";
    if (affectedStatRatios.endurance > 0)
        statGainDescription += "+" + statGain * affectedStatRatios.endurance + " Endurance\n";
    if (affectedStatRatios.focus > 0)
        statGainDescription += "+" + statGain * affectedStatRatios.focus + " Focus\n";
    if (affectedStatRatios.power > 0)
        statGainDescription += "+" + statGain * affectedStatRatios.power + " Power\n";
    if (affectedStatRatios.adaptability > 0)
        statGainDescription += "+" + statGain * affectedStatRatios.adaptability + " Adaptability\n";

    return statGainDescription;
}

  getTalentTreeNames() {
    var talentTrees = [];

    talentTrees.push("Sprint");
    talentTrees.push("Support");
    talentTrees.push("Long Distance");

    return talentTrees;
  }

  getInDepthTalentTreeDescription(talentTree: string) {
    var description = "";

    if (talentTree === "Sprint") {
      description = "Sprinters excel at going short distances quickly. Whether it's through chaining together quick Bursts or powerful abilities, these racers will leave others in the dust at the starting line. Recommended for when you want to get the most out of Burst effects and high acceleration.";
    }
    else if (talentTree === "Support") {
      description = "Supporters excel when working alongside other animals. They have a special way of encouraging the racers after and sometimes before them to reach new limits. Recommended for when you want to get the most out of Relay effects.";
    }
    else if (talentTree === "Long Distance") {
      description = "Long Distance Racers excel when given time to ramp up and go the distance. These racers manage their stamina well and can reach incredible speeds over time. Recommended for racers with high max speed and that have abilities that improve over time.";
    }

    return description;
  }

  getTalentDescription(row: number, column: number, talentTreeType: TalentTreeTypeEnum, numberOfPoints?: number) {
    var description = "";
    if (numberOfPoints === null || numberOfPoints === undefined || numberOfPoints <= 0)
      numberOfPoints = 1;

    if (talentTreeType === TalentTreeTypeEnum.sprint) {
      if (row === 0 && column === 0)
        description = "Increase Adaptability stat gain from training by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 0)
        description = "Increase Adaptability Distance by <span class='keyword'>" + 5 * numberOfPoints + "</span>% until you lose focus for the first time.";
      if (row === 2 && column === 0)
        description = "Increase Adaptability Distance gain from Adaptability stat by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 0)
        description = "Every time you make it through a special path without stumbling, enter a Burst that lasts <span class='keyword'>" + 5 * numberOfPoints + "</span>% as long as normal.";

      if (row === 0 && column === 1)
        description = "Increase Acceleration stat gain from training by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 1)
        description = "The first time velocity exceeds Max Speed while bursting, increase remaining burst distance by <span class='keyword'>" + 5 * numberOfPoints + "</span>%.";
      if (row === 2 && column === 1)
        description = "Increase Acceleration Rate gain from Acceleration stat by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 1)
        description = "Each time your velocity reaches Max Speed, increase Max Speed by <span class='keyword'>" + numberOfPoints * .5 + "</span>% and reduce Focus Distance by <span class='keyword'>" + numberOfPoints * .5 + "</span>%. This effect can occur 10 times, up to <span class='keyword'>" + numberOfPoints * 5 + "</span>%.";

      if (row === 0 && column === 2)
        description = "Increase Power stat gain from training by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 2)
        description = "Increase Power Efficiency by <span class='keyword'>" + 5 * numberOfPoints + "</span>%, but consume stamina <span class='keyword'>" + 5 * numberOfPoints + "</span>% faster.";
      if (row === 2 && column === 2)
        description = "Increase Power Efficiency gain from Power stat by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 2)
        description = "The first time you use an ability every race, the efficiency is increased by <span class='keyword'>" + 5 * numberOfPoints + "</span>%.";
    }
    if (talentTreeType === TalentTreeTypeEnum.support) {
      if (row === 0 && column === 0)
        description = "Increase Relay Animal's Adaptability Distance by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 0)
        description = "Increase the effectiveness of your Relay effects by <span class='keyword'>" + 2 * numberOfPoints + "</span>%.";
      if (row === 2 && column === 0)
        description = "Increase Relay Animal's Max Speed by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 0)
        description = "The racer prior to you gains any relay effects you provide for <span class='keyword'>" + 3 * numberOfPoints + "</span>% of the normal length if possible.";

      if (row === 0 && column === 1)
        description = "Increase Relay Animal's Acceleration Rate by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 1)
        description = "Increase Burst Distance of next racer by <span class='keyword'>" + 5 * numberOfPoints + "</span>% of your Burst Distance on Relay.";
      if (row === 2 && column === 1)
        description = "Increase Relay Animal's Stamina by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 1)
        description = "Increase Burst Chance of next racer by <span class='keyword'>" + 3 * numberOfPoints + "</span>% of your Burst Chance on Relay.";

      if (row === 0 && column === 2)
        description = "Increase Relay Animal's Power Efficiency by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 2)
        description = "If Relay Animal ability has a cooldown, reduce it by <span class='keyword'>" + (2 * numberOfPoints) + "</span>%.";
      if (row === 2 && column === 2)
        description = "Increase Relay Animal's Focus Distance by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 2)
        description = "Increase Relay Animal's Ability Efficiency by <span class='keyword'>" + 2 * numberOfPoints + "</span>%.";
    }
    if (talentTreeType === TalentTreeTypeEnum.longDistance) {
      if (row === 0 && column === 0)
        description = "Increase Focus stat gain from training by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 0)
        description = "Every burst increases Burst Velocity Bonus by <span class='keyword'>" + .5 * numberOfPoints + "</span>%.";
      if (row === 2 && column === 0)
        description = "Increase Focus Distance gain from Focus stat by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 0)
        description = "Instead of reducing velocity to 10% when losing focus, reduce to <span class='keyword'>" + (10 + (2 * numberOfPoints)) + "</span>%.";

      if (row === 0 && column === 1)
        description = "Increase Max Speed stat gain from training by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 1)
        description = "While your velocity is 25% of your Max Speed or below, increase your Acceleration Rate by <span class='keyword'>" + 5 * numberOfPoints + "</span>%.";
      if (row === 2 && column === 1)
        description = "Increase Max Speed gain from Speed stat by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 1)
        description = "After surpassing <span class='keyword'>" + .5 * numberOfPoints + "</span>% of your Max Speed, your velocity can no longer drop below it. All calculations consider this to be 0% of your velocity.";

      if (row === 0 && column === 2)
        description = "Increase Endurance stat gain from training by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 1 && column === 2)
        description = "While stamina is below 35%, reduce stamina consumption by <span class='keyword'>" + 5 * numberOfPoints + "</span>%.";
      if (row === 2 && column === 2)
        description = "Increase Stamina gain from Endurance stat by <span class='keyword'>" + numberOfPoints + "</span>%.";
      if (row === 3 && column === 2)
        description = "When running out of stamina, increase the percent regained by <span class='keyword'>" + (numberOfPoints * 2) + "</span>%.";
    }

    return description;
  }

  getTalentUpgradeDescription(row: number, column: number, talentTreeType: TalentTreeTypeEnum, numberOfPoints?: number) {

  }

  getTotalPossiblePointsByRowColumn(row: number, column: number, talentTreeType: TalentTreeTypeEnum) {
    var points = 0;

    if (talentTreeType === TalentTreeTypeEnum.sprint) {
      if (row === 0 && column === 0)
        points = 999;
      if (row === 1 && column === 0)
        points = 10;
      if (row === 2 && column === 0)
        points = 999;
      if (row === 3 && column === 0)
        points = 10;

      if (row === 0 && column === 1)
        points = 999;
      if (row === 1 && column === 1)
        points = 10;
      if (row === 2 && column === 1)
        points = 999;
      if (row === 3 && column === 1)
        points = 10;

      if (row === 0 && column === 2)
        points = 999;
      if (row === 1 && column === 2)
        points = 10;
      if (row === 2 && column === 2)
        points = 999;
      if (row === 3 && column === 2)
        points = 10;
    }
    if (talentTreeType === TalentTreeTypeEnum.support) {
      if (row === 0 && column === 0)
        points = 999;
      if (row === 1 && column === 0)
        points = 10;
      if (row === 2 && column === 0)
        points = 999;
      if (row === 3 && column === 0)
        points = 10;

      if (row === 0 && column === 1)
        points = 999;
      if (row === 1 && column === 1)
        points = 10;
      if (row === 2 && column === 1)
        points = 999;
      if (row === 3 && column === 1)
        points = 10;

      if (row === 0 && column === 2)
        points = 999;
      if (row === 1 && column === 2)
        points = 10;
      if (row === 2 && column === 2)
        points = 999;
      if (row === 3 && column === 2)
        points = 10;
    }
    if (talentTreeType === TalentTreeTypeEnum.longDistance) {
      if (row === 0 && column === 0)
        points = 999;
      if (row === 1 && column === 0)
        points = 10;
      if (row === 2 && column === 0)
        points = 999;
      if (row === 3 && column === 0)
        points = 10;

      if (row === 0 && column === 1)
        points = 999;
      if (row === 1 && column === 1)
        points = 10;
      if (row === 2 && column === 1)
        points = 999;
      if (row === 3 && column === 1)
        points = 10;

      if (row === 0 && column === 2)
        points = 999;
      if (row === 1 && column === 2)
        points = 10;
      if (row === 2 && column === 2)
        points = 999;
      if (row === 3 && column === 2)
        points = 10;
    }

    return points;
  }

  getTalentPointsAvailableToAnimal(animal: Animal) {
    var availableTalentPoints = 0;
    availableTalentPoints = this.getResourceByName("Talent Points");

    availableTalentPoints += animal.miscStats.bonusTalents;
    availableTalentPoints -= animal.talentTree.getTotalSpentPoints();

    if (availableTalentPoints <= 0)
      availableTalentPoints = 0;

    return availableTalentPoints;
  }
}
