import { Component, OnInit } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-incubator-view',
  templateUrl: './incubator-view.component.html',
  styleUrls: ['./incubator-view.component.css']
})
export class IncubatorViewComponent implements OnInit {

  availableAnimals: Animal[];
  animalSelected = false;
  animal: Animal;
  researchLevel: number;

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);
    this.researchLevel = this.lookupService.getResearchLevel();

    var incubator = this.globalService.globalVar.incubator;
    if (incubator.assignedAnimal !== null && incubator.assignedAnimal !== undefined)
    {
      this.animalSelected = true;
      this.animal = incubator.assignedAnimal;
    }
  }

  selectedAnimal($event: Animal): void {
    this.animalSelected = true;
    this.animal = $event;
  }

  returnToAnimalView($event: boolean) {
    this.animalSelected = false;
  }
  
}
