import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { BarnSpecializationEnum } from 'src/app/models/barn-specialization-enum.model';
import { Barn } from 'src/app/models/barns/barn.model';
import { FacilitySizeEnum } from 'src/app/models/facility-size-enum.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { TalentTreeTypeEnum } from 'src/app/models/talent-tree-type-enum.model';
import { TrainingOptionsEnum } from 'src/app/models/training-options-enum.model';
import { TrainingOption } from 'src/app/models/training/training-option.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { SpecializationService } from 'src/app/services/specialization.service';
import { TutorialService } from 'src/app/services/tutorial-service.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
//import * as cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-selected-barn',
  templateUrl: './selected-barn.component.html',
  styleUrls: ['./selected-barn.component.css']
})
export class SelectedBarnComponent implements OnInit {
  @Input() selectedBarnNumber: number;
  @Output() returnToBarnEmitter = new EventEmitter<number>();
  @Output() isCoachingEmitter = new EventEmitter<boolean>();
  @ViewChild('specializationModal', { static: true }) specializationModal: ElementRef;

  barn: Barn;
  barnName: string;
  animalAssigned: boolean;
  associatedAnimal: Animal;
  associatedAnimalName: string;
  existingTraining: TrainingOption | null;
  trainingProgressBarPercent: number;
  availableTrainings: TrainingOption[];
  availableAnimals: Animal[];
  canUpgrade = false;
  canBuild = false;
  sizeValue: string;
  totalBarnStatsPopover: string;
  upgradeBarnPopover: string;
  buildBiggerBarnPopover: string;
  upgradeText: string;
  specializationOptions: string[];
  selectedSpecialization: string;
  specializationDescription: string;
  inDepthSpecializationDescription: string;
  barnSpecializationsUnlocked = false;
  coachingUnlocked = false;
  tutorialActive = false;
  tutorialSubscription: any;
  subscription: any;
  colorConditional: any;
  currentTrainingPopover: string;
  postResetBarnUpgradeLevel = 0;

  filterSpeed = false;
  filterAcceleration = false;
  filterEndurance = false;
  filterPower = false;
  filterFocus = false;
  filterAdaptability = false;
  filterSmall = false;
  filterMedium = false;
  filterLarge = false;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    var availableBarns = this.lookupService.getAvailableBarns().filter(item => item !== undefined);
    var indexOfCurrentBarn = availableBarns.findIndex(item => this.selectedBarnNumber === item!.barnNumber);

