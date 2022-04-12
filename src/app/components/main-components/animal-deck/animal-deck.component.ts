import { Component, Input, OnInit } from '@angular/core';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-animal-deck',
  templateUrl: './animal-deck.component.html',
  styleUrls: ['./animal-deck.component.css']
})
export class AnimalDeckComponent implements OnInit {
  deck: AnimalDeck;
  @Input() deckNumber: number;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    if (this.deckNumber === 0 || this.deckNumber === undefined || this.deckNumber === null) {
      var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (primaryDeck !== undefined && primaryDeck !== null)
        this.deck = primaryDeck;
    }
    else
    {
      var selectedDeck = this.globalService.globalVar.animalDecks.find(item => item.deckNumber === this.deckNumber);
      if (selectedDeck !== undefined && selectedDeck !== null)
        this.deck = selectedDeck;
    }
  }

  getColorClass(animal: Animal) {
    var colorConditional = {
      'flatlandColor': animal.getRaceCourseType() === 'Flatland',
      'mountainColor': animal.getRaceCourseType() === 'Mountain',
       'waterColor': animal.getRaceCourseType() === 'Water'
    };
    return colorConditional;    
  }
}
