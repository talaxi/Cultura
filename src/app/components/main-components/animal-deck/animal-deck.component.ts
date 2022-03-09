import { Component, OnInit } from '@angular/core';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-animal-deck',
  templateUrl: './animal-deck.component.html',
  styleUrls: ['./animal-deck.component.css']
})
export class AnimalDeckComponent implements OnInit {
  deck: AnimalDeck;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (primaryDeck !== undefined && primaryDeck !== null)
      this.deck = primaryDeck;
  }

}
