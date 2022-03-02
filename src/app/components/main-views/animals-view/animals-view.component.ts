import { Component, OnInit } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
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

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);    
  }

  selectedAnimal($event: Animal): void {
    this.animalSelected = true;
    this.animal = $event;
  }

  returnToAnimalView($event: boolean)
  {    
    this.animalSelected = false;   
  }
}
