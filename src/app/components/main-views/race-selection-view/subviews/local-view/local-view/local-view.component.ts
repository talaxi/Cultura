import { Component, OnInit } from '@angular/core';
import { Race } from 'src/app/models/races/race.model';

@Component({
  selector: 'app-local-view',
  templateUrl: './local-view.component.html',
  styleUrls: ['./local-view.component.css']
})
export class LocalViewComponent implements OnInit {
  availableLocalRaces: Race[];

  constructor() { }

  ngOnInit(): void {
  }

  selectLocalRace(race: Race) {

  }
}
