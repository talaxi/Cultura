import { Component, OnInit } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-animals-view',
  templateUrl: './animals-view.component.html',
  styleUrls: ['./animals-view.component.css']
})
export class AnimalsViewComponent implements OnInit {
  availableAnimals: Animal[];
  animalSelected = false;
  animal: Animal;
  subscription: any;

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.animals);
    this.availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);

    this.subscription = this.componentCommunicationService.getAnimalView().subscribe((value) => {
      if (value.type !== undefined && value.type !== null) {
        this.animalSelected = true;
        this.animal = value;
      }
      else
        this.animalSelected = false;
    });
  }

  selectedAnimal($event: Animal): void {
    this.animalSelected = true;
    this.animal = $event;
    this.componentCommunicationService.setAnimalView(NavigationEnum.animals, this.animal);
  }

  returnToAnimalView($event: boolean) {
    this.animalSelected = false;
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
