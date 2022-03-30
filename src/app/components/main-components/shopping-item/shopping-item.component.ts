import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
  }

  BuyItem(): void {
    var moneyAmount = this.lookupService.getMoney();

    if (moneyAmount >= this.selectedItem.purchasePrice) {
      this.lookupService.spendMoney(this.selectedItem.purchasePrice);

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

  buyAnimal() {
    var animal = this.globalService.globalVar.animals.find(item => item.name === this.selectedItem.name);
    if (animal !== null && animal !== undefined) {
      animal.isAvailable = true;
      this.selectedItem.amountPurchased = 1;

      var primaryAnimalDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (primaryAnimalDeck !== null && primaryAnimalDeck !== undefined) {
        var typeFound = false;
        primaryAnimalDeck.selectedAnimals.forEach(item => {
          console.log(item.raceCourseType + " vs " + animal?.raceCourseType);
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

  }

  buySpecialty() {

  }

  buyAbility() {
    var animalType = this.selectedItem.name.split(' ')[0].trim();
    var abilityName = this.selectedItem.name.split(':')[1].trim();

    console.log(animalType);
    console.log(abilityName);

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
