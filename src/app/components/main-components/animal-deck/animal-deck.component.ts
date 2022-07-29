import { Component, Input, OnInit } from '@angular/core';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-animal-deck',
  templateUrl: './animal-deck.component.html',
  styleUrls: ['./animal-deck.component.css']
})
export class AnimalDeckComponent implements OnInit {
  deck: AnimalDeck;
  @Input() deckNumber: number;

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    if (this.deckNumber === 0 || this.deckNumber === undefined || this.deckNumber === null) {
      var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (primaryDeck !== undefined && primaryDeck !== null)
        this.deck = primaryDeck;
    }
    else {
      var selectedDeck = this.globalService.globalVar.animalDecks.find(item => item.deckNumber === this.deckNumber);
      if (selectedDeck !== undefined && selectedDeck !== null)
        this.deck = selectedDeck;
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
    this.componentCommunicationService.setNewView(NavigationEnum.relayTeams);
  }
}
