import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Ability } from 'src/app/models/animals/ability.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { IncubatorStatUpgrades } from 'src/app/models/animals/incubator-stat-upgrades.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { OrbTypeEnum } from 'src/app/models/orb-type-enum.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { TalentTreeTypeEnum } from 'src/app/models/talent-tree-type-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

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
  borderColorConditional: any;
  borderHeightConditional: any;
  editingName: boolean;
  newName: string;
  selectedAbility: Ability;
  abilityLevelMaxedOut: boolean;
  longDescription: string;
  traitStatGainDescription: string;
  autoBreedActive: boolean;
  canAutoBreed = false;
  areTalentsAvailable = false;
  orbIsUnlocked = false;
  assignedBarnName: string;
  talentTreeTypeEnum = TalentTreeTypeEnum;
  talentResetCost: string;
  freeTalentResets: number;
  canBreed = true;
  subscription: any;

  ability1: Ability;
  ability2: Ability;
  ability3: Ability;

  usableItemsList: ResourceValue[];
  itemsRows: ResourceValue[][]; //for display purposes
  itemsCells: ResourceValue[]; //for display purposes
  selectedItem: ResourceValue | undefined;
  selectedItemQuantity: number;

  equipmentList: ResourceValue[];
  equipmentRows: ResourceValue[][]; //for display purposes
  equipmentCells: ResourceValue[]; //for display purposes
  selectedEquipment: ResourceValue | undefined;

  orbFunctionalityReleased = true;
  orbList: ResourceValue[];
  orbRows: ResourceValue[][]; //for display purposes
  orbCells: ResourceValue[]; //for display purposes
  selectedOrb: ResourceValue | undefined;

  talentTreeOptions: string[];
  selectedTalentTree: string;
  talentTreeDescription: string;
  inDepthTalentTreeDescription: string;
  availableTalentPoints: number;
  talentColumns = 3;
  talentRows = 4;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.modalService.hasOpenModals()) {
      var availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);
      var indexOfCurrentAnimal = availableAnimals.findIndex(item => this.selectedAnimal === item);
      if (indexOfCurrentAnimal > -1) {
        if (event.key === "ArrowLeft") {
          var indexOfNewAnimal = indexOfCurrentAnimal - 1;
          if (indexOfNewAnimal < 0)
            indexOfNewAnimal = availableAnimals.length - 1;

          var newAnimal = availableAnimals[indexOfNewAnimal];
          this.componentCommunicationService.setAnimalView(NavigationEnum.animals, newAnimal);
          this.resetSelectedAnimalInfo(newAnimal);
        }
        else if (event.key === "ArrowRight") {
          var indexOfNewAnimal = indexOfCurrentAnimal + 1;
          if (indexOfNewAnimal === availableAnimals.length)
            indexOfNewAnimal = 0;

          var newAnimal = availableAnimals[indexOfNewAnimal];
          this.componentCommunicationService.setAnimalView(NavigationEnum.animals, newAnimal);
          this.resetSelectedAnimalInfo(newAnimal);
        }
      }
    }
  }

  constructor(public lookupService: LookupService, private modalService: NgbModal, private globalService: GlobalService,
    private componentCommunicationService: ComponentCommunicationService, private utilityService: UtilityService,
    private gameLoopService: GameLoopService) { }

  ngOnInit(): void {
    this.handleIntroTutorial();
    this.resetSelectedAnimalInfo(this.selectedAnimal);
    this.breedDescriptionPopover = "When your Breed XP reaches the max, you can Breed your animal. This will reset your base stats, but it will also increase the amount that your base stats contribute to your racing stats.";
  }

  returnToAnimalView(): void {
    this.returnEmitter.emit(false);
  }

  isAbilityLevelMaxedOut() {
    var abilityLevelCap = 25;
    var abilityLevelCapModifier = this.globalService.globalVar.modifiers.find(item => item.text === "abilityLevelCapModifier");
    if (abilityLevelCapModifier !== null && abilityLevelCapModifier !== undefined)
      abilityLevelCap = abilityLevelCapModifier.value;

    if (this.selectedAbility !== null && this.selectedAbility !== undefined &&
      this.selectedAbility.abilityLevel > this.selectedAnimal.breedLevel + abilityLevelCap)
      return true;
    else
      return false;
  }

  canAnimalBreed() {
    var canBreed = true;

    if (this.selectedAnimal.breedGaugeXp < this.selectedAnimal.breedGaugeMax)
      canBreed = false;

    return canBreed;
  }

  breed(): void {
    if (!this.globalService.globalVar.showBreedWarning || confirm("Breeding will increase your base stat modifiers at the cost of resetting your base stats to their default values. You should do this when you have raced as far as you can without breeding or you have the time to spend to train your stats back. Continue?")) {
      this.globalService.globalVar.showBreedWarning = false;
      this.globalService.BreedAnimal(this.selectedAnimal);

      this.maxSpeedModifierAmount = this.lookupService.getMaxSpeedModifierByAnimalType(this.selectedAnimal.type);
      this.accelerationModifierAmount = this.lookupService.getAccelerationModifierByAnimalType(this.selectedAnimal.type);
      this.staminaModifierAmount = this.lookupService.getStaminaModifierByAnimalType(this.selectedAnimal.type);
      this.powerModifierAmount = this.lookupService.getPowerModifierByAnimalType(this.selectedAnimal.type);
      this.focusModifierAmount = this.lookupService.getFocusModifierByAnimalType(this.selectedAnimal.type);
      this.adaptabilityModifierAmount = this.lookupService.getAdaptabilityModifierByAnimalType(this.selectedAnimal.type);
      this.diminishingReturnsAmount = this.globalService.GetAnimalDiminishingReturns(this.selectedAnimal);

      this.breedLevelPopover = this.lookupService.getBreedLevelPopover(this.selectedAnimal.breedLevel);
      this.abilityLevelMaxedOut = this.isAbilityLevelMaxedOut();
    }
  }

  editName(): void {
    if (this.newName.length <= 50 && this.newName.length >= 1) {
      this.selectedAnimal.name = this.newName;
      this.editingName = false;
    }
    else
      alert("Name must be between 1 and 50 characters long.");
  }

  selectAbility(ability: Ability) {
    this.selectedAnimal.ability = ability;
    this.selectedAbility = this.selectedAnimal.ability;
    this.abilityLevelMaxedOut = this.isAbilityLevelMaxedOut();
    this.longDescription = this.lookupService.getAnimalAbilityDescription(false, this.selectedAnimal.ability.name, this.selectedAnimal);
  }

  updateItemsList() {
    this.usableItemsList = [];
    //add food to list    
    this.globalService.globalVar.resources.filter(item => (item.itemType === ShopItemTypeEnum.Food || item.itemType === ShopItemTypeEnum.Consumable) && item.amount > 0).forEach(food => {
      if (food !== undefined) {
        this.usableItemsList.push(food);
      }
    });

    this.setupDisplayItems();
  }

  updateEquipmentList() {
    this.equipmentList = [];
    //add equipment to list
    this.globalService.globalVar.resources.filter(item => item.itemType === ShopItemTypeEnum.Equipment && !this.lookupService.isEquipmentItemAnOrb(item.name))
      .forEach(equipment => {
        if (equipment !== undefined) {
          var modifiedEquipment = equipment.makeCopy(equipment);
          this.equipmentList.push(modifiedEquipment);
        }
      });

    this.setupDisplayEquipment();

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
  }

  updateOrbList() {
    this.orbList = [];
    //add equipment to list
    this.globalService.globalVar.resources.filter(item => item.itemType === ShopItemTypeEnum.Equipment && this.lookupService.isEquipmentItemAnOrb(item.name))
      .forEach(orb => {
        if (orb !== undefined) {
          var modifiedOrb = orb.makeCopy(orb);
          this.orbList.push(modifiedOrb);
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

  setupDisplayOrbs(): void {
    this.orbCells = [];
    this.orbRows = [];

    var maxColumns = 4;

    for (var i = 1; i <= this.orbList.length; i++) {
      this.orbCells.push(this.orbList[i - 1]);
      if ((i % maxColumns) == 0) {
        this.orbRows.push(this.orbCells);
        this.orbCells = [];
      }
    }

    if (this.orbCells.length !== 0)
      this.orbRows.push(this.orbCells);
  }

  openTalentsModal(content: any) {           
    this.freeTalentResets = this.selectedAnimal.freeTalentResetCount; 
    var talentResetCost = this.lookupService.getTalentResetCost(this.selectedAnimal.type);
    this.talentResetCost = talentResetCost.toLocaleString() + " Coins";

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  openBaseStatsModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  openRacingStatsModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  openMiscStatsModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  openItemModal(content: any) {
    this.setupDisplayItems();
    var modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });

    modalRef.result.then((data) => {
      this.selectedItem = undefined;
      this.selectedItemQuantity = 0;
      this.clearSelectedItems();
      this.updateItemsList();
    }, (reason) => {
      this.selectedItem = undefined;
      this.selectedItemQuantity = 0;
      this.clearSelectedItems();
      this.updateItemsList();
    });
  }

  openEquipmentModal(content: any) {
    this.setupDisplayEquipment();
    var modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });

    modalRef.result.then((data) => {
      this.selectedEquipment = undefined;
      this.clearSelectedEquipment();
      this.updateEquipmentList();
    }, (reason) => {
      this.selectedEquipment = undefined;
      this.clearSelectedEquipment();
      this.updateEquipmentList();
    });
  }

  openOrbModal(content: any) {
    this.setupDisplayOrbs();
    var modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });

    modalRef.result.then((data) => {
      this.selectedOrb = undefined;
      this.clearSelectedOrb();
      this.updateOrbList();
    }, (reason) => {
      this.selectedOrb = undefined;
      this.clearSelectedOrb();
      this.updateOrbList();
    });
  }

  useItem() {
    if (this.selectedItem === undefined)
      return;

    var globalResource = this.globalService.globalVar.resources.find(item => item.name === this.selectedItem!.name && item.itemType === this.selectedItem!.itemType);
    if (globalResource === undefined) {
      alert("You've run into an error! Please try again. If you have the time, please export your data under the Settings tab and send me the data and any relevant info at CulturaIdle@gmail.com. Thank you!");
      return;
    }

    if (this.selectedItemQuantity === undefined || this.selectedItemQuantity === null || isNaN(Number(this.selectedItemQuantity))) {
      alert("You must enter a numerical amount to use.");
      return;
    }

    if (globalResource.amount < this.selectedItemQuantity) {
      alert("You don't have that many " + globalResource.name + "!");
      return;
    }

    if (this.selectedItem.itemType === ShopItemTypeEnum.Consumable && this.selectedItem.name.includes("Certificate") &&
      this.lookupService.isAmountMoreThanCertificateCap(this.selectedItemQuantity, this.selectedAnimal, this.selectedItem.name)) {
      alert("This amount will exceed the amount of these certificates you can give your animal.");
      return;
    }

    globalResource.amount -= this.selectedItemQuantity;

    if (this.selectedItem.itemType === ShopItemTypeEnum.Food) {
      if (this.selectedItem.name === "Mangoes") {
        this.selectedAnimal.breedLevel += +this.selectedItemQuantity;
        if (this.selectedAnimal.mangoesUsed === null || this.selectedAnimal.mangoesUsed === undefined)
          this.selectedAnimal.mangoesUsed = 0;
        this.selectedAnimal.mangoesUsed += +this.selectedItemQuantity;

        this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
      }
      else if (this.selectedItem.name === "Gingko Leaves") {
        this.selectedAnimal.previousBreedLevel = this.selectedAnimal.breedLevel;
        this.selectedAnimal.breedLevel = 1;
        this.selectedAnimal.breedGaugeMax = 200;
        this.selectedAnimal.breedGaugeXp = 0;
        this.selectedAnimal.incubatorStatUpgrades = new IncubatorStatUpgrades();
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
    else if (this.selectedItem.itemType === ShopItemTypeEnum.Consumable) {
      this.selectedItemQuantity = +this.selectedItemQuantity;

      if (this.selectedItem.name === "Free Race Breed XP Gain Certificate") {
        this.selectedAnimal.miscStats.bonusBreedXpGainFromLocalRaces += +this.selectedItemQuantity;
        this.selectedAnimal.miscStats.bonusLocalBreedXpCertificateCount += +this.selectedItemQuantity;
      }
      if (this.selectedItem.name === "Circuit Race Breed XP Gain Certificate") {
        this.selectedAnimal.miscStats.bonusBreedXpGainFromCircuitRaces += +(this.selectedItemQuantity * 2);
        this.selectedAnimal.miscStats.bonusCircuitBreedXpCertificateCount += +this.selectedItemQuantity;
      }
      if (this.selectedItem.name === "Training Breed XP Gain Certificate") {
        this.selectedAnimal.miscStats.bonusBreedXpGainFromTraining += +this.selectedItemQuantity;
        this.selectedAnimal.miscStats.bonusTrainingBreedXpCertificateCount += +this.selectedItemQuantity;
      }
      if (this.selectedItem.name === "Diminishing Returns Increase Certificate") {
        this.selectedAnimal.miscStats.diminishingReturnsBonus += +this.selectedItemQuantity;
        this.selectedAnimal.miscStats.bonusDiminishingReturnsCertificateCount += +this.selectedItemQuantity;
        this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
      }
    }

    this.selectedItem = undefined;
    this.selectedItemQuantity = 0;
    this.clearSelectedItems();
    this.updateItemsList();
  }

  selectItem(item: ResourceValue) {
    this.selectedItem = item;

    this.usableItemsList.forEach(item => {
      item.isSelected = false;
    });

    item.isSelected = true;
  }

  clearSelectedItems() {
    this.usableItemsList.forEach(item => {
      item.isSelected = false;
    });
  }

  clearSelectedEquipment() {
    this.equipmentList.forEach(item => {
      item.isSelected = false;
    });
  }

  clearSelectedOrb() {
    this.orbList.forEach(item => {
      item.isSelected = false;
    });
  }

  equipItem() {
    if (this.selectedEquipment === undefined)
      return;

    this.selectedAnimal.equippedItem = this.selectedEquipment;
    this.updateEquipmentList();
    this.clearSelectedEquipment();
    this.modalService.dismissAll();
    this.selectedEquipment = undefined;
  }

  selectEquipment(item: ResourceValue) {
    this.selectedEquipment = item;

    this.equipmentList.forEach(item => {
      item.isSelected = false;
    });

    item.isSelected = true;
  }

  unequipItem() {
    this.selectedAnimal.equippedItem = null;
    this.clearSelectedEquipment();
    this.updateEquipmentList();
  }

  equipOrb() {
    if (this.selectedOrb === undefined)
      return;

    this.selectedAnimal.equippedOrb = this.selectedOrb;
    this.updateOrbList();
    this.clearSelectedOrb();
    this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
    this.modalService.dismissAll();
    this.selectedOrb = undefined;
  }

  selectOrb(item: ResourceValue) {
    this.selectedOrb = item;

    this.orbList.forEach(item => {
      item.isSelected = false;
    });

    item.isSelected = true;
  }

  unequipOrb() {
    this.selectedAnimal.equippedOrb = null;
    this.clearSelectedOrb();
    this.updateOrbList();
    this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
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

  getAbilityLevelPopover() {
    return this.lookupService.abilityLevelPopover(this.selectedAnimal);
  }

  getBonusFreeRaceXpPopover() {
    return this.lookupService.bonusFreeRaceXpPopover(this.selectedAnimal);
  }

  getBonusCircuitRaceXpPopover() {
    return this.lookupService.bonusCircuitRaceXpPopover(this.selectedAnimal);
  }

  getBonusTrainingXpPopover() {
    return this.lookupService.bonusTrainingXpPopover(this.selectedAnimal);
  }

  getBonusDiminishingReturnsPerFacilityLevelPopover() {
    return this.lookupService.bonusDiminishingReturnsPerFacilityLevelPopover(this.selectedAnimal);
  }

  getBonusTrainingTimeReductionPopover() {
    return this.lookupService.bonusTrainingTimeReductionPopover(this.selectedAnimal);
  }

  getBonusTalentsPopover() {
    return this.lookupService.bonusTalentsPopover(this.selectedAnimal);
  }

  getAbilityPopover() {
    return this.lookupService.abilityPopover();
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

  itemHasAdditionalText(item: ResourceValue) {
    if (item.itemType === ShopItemTypeEnum.Consumable && item.name.includes("Certificate")) {
      return true;
    }

    return false;
  }

  getItemAdditionalText(item: ResourceValue) {
    var additionalText = "";

    if (item.itemType === ShopItemTypeEnum.Consumable && item.name.includes("Certificate")) {
      if (item.name === "Free Race Breed XP Gain Certificate") {
        additionalText = "<em>" + this.selectedAnimal.miscStats.bonusLocalBreedXpCertificateCount + " out of " + this.selectedAnimal.miscStats.certificateUseCap + " used</em>";
      }
      if (item.name === "Circuit Race Breed XP Gain Certificate") {
        additionalText = "<em>" + this.selectedAnimal.miscStats.bonusCircuitBreedXpCertificateCount + " out of " + this.selectedAnimal.miscStats.certificateUseCap + " used</em>";
      }
      if (item.name === "Training Breed XP Gain Certificate") {
        additionalText = "<em>" + this.selectedAnimal.miscStats.bonusTrainingBreedXpCertificateCount + " out of " + this.selectedAnimal.miscStats.certificateUseCap + " used</em>";
      }
      if (item.name === "Diminishing Returns Increase Certificate") {
        additionalText = "<em>" + this.selectedAnimal.miscStats.bonusDiminishingReturnsCertificateCount + " out of " + this.selectedAnimal.miscStats.certificateUseCap + " used</em>";
      }
    }

    return this.utilityService.getSanitizedHtml(additionalText);
  }

  handleIntroTutorial() {
    var hare = this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Hare);

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 3) {
      this.globalService.globalVar.tutorials.showTutorial = true;
    }
    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 9 &&
      hare?.isAvailable) {
      this.globalService.globalVar.tutorials.currentTutorialId += 1;
      this.globalService.globalVar.tutorials.showTutorial = true;
    }
  }

  goToAssignedBarn() {
    var assignedBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedAnimal.associatedBarnNumber);
    if (assignedBarn !== null && assignedBarn !== undefined)
      this.componentCommunicationService.setBarnView(NavigationEnum.barn, assignedBarn.barnNumber);
  }

  filterTalentTree(talentTree: string) {
    this.selectedTalentTree = talentTree;
    this.inDepthTalentTreeDescription = this.lookupService.getInDepthTalentTreeDescription(talentTree);
  }

  selectTalentTree() {
    if (this.selectedTalentTree === "" || this.selectedTalentTree === null || this.selectedTalentTree === undefined) {
      alert("You must select a talent tree.");
      return;
    }

    this.selectedAnimal.talentTree.talentTreeType = this.lookupService.convertTalentTreeNameToEnum(this.selectedTalentTree);
  }

  resetSelectedAnimalInfo(newAnimal: Animal) {
    this.selectedAnimal = newAnimal;
    this.areTalentsAvailable = this.lookupService.isItemUnlocked("rainbowRace");
    this.orbIsUnlocked = this.lookupService.isItemUnlocked("orbs") && this.selectedAnimal.canEquipOrb;

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

    this.selectedAbility = this.selectedAnimal.ability;
    this.abilityLevelMaxedOut = this.isAbilityLevelMaxedOut();
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
    this.updateOrbList();
    this.selectedTalentTree = "";
    this.inDepthTalentTreeDescription = "";

    this.componentCommunicationService.setAnimalView(NavigationEnum.animals, newAnimal);

    var assignedBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedAnimal.associatedBarnNumber);
    if (assignedBarn === null || assignedBarn === undefined)
      this.assignedBarnName = "Unassigned";
    else
      this.assignedBarnName = "Assigned to: " + this.lookupService.getBarnName(assignedBarn);

    if (this.areTalentsAvailable) {
      this.talentTreeOptions = this.lookupService.getTalentTreeNames();
      this.availableTalentPoints = this.lookupService.getTalentPointsAvailableToAnimal(this.selectedAnimal);
    }

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      this.canBreed = this.canAnimalBreed();
    });
  }

  getTalentTreeName() {
    var talentLevel = this.selectedAnimal.talentTree.getTotalSpentPoints();

    return this.lookupService.getTalentTreeNameByEnum(this.selectedAnimal.talentTree.talentTreeType) + " Level " + talentLevel;
  }

  resetTalents() {
    var talentResetCost = this.lookupService.getTalentResetCost(this.selectedAnimal.type);
    var paidTalentResetNotice = 'Future resets for this animal will be more expensive.';
    if (talentResetCost === 0)
      paidTalentResetNotice = "";
    if (this.lookupService.getCoins() >= talentResetCost && 
    confirm("This will refund all talent points and allow you to reselect your specialization. " + paidTalentResetNotice + "  Continue?"))
    {
      this.lookupService.spendCoins(this.lookupService.getTalentResetCost(this.selectedAnimal.type));      
      this.selectedAnimal.talentTree.reset();
      this.availableTalentPoints = this.lookupService.getTalentPointsAvailableToAnimal(this.selectedAnimal);
      if (this.selectedAnimal.freeTalentResetCount > 0)
      {
        this.selectedAnimal.freeTalentResetCount -= 1;
        if (this.selectedAnimal.freeTalentResetCount < 0)
          this.selectedAnimal.freeTalentResetCount = 0;
      }
      else
      {
        this.selectedAnimal.talentResetCount += 1;
      }

      this.freeTalentResets = this.selectedAnimal.freeTalentResetCount;
      var talentResetCost = this.lookupService.getTalentResetCost(this.selectedAnimal.type);          
      this.talentResetCost = talentResetCost.toLocaleString() + " Coins";
    }
  }

  getBorderConditional(row: number, column: number) {
    var conditional: any;
    var connectionRow = row + 1;

    var pointsNeededInColumn = 0;
    if (connectionRow === 1)
      pointsNeededInColumn = this.selectedAnimal.talentTree.row2RequiredPoints;
    if (connectionRow === 2)
      pointsNeededInColumn = this.selectedAnimal.talentTree.row3RequiredPoints;
    if (connectionRow === 3)
      pointsNeededInColumn = this.selectedAnimal.talentTree.row4RequiredPoints;

    var remainingPointsNeededInColumn = pointsNeededInColumn - this.selectedAnimal.talentTree.getTalentPointsByColumn(column);

    if (this.selectedAnimal.getRaceCourseType() === 'Flatland') {
      if (remainingPointsNeededInColumn >= 5)
        conditional = { 'completedFlatlandTalentSpacer height0': true };
      else if (remainingPointsNeededInColumn === 4)
        conditional = { 'completedFlatlandTalentSpacer height1': true };
      else if (remainingPointsNeededInColumn === 3)
        conditional = { 'completedFlatlandTalentSpacer height2': true };
      else if (remainingPointsNeededInColumn === 2)
        conditional = { 'completedFlatlandTalentSpacer height3': true };
      else if (remainingPointsNeededInColumn === 1)
        conditional = { 'completedFlatlandTalentSpacer height4': true };
      else if (remainingPointsNeededInColumn <= 0)
        conditional = { 'completedFlatlandTalentSpacer height5': true };
    }
    if (this.selectedAnimal.getRaceCourseType() === 'Mountain') {
      if (remainingPointsNeededInColumn >= 5)
        conditional = { 'completedMountainTalentSpacer height0': true };
      else if (remainingPointsNeededInColumn === 4)
        conditional = { 'completedMountainTalentSpacer height1': true };
      else if (remainingPointsNeededInColumn === 3)
        conditional = { 'completedMountainTalentSpacer height2': true };
      else if (remainingPointsNeededInColumn === 2)
        conditional = { 'completedMountainTalentSpacer height3': true };
      else if (remainingPointsNeededInColumn === 1)
        conditional = { 'completedMountainTalentSpacer height4': true };
      else if (remainingPointsNeededInColumn <= 0)
        conditional = { 'completedMountainTalentSpacer height5': true };
    }
    if (this.selectedAnimal.getRaceCourseType() === 'Ocean') {
      if (remainingPointsNeededInColumn >= 5) {
        conditional = { 'completedOceanTalentSpacer height0': true };
      }
      else if (remainingPointsNeededInColumn === 4) {
        conditional = { 'completedOceanTalentSpacer height1': true };
      }
      else if (remainingPointsNeededInColumn === 3) {
        conditional = { 'completedOceanTalentSpacer height2': true };
      }
      else if (remainingPointsNeededInColumn === 2) {
        conditional = { 'completedOceanTalentSpacer height3': true };
      }
      else if (remainingPointsNeededInColumn === 1) {
        conditional = { 'completedOceanTalentSpacer height4': true };
      }
      else if (remainingPointsNeededInColumn <= 0) {
        conditional = { 'completedOceanTalentSpacer height5': true };
      }
    }
    if (this.selectedAnimal.getRaceCourseType() === 'Tundra') {
      if (remainingPointsNeededInColumn >= 5)
        conditional = { 'completedTundraTalentSpacer height0': true };
      else if (remainingPointsNeededInColumn === 4)
        conditional = { 'completedTundraTalentSpacer height1': true };
      else if (remainingPointsNeededInColumn === 3)
        conditional = { 'completedTundraTalentSpacer height2': true };
      else if (remainingPointsNeededInColumn === 2)
        conditional = { 'completedTundraTalentSpacer height3': true };
      else if (remainingPointsNeededInColumn === 1)
        conditional = { 'completedTundraTalentSpacer height4': true };
      else if (remainingPointsNeededInColumn <= 0)
        conditional = { 'completedTundraTalentSpacer height5': true };
    }
    if (this.selectedAnimal.getRaceCourseType() === 'Volcanic') {
      if (remainingPointsNeededInColumn >= 5)
        conditional = { 'completedVolcanicTalentSpacer height0': true };
      else if (remainingPointsNeededInColumn === 4)
        conditional = { 'completedVolcanicTalentSpacer height1': true };
      else if (remainingPointsNeededInColumn === 3)
        conditional = { 'completedVolcanicTalentSpacer height2': true };
      else if (remainingPointsNeededInColumn === 2)
        conditional = { 'completedVolcanicTalentSpacer height3': true };
      else if (remainingPointsNeededInColumn === 1)
        conditional = { 'completedVolcanicTalentSpacer height4': true };
      else if (remainingPointsNeededInColumn <= 0)
        conditional = { 'completedVolcanicTalentSpacer height5': true };
    }

    return conditional;
  }

  spentTalent(spent: boolean) {
    this.availableTalentPoints = this.lookupService.getTalentPointsAvailableToAnimal(this.selectedAnimal);
  }

  orbColorConditional(orb: ResourceValue) {
    var type = this.globalService.getOrbTypeFromResource(orb);

    return {
      'amberColor': type === OrbTypeEnum.amber,
      'amethystColor': type === OrbTypeEnum.amethyst,
      'rubyColor': type === OrbTypeEnum.ruby,
      'sapphireColor': type === OrbTypeEnum.sapphire,
      'topazColor': type === OrbTypeEnum.topaz,
      'emeraldColor': type === OrbTypeEnum.emerald,
    };
  }

  viewOrbDetails(content: any) {    
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  ngOnDestroy() {
    if (this.subscription !== undefined && this.subscription !== null)
      this.subscription.unsubscribe();

    this.componentCommunicationService.setAnimal(new Animal());
  }
}
