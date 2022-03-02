import { Component, HostListener, Input, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { Barn } from 'src/app/models/barns/barn.model';
import { TrainingOption } from 'src/app/models/training/training-option.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
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
  associatedAnimalName: string;
  existingTraining: TrainingOption | null;
  trainingProgressBarPercent: number;
  availableTrainings: TrainingOption[];
  availableAnimals: Animal[];

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService) {
  }

  ngOnInit(): void {
    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        this.barn = globalBarn;

        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.animalAssigned = true;
          this.associatedAnimalName = associatedAnimal.name;
          this.existingTraining = associatedAnimal.currentTraining;

          this.availableTrainings = this.GetAvailableTrainingOptions(associatedAnimal);
        }
        else {
          this.animalAssigned = false;
          this.availableAnimals = this.GetAvailableAnimalOptions();
        }

        if (!this.barn.isLocked) {
          this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
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
          });
        }
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

    console.log(animalOptions);

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
  }

  returnToBarnView(): void {
    this.returnToBarnEmitter.emit(0);
  }
}