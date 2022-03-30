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
    var canRace = true;
    var racingAnimals = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (racingAnimals === undefined || racingAnimals === null || racingAnimals.selectedAnimals.length === 0) {
      canRace = false;
      return;
    }

    race.raceLegs.forEach(leg => {
      if (!racingAnimals?.selectedAnimals.some(item => item.raceCourseType === leg.courseType))
        canRace = false;
    });

    if (canRace) {
      /* bubble back up to race selection with the chosen race, over there show the race occur */
      this.raceSelected.emit(race);
    }
  }
}
