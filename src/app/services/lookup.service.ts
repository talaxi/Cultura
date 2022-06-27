import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AnimalStatEnum } from '../models/animal-stat-enum.model';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { Ability } from '../models/animals/ability.model';
import { AnimalDeck } from '../models/animals/animal-deck.model';
import { AnimalTraits } from '../models/animals/animal-traits.model';
import { Animal } from '../models/animals/animal.model';
import { BarnSpecializationEnum } from '../models/barn-specialization-enum.model';
import { BarnUpgrades } from '../models/barns/barn-upgrades.model';
import { Barn } from '../models/barns/barn.model';
import { LocalRaceTypeEnum } from '../models/local-race-type-enum.model';
import { RaceCourseTypeEnum } from '../models/race-course-type-enum.model';
import { RaceLeg } from '../models/races/race-leg.model';
import { Race } from '../models/races/race.model';
import { Terrain } from '../models/races/terrain.model';
import { ResourceValue } from '../models/resources/resource-value.model';
import { ShopItemTypeEnum } from '../models/shop-item-type-enum.model';
import { TerrainTypeEnum } from '../models/terrain-type-enum.model';
import { TrackRaceTypeEnum } from '../models/track-race-type-enum.model';
import { TrainingOption } from '../models/training/training-option.model';
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

      totalModifier = defaultModifier * breedModifier * traitMaxSpeedModifier * animal.incubatorStatUpgrades.maxSpeedModifier;
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

      totalModifier = defaultModifier * breedModifier * traitAccelerationModifier * animal.incubatorStatUpgrades.accelerationModifier;
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

      totalModifier = defaultModifier * breedModifier * traitEnduranceModifier * animal.incubatorStatUpgrades.staminaModifier;
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

      totalModifier = defaultModifier * breedModifier * traitPowerModifier * animal.incubatorStatUpgrades.powerModifier;
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

      totalModifier = defaultModifier * breedModifier * traitFocusModifier * animal.incubatorStatUpgrades.focusModifier;
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

      totalModifier = defaultModifier * breedModifier * traitAdaptabilityModifier * animal.incubatorStatUpgrades.adaptabilityModifier;
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
      return "Increases Coins gained from races by " + currentRenown + "%. Increase total number of local races available per reset period by 1 for every 100 renown for a total of " + this.getTotalFreeRacesPerPeriod() + ". Complete circuit or local races to get your name out there and raise your renown.";
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
      rewards.push("- +1 Bonus Breed XP Gain From Local Races");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Training");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Local Races");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Training");
      rewards.push("- 50 Coins");
      rewards.push("- +1 Bonus Breed XP Gain From Local Races");
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
      rewards.push("- +2 Bonus Breed XP Gain From Local Races");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- +3 Diminishing Returns per Facility Level");
    }
    else if (type === TrackRaceTypeEnum.master) {
      rewards.push("- +5 Bonus Breed XP Gain From Local Races");
      rewards.push("- +2 Diminishing Returns per Facility Level");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- 1000 Coins");
      rewards.push("- +3 Bonus Breed XP Gain From Training");
      rewards.push("- +2 Talents");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- 1000 Coins");
      rewards.push("- Nothing Yet -- Coming Soon!");
      rewards.push("- +3 Diminishing Returns per Facility Level");
      rewards.push("- +1% Training Time Reduction");
      rewards.push("- +3 Talents");
    }

    return rewards;
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
      powerAbilityModifier *= .8;
    }
    if (animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Trickster" && animal.ability.tricksterStatGain === "Power" && animal.ability.abilityInUse) {
      powerAbilityModifier *= 1.4;
    }

    var usedAbility = animal.ability;
    if (ability !== undefined && ability !== null)
      usedAbility = ability;

    var modifiedPower = (animal.currentStats.powerMs * powerAbilityModifier * terrainModifier * statLossFromExhaustion) / 100;
    var modifiedEfficiency = usedAbility.efficiency + (usedAbility.efficiency * ((usedAbility.abilityLevel - 1) * .01));

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
        return "Increase acceleration the further behind you are";
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
        var effectiveAmountDisplay = this.GetAbilityEffectiveAmount(animal, undefined, undefined, selectedAbility).toFixed(2);

        if (cooldownDisplay === "" && animal.ability.cooldown !== undefined && animal.ability.cooldown !== null)
          cooldownDisplay = animal.ability.cooldown.toString();

        var abilityDescription: string | null = "";
        var sanitizedDescription = "";
        if (abilityName === "Second Wind") {
          return "Stamina does not go down for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Inspiration") {
          return "When the next racer starts, they gain 25% of your Max Speed for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Passive.";
        }
        if (abilityName === "Pacemaker") {
          return "Increase acceleration by 25% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Sprint") {
          return " Gain 25% Max Speed and 10% Acceleration for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters, but lose twice as much stamina as normal. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Giving Chase") {
          return "Acceleration increases by <span class='keyword'>" + effectiveAmountDisplay + "</span>% for every second behind the average pace per second. Passive.";
        }
        if (abilityName === "On The Hunt") {
          return "Every time you Burst, increase your max speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Awareness") {
          return "Boosts focus and adaptability by 25% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Prey Instinct") {
          return "Starts its leg in burst mode that continues for an additional <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Passive.";
        }
        if (abilityName === "Nap") {
          return "Sleep until the competition has traveled a distance equal to <span class='keyword'>" + effectiveAmountDisplay + "</span> meters from the end of your leg. Acceleration and focus are then doubled. Passive.";
        }
        if (abilityName === "Landslide") {
          return "Drop rocks on competitors, delaying them <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Frenzy") {
          return "Increase burst distance by <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. You do not stumble or lose focus while bursting. Passive.";
        }
        if (abilityName === "Leap") {
          return "When you are <span class='keyword'>" + effectiveAmountDisplay + "</span> meters from the finish line, leap straight to the end over .5 seconds. Passive.";
        }
        if (abilityName === "Sure-footed") {
          return "When you make it through a special path without stumbling, increase your adaptability by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Deep Breathing") {
          return "Every time you burst, regain <span class='keyword'>" + effectiveAmountDisplay + "</span>% of your stamina, up to 100%. If this amount exceeds 100% of your stamina, increase all other racers' stamina by the amount exceeded. Passive.";
        }
        if (abilityName === "In The Rhythm") {
          return "Increase your max speed bonus while bursting by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Sticky") {
          return "Cannot stumble for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Night Vision") {
          return "Increase Max Speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>% for every path you complete without losing focus. If you lose focus, reset this bonus back to 0%. Passive.";
        }
        if (abilityName === "Camouflage") {
          return "The speed you finish your leg at is given to your following racer on Relay. Decrease this amount to 0 evenly over <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. The following racer can break their max speed by up to 50% while this is active. Passive.";
        }
        if (abilityName === "Echolocation") {
          return "Increase your adaptability by 50% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters and ignore any negative effects from the terrain. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Navigator") {
          return "Assist the previous racer and next racer, boosting their adaptability by 25% of your max for the last and first <span class='keyword'>" + effectiveAmountDisplay + "</span> meters of their legs respectively. Passive.";
        }
        if (abilityName === "Flowing Current") {
          return "When relaying, increase the acceleration of your next racer by 25% of your acceleration for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Passive.";
        }
        if (abilityName === "Apex Predator") {
          return "If the competitors moving at the average pace pass the shark during its leg, immediately bite them, slowing their pace by 50% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. Can only occur once. Passive.";
        }
        if (abilityName === "Feeding Frenzy") {
          return "Increase Max Speed and Acceleration by 50% for the first and last <span class='keyword'>" + effectiveAmountDisplay + "</span> meters of your leg. Your next and previous racers have a 10% Max Speed reduction. Passive.";
        }
        if (abilityName === "Blood In The Water") {
          return "While you are ahead of the average pace, increase max speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Propulsion") {
          return "Dash <span class='keyword'>" + effectiveAmountDisplay + "</span> meters over .25 seconds. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Buried Treasure") {
          return "Delay your start by 8 seconds. If you still win the race, increase your Coin reward by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Big Brain") {
          return "After Bursting through one third of your race paths, increase Power of all remaining racers by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Passive.";
        }
        if (abilityName === "Herd Mentality") {
          return "After completing your leg, <span class='keyword'>" + effectiveAmountDisplay + "</span>% of your remaining stamina is given to the next racer and they start their leg in burst mode. This does not occur if you run out of stamina during your leg. Passive.";
        }
        if (abilityName === "Great Migration") {
          return "Reduce stamina by 10%. For <span class='keyword'>" + effectiveAmountDisplay + "</span> meters, acceleration is increased by 25% of the amount of stamina lost. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Special Delivery") {
          return "Increase all remaining racers’ burst max speed bonus by <span class='keyword'>" + effectiveAmountDisplay + "</span>% of your remaining stamina percentage after completing your leg. This does not occur if you run out of stamina during your leg. Passive.";
        }
        if (abilityName === "Careful Toboggan") {
          return "Increase adaptability by 40% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Wild Toboggan") {
          return "Double the maximum amount of drift per path. Increase acceleration by up to <span class='keyword'>" + effectiveAmountDisplay + "</span>% based on how much you drift. Passive.";
        }
        if (abilityName === "Quick Toboggan") {
          return "Every time you make it through a path without drifting, gain <span class='keyword'>" + effectiveAmountDisplay + "</span>% max speed. Passive.";
        }
        if (abilityName === "Cold Blooded") {
          return "Increase stamina and focus by 0-50% depending on how close to the center of the volcano you are. Focus boost lasts <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Burrow") {
          return "Go underground for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters, dodging lava fall and preventing stumbles. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Heat Up") {
          return "Increase Acceleration by 15% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. This increase doubles every subsequent use this race. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Trickster") {
          return "When active, sacrifice 20% of one random stat for 40% of another random stat. Lasts <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Fleeting Speed") {
          return "Increase Max Speed by <span class='keyword'>" + effectiveAmountDisplay + "</span>%. Decrease this bonus by 2% for every percent of the leg you complete. Passive.";
        }
        if (abilityName === "Nine Tails") {
          return "At the start of each path, increase either Acceleration, Max Speed, Focus, or Adaptability by 10% for <span class='keyword'>" + effectiveAmountDisplay + "</span> meters. This effect can stack. Passive.";
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
      var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingBreedGaugeIncrease");
      if (modifierPair !== null && modifierPair !== undefined)
        increaseAmount = modifierPair.value;

      description = "For every 10 levels, gain " + increaseAmount + "% additional breed XP when completing a training.";
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

    return "+" + trait.researchLevel + "% " + positiveStat + ", -" + trait.researchLevel + "% " + negativeStat;
  }

  getSpecialtyItemDescription(itemName: string) {
    var description = ""

    if (itemName === "Stopwatch")
      description = "Reduce training time by 5%";
    else if (itemName === "Animal Handler")
      description = "Retain 2% of trained stats after breeding";
    else if (itemName === "Course Maps")
      description = "Increase your chance to burst during special routes by 10%";
    else if (itemName === "Stockbreeder")
      description = "Add option to auto breed when Breed XP is full";
    else if (itemName === "Scouts")
      description = "You can choose the order of race legs for each animal deck";
    else if (itemName === "Money Mark")
      description = "Add new indicator to race, beat its time to gain increased coins";
    else if (itemName === "National Races")
      description = "Gain 1 medal for every 10 free races you complete";
    else if (itemName === "International Races")
      description = "Gain 1 medal for every 5 free races you complete";
    else if (itemName === "Team Manager")
      description = "Add option to automatically run 1 free race per reset period";
    else if (itemName === "Incubator Upgrade")
      description = "When breeding, permanently increase racing stat gain from base stat by .1% of positive trait value";

    return description;
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

    var popover = "Every stat point increases max speed by " + this.getMaxSpeedModifierByAnimalType(animal.type).toFixed(3) + "m/s up to diminishing returns. \n\n" +
      "Base: " + baseMaxSpeedModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.maxSpeedModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.maxSpeedModifier.toFixed(3) + "\n";

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

    var popover = "Every stat point increases acceleration by " + this.getAccelerationModifierByAnimalType(animal.type).toFixed(3) + "m/s up to diminishing returns. \n\n" +
      "Base: " + baseAccelerationModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.accelerationModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.accelerationModifier.toFixed(3) + "\n";

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


    var popover = "Every stat point increases stamina by " + this.getStaminaModifierByAnimalType(animal.type).toFixed(3) + " up to diminishing returns. \n\n" +
      "Base: " + baseStaminaModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.staminaModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.staminaModifier.toFixed(3) + "\n";

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


    var popover = "Every stat point increases ability efficiency by " + this.getPowerModifierByAnimalType(animal.type).toFixed(3) + "% up to diminishing returns. \n\n" +
      "Base: " + basePowerModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.powerModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.powerModifier.toFixed(3) + "\n";

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

    var popover = "Every stat point increases focus distance by " + this.getFocusModifierByAnimalType(animal.type).toFixed(3) + " meters up to diminishing returns. \n\n" +
      "Base: " + baseFocusModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.focusModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.focusModifier.toFixed(3) + "\n";

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

    var popover = "Every stat point increases adaptability distance by " + this.getAdaptabilityModifierByAnimalType(animal.type).toFixed(3) + " meters up to diminishing returns. \n\n" +
      "Base: " + baseAdaptabilityModifier.toFixed(3) + "\n";

    if (breedLevelStatModifierValue > 1)
      popover += "Breed Modifier: *" + breedLevelStatModifierValue.toFixed(2) + "\n";

    if (traitModifier !== 1)
      popover += animal.trait.traitName + " (Trait): *" + traitModifier.toFixed(2) + "\n";

    if (animal.incubatorStatUpgrades.adaptabilityModifier > 1)
      popover += "Incubator Upgrade: *" + animal.incubatorStatUpgrades.adaptabilityModifier.toFixed(3) + "\n";

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

  getRandomTip() {
    var tip = "";
    var tipList = [];

    if (!this.globalService.globalVar.settings.get("hideTips")) {
      tipList.push("After upgrading training options, reselect them to gain their benefits!");
      tipList.push("Don't forget to export your save regularly!");
      tipList.push("Have to recite the alphabet to figure out what your next circuit rank is? You're not alone, go to the settings to use numbers instead!");
      tipList.push("Small barns allow training for 2 hours, medium for 4 hours, and large for 8 hours. Your animals will train even when the game is not active.");

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
}
