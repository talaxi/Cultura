import { Injectable } from '@angular/core';
import { AnimalStatEnum } from '../models/animal-stat-enum.model';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalDeck } from '../models/animals/animal-deck.model';
import { AnimalTraits } from '../models/animals/animal-traits.model';
import { Animal } from '../models/animals/animal.model';
import { BarnSpecializationEnum } from '../models/barn-specialization-enum.model';
import { BarnUpgrades } from '../models/barns/barn-upgrades.model';
import { Barn } from '../models/barns/barn.model';
import { RaceCourseTypeEnum } from '../models/race-course-type-enum.model';
import { RaceLeg } from '../models/races/race-leg.model';
import { Terrain } from '../models/races/terrain.model';
import { ResourceValue } from '../models/resources/resource-value.model';
import { TerrainTypeEnum } from '../models/terrain-type-enum.model';
import { TrainingOption } from '../models/training/training-option.model';
import { GlobalService } from './global-service.service';
import { UtilityService } from './utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private globalService: GlobalService, private utilityService: UtilityService) { }

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

      totalModifier = defaultModifier * breedModifier * traitMaxSpeedModifier;
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

      totalModifier = defaultModifier * breedModifier * traitAccelerationModifier;
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

      totalModifier = defaultModifier * breedModifier * traitEnduranceModifier;
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

      totalModifier = defaultModifier * breedModifier * traitPowerModifier;
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

      totalModifier = defaultModifier * breedModifier * traitFocusModifier;
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

      totalModifier = defaultModifier * breedModifier * traitAdaptabilityModifier;
    }

    return totalModifier;
  }

  getTrainingBreedGaugeIncrease(breedingGroundsSpecializationLevel: number): number {
    var increaseAmount = 0;
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingBreedGaugeIncrease");
    if (modifierPair !== null && modifierPair !== undefined)
      increaseAmount = modifierPair.value;

    if (breedingGroundsSpecializationLevel > 0) {
      var breedingGroundsModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "breedingGroundsSpecializationModifier");
      if (breedingGroundsModifierPair !== null && breedingGroundsModifierPair !== undefined) {
        increaseAmount *= 1 + (breedingGroundsSpecializationLevel * breedingGroundsModifierPair.value);
      }
    }

    return increaseAmount;
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

  getBreedLevelPopover(breedLevel: number) {
    var breedLevelModifier = 0.2;
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      breedLevelModifier = modifierPair.value;

    return "Increase racing stat gain from base stats by " + ((breedLevelModifier * (breedLevel - 1)) * 100) + "%";
  }

  getResourcePopover(name: string) {
    if (name === "Coins")
      return "Good ol classic Coins. Gain from most actions and buy most things with this.";
    else if (name === "Medals")
      return "Rare currency gained from improving your circuit rank and winning certain special races.";
    else if (name === "Renown") {
      var currentRenown = this.getRenown();
      return "Increases Coins gained from races by " + currentRenown + "%";
    }
    else if (name === "Stopwatch")
      return this.getSpecialtyItemDescription(name);
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

  GetAbilityEffectiveAmount(animal: Animal, terrainModifier?: number, statLossFromExhaustion?: number) {
    if (animal.ability === undefined || animal.ability === null ||
      animal.ability.name === undefined || animal.ability.name === null)
      return -1;

    if (terrainModifier === null || terrainModifier === undefined)
      terrainModifier = 1;

    if (statLossFromExhaustion === null || statLossFromExhaustion === undefined)
      statLossFromExhaustion = 1;

    var powerAbilityModifier = 1;
    if (animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Trickster" && animal.ability.tricksterStatLoss === "Power"  && animal.ability.abilityInUse) {
      powerAbilityModifier *= .8;
    }
    if (animal.type === AnimalTypeEnum.Fox && animal.ability.name === "Trickster" && animal.ability.tricksterStatGain === "Power"  && animal.ability.abilityInUse) {
      powerAbilityModifier *= 1.4;
    }

    var modifiedPower = (animal.currentStats.powerMs * powerAbilityModifier * terrainModifier * statLossFromExhaustion) / 100;    

    if (animal.ability.name === "Second Wind") {
      return (animal.ability.efficiency * (1 + modifiedPower));
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
    if (animal.ability.name === "On The Hunt") { //this one is percent based
      return (animal.ability.efficiency * (1 + modifiedPower));
    }
    if (animal.ability.name === "Sure-footed") { //this one is percent based
      return (animal.ability.efficiency * (1 + modifiedPower));
    }
    if (animal.ability.name === "Deep Breathing") { //this one is percent based
      return (animal.ability.efficiency * (1 + modifiedPower));
    }
    else
      return animal.ability.efficiency * (1 + modifiedPower);
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
        return "Delay leg start, increase acceleration and focus";
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
      if (abilityName === "Breach") {
        return "Jump a short distance";
      }
      if (abilityName === "Echolocation") {
        return "Increase adaptability, ignore negative terrain effects for a short period";
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
      if (abilityName === "Blood in the Water") {
        return "increase max speed when ahead of competitors";
      }
      if (abilityName === "Sure-footed") {
        return "Increase adaptability after not stumbling through path";
      }
      if (abilityName === "Deep Breathing") {
        return "Regain stamina after burst, permanently increase endurance";
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
        return "Increase previous and next racer's adaptability";
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

        if (abilityName === "Second Wind") {
          return "Stamina does not go down for " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Inspiration") {
          return "When the next racer starts, they gain 25% of your Max Speed for " + effectiveAmountDisplay + " meters. Passive.";
        }
        if (abilityName === "Pacemaker") {
          return "Increase acceleration by 25% for " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Sprint") {
          return " Gain 25% Max Speed and 10% Acceleration for " + effectiveAmountDisplay + " meters, but lose twice as much stamina as normal. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Giving Chase") {
          return "Acceleration increases by " + effectiveAmountDisplay + "% for every second behind the average pace per second. Passive.";
        }
        if (abilityName === "On The Hunt") {
          return "Every time you Burst, increase your max speed by " + effectiveAmountDisplay + "%. Passive.";
        }
        if (abilityName === "Awareness") {
          return "Boosts focus and adaptability by 25% for " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Prey Instinct") {
          return "Starts its leg in burst mode that continues for an additional " + effectiveAmountDisplay + " meters. Passive.";
        }
        if (abilityName === "Nap") {
          return "Sleep until the competition is " + effectiveAmountDisplay + " meters from the end of your leg. Acceleration and focus are then doubled. Passive.";
        }
        if (abilityName === "Landslide") {
          return "Drop rocks on competitors, delaying them " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Frenzy") {
          return "Increase burst distance by " + effectiveAmountDisplay + " meters. You do not stumble or lose focus while bursting. Passive.";
        }
        if (abilityName === "Leap") {
          return "When you are " + effectiveAmountDisplay + " meters from the finish line, leap straight to the end over .25 seconds. Passive.";
        }
        if (abilityName === "Sure-footed") {
          return "When you make it through a special path without stumbling, increase your adaptability by " + effectiveAmountDisplay + "%. Passive.";
        }
        if (abilityName === "Deep Breathing") {
          return "Every time you burst, regain " + effectiveAmountDisplay + "% of your stamina, up to 100%. If this brings you to your max stamina, permanently gain an endurance stat point. Passive.";
        }
        if (abilityName === "In The Rhythm") {
          return "Increase your max speed bonus while bursting by " + effectiveAmountDisplay + "%. Passive.";
        }
        if (abilityName === "Sticky") {
          return "Cannot stumble for " + effectiveAmountDisplay + " meters. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Night Vision") {
          return "Every second of the average pace per second that you don't lose focus, increase Max Speed by " + effectiveAmountDisplay + "%. Passive.";
        }
        if (abilityName === "Camouflage") {
          return "Assist the previous racer and next racer, boosting their adaptability by 25% of your max for the last and first " + effectiveAmountDisplay + " meters of their legs respectively. Passive.";
        }
        if (abilityName === "Breach") {
          return "Jump " + effectiveAmountDisplay + " meters over .25 seconds. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Echolocation") {
          return "Increase your adaptability by 50% for " + effectiveAmountDisplay + " meters and ignore any negative effects from the terrain. " + cooldownDisplay + " second cooldown.";
        }
        if (abilityName === "Flowing Current") {
          return "When relaying, increase the acceleration of your next racer by 25% of your acceleration for " + effectiveAmountDisplay + " meters. Passive.";
        }
        if (abilityName === "Apex Predator") {
          return "If the competitors moving at the average pace pass the shark during its leg, immediately bite them, slowing their pace by 50% for " + effectiveAmountDisplay + " meters. Can only occur once. Passive.";
        }
        if (abilityName === "Feeding Frenzy") {
          return "Increase Max Speed and Acceleration by 50% for the first and last " + effectiveAmountDisplay + " meters of your leg. Your next and previous racers have a 10% Max Speed reduction. Passive.";
        }
        if (abilityName === "Blood In The Water") {
          return "While you are ahead of the average pace, increase max speed by " + effectiveAmountDisplay + "%. Passive.";
        }
      }
    }

    return "";
  }

  getResourcesForBarnUpgrade(currentLevel: number): ResourceValue[] {
    var allResourcesRequired: ResourceValue[] = [];
    var Coins = new ResourceValue("Coins", 100);
    Coins.amount *= (currentLevel + 1);
    allResourcesRequired.push(Coins);
    return allResourcesRequired;
  }

  getBarnName(barn: Barn) {
    var barnName = "";
    
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.None || barn.barnUpgrades.specialization === undefined ||
      barn.barnUpgrades.specialization === null)
      barnName = "Barn " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.Attraction)
      barnName = "Attraction " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.BreedingGrounds)
      barnName = "Breeding Grounds " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.TrainingFacility)
      barnName = "Training Facility " + barn.barnNumber;
    if (barn.barnUpgrades.specialization === BarnSpecializationEnum.ResearchCenter)
      barnName = "Research Center " + barn.barnNumber;

    return barnName;
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
      description = "Give the people what they want and turn your barn into a tourist attraction. As you progress, your barn will provide passive income at a steady rate while training.";
    }
    else if (specializationName === "Research Center") {
      description = "Bring in the top names in animal research to optimize your training process. As you progress, your animal will gain reduced stats from training but split its improvements with other animals."
    }

    return description;
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
      positiveStat = "Top Speed";

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
      negativeStat = "Top Speed";

    return "+" + trait.researchLevel + "% " + positiveStat + ", -" + trait.researchLevel + "% " + negativeStat;
  }

  getSpecialtyItemDescription(itemName: string) {
    var description = ""

    if (itemName === "Stopwatch")
      description = "Reduce training time by 5%";
    else if (itemName === "Animal Handler")
      description = "Retain 2% of trained stats after breeding";

    return description;
  }
}
