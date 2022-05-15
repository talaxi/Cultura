import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Animal } from 'src/app/models/animals/animal.model';
import { BarnSpecializationEnum } from 'src/app/models/barn-specialization-enum.model';
import { Barn } from 'src/app/models/barns/barn.model';
import { FacilitySizeEnum } from 'src/app/models/facility-size-enum.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { TrainingOption } from 'src/app/models/training/training-option.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { SpecializationService } from 'src/app/services/specialization.service';
//import * as cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-selected-barn',
  templateUrl: './selected-barn.component.html',
  styleUrls: ['./selected-barn.component.css']
})
export class SelectedBarnComponent implements OnInit {
  @Input() selectedBarnNumber: number;
  @Output() returnToBarnEmitter = new EventEmitter<number>();
  @ViewChild('specializationModal', { static: true }) specializationModal: ElementRef;

  barn: Barn;
  animalAssigned: boolean;
  associatedAnimal: Animal;
  associatedAnimalName: string;
  existingTraining: TrainingOption | null;
  trainingProgressBarPercent: number;
  availableTrainings: TrainingOption[];
  availableAnimals: Animal[];
  canUpgrade = false;
  sizeValue: string;
  totalBarnStatsPopover: string;
  upgradeBarnPopover: string;
  upgradeText: string;
  specializationOptions: string[];
  selectedSpecialization: string;
  specializationDescription: string;
  inDepthSpecializationDescription: string;
  barnSpecializationsUnlocked = false;

