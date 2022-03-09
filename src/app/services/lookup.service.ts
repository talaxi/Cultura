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
    console.log(this.globalService.globalVar.resources);
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

  getAnimalByType(type: AnimalTypeEnum): Animal | null {
    var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === type);
    if (globalAnimal !== undefined)
      return globalAnimal;
    else
      return null;
  }  

  getMaxSpeedModifierByAnimalType(type: AnimalTypeEnum): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultMaxSpeedModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getAccelerationModifierByAnimalType(type: AnimalTypeEnum): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultAccelerationModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getStaminaModifierByAnimalType(type: AnimalTypeEnum): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultStaminaModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getPowerModifierByAnimalType(type: AnimalTypeEnum): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultPowerModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getFocusModifierByAnimalType(type: AnimalTypeEnum): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultFocusModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }

  getAdaptabilityModifierByAnimalType(type: AnimalTypeEnum): number {
    var modifierPair = this.globalService.globalVar.modifiers.find(item => item.text === AnimalTypeEnum[type].toLowerCase() + "DefaultAdaptabilityModifier");
    if (modifierPair !== null && modifierPair !== undefined)
      return modifierPair.value;

    return 0;
  }
}
