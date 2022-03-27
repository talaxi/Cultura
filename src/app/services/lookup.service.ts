import { Injectable } from '@angular/core';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalDeck } from '../models/animals/animal-deck.model';
import { Animal } from '../models/animals/animal.model';
import { GlobalService } from './global-service.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private globalService: GlobalService) { }

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

  getRenown(): number {    
    var resource = this.globalService.globalVar.resources.find(item => item.name === "Renown");
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

  

  getResourcePopover(name: string) {
    if (name === "Money")
      return "Good ol classic money. Gain from most actions and buy most things with this.";
    else if (name === "Medals")
      return "Rare currency gained from improving your circuit rank and winning certain special races.";
    else if (name === "Renown")
      return "Increases money gained from races by X%";

    return "";
  }
}
