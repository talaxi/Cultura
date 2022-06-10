import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ability } from 'src/app/models/animals/ability.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
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
  diminishingReturnsAmount: number;
  breedLevelPopover: string;
  breedDescriptionPopover: string;
  colorConditional: any;
  editingName: boolean;
  newName: string;
  longDescription: string;
  traitStatGainDescription: string;
  autoBreedActive: boolean;
  canAutoBreed = false;
  assignedBarnName: string;  

  ability1: Ability;
  ability2: Ability;
  ability3: Ability;

  usableItemsList: ResourceValue[];
  itemsRows: ResourceValue[][]; //for display purposes
  itemsCells: ResourceValue[]; //for display purposes
  selectedItem: ResourceValue;
  selectedItemQuantity: number;

  equipmentList: ResourceValue[];
  equipmentRows: ResourceValue[][]; //for display purposes
  equipmentCells: ResourceValue[]; //for display purposes
  selectedEquipment: ResourceValue;

  constructor(private lookupService: LookupService, private modalService: NgbModal, private globalService: GlobalService,
    private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.handleIntroTutorial();
    this.maxSpeedModifierAmount = this.lookupService.getMaxSpeedModifierByAnimalType(this.selectedAnimal.type);
    this.accelerationModifierAmount = this.lookupService.getAccelerationModifierByAnimalType(this.selectedAnimal.type);
    this.staminaModifierAmount = this.lookupService.getStaminaModifierByAnimalType(this.selectedAnimal.type);
    this.powerModifierAmount = this.lookupService.getPowerModifierByAnimalType(this.selectedAnimal.type);
    this.focusModifierAmount = this.lookupService.getFocusModifierByAnimalType(this.selectedAnimal.type);
    this.adaptabilityModifierAmount = this.lookupService.getAdaptabilityModifierByAnimalType(this.selectedAnimal.type);
    this.diminishingReturnsAmount = this.globalService.GetAnimalDiminishingReturns(this.selectedAnimal);
    this.breedLevelPopover = this.lookupService.getBreedLevelPopover(this.selectedAnimal.breedLevel);

    var stockbreeder = this.lookupService.getStockbreeder();

    if (stockbreeder !== null && stockbreeder !== undefined && stockbreeder > 0)
      this.canAutoBreed = true;

    if (this.canAutoBreed)
      this.autoBreedActive = this.selectedAnimal.autoBreedActive;

    this.ability1 = this.selectedAnimal.availableAbilities[0];
    if (this.selectedAnimal.availableAbilities.length > 1)
      this.ability2 = this.selectedAnimal.availableAbilities[1];
    if (this.selectedAnimal.availableAbilities.length > 2)
      this.ability3 = this.selectedAnimal.availableAbilities[2];

    this.longDescription = this.lookupService.getAnimalAbilityDescription(false, this.selectedAnimal.ability.name, this.selectedAnimal);

    if (this.selectedAnimal.trait !== undefined && this.selectedAnimal.trait !== null)
      this.traitStatGainDescription = this.lookupService.getTraitStatGainDescription(this.selectedAnimal.trait);

    this.colorConditional = {
      'flatlandColor': this.selectedAnimal.getRaceCourseType() === 'Flatland',
      'mountainColor': this.selectedAnimal.getRaceCourseType() === 'Mountain',
      'waterColor': this.selectedAnimal.getRaceCourseType() === 'Ocean',
      'tundraColor': this.selectedAnimal.getRaceCourseType() === 'Tundra',
      'volcanicColor': this.selectedAnimal.getRaceCourseType() === 'Volcanic'
    };

    this.updateItemsList();
    this.updateEquipmentList();

    //remove any equipment already in use
    this.globalService.globalVar.animals.filter(item => item.equippedItem !== null && item.equippedItem !== undefined).forEach(animal => {
      var listItem = this.equipmentList.find(item => item.name === animal.equippedItem?.name);
      if (listItem !== null && listItem !== undefined) {
        if (listItem.amount > 0) {
          listItem.amount -= 1;
        }

        if (listItem.amount <= 0) {
          this.equipmentList = this.equipmentList.filter(item => item.name !== listItem?.name);
        }
      }
    });

    this.componentCommunicationService.setAnimalView(NavigationEnum.animals, new Animal());

    var assignedBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedAnimal.associatedBarnNumber);
    if (assignedBarn === null || assignedBarn === undefined)
      this.assignedBarnName = "Unassigned";
    else
      this.assignedBarnName = "Assigned to: " + this.lookupService.getBarnName(assignedBarn);

    this.breedDescriptionPopover = "When your Breed XP reaches the max, you can Breed your animal. This will reset your base stats, but it will also increase the amount that your base stats contribute to your racing stats.";
  }

  returnToAnimalView(): void {
    this.returnEmitter.emit(false);
  }

  breed(): void {
    this.globalService.BreedAnimal(this.selectedAnimal);

    this.maxSpeedModifierAmount = this.lookupService.getMaxSpeedModifierByAnimalType(this.selectedAnimal.type);
    this.accelerationModifierAmount = this.lookupService.getAccelerationModifierByAnimalType(this.selectedAnimal.type);
    this.staminaModifierAmount = this.lookupService.getStaminaModifierByAnimalType(this.selectedAnimal.type);
    this.powerModifierAmount = this.lookupService.getPowerModifierByAnimalType(this.selectedAnimal.type);
    this.focusModifierAmount = this.lookupService.getFocusModifierByAnimalType(this.selectedAnimal.type);
    this.adaptabilityModifierAmount = this.lookupService.getAdaptabilityModifierByAnimalType(this.selectedAnimal.type);
    this.diminishingReturnsAmount = this.globalService.GetAnimalDiminishingReturns(this.selectedAnimal);

    this.breedLevelPopover = this.lookupService.getBreedLevelPopover(this.selectedAnimal.breedLevel);
  }

  editName(): void {
    //TODO: error message?
    if (this.newName.length <= 50 && this.newName.length >= 1)
    {
      this.selectedAnimal.name = this.newName;
      this.editingName = false;
    }
  }

  selectAbility(ability: Ability) {
    this.selectedAnimal.ability = ability;
    this.longDescription = this.lookupService.getAnimalAbilityDescription(false, this.selectedAnimal.ability.name, this.selectedAnimal);
  }

  updateItemsList() {
    this.usableItemsList = [];
    //add food to list
    this.globalService.globalVar.resources.filter(item => item.itemType === ShopItemTypeEnum.Food && item.amount > 0).forEach(food => {
      if (food !== undefined) {
        this.usableItemsList.push(food);
      }
    });

    this.setupDisplayItems();
  }

  updateEquipmentList() {    
    this.equipmentList = [];
    //add equipment to list
    this.globalService.globalVar.resources.filter(item => item.itemType === ShopItemTypeEnum.Equipment).forEach(equipment => {
      if (equipment !== undefined) {
        var modifiedEquipment = equipment.makeCopy(equipment);
        this.equipmentList.push(modifiedEquipment);
      }
    });

    this.setupDisplayEquipment();
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

  setupDisplayEquipment(): void {
    this.equipmentCells = [];
    this.equipmentRows = [];

    var maxColumns = 4;

    for (var i = 1; i <= this.equipmentList.length; i++) {
      this.equipmentCells.push(this.equipmentList[i - 1]);
      if ((i % maxColumns) == 0) {
        this.equipmentRows.push(this.equipmentCells);
        this.equipmentCells = [];
      }
    }

    if (this.equipmentCells.length !== 0)
      this.equipmentRows.push(this.equipmentCells);
  }

  openItemModal(content: any) {
    this.setupDisplayItems();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  openEquipmentModal(content: any) {
    this.setupDisplayEquipment();
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
      if (this.selectedItem.name === "Mangoes") {        
        this.selectedAnimal.breedLevel += +this.selectedItemQuantity;        
        this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
      }
      else {
        var increaseStats = new AnimalStats(0, 0, 0, 0, 0, 0);

        if (this.selectedItem.name === "Apples")
          increaseStats.acceleration = this.selectedItemQuantity;
        if (this.selectedItem.name === "Bananas")
          increaseStats.topSpeed = this.selectedItemQuantity;
        if (this.selectedItem.name === "Strawberries")
          increaseStats.endurance = this.selectedItemQuantity;
        if (this.selectedItem.name === "Carrots")
          increaseStats.power = this.selectedItemQuantity;
        if (this.selectedItem.name === "Turnips")
          increaseStats.focus = this.selectedItemQuantity;
        if (this.selectedItem.name === "Oranges")
          increaseStats.adaptability = this.selectedItemQuantity;

        this.selectedAnimal.increaseStats(increaseStats);
        this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
      }
    }

    this.updateItemsList();
  }

  selectItem(item: ResourceValue) {
    this.selectedItem = item;
  }

  equipItem() {
    this.selectedAnimal.equippedItem = this.selectedEquipment;
    this.updateEquipmentList();
    this.modalService.dismissAll();
  }

  selectEquipment(item: ResourceValue) {
    this.selectedEquipment = item;
  }

  unequipItem() {
    this.selectedAnimal.equippedItem = null;
  }

  toggleAutoBreed = (): void => {
    this.autoBreedActive = !this.autoBreedActive;
    this.selectedAnimal.autoBreedActive = this.autoBreedActive;
  }

  getTopSpeedPopover() {
    return this.lookupService.topSpeedPopover(this.selectedAnimal);
  }

  getAccelerationPopover() {
    return this.lookupService.accelerationPopover(this.selectedAnimal);
  }

  getEndurancePopover() {
    return this.lookupService.endurancePopover(this.selectedAnimal);
  }

  getPowerPopover() {
    return this.lookupService.powerPopover(this.selectedAnimal);
  }

  getFocusPopover() {
    return this.lookupService.focusPopover(this.selectedAnimal);
  }

  getAdaptabilityPopover() {
    return this.lookupService.adaptabilityPopover(this.selectedAnimal);
  }

  getDiminishingReturnsPopover() {
    return "Once a trainable stat is over this number, additional gains in this stat will be reduced. Increase with Facility Level.";
  }

  getEquipmentShortDescription(name: string) {
    var description = "";

    description = this.globalService.getEquipmentDescription(name);

    return description;
  }

  getItemShortDescription(name: string) {
    var description = "";

    description = this.globalService.getItemDescription(name);

    return description;
  }

  handleIntroTutorial()
  {    
    if (!this.globalService.globalVar.tutorialCompleted && this.globalService.globalVar.currentTutorialId === 3)
    {      
      this.globalService.globalVar.showTutorial = true;
    }  
    if (!this.globalService.globalVar.tutorialCompleted && this.globalService.globalVar.currentTutorialId === 8)
    {      
      this.globalService.globalVar.currentTutorialId += 1;
      this.globalService.globalVar.showTutorial = true;
    }      
  }

  goToAssignedBarn() {
    var assignedBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedAnimal.associatedBarnNumber);
    if (assignedBarn !== null && assignedBarn !== undefined)
      this.componentCommunicationService.setBarnView(NavigationEnum.barn, assignedBarn.barnNumber);
  }
}
