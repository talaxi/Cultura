import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ability } from 'src/app/models/animals/ability.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { ShopItem } from 'src/app/models/shop/shop-item.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-selected-animal',
  templateUrl: './selected-animal.component.html',
  styleUrls: ['./selected-animal.component.css']
})
export class SelectedAnimalComponent implements OnInit {
  @Input() selectedAnimal: Animal;
  @Output() returnEmitter = new EventEmitter<boolean>();

  maxSpeedModifierAmount: number;
  accelerationModifierAmount: number;
  staminaModifierAmount: number;
  powerModifierAmount: number;
  focusModifierAmount: number;
  adaptabilityModifierAmount: number;
  colorConditional: any;
  editingName: boolean;
  newName: string;
  longDescription: string;

  ability1: Ability;
  ability2: Ability;
  ability3: Ability;

  usableItemsList: ResourceValue[];
  itemsRows: ResourceValue[][]; //for display purposes
  itemsCells: ResourceValue[]; //for display purposes
  selectedItem: ResourceValue;
  selectedItemQuantity: number;

  //get food item list, display it in the html, when selected it goes down into a pane with the description and quantity
  //so Title
  // -------
  //
  //   List
  //
  // -------
  // Description
  // Quantity / Buy

  /*useItemForm = new FormGroup({
    deckName: new FormControl(''),
  });*/


  constructor(private lookupService: LookupService, private modalService: NgbModal, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.maxSpeedModifierAmount = this.lookupService.getMaxSpeedModifierByAnimalType(this.selectedAnimal.type);
    this.accelerationModifierAmount = this.lookupService.getAccelerationModifierByAnimalType(this.selectedAnimal.type);
    this.staminaModifierAmount = this.lookupService.getStaminaModifierByAnimalType(this.selectedAnimal.type);
    this.powerModifierAmount = this.lookupService.getPowerModifierByAnimalType(this.selectedAnimal.type);
    this.focusModifierAmount = this.lookupService.getFocusModifierByAnimalType(this.selectedAnimal.type);
    this.adaptabilityModifierAmount = this.lookupService.getAdaptabilityModifierByAnimalType(this.selectedAnimal.type);

    this.ability1 = this.selectedAnimal.availableAbilities[0];
    if (this.selectedAnimal.availableAbilities.length > 1)
      this.ability2 = this.selectedAnimal.availableAbilities[1];
    if (this.selectedAnimal.availableAbilities.length > 2)
      this.ability3 = this.selectedAnimal.availableAbilities[2];

    this.longDescription = this.lookupService.getAnimalAbilityDescription(false, this.selectedAnimal.ability.name, this.selectedAnimal);

    this.colorConditional = {
      'flatlandColor': this.selectedAnimal.getRaceCourseType() === 'Flatland',
      'mountainColor': this.selectedAnimal.getRaceCourseType() === 'Mountain', 'waterColor': this.selectedAnimal.getRaceCourseType() === 'Water'
    };

    this.usableItemsList = [];
    //add food to list
    this.globalService.globalVar.resources.filter(item => item.itemType === ShopItemTypeEnum.Food).forEach(food => {
      if (food !== undefined) {
        this.usableItemsList.push(food);
      }
    });
  }

  returnToAnimalView(): void {
    this.returnEmitter.emit(false);
  }

  breed(): void {
    this.globalService.BreedAnimal(this.selectedAnimal);
  }

  editName(): void {
    this.selectedAnimal.name = this.newName;
    this.editingName = false;
  }

  selectAbility(ability: Ability) {
    this.selectedAnimal.ability = ability;
    this.longDescription = this.lookupService.getAnimalAbilityDescription(false, this.selectedAnimal.ability.name, this.selectedAnimal);
  }

  setupDisplayItems(): void {
    this.itemsCells = [];
    this.itemsRows = [];

    var maxColumns = 4;

    for (var i = 1; i <= this.usableItemsList.length; i++) {
      this.itemsCells.push(this.usableItemsList[i - 1]);
      if ((i % maxColumns) == 0) {
        this.itemsRows.push(this.itemsCells);
        this.itemsCells = [];
      }
    }

    if (this.itemsCells.length !== 0)
      this.itemsRows.push(this.itemsCells);
  }


  openItemModal(content: any) {
    this.setupDisplayItems();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  useItem() {
    var globalResource = this.globalService.globalVar.resources.find(item => item.name === this.selectedItem.name && item.itemType === this.selectedItem.itemType);
    if (globalResource === undefined)
      return; //TODO: Error handle

    if (globalResource.amount < this.selectedItemQuantity)
      return; //TODO: error handle

    globalResource.amount -= this.selectedItemQuantity;

    if (this.selectedItem.itemType === ShopItemTypeEnum.Food) {
      var increaseStats = new AnimalStats(0, 0, 0, 0, 0, 0);

      if (this.selectedItem.name === "Apple")
        increaseStats.acceleration = this.selectedItemQuantity;
      if (this.selectedItem.name === "Banana")
        increaseStats.topSpeed = this.selectedItemQuantity;
      if (this.selectedItem.name === "Strawberry")
        increaseStats.endurance = this.selectedItemQuantity;
      if (this.selectedItem.name === "Carrot")
        increaseStats.power = this.selectedItemQuantity;
      if (this.selectedItem.name === "Turnip")
        increaseStats.focus = this.selectedItemQuantity;
      if (this.selectedItem.name === "Orange")
        increaseStats.adaptability = this.selectedItemQuantity;

      this.selectedAnimal.increaseStats(increaseStats);
      this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
    }
  }

  selectItem(item: ResourceValue) {
    this.selectedItem = item;
  }
}
