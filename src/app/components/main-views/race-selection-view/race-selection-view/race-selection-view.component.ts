import { Component, Input, OnInit } from '@angular/core';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-race-selection-view',
  templateUrl: './race-selection-view.component.html',
  styleUrls: ['./race-selection-view.component.css']
})
export class RaceSelectionViewComponent implements OnInit {
  displayCircuitView = true;
  showRace = false;
  selectedRace: Race;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
  }

  toggleCircuitRace(toggle: boolean): void {    
    this.displayCircuitView = toggle;    
  }

  raceSelected(race: Race)
  {       
    this.selectedRace = race;    
    this.showRace = true;
  }
}
