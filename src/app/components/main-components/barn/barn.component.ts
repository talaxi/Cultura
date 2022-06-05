import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, HostListener, EventEmitter, Output } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Barn } from 'src/app/models/barns/barn.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Animal } from 'src/app/models/animals/animal.model';

@Component({
  selector: 'app-barn',
  templateUrl: './barn.component.html',
  styleUrls: ['./barn.component.css'],  
})
export class BarnComponent implements OnInit {
  @Input() barnNumber: number;
  barn: Barn;
  barnName: string;
  associatedAnimalName: string;
  associatedAnimalType: string;
  associatedAnimal: Animal;
  isLocked: boolean;
  isOccupied: boolean;
  subscription: any;
  trainingCompleteText = "";
  showTrainingAnimation = false;
  previousTrainedAmount: number;
  readyToBreed: boolean;

  @Output() selectedBarn = new EventEmitter<number>();
  trainingProgressBarPercent: number;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService) { }

  ngOnInit(): void {
    if (this.barnNumber > 0 && this.barnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.barnNumber);

      if (globalBarn !== undefined) {
        this.barn = globalBarn;
        this.barnName = this.lookupService.getBarnName(globalBarn);

        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.barnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.isOccupied = true;
          this.associatedAnimalName = associatedAnimal.name;
          this.associatedAnimalType = AnimalTypeEnum[associatedAnimal.type];
          this.associatedAnimal = associatedAnimal;
        }
        else
          this.isOccupied = false;

        this.isLocked = globalBarn.isLocked;
      }
    }
    else {
      console.log("Can't find barn");
      //TODO: throw error, can't find barn
    }

    if (!this.isLocked) {
      this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.barnNumber);
        if (associatedAnimal === undefined || associatedAnimal === null) {
          //any game loop logic needed for an empty barn
        }
        else {
          //UI updates          
          if (associatedAnimal.currentTraining === undefined || associatedAnimal.currentTraining === null)
          {
            this.trainingProgressBarPercent = 0;
            return;
          }
          if (associatedAnimal.currentTraining.timeTrained < this.previousTrainedAmount) {            
            this.trainingCompleteText = this.lookupService.getTrainingProgressionAnimationText(associatedAnimal.currentTraining);
            this.showTrainingAnimation = true;

            setTimeout(() => {
              this.showTrainingAnimation = false;
              this.trainingCompleteText = "";
            }, 3000);
          }

          this.readyToBreed = associatedAnimal.breedGaugeXp >= associatedAnimal.breedGaugeMax;

          this.previousTrainedAmount = associatedAnimal.currentTraining.timeTrained;
          this.trainingProgressBarPercent = ((associatedAnimal.currentTraining.timeTrained / associatedAnimal.currentTraining.timeToComplete) * 100);
        }
      });
    }
  }

  ngOnDestroy() {
    this.previousTrainedAmount = 0;

    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

  @HostListener("click") onClick() {
    this.selectedBarn.emit(this.barnNumber);
  }
}
