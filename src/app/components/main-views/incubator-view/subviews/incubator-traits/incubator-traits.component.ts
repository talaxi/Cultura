import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnimalStatEnum } from 'src/app/models/animal-stat-enum.model';
import { AnimalTraits } from 'src/app/models/animals/animal-traits.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { SpecializationService } from 'src/app/services/specialization.service';

@Component({
  selector: 'app-incubator-traits',
  templateUrl: './incubator-traits.component.html',
  styleUrls: ['./incubator-traits.component.css']
})
export class IncubatorTraitsComponent implements OnInit {
  @Input() selectedAnimal: Animal;
  @Output() returnEmitter = new EventEmitter<boolean>();

  existingTrait: AnimalTraits | null;
  trainingProgressBarPercent: number;
  availableTraits: AnimalTraits[];

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService,
    private lookupService: LookupService) { }

  ngOnInit(): void {
    this.availableTraits = this.GetAvailableTraits();      

    var incubator = this.globalService.globalVar.incubator;
    if (incubator.assignedAnimal !== null && incubator.assignedAnimal !== undefined &&
      incubator.assignedTrait !== null && incubator.assignedTrait !== undefined)
    {
      this.existingTrait = incubator.assignedTrait;      
    }

    if (this.existingTrait !== undefined && this.existingTrait !== null)
    {
      var selectedTraining = this.availableTraits.find(item => this.existingTrait?.traitName === item.traitName);
      if (selectedTraining !== null && selectedTraining !== undefined)
        selectedTraining.isSelected = true;
    }

    this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      var incubator = this.globalService.globalVar.incubator;

      //UI updates          
      if (incubator.assignedAnimal === undefined || incubator.assignedAnimal === null ||
        incubator.assignedTrait === undefined || incubator.assignedTrait === null) {
        this.existingTrait = null;
        this.availableTraits.forEach(item => {
          item.isSelected = false;
        });

        return;
      }
      
      this.trainingProgressBarPercent = ((incubator.timeTrained / incubator.timeToComplete) * 100);
    });
  }

  selectNewTrait(trait: AnimalTraits): void {
    var newTrait = Object.assign({}, trait);
    var incubator = this.globalService.globalVar.incubator;

    incubator.timeTrained = 0;
    incubator.assignedAnimal = this.selectedAnimal;
    incubator.assignedTrait = newTrait;
    this.existingTrait = newTrait;

    //cancel any trainings
    this.selectedAnimal.currentTraining = null;
    this.selectedAnimal.canTrain = false;
  }

  GetAvailableTraits(): AnimalTraits[] {
    var traits: AnimalTraits[] = [];
    var researchLevel = this.lookupService.getResearchLevel();

    traits.push(new AnimalTraits("Alert", 1, researchLevel, AnimalStatEnum.focus, AnimalStatEnum.endurance));
    traits.push(new AnimalTraits("Sharp", 1, researchLevel, AnimalStatEnum.adaptability, AnimalStatEnum.power));
    traits.push(new AnimalTraits("Bulky", 1, researchLevel, AnimalStatEnum.power, AnimalStatEnum.topSpeed));
    traits.push(new AnimalTraits("Curious", 3, researchLevel, AnimalStatEnum.acceleration, AnimalStatEnum.focus));
    traits.push(new AnimalTraits("Adamant", 3, researchLevel, AnimalStatEnum.topSpeed, AnimalStatEnum.acceleration));
    traits.push(new AnimalTraits("Stoic", 5, researchLevel, AnimalStatEnum.endurance, AnimalStatEnum.adaptability));

    traits.push(new AnimalTraits("Careful", 5, researchLevel, AnimalStatEnum.adaptability, AnimalStatEnum.acceleration));
    traits.push(new AnimalTraits("Smart", 7, researchLevel, AnimalStatEnum.focus, AnimalStatEnum.endurance));
    traits.push(new AnimalTraits("Attentive", 7, researchLevel, AnimalStatEnum.focus, AnimalStatEnum.endurance));
    traits.push(new AnimalTraits("Keen", 9, researchLevel, AnimalStatEnum.power, AnimalStatEnum.topSpeed));
    traits.push(new AnimalTraits("Quick", 9, researchLevel, AnimalStatEnum.topSpeed, AnimalStatEnum.adaptability));

    traits = traits.filter(item => researchLevel >= item.requiredLevel);
    /*
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
    
        return modifiedTrainingOptions;*/

    return traits;
  }

  returnToAnimalView(): void {
    this.returnEmitter.emit(false);
  }
}
