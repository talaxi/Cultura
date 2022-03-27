import { Component, OnInit } from '@angular/core';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-decks-view',
  templateUrl: './decks-view.component.html',
  styleUrls: ['./decks-view.component.css']
})
export class DecksViewComponent implements OnInit {
  animalDecks: AnimalDeck[];

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.animalDecks = this.globalService.globalVar.animalDecks;

    
  }

}
