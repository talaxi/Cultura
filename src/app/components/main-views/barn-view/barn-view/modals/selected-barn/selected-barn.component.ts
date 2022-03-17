import { Component, HostListener, Input, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { Barn } from 'src/app/models/barns/barn.model';
import { FacilitySizeEnum } from 'src/app/models/facility-size-enum.model';
import { TrainingOption } from 'src/app/models/training/training-option.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-selected-barn',
  templateUrl: './selected-barn.component.html',
  styleUrls: ['./selected-barn.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SelectedBarnComponent implements OnInit {
  @Input() selectedBarnNumber: number;
  @Output() returnToBarnEmitter = new EventEmitter<number>();

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

  filterSpeed = false;
  filterAcceleration = false;
  filterEndurance = false;
  filterPower = false;
  filterFocus = false;
  filterAdaptability = false;
  filterSmall = false;
  filterMedium = false;
  filterLarge = false;


  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService) {
  }

  ngOnInit(): void {
    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        this.barn = globalBarn;
        this.getSizeValue();

        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.animalAssigned = true;
          this.associatedAnimal = associatedAnimal;
          this.associatedAnimalName = associatedAnimal.name;
          this.existingTraining = associatedAnimal.currentTraining;

          this.availableTrainings = this.GetAvailableTrainingOptions(associatedAnimal);          
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

    if (animal.currentTraining !== null && animal.currentTraining !== undefined)
      animal.currentTraining.timeTrained = 0;

    var newTraining = Object.assign({}, training);
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
      item.trainingCourseType === associatedAnimal.raceCourseType);

    if (this.filterAcceleration || this.filterAdaptability || this.filterEndurance || this.filterFocus || this.filterPower
      || this.filterSpeed || this.filterSmall || this.filterMedium || this.filterLarge) {
      trainingOptions = trainingOptions.filter(item => (((!this.filterAcceleration && !this.filterAdaptability && !this.filterFocus &&
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

    return trainingOptions;
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

  purchaseBarn(): void {
    var moneyAmount = this.lookupService.getMoney();

    if (moneyAmount >= this.barn.purchasePrice) {
      this.barn.isLocked = false;
      this.lookupService.spendMoney(this.barn.purchasePrice);
    }
  }

  getSizeValue() {
    this.sizeValue = this.barn.getSize();
  }

  upgradeBarn(): void {
    console.log("Upgrade Barn");
    var moneyAmount = this.lookupService.getMoney();

    if (moneyAmount >= this.barn.facilityUpgradePrice) {      
      if (this.barn.size === FacilitySizeEnum.Small)
        this.barn.size = FacilitySizeEnum.Medium;
      else if (this.barn.size === FacilitySizeEnum.Medium)
        this.barn.size = FacilitySizeEnum.Large;

      this.getSizeValue();
      console.log ("Upgraded to " + this.sizeValue);
      this.lookupService.spendMoney(this.barn.facilityUpgradePrice);
    }
  }
}
