import { Component, OnInit } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-training-track-view',
  templateUrl: './training-track-view.component.html',
  styleUrls: ['./training-track-view.component.css']
})
export class TrainingTrackViewComponent implements OnInit {
  availableAnimals: Animal[];
  animalSelected = false;
  animal: Animal;
  showRace: boolean;
  selectedRace: Race;

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);        
  }

  selectedAnimal($event: Animal): void {
    this.animalSelected = true;
    this.animal = $event;
  }

  returnToAnimalView() {
    this.animalSelected = false;
  }

  raceSelected(race: Race)
  {       
    this.selectedRace = race;    
    this.showRace = true;
  }
}
