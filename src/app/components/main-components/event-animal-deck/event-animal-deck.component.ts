import { Component, OnInit } from '@angular/core';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-event-animal-deck',
  templateUrl: './event-animal-deck.component.html',
  styleUrls: ['./event-animal-deck.component.css']
})
export class EventAnimalDeckComponent implements OnInit {
  deck: AnimalDeck;

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    var eventDeck = this.globalService.globalVar.animalDecks.find(item => item.isEventDeck);
    if (eventDeck !== undefined)
      this.deck = eventDeck;
  }

  getMorale(animal: Animal) {
    if (this.globalService.globalVar.eventRaceData.animalData === null || this.globalService.globalVar.eventRaceData.animalData === undefined ||
      this.globalService.globalVar.eventRaceData.animalData.length === 0)
      return;

    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return;
    
    var exhaustionLevel = associatedAnimalData.exhaustionStatReduction;

    //TODO: some sort of morale modifier?

    return exhaustionLevel;
  }

  getExhaustion(animal: Animal) {
    if (this.globalService.globalVar.eventRaceData.animalData === null || this.globalService.globalVar.eventRaceData.animalData === undefined ||
      this.globalService.globalVar.eventRaceData.animalData.length === 0)
      return;

    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return;
    
    var exhaustionLevel = associatedAnimalData.exhaustionStatReduction;

    //TODO: some sort of morale modifier?

    return exhaustionLevel;
  }

  eventHasStarted() {
    var secondsToEvent = this.globalService.getTimeToEventRace();
    if (secondsToEvent > 0)
      return false;

    return true;
  }

  chooseToStartRace(animal: Animal) {

  }

  isCurrentlyRacing(animal: Animal): boolean
  {
    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return false;
        
    return associatedAnimalData.isCurrentlyRacing;
  }

  isSetToRelay(animal: Animal): boolean
  {
    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return false;
            
    return associatedAnimalData.isSetToRelay;
  }

  relayAnimal(animal: Animal)
  {
    var animalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);

    console.log(animalData);
    if (animalData !== undefined)
    {
      this.globalService.globalVar.eventRaceData.animalData.forEach(item => {
        item.isSetToRelay = false;
      });

      animalData.isSetToRelay = true;
    }
  }

  getColorClass(animal: Animal) {
    if (animal !== null && animal !== undefined) {
      var colorConditional = {
        'flatlandColor': animal.getRaceCourseType() === 'Flatland',
        'mountainColor': animal.getRaceCourseType() === 'Mountain',
        'waterColor': animal.getRaceCourseType() === 'Ocean',
        'tundraColor': animal.getRaceCourseType() === 'Tundra',
        'volcanicColor': animal.getRaceCourseType() === 'Volcanic'
      };
      return colorConditional;
    }
    else
      return {};
  }

  goToDeckView() {
    this.componentCommunicationService.setNewView(NavigationEnum.decks);
  }
}
