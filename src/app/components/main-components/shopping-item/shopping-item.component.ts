import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { ShopItem } from 'src/app/models/shop/shop-item.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-shopping-item',
  templateUrl: './shopping-item.component.html',
  styleUrls: ['./shopping-item.component.css']
})
export class ShoppingItemComponent implements OnInit {
  @Input() selectedItem: ShopItem;
  @Output() itemPurchased = new EventEmitter<ShopItem>();
  shortDescription: string;
  longDescription: string;
  purchaseResourcesRequired: string;

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
    if (this.selectedItem.type === ShopItemTypeEnum.Ability) {
      this.shortDescription = this.lookupService.getAnimalAbilityDescription(true, this.selectedItem.additionalIdentifier);
      this.longDescription = this.lookupService.getAnimalAbilityDescription(false, this.selectedItem.additionalIdentifier);
    }
    else {
      this.shortDescription = this.selectedItem.shortDescription;
      this.longDescription = this.selectedItem.longDescription;
    }

    this.selectedItem.purchasePrice.forEach(resource => {
      this.purchaseResourcesRequired = resource.amount + " " + resource.name + ", ";
    });

    
    if (this.purchaseResourcesRequired.length > 0)
    {            
      this.purchaseResourcesRequired = this.purchaseResourcesRequired.substring(0, this.purchaseResourcesRequired.length - 2);
    }
  }

  BuyItem(): void {
    if (this.canBuyItem()) {
      this.spendResourcesOnItem();

      if (this.selectedItem.type === ShopItemTypeEnum.Animal) {
        this.buyAnimal();
      }
      if (this.selectedItem.type === ShopItemTypeEnum.Food) {
        this.buyFood();
      }
      else if (this.selectedItem.type === ShopItemTypeEnum.Training) {
        this.buyTraining();
      }
      if (this.selectedItem.type === ShopItemTypeEnum.Specialty) {
        this.buySpecialty();
      }
      else if (this.selectedItem.type === ShopItemTypeEnum.Ability) {
        this.buyAbility();
      }

      this.itemPurchased.emit(this.selectedItem);
    }
  }

  canBuyItem() {
    var canBuy = true;
    this.selectedItem.purchasePrice.forEach(resource => {
      var userResourceAmount = this.lookupService.getResourceByName(resource.name);
      if (userResourceAmount < resource.amount)
        canBuy = false;
    });

    return canBuy;
  }

  spendResourcesOnItem() {
    this.selectedItem.purchasePrice.forEach(resource => {
      this.lookupService.spendResourceByName(resource.name, resource.amount);
    });
  }

  buyAnimal() {
    var animal = this.globalService.globalVar.animals.find(item => item.name === this.selectedItem.name);
    if (animal !== null && animal !== undefined) {
      animal.isAvailable = true;
      this.selectedItem.amountPurchased = 1;

      var primaryAnimalDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (primaryAnimalDeck !== null && primaryAnimalDeck !== undefined) {
        var typeFound = false;
        primaryAnimalDeck.selectedAnimals.forEach(item => {
          if (item.raceCourseType === animal?.raceCourseType)
            typeFound = true;
        });

        if (!typeFound)
          primaryAnimalDeck.selectedAnimals.push(animal);
      }
    }
  }

  buyTraining() {
    this.selectedItem.amountPurchased = 1;

    var training = this.globalService.globalVar.trainingOptions.find(training => training.trainingName === this.selectedItem.name);
    if (training !== undefined)
      training.isAvailable = true;
  }

  buyFood() {
    if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
      if (this.globalService.globalVar.resources.some(x => x.name === this.selectedItem.name)) {
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === this.selectedItem.name);
        if (globalResource !== null && globalResource !== undefined) {
          globalResource.amount += 1;
        }
      }
      else
        this.globalService.globalVar.resources.push(new ResourceValue(this.selectedItem.name, 1, ShopItemTypeEnum.Food));
    }
  }

  buySpecialty() {
    this.selectedItem.amountPurchased += 1;

    if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
      if (this.globalService.globalVar.resources.some(x => x.name === this.selectedItem.name)) {
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === this.selectedItem.name);
        if (globalResource !== null && globalResource !== undefined) {
          globalResource.amount += 1;
        }
      }
      else
        this.globalService.globalVar.resources.push(new ResourceValue(this.selectedItem.name, 1, ShopItemTypeEnum.Specialty));
    }
  }

  buyAbility() {
    var animalType = this.selectedItem.name.split(' ')[0].trim();
    var abilityName = this.selectedItem.name.split(':')[1].trim();

    if (animalType === "" || abilityName === "")
      return;

    var animal = this.globalService.globalVar.animals.find(animal => animal.getAnimalType() === animalType);
    if (animal === undefined)
      return;

    var selectedAbility = animal.availableAbilities.find(ability => ability.name === abilityName);
    if (selectedAbility === undefined)
      return;

    selectedAbility.isAbilityPurchased = true;
    this.selectedItem.amountPurchased = 1;
  }
}