    if (event.key === "ArrowLeft") {
      if (indexOfCurrentBarn > -1) {
        if (this.subscription !== undefined && this.subscription !== null)
          this.subscription.unsubscribe();

        var indexOfNewBarn = indexOfCurrentBarn - 1;
        if (indexOfNewBarn < 0)
          indexOfNewBarn = availableBarns.length - 1;

        var newBarn = availableBarns[indexOfNewBarn]!;
        this.componentCommunicationService.setBarnView(NavigationEnum.barn, newBarn.barnNumber);
        this.resetSelectedBarnInfo(newBarn);
      }
    }
    else if (event.key === "ArrowRight") {
      if (indexOfCurrentBarn > -1) {
        if (this.subscription !== undefined && this.subscription !== null)
          this.subscription.unsubscribe();

        var indexOfNewBarn = indexOfCurrentBarn + 1;
        if (indexOfNewBarn === availableBarns.length)
          indexOfNewBarn = 0;

        var newBarn = availableBarns[indexOfNewBarn]!;
        this.componentCommunicationService.setBarnView(NavigationEnum.barn, newBarn.barnNumber);
        this.resetSelectedBarnInfo(newBarn);
      }
    }
  }

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private modalService: NgbModal,
    private lookupService: LookupService, private componentCommunicationService: ComponentCommunicationService,
    private specializationService: SpecializationService, private tutorialService: TutorialService, private utilityService: UtilityService) {
  }

  ngOnInit(): void {
    this.handleTutorial();

    /*this.tutorialSubscription = this.gameLoopService.gameUpdateEvent.subscribe(async () => {
      if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId > 3) {        
        this.handleSecondaryTutorial();
      }
    });*/

    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== null && globalBarn !== undefined)
        this.resetSelectedBarnInfo(globalBarn);
    }
  }

  selectNewTraining(training: TrainingOption): void {
    var animal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber === this.selectedBarnNumber);
    if (animal === undefined || animal === null)
      return;

    var newTraining = Object.assign({}, training);

    var modifierName = "smallBarnTrainingTimeModifier";
    if (this.barn.size === FacilitySizeEnum.Medium)
      modifierName = "mediumBarnTrainingTimeModifier";
    else if (this.barn.size === FacilitySizeEnum.Large)
      modifierName = "largeBarnTrainingTimeModifier";

    //console.log("Mod Name: " + modifierName);
    var trainingTimeModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === modifierName);
    //console.log("Pair: ");
    //console.log(trainingTimeModifierPair);
    if (trainingTimeModifierPair !== null && trainingTimeModifierPair !== undefined) {
      newTraining.trainingTimeRemaining = trainingTimeModifierPair.value;
    }

    if (animal.currentTraining !== null && animal.currentTraining !== undefined) {
      if (this.globalService.globalVar.settings.get("finishTrainingBeforeSwitching")) {
        animal.queuedTraining = newTraining;
        return;
      }

      animal.currentTraining.timeTrained = 0;
    }

    animal.currentTraining = newTraining;
    this.existingTraining = newTraining;

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 2) {
      this.tutorialActive = false;
      this.globalService.globalVar.tutorials.currentTutorialId += 1;
      this.globalService.globalVar.tutorials.showTutorial = true;
      this.componentCommunicationService.setAnimalView(NavigationEnum.animals, this.associatedAnimal);
    }

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 8) {
      this.tutorialActive = false;
      this.globalService.globalVar.tutorials.currentTutorialId += 1;
    }
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

      modifiedOption.timeToComplete *= 1 - (stopwatch * .05 + trainingTimeReduction + (associatedAnimal.miscStats.trainingTimeReduction / 100));
      modifiedOption.timeToComplete = Math.round((modifiedOption.timeToComplete + Number.EPSILON) * 100) / 100;

      if (associatedAnimal.raceCourseType === RaceCourseTypeEnum.Mountain) {
        if (modifiedOption.trainingType === TrainingOptionsEnum.ShortTrackRunning)
          modifiedOption.trainingName = "Short Track Climbing";
        if (modifiedOption.trainingType === TrainingOptionsEnum.TrailRunning)
          modifiedOption.trainingName = "Trail Climbing";
        if (modifiedOption.trainingType === TrainingOptionsEnum.LongTrackRunning)
          modifiedOption.trainingName = "Long Track Climbing";
      }
      if (associatedAnimal.raceCourseType === RaceCourseTypeEnum.Ocean) {
        if (modifiedOption.trainingType === TrainingOptionsEnum.ShortTrackRunning)
          modifiedOption.trainingName = "Short Track Swimming";
        if (modifiedOption.trainingType === TrainingOptionsEnum.TrailRunning)
          modifiedOption.trainingName = "Lane Swimming";
        if (modifiedOption.trainingType === TrainingOptionsEnum.SmallWagonTow)
          modifiedOption.trainingName = "Small Canoe Tow";
        if (modifiedOption.trainingType === TrainingOptionsEnum.UphillRun)
          modifiedOption.trainingName = "Upstream Swim";
        if (modifiedOption.trainingType === TrainingOptionsEnum.LongTrackRunning)
          modifiedOption.trainingName = "Long Track Swimming";
        if (modifiedOption.trainingType === TrainingOptionsEnum.VehicleTow)
          modifiedOption.trainingName = "Boat Tow";
        if (modifiedOption.trainingType === TrainingOptionsEnum.GreenwayHike)
          modifiedOption.trainingName = "Canal Adventure";
      }

      modifiedOption.affectedStatRatios.topSpeed *= this.barn.barnUpgrades.upgradedStatGain.topSpeed;
      modifiedOption.affectedStatRatios.acceleration *= this.barn.barnUpgrades.upgradedStatGain.acceleration;
      modifiedOption.affectedStatRatios.endurance *= this.barn.barnUpgrades.upgradedStatGain.endurance;
      modifiedOption.affectedStatRatios.power *= this.barn.barnUpgrades.upgradedStatGain.power;
      modifiedOption.affectedStatRatios.focus *= this.barn.barnUpgrades.upgradedStatGain.focus;
      modifiedOption.affectedStatRatios.adaptability *= this.barn.barnUpgrades.upgradedStatGain.adaptability;

      var topSpeedTalentModifier = 1;
      var accelerationTalentModifier = 1;
      var enduranceTalentModifier = 1;
      var powerTalentModifier = 1;
      var focusTalentModifier = 1;
      var adaptabilityTalentModifier = 1;

      if (associatedAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.sprint) {
        adaptabilityTalentModifier = 1 + (associatedAnimal.talentTree.column1Row1Points / 100);
        accelerationTalentModifier = 1 + (associatedAnimal.talentTree.column2Row1Points / 100);
        powerTalentModifier = 1 + (associatedAnimal.talentTree.column3Row1Points / 100);
      }
      if (associatedAnimal.talentTree.talentTreeType === TalentTreeTypeEnum.longDistance) {
        focusTalentModifier = 1 + (associatedAnimal.talentTree.column1Row1Points / 100);
        topSpeedTalentModifier = 1 + (associatedAnimal.talentTree.column2Row1Points / 100);
        enduranceTalentModifier = 1 + (associatedAnimal.talentTree.column3Row1Points / 100);
      }

      modifiedOption.affectedStatRatios.topSpeed *= topSpeedTalentModifier;
      modifiedOption.affectedStatRatios.acceleration *= accelerationTalentModifier;
      modifiedOption.affectedStatRatios.endurance *= enduranceTalentModifier;
      modifiedOption.affectedStatRatios.power *= powerTalentModifier;
      modifiedOption.affectedStatRatios.focus *= focusTalentModifier;
      modifiedOption.affectedStatRatios.adaptability *= adaptabilityTalentModifier;

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

    var selectedTraining = modifiedTrainingOptions.find(item => this.existingTraining?.trainingName === item.trainingName);
    if (selectedTraining !== null && selectedTraining !== undefined && this.animalAssigned)
      selectedTraining.isSelected = true;

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

    this.existingTraining = null;
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

      this.colorConditional = {
        'flatlandColor': this.associatedAnimal.getRaceCourseType() === 'Flatland',
        'mountainColor': this.associatedAnimal.getRaceCourseType() === 'Mountain',
        'waterColor': this.associatedAnimal.getRaceCourseType() === 'Ocean',
        'tundraColor': this.associatedAnimal.getRaceCourseType() === 'Tundra',
        'volcanicColor': this.associatedAnimal.getRaceCourseType() === 'Volcanic'
      };
    }

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 7 &&
      this.associatedAnimal.type === AnimalTypeEnum.Monkey) {
      this.globalService.globalVar.tutorials.currentTutorialId += 1;
      this.globalService.globalVar.tutorials.showTutorial = true;
      this.tutorialActive = true;
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

  canPurchaseBarn() {
    if (this.lookupService.getCoins() >= this.barn.purchasePrice)
      return true;
    else
      return false;
  }

  getSizeValue() {
    this.sizeValue = this.barn.getSize();
  }

  upgradeBarnSize(): void {
    var CoinsAmount = this.lookupService.getCoins();

    if (CoinsAmount >= this.barn.facilityUpgradePrice) {
      this.lookupService.spendCoins(this.barn.facilityUpgradePrice);

      if (this.barn.size === FacilitySizeEnum.Small) {
        this.barn.size = FacilitySizeEnum.Medium;
        this.barn.facilityUpgradePrice = 4000;
        var trainingShop = this.globalService.globalVar.shop.find(item => item.name === "Trainings");
        if (trainingShop !== null && trainingShop !== undefined) {
          trainingShop.itemList.filter(item => item.additionalIdentifier === FacilitySizeEnum.Medium.toString()).forEach(item => {
            item.isAvailable = true;
          });
        }
      }
      else if (this.barn.size === FacilitySizeEnum.Medium) {
        this.barn.size = FacilitySizeEnum.Large;

        var trainingShop = this.globalService.globalVar.shop.find(item => item.name === "Trainings");
        if (trainingShop !== null && trainingShop !== undefined) {
          trainingShop.itemList.filter(item => item.additionalIdentifier === FacilitySizeEnum.Large.toString()).forEach(item => {
            item.isAvailable = true;
          });
        }
      }

      this.getSizeValue();
      this.canUpgrade = this.canUpgradeBarn(this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel));
      this.canBuild = this.canBuildLargerBarn();
      this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
      this.buildBiggerBarnPopover = this.getBuildLargerBarnPopover();
    }
  }

  upgradeBarn(): void {
    var requiredResources = this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel);
    var canBuy = this.canUpgradeBarn(requiredResources);

    if (!canBuy) {
      alert("You don't have the required resources to upgrade your barn.");
      return;
    }

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

      this.totalBarnStatsPopover = this.getTotalBarnStatsPopover(true);
      this.upgradeBarnPopover = this.getUpgradeBarnPopover();
    }

    this.upgradeText = "Upgrade";
    if (this.barn.barnUpgrades.barnLevel === 9)
      this.upgradeText = "Specialize";

    this.canUpgrade = this.canUpgradeBarn(this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel));
    this.canBuild = this.canBuildLargerBarn();
    this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
  }

  canUpgradeBarn(requiredResources: ResourceValue[]): boolean {
    var canUpgrade = true;
    requiredResources.forEach(resource => {
      if (this.lookupService.getResourceByName(resource.name) < resource.amount)
        canUpgrade = false;
    });

    return canUpgrade;
  }

  canBuildLargerBarn(): boolean {
    var canUpgrade = false;
    var CoinsAmount = this.lookupService.getCoins();

    if (CoinsAmount >= this.barn.facilityUpgradePrice) {
      canUpgrade = true;
    }

    return canUpgrade;
  }

  getTotalBarnStatsPopover(showClickInfo: boolean) {
    var popover = "Upgrade to gain barn bonuses. ";

    if (this.barn.barnUpgrades.barnLevel >= 1)    
      if (showClickInfo)
      popover = "<em>Click to view full information and to change Barn specialization.</em><br/><br/>";
      else
      popover = "";

      popover += "Barn Upgrades: <br/>"

    if (this.barn.barnUpgrades.specialization === BarnSpecializationEnum.TrainingFacility) {
      var popoverSpecializationText = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.TrainingFacility, this.barn.barnUpgrades.specializationLevel);
      popover += popoverSpecializationText;
    }
    else if (this.barn.barnUpgrades.specialization === BarnSpecializationEnum.BreedingGrounds) {
      var popoverSpecializationText = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.BreedingGrounds, this.barn.barnUpgrades.specializationLevel);
      popover += popoverSpecializationText;
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
      popover += "Adaptability Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.adaptability.toFixed(1) + "<br/>";
    if (this.barn.barnUpgrades.upgradedStatGain.focus > 1)
      popover += "Focus Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.focus.toFixed(1) + "<br/>";
    if (this.barn.barnUpgrades.upgradedStatGain.power > 1)
      popover += "Power Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.power.toFixed(1) + "<br/>";
    if (this.barn.barnUpgrades.upgradedStatGain.endurance > 1)
      popover += "Endurance Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.endurance.toFixed(1) + "<br/>";
    if (this.barn.barnUpgrades.upgradedStatGain.acceleration > 1)
      popover += "Acceleration Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.acceleration.toFixed(1) + "<br/>";
    if (this.barn.barnUpgrades.upgradedStatGain.topSpeed > 1)
      popover += "Speed Multiplier: " + this.barn.barnUpgrades.upgradedStatGain.topSpeed.toFixed(1) + "<br/>";

    if (this.utilityService.getSanitizedHtml(popover) !== null)
      popover = this.utilityService.getSanitizedHtml(popover)!;

    return popover;
  }

  getUpgradeBarnPopover() {
    var popover = "Cost for next upgrade: \n";

    var requiredResources = this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel);

    requiredResources.forEach(resource => {
      var name = resource.name;
      if (name === "Medals" && resource.amount === 1)
        name = "Medal";
      popover += resource.amount + " " + name + "\n";
    });

    return popover;
  }

  getBuildLargerBarnPopover() {
    var popover = "Cost to build larger barn: \n";

    popover += this.barn.facilityUpgradePrice + " Coins \n\n";

    if (this.barn.size === FacilitySizeEnum.Small)
      popover += "You will be able to do Medium trainings and increase idle training time to 8 hours.";
    else if (this.barn.size === FacilitySizeEnum.Medium)
      popover += "You will be able to do Large trainings and increase idle training time to 12 hours.";

    return popover;
  }

  filterSpecialization(specialization: string) {
    this.selectedSpecialization = specialization;
    this.specializationDescription = this.globalService.getSpecializationDescription(specialization);
    this.inDepthSpecializationDescription = this.lookupService.getInDepthSpecializationDescription(specialization);
  }

  selectSpecialization() {
    if (this.selectedSpecialization === "" || this.selectedSpecialization === null || this.selectedSpecialization === undefined) {
      alert("You must select a specialization.");
      return;
    }

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
    this.totalBarnStatsPopover = this.getTotalBarnStatsPopover(true);
    this.upgradeBarnPopover = this.getUpgradeBarnPopover();
    this.canUpgrade = this.canUpgradeBarn(this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel));
    this.canBuild = this.canBuildLargerBarn();

    this.upgradeText = "Upgrade";
    if (this.barn.barnUpgrades.barnLevel === 9)
      this.upgradeText = "Specialize";

    this.barnName = this.lookupService.getBarnName(this.barn);
    this.selectedSpecialization = "";
    this.specializationDescription = "";
    this.inDepthSpecializationDescription = "";

    this.modalService.dismissAll();
  }

  resetSpecialization() {
    if (this.selectedSpecialization === "" || this.selectedSpecialization === null || this.selectedSpecialization === undefined) {
      alert("You must select a specialization.");
      return;
    }

    this.barn.barnUpgrades.barnLevel = Math.round(this.barn.barnUpgrades.barnLevel * .8);

    if (this.barn.barnUpgrades.barnLevel < 10) {
      this.barn.barnUpgrades.specialization = BarnSpecializationEnum.None;
    }
    else {
      this.barn.barnUpgrades.specialization = this.lookupService.convertSpecializationNameToEnum(this.selectedSpecialization);
    }

    this.barn.barnUpgrades.specializationLevel = 0;

    this.upgradeText = "Upgrade";
    if (this.barn.barnUpgrades.barnLevel === 9)
      this.upgradeText = "Specialize";

    this.barnName = this.lookupService.getBarnName(this.barn);
    this.selectedSpecialization = "";
    this.specializationDescription = "";
    this.inDepthSpecializationDescription = "";

    //recalculate stat gain
    var defaultStatGain = .1;
    this.barn.barnUpgrades.upgradedStatGain = new AnimalStats(1, 1, 1, 1, 1, 1);

    for (var i = 1; i <= this.barn.barnUpgrades.barnLevel; i++) {
      if (i % 10 === 0) {
        this.barn.barnUpgrades.specializationLevel += 1;
      }
      else {
        var statBarnLevel = i - this.barn.barnUpgrades.specializationLevel;
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
    }

    this.availableTrainings = this.GetAvailableTrainingOptions(this.associatedAnimal);
    this.totalBarnStatsPopover = this.getTotalBarnStatsPopover(true);
    this.upgradeBarnPopover = this.getUpgradeBarnPopover();
    this.canUpgrade = this.canUpgradeBarn(this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel));
    this.canBuild = this.canBuildLargerBarn();

    this.modalService.dismissAll();
  }

  goToAnimal() {
    this.componentCommunicationService.setAnimalView(NavigationEnum.animals, this.associatedAnimal);
  }

  handleTutorial() {
    var monkey = this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey);
    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 1) {
      this.tutorialActive = true;
      this.globalService.globalVar.tutorials.currentTutorialId += 1;
      this.globalService.globalVar.tutorials.showTutorial = true;
    }
    else if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 6 &&
      monkey?.isAvailable) {
      this.globalService.globalVar.tutorials.currentTutorialId += 1;
      this.globalService.globalVar.tutorials.showTutorial = true;
    }
    else if (!this.globalService.globalVar.tutorials.tutorialCompleted) {
      this.tutorialActive = false;
    }
  }

  resetSelectedBarnInfo(newBarn: Barn) {
    this.specializationOptions = this.lookupService.getAllBarnSpecializations();
    this.upgradeText = "Upgrade";
    this.barnSpecializationsUnlocked = this.lookupService.isItemUnlocked("barnSpecializations");
    this.coachingUnlocked = this.lookupService.isItemUnlocked("coaching");
    this.selectedBarnNumber = newBarn.barnNumber;

    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        this.barn = globalBarn;
        this.barnName = this.lookupService.getBarnName(globalBarn);
        this.getSizeValue();
        this.totalBarnStatsPopover = this.getTotalBarnStatsPopover(true);
        this.upgradeBarnPopover = this.getUpgradeBarnPopover();
        this.buildBiggerBarnPopover = this.getBuildLargerBarnPopover();
        this.canUpgrade = this.canUpgradeBarn(this.lookupService.getResourcesForBarnUpgrade(this.barn.barnUpgrades.barnLevel));
        this.canBuild = this.canBuildLargerBarn();

        if (this.barn.barnUpgrades.barnLevel === 9)
          this.upgradeText = "Specialize";

        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.animalAssigned = true;
          this.associatedAnimal = associatedAnimal;
          this.associatedAnimalName = associatedAnimal.name;
          this.existingTraining = associatedAnimal.currentTraining;
          this.colorConditional = {
            'flatlandColor': this.associatedAnimal.getRaceCourseType() === 'Flatland',
            'mountainColor': this.associatedAnimal.getRaceCourseType() === 'Mountain',
            'waterColor': this.associatedAnimal.getRaceCourseType() === 'Ocean',
            'tundraColor': this.associatedAnimal.getRaceCourseType() === 'Tundra',
            'volcanicColor': this.associatedAnimal.getRaceCourseType() === 'Volcanic'
          };

          this.availableTrainings = this.GetAvailableTrainingOptions(associatedAnimal);
          this.currentTrainingPopover = this.getCurrentTrainingPopover(associatedAnimal);

          if (this.existingTraining !== undefined && this.existingTraining !== null) {
            var selectedTraining = this.availableTrainings.find(item => this.existingTraining?.trainingName === item.trainingName);
            if (selectedTraining !== null && selectedTraining !== undefined)
              selectedTraining.isSelected = true;
          }
        }
        else {
          this.animalAssigned = false;
          this.availableAnimals = this.GetAvailableAnimalOptions();
        }

        this.componentCommunicationService.setBarnView(NavigationEnum.barn, this.selectedBarnNumber);

        this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {          
          if (!this.barn.isLocked) {
            var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);
            if (associatedAnimal === undefined || associatedAnimal === null) {
              //any game loop logic needed for an empty barn
            }
            else {
              //UI updates          
              if (associatedAnimal.currentTraining === undefined || associatedAnimal.currentTraining === null) {
                if (this.existingTraining !== null) {
                  var selectedTraining = this.availableTrainings.find(item => this.existingTraining?.trainingName === item.trainingName);
                  if (selectedTraining !== null && selectedTraining !== undefined)
                    selectedTraining.isSelected = false;

                  this.existingTraining = null;
                }
                return;
              }
              if (associatedAnimal.currentTraining !== this.existingTraining)
                this.existingTraining = associatedAnimal.currentTraining;

              if (this.trainingProgressBarPercent >= 100) {
                this.trainingProgressBarPercent = 100;
              }

              this.trainingProgressBarPercent = ((associatedAnimal.currentTraining.timeTrained / associatedAnimal.currentTraining.timeToComplete) * 100);
              this.currentTrainingPopover = this.getCurrentTrainingPopover(associatedAnimal);
            }
          }
        });
      }

    }
    else {
      alert("You've run into an error! Please try again. If you have the time, please export your data under the Settings tab and send me the data and any relevant info at CulturaIdle@gmail.com. Thank you!");
    }
  }

  getCurrentTrainingPopover(animal: Animal) {
    var popover = "";

    if (animal.currentTraining !== undefined && animal.currentTraining !== null) {
      popover += animal.currentTraining.trainingName + "\n" + this.lookupService.getStatGainDescription(animal.currentTraining.affectedStatRatios, animal.currentTraining.statGain) + "\n";
    }

    popover += animal.name + " Current Stats:" + "\n";
    popover += "Speed: " + Math.round(animal.currentStats.topSpeed).toLocaleString() + "\n";
    popover += "Acceleration: " + Math.round(animal.currentStats.acceleration).toLocaleString() + "\n";
    popover += "Endurance: " + Math.round(animal.currentStats.endurance).toLocaleString() + "\n";
    popover += "Power: " + Math.round(animal.currentStats.power).toLocaleString() + "\n";
    popover += "Focus: " + Math.round(animal.currentStats.focus).toLocaleString() + "\n";
    popover += "Adaptability: " + Math.round(animal.currentStats.adaptability).toLocaleString() + "\n";
    popover += "Diminishing Returns: " + this.globalService.GetAnimalDiminishingReturns(animal);

    var sanitized = this.utilityService.getSanitizedHtml(popover);
    if (sanitized !== null)
      popover = sanitized;

    return popover;
  }

  goToCoaching() {
    this.isCoachingEmitter.emit(true);
  }

  openBarnUpgradeModal(content: any) {
    this.specializationOptions = this.lookupService.getAllBarnSpecializations();
    this.totalBarnStatsPopover = this.getTotalBarnStatsPopover(false);

    if (this.barn.barnUpgrades.specialization !== BarnSpecializationEnum.None) {
      var currentSpecializationName = this.lookupService.convertSpecializationEnumToName(this.barn.barnUpgrades.specialization);
      this.specializationOptions = this.specializationOptions.filter(item => item !== currentSpecializationName);
      this.postResetBarnUpgradeLevel = Math.round(this.barn.barnUpgrades.barnLevel * .8);
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }

    if (this.tutorialSubscription !== null && this.tutorialSubscription !== undefined) {
      this.tutorialSubscription.unsubscribe();
    }
  }
}
