import { Component, Input, OnInit, HostListener, EventEmitter, Output } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Barn } from 'src/app/models/barns/barn.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-barn',
  templateUrl: './barn.component.html',
  styleUrls: ['./barn.component.css']
})
export class BarnComponent implements OnInit {
  @Input() barnNumber: number;
  barn: Barn;
  associatedAnimalName: string;
  associatedAnimalType: string;
  isLocked: boolean;
  isOccupied: boolean; 

  @Output() selectedBarn = new EventEmitter<number>();
  trainingProgressBarPercent: number;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService) { }

  ngOnInit(): void {
    if (this.barnNumber > 0 && this.barnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.barnNumber);

      if (globalBarn !== undefined) {
        this.barn = globalBarn;

        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.barnNumber);
        
        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.isOccupied = true;
          this.associatedAnimalName = associatedAnimal.name;
          this.associatedAnimalType = AnimalTypeEnum[associatedAnimal.type];
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
      this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.barnNumber);
        if (associatedAnimal === undefined || associatedAnimal === null) {
          //any game loop logic needed for an empty barn
        }
        else {
          //UI updates          
          if (associatedAnimal.currentTraining === undefined || associatedAnimal.currentTraining === null)
            return;

          this.trainingProgressBarPercent = ((associatedAnimal.currentTraining.timeTrained / associatedAnimal.currentTraining.timeToComplete) * 100);
        }
      });
    }
  }

  @HostListener("click") onClick() {
    this.selectedBarn.emit(this.barnNumber);
  }  
}
