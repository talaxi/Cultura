import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnimalStatEnum } from 'src/app/models/animal-stat-enum.model';
import { AnimalTraits } from 'src/app/models/animals/animal-traits.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
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

  traitStatGainDescription = "";
  existingTrait: AnimalTraits | null;
  trainingProgressBarPercent: number;
  availableTraits: AnimalTraits[];
  subscription: any;

  filterSpeed = false;
  filterAcceleration = false;
  filterEndurance = false;
  filterPower = false;
  filterFocus = false;
  filterAdaptability = false;

  colorConditional: any;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService,
    private lookupService: LookupService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.availableTraits = this.GetAvailableTraits();

    var incubator = this.globalService.globalVar.incubator;
    if (incubator.assignedAnimal !== null && incubator.assignedAnimal !== undefined &&
      incubator.assignedTrait !== null && incubator.assignedTrait !== undefined) {
      this.existingTrait = incubator.assignedTrait;
    }

    if (this.existingTrait !== undefined && this.existingTrait !== null) {
      var selectedTraining = this.availableTraits.find(item => this.existingTrait?.traitName === item.traitName);
      if (selectedTraining !== null && selectedTraining !== undefined)
        selectedTraining.isSelected = true;
    }

    this.colorConditional = {
      'flatlandColor': this.selectedAnimal.getRaceCourseType() === 'Flatland',
      'mountainColor': this.selectedAnimal.getRaceCourseType() === 'Mountain',
      'waterColor': this.selectedAnimal.getRaceCourseType() === 'Ocean',
      'tundraColor': this.selectedAnimal.getRaceCourseType() === 'Tundra',
      'volcanicColor': this.selectedAnimal.getRaceCourseType() === 'Volcanic'
    };

    if (this.selectedAnimal.trait !== undefined && this.selectedAnimal.trait !== null)
      this.traitStatGainDescription = this.lookupService.getTraitStatGainDescription(this.selectedAnimal.trait);

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
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

    traits.push(new AnimalTraits("Smart", 5, researchLevel, AnimalStatEnum.focus, AnimalStatEnum.power));
    traits.push(new AnimalTraits("Careful", 7, researchLevel, AnimalStatEnum.adaptability, AnimalStatEnum.acceleration));
    traits.push(new AnimalTraits("Attentive", 7, researchLevel, AnimalStatEnum.power, AnimalStatEnum.endurance));
    traits.push(new AnimalTraits("Keen", 9, researchLevel, AnimalStatEnum.acceleration, AnimalStatEnum.topSpeed));
    traits.push(new AnimalTraits("Quick", 9, researchLevel, AnimalStatEnum.topSpeed, AnimalStatEnum.adaptability));
    traits.push(new AnimalTraits("Tough", 11, researchLevel, AnimalStatEnum.endurance, AnimalStatEnum.focus));

    traits.push(new AnimalTraits("Solitary", 11, researchLevel, AnimalStatEnum.focus, AnimalStatEnum.acceleration));
    traits.push(new AnimalTraits("Cautious", 13, researchLevel, AnimalStatEnum.adaptability, AnimalStatEnum.topSpeed));
    traits.push(new AnimalTraits("Wild", 13, researchLevel, AnimalStatEnum.power, AnimalStatEnum.focus));
    traits.push(new AnimalTraits("Clumsy", 15, researchLevel, AnimalStatEnum.acceleration, AnimalStatEnum.adaptability));
    traits.push(new AnimalTraits("Natural", 15, researchLevel, AnimalStatEnum.topSpeed, AnimalStatEnum.endurance));
    traits.push(new AnimalTraits("Resilient", 17, researchLevel, AnimalStatEnum.endurance, AnimalStatEnum.power));

    traits.push(new AnimalTraits("Anxious", 17, researchLevel, AnimalStatEnum.focus, AnimalStatEnum.topSpeed));
    traits.push(new AnimalTraits("Lucky", 19, researchLevel, AnimalStatEnum.adaptability, AnimalStatEnum.focus));
    traits.push(new AnimalTraits("Rugged", 19, researchLevel, AnimalStatEnum.power, AnimalStatEnum.adaptability));
    traits.push(new AnimalTraits("Naive", 21, researchLevel, AnimalStatEnum.acceleration, AnimalStatEnum.endurance));
    traits.push(new AnimalTraits("Sprightly", 21, researchLevel, AnimalStatEnum.topSpeed, AnimalStatEnum.power));
    traits.push(new AnimalTraits("Stout", 23, researchLevel, AnimalStatEnum.endurance, AnimalStatEnum.acceleration));

    traits.push(new AnimalTraits("Pensive", 23, researchLevel, AnimalStatEnum.focus, AnimalStatEnum.adaptability));
    traits.push(new AnimalTraits("Languid", 25, researchLevel, AnimalStatEnum.adaptability, AnimalStatEnum.endurance));
    traits.push(new AnimalTraits("Mighty", 25, researchLevel, AnimalStatEnum.power, AnimalStatEnum.acceleration));
    traits.push(new AnimalTraits("Nimble", 27, researchLevel, AnimalStatEnum.acceleration, AnimalStatEnum.power));
    traits.push(new AnimalTraits("Small", 27, researchLevel, AnimalStatEnum.topSpeed, AnimalStatEnum.focus));
    traits.push(new AnimalTraits("Resolute", 29, researchLevel, AnimalStatEnum.endurance, AnimalStatEnum.topSpeed));

    traits = traits.filter(item => researchLevel >= item.requiredLevel);

    traits = traits.filter(item => (!this.filterAcceleration && !this.filterAdaptability && !this.filterFocus &&
      !this.filterSpeed && !this.filterPower && !this.filterEndurance) ||
      (this.filterSpeed && item.positiveStatGain === AnimalStatEnum.topSpeed) ||
      (this.filterAcceleration && item.positiveStatGain === AnimalStatEnum.acceleration) ||
      (this.filterEndurance && item.positiveStatGain === AnimalStatEnum.endurance) ||
      (this.filterPower && item.positiveStatGain === AnimalStatEnum.power) ||
      (this.filterFocus && item.positiveStatGain === AnimalStatEnum.focus) ||
      (this.filterAdaptability && item.positiveStatGain === AnimalStatEnum.adaptability))

    return traits;
  }

  resetFilters() {
    this.filterSpeed = false;
    this.filterAcceleration = false;
    this.filterEndurance = false;
    this.filterFocus = false;
    this.filterPower = false;
    this.filterAdaptability = false;

    this.availableTraits = this.GetAvailableTraits();
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

    this.availableTraits = this.GetAvailableTraits();
  }

  returnToAnimalView(): void {
    this.returnEmitter.emit(false);
  }

  goToAnimal() {
    this.componentCommunicationService.setAnimalView(NavigationEnum.animals, this.selectedAnimal);
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
