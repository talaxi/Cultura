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
  canAffordItem = true;
  displayNumberPurchasing = false;
  displayName = "";
  colorConditional: any;

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
    if (this.selectedItem.type === ShopItemTypeEnum.Ability) {
      this.shortDescription = this.lookupService.getAnimalAbilityDescription(true, this.selectedItem.additionalIdentifier);
      this.longDescription = this.lookupService.getAnimalAbilityDescription(false, this.selectedItem.additionalIdentifier);
    }
    else if (this.selectedItem.type === ShopItemTypeEnum.Specialty) {
      this.shortDescription = this.lookupService.getSpecialtyItemDescription(this.selectedItem.name);

      if (this.shortDescription === "")
        this.shortDescription = this.selectedItem.shortDescription;
    }
    else {
      this.shortDescription = this.selectedItem.shortDescription;
      this.longDescription = this.selectedItem.longDescription;
    }

    this.displayName = this.selectedItem.name;

    if (this.selectedItem.type === ShopItemTypeEnum.Animal) {
      var animal = this.globalService.globalVar.animals.find(item => item.name === this.selectedItem.name);

      if (animal !== undefined) {
        this.colorConditional = {
          'flatlandColor': animal.getRaceCourseType() === 'Flatland',
          'mountainColor': animal.getRaceCourseType() === 'Mountain',
          'waterColor': animal.getRaceCourseType() === 'Ocean',
          'tundraColor': animal.getRaceCourseType() === 'Tundra',
          'volcanicColor': animal.getRaceCourseType() === 'Volcanic'
        };
      }
    }

    if (this.selectedItem.type === ShopItemTypeEnum.Ability) {
      var animalType = this.selectedItem.name.split(' ')[0].trim();

      if (animalType !== "") {
        var animal = this.globalService.globalVar.animals.find(animal => animal.getAnimalType() === animalType);
        if (animal !== undefined) {
          this.colorConditional = {
            'flatlandColor': animal.getRaceCourseType() === 'Flatland',
            'mountainColor': animal.getRaceCourseType() === 'Mountain',
            'waterColor': animal.getRaceCourseType() === 'Ocean',
            'tundraColor': animal.getRaceCourseType() === 'Tundra',
            'volcanicColor': animal.getRaceCourseType() === 'Volcanic'
          };
        }
      }
    }

    if (this.selectedItem.type === ShopItemTypeEnum.Food && this.selectedItem.numberPurchasing === 1) {
      if (this.displayName === "Apples")
        this.displayName = "Apple";
      if (this.displayName === "Oranges")
        this.displayName = "Orange";
      if (this.displayName === "Bananas")
        this.displayName = "Banana";
      if (this.displayName === "Strawberries")
        this.displayName = "Strawberry";
      if (this.displayName === "Carrots")
        this.displayName = "Carrot";
      if (this.displayName === "Turnips")
        this.displayName = "Turnip";
      if (this.displayName === "Mangoes")
        this.displayName = "Mango";
    }

    if (this.selectedItem.type === ShopItemTypeEnum.Food || this.selectedItem.type === ShopItemTypeEnum.Resources) {
      this.displayNumberPurchasing = true;
    }

    this.selectedItem.purchasePrice.forEach(resource => {
      var displayName = resource.name;

      if (resource.amount === 1) {
        if (displayName === "Tokens")
          displayName = "Token";
        if (displayName === "Medals")
          displayName = "Medal";
      }

      this.purchaseResourcesRequired = resource.amount.toLocaleString() + " " + displayName + ", ";

      var currentAmount = this.lookupService.getResourceByName(resource.name);
      if (currentAmount < resource.amount)
        this.canAffordItem = false;
    });

    if (this.purchaseResourcesRequired.length > 0) {
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
      if (this.selectedItem.type === ShopItemTypeEnum.Equipment) {
        this.buyEquipment();
      }
      if (this.selectedItem.type === ShopItemTypeEnum.Consumable) {
        this.buyConsumable();
      }
      if (this.selectedItem.type === ShopItemTypeEnum.Resources) {
        this.buyResources();
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

      var associatedAbilitySection = this.globalService.globalVar.shop.find(item => item.name === "Abilities");
      if (associatedAbilitySection !== undefined && associatedAbilitySection !== null) {
        var associatedAbilities = associatedAbilitySection.itemList.filter(item => item.name.split(' ')[0] === animal?.getAnimalType());
        if (associatedAbilities !== undefined && associatedAbilities !== null && associatedAbilities.length > 0) {
          associatedAbilities.forEach(ability => {
            ability.isAvailable = true;
          })
        }
      }

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
    if (this.selectedItem.numberPurchasing === undefined || this.selectedItem.numberPurchasing === null)
      this.selectedItem.numberPurchasing = 1;

    if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
      if (this.globalService.globalVar.resources.some(x => x.name === this.selectedItem.name)) {
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === this.selectedItem.name);
        if (globalResource !== null && globalResource !== undefined) {
          globalResource.amount += this.selectedItem.numberPurchasing;
        }
      }
      else
        this.globalService.globalVar.resources.push(new ResourceValue(this.selectedItem.name, this.selectedItem.numberPurchasing, ShopItemTypeEnum.Food));
    }
  }

  buySpecialty() {
    this.selectedItem.amountPurchased += 1;

    if (this.selectedItem.name === "Whistle") {
      var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
      if (specialtyShop !== undefined && specialtyShop !== null) {
        var goldenWhistle = specialtyShop.itemList.find(item => item.name === "Golden Whistle");

        if (goldenWhistle !== undefined && goldenWhistle !== null)
          goldenWhistle.isAvailable = true;
      }
    }

    if (this.selectedItem.name === "National Races") {
      this.globalService.globalVar.nationalRaceCountdown = 0;
      var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
      if (specialtyShop !== undefined && specialtyShop !== null) {
        var internationalRaces = specialtyShop.itemList.find(item => item.name === "International Races");

        if (internationalRaces !== undefined && internationalRaces !== null)
          internationalRaces.isAvailable = true;
      }
    }

    if (this.selectedItem.name === "Incubator Upgrade Lv1") {
      var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
      if (specialtyShop !== undefined && specialtyShop !== null) {
        var nextUpgrade = specialtyShop.itemList.find(item => item.name === "Incubator Upgrade Lv2");

        if (nextUpgrade !== undefined && nextUpgrade !== null)
          nextUpgrade.isAvailable = true;
      }
    }

    if (this.selectedItem.name === "Incubator Upgrade Lv2") {
      var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
      if (specialtyShop !== undefined && specialtyShop !== null) {
        var nextUpgrade = specialtyShop.itemList.find(item => item.name === "Incubator Upgrade Lv3");

        if (nextUpgrade !== undefined && nextUpgrade !== null)
          nextUpgrade.isAvailable = true;
      }
    }

    if (this.selectedItem.name === "Incubator Upgrade Lv3") {
      var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
      if (specialtyShop !== undefined && specialtyShop !== null) {
        var nextUpgrade = specialtyShop.itemList.find(item => item.name === "Incubator Upgrade Lv4");

        if (nextUpgrade !== undefined && nextUpgrade !== null)
          nextUpgrade.isAvailable = true;
      }
    }

    if (this.selectedItem.name === "Team Manager" && this.selectedItem.amountPurchased === 1) {
      var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (primaryDeck !== null && primaryDeck !== undefined) {
        primaryDeck.autoRunFreeRace = true;
      }
    }

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

    if (this.selectedItem.quantityMultiplier !== null && this.selectedItem.quantityMultiplier !== undefined && this.selectedItem.quantityMultiplier > 0) {
      this.selectedItem.purchasePrice.forEach(price => {
        //var basePrice = this.selectedItem.basePurchasePrice.find(item => item.name === price.name);
        //if (basePrice !== undefined && basePrice !== null)
        //price.amount = basePrice?.amount * (this.selectedItem.quantityMultiplier * this.selectedItem.amountPurchased);
        //else

        if (this.selectedItem.quantityAdditive !== undefined && this.selectedItem.quantityAdditive !== null && this.selectedItem.quantityAdditive > 0)
          price.amount += this.selectedItem.quantityAdditive;
        else
          price.amount *= this.selectedItem.quantityMultiplier;
      });
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

  buyEquipment() {
    if (this.selectedItem.numberPurchasing === undefined || this.selectedItem.numberPurchasing === null)
      this.selectedItem.numberPurchasing = 1;

    this.selectedItem.amountPurchased += 1;

    if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
      if (this.globalService.globalVar.resources.some(x => x.name === this.selectedItem.name)) {
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === this.selectedItem.name);
        if (globalResource !== null && globalResource !== undefined) {
          globalResource.amount += 1;
        }
      }
      else
        this.globalService.globalVar.resources.push(new ResourceValue(this.selectedItem.name, 1, ShopItemTypeEnum.Equipment));
    }
  }

  buyConsumable() {
    if (this.selectedItem.numberPurchasing === undefined || this.selectedItem.numberPurchasing === null)
      this.selectedItem.numberPurchasing = 1;

    if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
      if (this.globalService.globalVar.resources.some(x => x.name === this.selectedItem.name)) {
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === this.selectedItem.name);
        if (globalResource !== null && globalResource !== undefined) {
          globalResource.amount += this.selectedItem.numberPurchasing;
        }
      }
      else
        this.globalService.globalVar.resources.push(new ResourceValue(this.selectedItem.name, this.selectedItem.numberPurchasing, ShopItemTypeEnum.Consumable));
    }
  }

  buyResources() {
    if (this.selectedItem.numberPurchasing === undefined || this.selectedItem.numberPurchasing === null)
      this.selectedItem.numberPurchasing = 1;

    if (this.globalService.globalVar.resources !== undefined && this.globalService.globalVar.resources !== null) {
      if (this.globalService.globalVar.resources.some(x => x.name === this.selectedItem.name)) {
        var globalResource = this.globalService.globalVar.resources.find(x => x.name === this.selectedItem.name);
        if (globalResource !== null && globalResource !== undefined) {
          globalResource.amount += this.selectedItem.numberPurchasing;
        }
      }
      else
        this.globalService.globalVar.resources.push(new ResourceValue(this.selectedItem.name, this.selectedItem.numberPurchasing, ShopItemTypeEnum.Resources));
    }
  }
}
