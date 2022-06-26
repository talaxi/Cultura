import { Component, OnInit } from '@angular/core';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { Race } from 'src/app/models/races/race.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
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
  existingPrimaryDeckAnimals: Animal[];

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);
    this.componentCommunicationService.setNewView(NavigationEnum.trainingtrack);
    var existingPrimaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (existingPrimaryDeck !== null && existingPrimaryDeck !== undefined) {
      this.existingPrimaryDeckAnimals = [];
      existingPrimaryDeck.selectedAnimals.forEach(animal => {
        this.existingPrimaryDeckAnimals.push(animal);
      });
    }
  }

  selectedAnimal($event: Animal): void {
    this.animalSelected = true;
    this.animal = $event;
  }

  returnToAnimalView() {
    this.animalSelected = false;
  }

  raceSelected(race: Race) {
    this.selectedRace = race;
    this.showRace = true;
  }

  raceFinished() {
    this.showRace = false;

    var existingDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
  
    if (existingDeck !== undefined && existingDeck !== null)
      existingDeck.selectedAnimals = this.existingPrimaryDeckAnimals;  
  }
}