  filterSpeed = false;
  filterAcceleration = false;
  filterEndurance = false;
  filterPower = false;
  filterFocus = false;
  filterAdaptability = false;
  filterSmall = false;
  filterMedium = false;
  filterLarge = false;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private modalService: NgbModal,
   private lookupService: LookupService, private componentCommunicationService: ComponentCommunicationService,
    private specializationService: SpecializationService) {
  }

  ngOnInit(): void {
    this.specializationOptions = this.lookupService.getAllBarnSpecializations();
    this.upgradeText = "Upgrade";
    this.barnSpecializationsUnlocked = this.lookupService.isItemUnlocked("barnSpecializations");

    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        this.barn = globalBarn;
        this.getSizeValue();
        this.totalBarnStatsPopover = this.getTotalBarnStatsPopover();
        this.upgradeBarnPopover = this.getUpgradeBarnPopover();

        if (this.barn.barnUpgrades.barnLevel === 9)
          this.upgradeText = "Specialize";

        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.animalAssigned = true;
          this.associatedAnimal = associatedAnimal;
          this.associatedAnimalName = associatedAnimal.name;
          this.existingTraining = associatedAnimal.currentTraining;

          this.availableTrainings = this.GetAvailableTrainingOptions(associatedAnimal);

          if (this.existingTraining !== undefined && this.existingTraining !== null)
          {
            var selectedTraining = this.availableTrainings.find(item => this.existingTraining?.trainingName === item.trainingName);
            if (selectedTraining !== null && selectedTraining !== undefined)
              selectedTraining.isSelected = true;
          }            
        }
        else {
          this.animalAssigned = false;
          this.availableAnimals = this.GetAvailableAnimalOptions();
        }

        this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
          if (!this.barn.isLocked) {
            var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);
            if (associatedAnimal === undefined || associatedAnimal === null) {
              //any game loop logic needed for an empty barn
            }
            else {
              //UI updates          
              if (associatedAnimal.currentTraining === undefined || associatedAnimal.currentTraining === null)
                return;

              if (associatedAnimal.currentTraining !== this.existingTraining)
                this.existingTraining = associatedAnimal.currentTraining;

              if (this.trainingProgressBarPercent >= 100) {
                this.trainingProgressBarPercent = 100;
              }

              this.trainingProgressBarPercent = ((associatedAnimal.currentTraining.timeTrained / associatedAnimal.currentTraining.timeToComplete) * 100);
            }
          }
        });
      }

    }
    else {
      console.log("Can't find barn");
      //TODO: throw error, can't find barn
    }
  }

  selectNewTraining(training: TrainingOption): void {
    var animal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber === this.selectedBarnNumber);
    if (animal === undefined || animal === null)
      return;

    var newTraining = Object.assign({}, training);
    
    if (animal.currentTraining !== null && animal.currentTraining !== undefined)
    {
      if (this.globalService.globalVar.settings.get("finishTrainingBeforeSwitching")) {
        animal.queuedTraining = newTraining;
        console.log("Name: "+ animal.queuedTraining.trainingName);
        return;
      }

      animal.currentTraining.timeTrained = 0;
    }

    animal.currentTraining = newTraining;
    this.existingTraining = newTraining;
  }

  GetAvailableTrainingOptions(associatedAnimal: Animal): TrainingOption[] {
    var trainingOptions: TrainingOption[] = [];

    if (this.globalService.globalVar === undefined || this.globalService.globalVar === null ||
      this.globalService.globalVar.trainingOptions === undefined || this.globalService.globalVar.trainingOptions === null ||
      this.globalService.globalVar.trainingOptions.length === 0) {
      return trainingOptions;
    }

    trainingOptions = this.globalService.globalVar.trainingOptions.filter(item => item.isAvailable &&
      (item.facilitySize === FacilitySizeEnum.Small ||
        item.facilitySize === FacilitySizeEnum.Medium && (this.barn.size === FacilitySizeEnum.Medium || this.barn.size === FacilitySizeEnum.Large) ||
        item.facilitySize === FacilitySizeEnum.Large && this.barn.size === FacilitySizeEnum.Large));

    var modifiedTrainingOptions: TrainingOption[] = [];

    trainingOptions.forEach(option => {
      var modifiedOption = option.makeCopy(option);

      var trainingTimeReduction = this.lookupService.getTrainingTimeReductionFromTrainingFacility(this.barn.barnUpgrades);
      var stopwatch = this.lookupService.getResourceByName("Stopwatch");
      if (stopwatch === undefined || stopwatch === null)
        stopwatch = 0;

      modifiedOption.timeToComplete *= 1 - (stopwatch * .05 + trainingTimeReduction);
      modifiedOption.timeToComplete = Math.round((modifiedOption.timeToComplete + Number.EPSILON) * 100) / 100;

      modifiedOption.affectedStatRatios.topSpeed *= this.barn.barnUpgrades.upgradedStatGain.topSpeed;
      modifiedOption.affectedStatRatios.acceleration *= this.barn.barnUpgrades.upgradedStatGain.acceleration;
      modifiedOption.affectedStatRatios.endurance *= this.barn.barnUpgrades.upgradedStatGain.endurance;
      modifiedOption.affectedStatRatios.power *= this.barn.barnUpgrades.upgradedStatGain.power;
      modifiedOption.affectedStatRatios.focus *= this.barn.barnUpgrades.upgradedStatGain.focus;
      modifiedOption.affectedStatRatios.adaptability *= this.barn.barnUpgrades.upgradedStatGain.adaptability;

      modifiedOption.affectedStatRatios.topSpeed = Math.round((modifiedOption.affectedStatRatios.topSpeed + Number.EPSILON) * 100) / 100;
      modifiedOption.affectedStatRatios.acceleration = Math.round((modifiedOption.affectedStatRatios.acceleration + Number.EPSILON) * 100) / 100;
      modifiedOption.affectedStatRatios.endurance = Math.round((modifiedOption.affectedStatRatios.endurance + Number.EPSILON) * 100) / 100;
      modifiedOption.affectedStatRatios.power = Math.round((modifiedOption.affectedStatRatios.power + Number.EPSILON) * 100) / 100;
      modifiedOption.affectedStatRatios.focus = Math.round((modifiedOption.affectedStatRatios.focus + Number.EPSILON) * 100) / 100;
      modifiedOption.affectedStatRatios.adaptability = Math.round((modifiedOption.affectedStatRatios.adaptability + Number.EPSILON) * 100) / 100;

      modifiedTrainingOptions.push(modifiedOption);
    });

    if (this.filterAcceleration || this.filterAdaptability || this.filterEndurance || this.filterFocus || this.filterPower
      || this.filterSpeed || this.filterSmall || this.filterMedium || this.filterLarge) {
      modifiedTrainingOptions = modifiedTrainingOptions.filter(item => (((!this.filterAcceleration && !this.filterAdaptability && !this.filterFocus &&
        !this.filterSpeed && !this.filterPower && !this.filterEndurance) ||
        (this.filterAcceleration && item.affectedStatRatios.acceleration > 0) ||
        (this.filterAdaptability && item.affectedStatRatios.adaptability > 0) ||
        (this.filterEndurance && item.affectedStatRatios.endurance > 0) ||
        (this.filterFocus && item.affectedStatRatios.focus > 0) || (this.filterPower && item.affectedStatRatios.power > 0) ||
        (this.filterSpeed && item.affectedStatRatios.topSpeed > 0))) && ((!this.filterSmall && !this.filterMedium && !this.filterLarge) ||
          (this.filterSmall && item.facilitySize === FacilitySizeEnum.Small) ||
          (this.filterMedium && item.facilitySize === FacilitySizeEnum.Medium) ||
          (this.filterLarge && item.facilitySize === FacilitySizeEnum.Large)));
    }

    return modifiedTrainingOptions;
  }

  GetAvailableAnimalOptions(): Animal[] {
    var animalOptions: Animal[] = [];

    if (this.globalService.globalVar === undefined || this.globalService.globalVar === null ||
      this.globalService.globalVar.animals === undefined || this.globalService.globalVar.animals === null ||
      this.globalService.globalVar.animals.length === 0) {
      return animalOptions;
    }

    animalOptions = this.globalService.globalVar.animals.filter(item => item.isAvailable &&
      (item.associatedBarnNumber === undefined || item.associatedBarnNumber <= 0));

    return animalOptions;
  }

  unassignAnimal(): void {
    var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

    if (associatedAnimal !== undefined && associatedAnimal !== null) {
      associatedAnimal.associatedBarnNumber = 0;
      associatedAnimal.currentTraining = null;
    }

    this.animalAssigned = false;

    this.availableAnimals = this.GetAvailableAnimalOptions();
  }

  assignAnimal(selectedAnimal: Animal): void {
    selectedAnimal.associatedBarnNumber = this.selectedBarnNumber;
    this.animalAssigned = true;
    this.availableAnimals = this.GetAvailableAnimalOptions();
    this.availableTrainings = this.GetAvailableTrainingOptions(selectedAnimal);
    this.associatedAnimalName = selectedAnimal.name;
    this.existingTraining = null;

    var globalAnimal = this.lookupService.getAnimalByType(selectedAnimal.type);
    if (globalAnimal !== null) {
      globalAnimal.associatedBarnNumber = this.selectedBarnNumber;
      this.associatedAnimal = globalAnimal;
    }
  }

  returnToBarnView(): void {
    this.returnToBarnEmitter.emit(0);
  }

  toggleStatFilter(stat: string): void {
    if (stat === "Speed")
      this.filterSpeed = !this.filterSpeed;
    if (stat === "Acceleration")
      this.filterAcceleration = !this.filterAcceleration;
    if (stat === "Focus")
      this.filterFocus = !this.filterFocus;
    if (stat === "Power")
      this.filterPower = !this.filterPower;
    if (stat === "Endurance")
      this.filterEndurance = !this.filterEndurance;
    if (stat === "Adaptability")
      this.filterAdaptability = !this.filterAdaptability;

    this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
  }

  toggleFacilityFilter(size: string): void {
    if (size === "Small")
      this.filterSmall = !this.filterSmall;
    if (size === "Medium")
      this.filterMedium = !this.filterMedium;
    if (size === "Large")
      this.filterLarge = !this.filterLarge;

    this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
  }

  resetFilters() {
    this.filterSpeed = false;
    this.filterAcceleration = false;
    this.filterEndurance = false;
    this.filterFocus = false;
    this.filterPower = false;
    this.filterAdaptability = false;
    this.filterSmall = false;
    this.filterMedium = false;
    this.filterLarge = false;

    this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
  }

  purchaseBarn(): void {
    var CoinsAmount = this.lookupService.getCoins();

    if (CoinsAmount >= this.barn.purchasePrice) {
      this.barn.isLocked = false;
      this.lookupService.spendCoins(this.barn.purchasePrice);
    }
  }

  getSizeValue() {
    this.sizeValue = this.barn.getSize();
  }

  upgradeBarnSize(): void {
    var CoinsAmount = this.lookupService.getCoins();

    if (CoinsAmount >= this.barn.facilityUpgradePrice) {
      if (this.barn.size === FacilitySizeEnum.Small)
        this.barn.size = FacilitySizeEnum.Medium;
      else if (this.barn.size === FacilitySizeEnum.Medium)
        this.barn.size = FacilitySizeEnum.Large;

      this.getSizeValue();
      this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
      this.lookupService.spendCoins(this.barn.facilityUpgradePrice);
    }
  }


  upgradeBarn(): void {
    var requiredResources = this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel);
    var canBuy = this.canUpgradeBarn(requiredResources);

    //console.log("Mod: " + this.barn.barnUpgrades.barnLevel % 10);
    if (!canBuy)
      return; //TODO: Add Error

    if (this.barn.barnUpgrades.barnLevel === 9) {
      this.modalService.open(this.specializationModal, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
    }
    else {
      requiredResources.forEach(resource => {
        this.lookupService.spendResourceByName(resource.name, resource.amount);
      });

      this.barn.barnUpgrades.barnLevel += 1;

      var defaultStatGain = .1;
      if (this.barn.barnUpgrades.barnLevel % 10 === 0) {
        this.barn.barnUpgrades.specializationLevel += 1;
      }
      else {
        var statBarnLevel = this.barn.barnUpgrades.barnLevel - this.barn.barnUpgrades.specializationLevel;
        if (statBarnLevel % 6 === 0)
          this.barn.barnUpgrades.upgradedStatGain.topSpeed += defaultStatGain;
        else if (statBarnLevel % 6 === 5)
          this.barn.barnUpgrades.upgradedStatGain.acceleration += defaultStatGain;
        else if (statBarnLevel % 6 === 4)
          this.barn.barnUpgrades.upgradedStatGain.endurance += defaultStatGain;
        else if (statBarnLevel % 6 === 3)
          this.barn.barnUpgrades.upgradedStatGain.power += defaultStatGain;
        else if (statBarnLevel % 6 === 2)
          this.barn.barnUpgrades.upgradedStatGain.focus += defaultStatGain;
        else if (statBarnLevel % 6 === 1)
          this.barn.barnUpgrades.upgradedStatGain.adaptability += defaultStatGain;
      }

      this.totalBarnStatsPopover = this.getTotalBarnStatsPopover();
      this.upgradeBarnPopover = this.getUpgradeBarnPopover();
    }

    this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
  }

  canUpgradeBarn(requiredResources: ResourceValue[]): boolean {
    var canUpgrade = true;
    requiredResources.forEach(resource => {
      if (resource.name === "Coins" && resource.amount > this.lookupService.getCoins()) {
        canUpgrade = false;
      }
      else if (resource.name === "Medals" && resource.amount > this.lookupService.getMedals()) {
        canUpgrade = false;
      }
    });

    return canUpgrade;
  }

  getTotalBarnStatsPopover() {
    var popover = "Upgrade to gain barn bonuses";

    if (this.barn.barnUpgrades.barnLevel >= 1)
      popover = "Barn Upgrades: \n"

    //TODO: Condense this entire if condition into the getspecializationpopovertext call
    if (this.barn.barnUpgrades.specialization === BarnSpecializationEnum.TrainingFacility) {
      if (this.barn.barnUpgrades.specializationLevel <= 20)
        popover += "Training Time Reduction: " + this.barn.barnUpgrades.specializationLevel + "%\n";
      else
        popover += "Training Time Reduction: 20%\n All Stat Multiplier: " + ((this.barn.barnUpgrades.specializationLevel - 20) / 10);
    }
    else if (this.barn.barnUpgrades.specialization === BarnSpecializationEnum.BreedingGrounds) {
      var breedingGroundsModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "breedingGroundsSpecializationModifier");
      if (breedingGroundsModifierPair !== null && breedingGroundsModifierPair !== undefined) {
        popover += "Training Breed XP Multipler: " + (this.barn.barnUpgrades.specializationLevel * (breedingGroundsModifierPair.value * 100)) + "%\n";
      }
    }
    else if (this.barn.barnUpgrades.specialization === BarnSpecializationEnum.Attraction) {
      var popoverSpecializationText = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.Attraction, this.barn.barnUpgrades.specializationLevel);
      popover += popoverSpecializationText;
    }
    else if (this.barn.barnUpgrades.specialization === BarnSpecializationEnum.ResearchCenter) {
      var popoverSpecializationText = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.ResearchCenter, this.barn.barnUpgrades.specializationLevel);
      popover += popoverSpecializationText;
    }


    if (this.barn.barnUpgrades.upgradedStatGain.adaptability > 1)
      popover += "Adaptability Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.adaptability.toFixed(1) + "\n";
    if (this.barn.barnUpgrades.upgradedStatGain.focus > 1)
      popover += "Focus Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.focus.toFixed(1) + "\n";
    if (this.barn.barnUpgrades.upgradedStatGain.power > 1)
      popover += "Power Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.power.toFixed(1) + "\n";
    if (this.barn.barnUpgrades.upgradedStatGain.endurance > 1)
      popover += "Endurance Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.endurance.toFixed(1) + "\n";
    if (this.barn.barnUpgrades.upgradedStatGain.acceleration > 1)
      popover += "Acceleration Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.acceleration.toFixed(1) + "\n";
    if (this.barn.barnUpgrades.upgradedStatGain.topSpeed > 1)
      popover += "Top Speed Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.topSpeed.toFixed(1) + "\n";

    return popover;
  }

  getUpgradeBarnPopover() {
    var popover = "Cost: \n";

    var requiredResources = this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel);

    requiredResources.forEach(resource => {
      popover += resource.amount + " " + resource.name + "\n";
    });

    return popover;
  }

  filterSpecialization(specialization: string) {
    this.selectedSpecialization = specialization;
    this.specializationDescription = this.lookupService.getSpecializationDescription(specialization);
    this.inDepthSpecializationDescription = this.lookupService.getInDepthSpecializationDescription(specialization);
  }

  selectSpecialization() {
    var requiredResources = this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel);
    requiredResources.forEach(resource => {
      this.lookupService.spendResourceByName(resource.name, resource.amount);
    });

    this.barn.barnUpgrades.specialization = this.lookupService.convertSpecializationNameToEnum(this.selectedSpecialization);
    this.barn.barnUpgrades.specializationLevel += 1;

    this.barn.barnUpgrades.barnLevel += 1;
    if (this.barn.barnUpgrades.specialization === BarnSpecializationEnum.TrainingFacility) {
      this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
    }
    this.totalBarnStatsPopover = this.getTotalBarnStatsPopover();
    this.upgradeBarnPopover = this.getUpgradeBarnPopover();

    this.modalService.dismissAll();
  }

  goToAnimal() {
    this.componentCommunicationService.setAnimalView(NavigationEnum.animals, this.associatedAnimal);
  }
}
