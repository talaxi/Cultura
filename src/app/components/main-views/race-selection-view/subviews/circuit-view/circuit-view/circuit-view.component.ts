import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-circuit-view',
  templateUrl: './circuit-view.component.html',
  styleUrls: ['./circuit-view.component.css']
})
export class CircuitViewComponent implements OnInit {
  circuitRank: string;
  availableCircuitRaces: Race[];
  @Output() raceSelected = new EventEmitter<Race>();

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {    
    this.circuitRank = this.globalService.globalVar.circuitRank;
    this.availableCircuitRaces = this.globalService.globalVar.circuitRaces.filter(item => item.requiredRank === this.circuitRank);    
  }

  selectCircuitRace(race: Race): void {
    /* bubble back up to race selection with the chosen race, over there show the race occur */
    this.raceSelected.emit(race);   
  }
}
