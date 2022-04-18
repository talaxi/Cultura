import { Injectable } from '@angular/core';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalDeck } from '../models/animals/animal-deck.model';
import { Animal } from '../models/animals/animal.model';
import { BarnSpecializationEnum } from '../models/barn-specialization-enum.model';
import { BarnUpgrades } from '../models/barns/barn-upgrades.model';
import { RaceCourseTypeEnum } from '../models/race-course-type-enum.model';
import { RaceLeg } from '../models/races/race-leg.model';
import { Terrain } from '../models/races/terrain.model';
import { ResourceValue } from '../models/resources/resource-value.model';
import { TerrainTypeEnum } from '../models/terrain-type-enum.model';
import { TrainingOption } from '../models/training/training-option.model';
import { GlobalService } from './global-service.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private globalService: GlobalService) { }

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

  getFacilityLevel(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Facility Level");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  getMoney(): number {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Money");
    if (resource !== undefined)
      return resource.amount;
    else
      return 0;
  }

  spendMoney(amountSpent: number): void {
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Money");
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

      breedModifier *= (animal.breedLevel - 1);
    }

    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultMaxSpeedModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      defaultModifier = modifierPair.value;

    totalModifier = defaultModifier + breedModifier;

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

      breedModifier *= (animal.breedLevel - 1);
    }

    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultAccelerationModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      defaultModifier = modifierPair.value;

    totalModifier = defaultModifier + breedModifier;

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

      breedModifier *= (animal.breedLevel - 1);
    }

    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultStaminaModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      defaultModifier = modifierPair.value;

    totalModifier = defaultModifier + breedModifier;

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

      breedModifier *= (animal.breedLevel - 1);
    }

    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultPowerModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      defaultModifier = modifierPair.value;

    totalModifier = defaultModifier + breedModifier;

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

      breedModifier *= (animal.breedLevel - 1);
    }

    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultFocusModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      defaultModifier = modifierPair.value;

    totalModifier = defaultModifier + breedModifier;

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

      breedModifier *= (animal.breedLevel - 1);
    }

    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultAdaptabilityModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      defaultModifier = modifierPair.value;

    totalModifier = defaultModifier + breedModifier;

    return totalModifier;
  }

  getTrainingBreedGaugeIncrease(): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingBreedGaugeIncrease");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getCircuitBreedGaugeIncrease(): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "circuitBreedGaugeIncrease");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getLocalBreedGaugeIncrease(): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "localBreedGaugeIncrease");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getDiminishingReturnsThreshold(animal: Animal): number {
    var threshold = animal.currentStats.diminishingReturnsDefaultStatThreshold;
    var facilityLevelModifier = this.globalService.globalVar.modifiers.find(item => item.text === "facilityLevelModifier");
    if (facilityLevelModifier !== undefined)
      threshold += this.getFacilityLevel() * facilityLevelModifier.value;

    return threshold;
  }

  getResourcePopover(name: string) {
    if (name === "Money")
      return "Good ol classic money. Gain from most actions and buy most things with this.";
    else if (name === "Medals")
      return "Rare currency gained from improving your circuit rank and winning certain special races.";
    else if (name === "Renown")
      return "Increases money gained from races by X%";

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
    if (this.isItemUnlocked("Attraction"))
      itemList.push("Attraction");
    if (this.isItemUnlocked("Research Center"))
      itemList.push("Research Center");
    return itemList;
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
    else if (type === "Water") {
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Dolphin]);
      itemList.push(AnimalTypeEnum[AnimalTypeEnum.Shark]);
    }

    return itemList;
  }

  GetAbilityEffectiveAmount(animal: Animal, terrainModifier?: number) {
    if (animal.ability === undefined || animal.ability === null ||
      animal.ability.name === undefined || animal.ability.name === null)
      return -1;

    if (terrainModifier === null || terrainModifier === undefined)
      terrainModifier = 1;

    var modifiedPower = animal.currentStats.powerMs * terrainModifier;

    if (animal.ability.name === "Thoroughbred") {
      return animal.ability.efficiency * (1 + modifiedPower);
    }
    if (animal.ability.name === "Inspiration") {
      return animal.ability.efficiency * (1 + modifiedPower);
    }
    if (animal.ability.name === "Pacemaker") {
      return animal.ability.efficiency * (1 + modifiedPower);
    }
    if (animal.ability.name === "Landslide") {
      return animal.ability.efficiency * (1 + modifiedPower);
    }
    if (animal.ability.name === "Leap") {
      return animal.ability.efficiency * (1 + modifiedPower);
    }

    return -1;
  }

  getAnimalAbilityDescription(shortDescription: boolean, abilityName: string, animal?: Animal) {
    if (shortDescription) {
      if (abilityName === "Thoroughbred") {
        return "Stamina does not go down for a short period";
      }
      if (abilityName === "Inspiration") {
        return "Increase next racer's max speed on relay";
      }
      if (abilityName === "Pacemaker") {
        return "Increase acceleration for a short period";
      }
      if (abilityName === "Sprint") {
        return "Short TODO";
      }
      if (abilityName === "Giving Chase") {
        return "Short TODO";
      }
      if (abilityName === "On The Hunt") {
        return "Short TODO";
      }
      if (abilityName === "Landslide") {
        return "Delay other racers";
      }
      if (abilityName === "Frenzy") {
        return "Short TODO";
      }
      if (abilityName === "Leap") {
        return "Jump to the finish line";
      }
    }
    else {
      var cooldownDisplay = "";
      if (animal === undefined || animal === null) {
        this.globalService.globalVar.animals.forEach(possibleAnimal => {
          possibleAnimal.availableAbilities.forEach(ability => {

            if (ability.name === abilityName) {
              animal = possibleAnimal;
              if (ability.cooldown !== undefined && ability.cooldown !== null)
                cooldownDisplay = ability.cooldown.toString();
            }
          });
        });
      }

      if (animal !== undefined && animal !== null) {
        var effectiveAmountDisplay = this.GetAbilityEffectiveAmount(animal).toFixed(2);

        if (cooldownDisplay === "" && animal.ability.cooldown !== undefined && animal.ability.cooldown !== null)
          cooldownDisplay = animal.ability.cooldown.toString();

        if (abilityName === "Thoroughbred") {
          return "Stamina does not go down for " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Inspiration") {
          return "When the next racer starts, they gain 25% of your Max Speed for " + effectiveAmountDisplay + " meters.";
        }
        if (abilityName === "Pacemaker") {
          return "Increase acceleration by 25% for " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Sprint") {
          return "Long TODO";
        }
        if (abilityName === "Giving Chase") {
          return "Long TODO";
        }
        if (abilityName === "On The Hunt") {
          return "Long TODO";
        }
        if (abilityName === "Landslide") {
          return "Drop rocks on competitors, delaying them " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Frenzy") {
          return "Long TODO";
        }
        if (abilityName === "Leap") {
          return "When you are " + effectiveAmountDisplay + " meters from the finish line, leap straight to the end.";
        }
      }
    }

    return "";
  }

  getResourcesForBarnUpgrade(currentLevel: number): ResourceValue[] {
    var allResourcesRequired: ResourceValue[] = [];
    var money = new ResourceValue("Money", 100);
    money.amount *= currentLevel;
    allResourcesRequired.push(money);
    return allResourcesRequired;
  }

  getTerrainPopoverText(terrain: Terrain, raceLeg: RaceLeg) {
    var popoverText = "The terrain for the " + raceLeg.getCourseTypeName() + " leg is " + terrain.getTerrainType() + ":\n";

    if (terrain.staminaModifier !== null && terrain.staminaModifier !== undefined && terrain.staminaModifier !== 0) {
      popoverText += "+" + (terrain.staminaModifier * 100).toFixed(0) + "% stamina cost\n";
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

  getSpecializationDescription(specializationName: string) {
    var description = "";

    if (specializationName === "Breeding Grounds") {
      description = "Turn your barn into a habitat based around the optimal breeding environment for your animals. As you progress, your animals will gain more breeding XP from their training.";
    }
    else if (specializationName === "Training Facility") {
      description = "Pull out all the stops giving your animals the best environment to improve. As you progress, your animals will train faster and gain stats from training at a higher rate.";
    }
    else if (specializationName === "Attraction") {
      description = "Give the people what they want and turn your barn into a tourist attraction. As you progress, your barn will provide passive income at a steady rate.";
    }
    else if (specializationName === "Research Center") {
      description = "Bring in the top names in animal research to optimize your training process. As you progress, your animal will gain reduced stats from training but split its improvements with other animals."
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
}
