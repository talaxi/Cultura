import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-circuit-view',
  templateUrl: './circuit-view.component.html',
  styleUrls: ['./circuit-view.component.css']
})
export class CircuitViewComponent implements OnInit {
  circuitRank: string;
  circuitRankUpDescription: string;
  availableCircuitRaces: Race[];
  @Output() raceSelected = new EventEmitter<Race>();

  constructor(private globalService: GlobalService, private utilityService: UtilityService) { }

  ngOnInit(): void {
    var rank = this.globalService.globalVar.circuitRank;
    if (this.globalService.globalVar.settings.get("useNumbersForCircuitRank"))
      this.circuitRank = this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank).toString();    
    else
      this.circuitRank = this.globalService.globalVar.circuitRank;

    this.circuitRankUpDescription = this.globalService.globalVar.circuitRankUpRewardDescription;
    this.availableCircuitRaces = this.globalService.globalVar.circuitRaces.filter(item => item.requiredRank === rank);
    var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);

    this.availableCircuitRaces.forEach(race => {      
      if (primaryDeck !== undefined)
        race.raceLegs = this.globalService.reorganizeLegsByDeckOrder(race.raceLegs, primaryDeck);
    });
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

    if (race.isCompleted)
      canRace = false;

    if (canRace) {
      /* bubble back up to race selection with the chosen race, over there show the race occur */
      this.raceSelected.emit(race);
    }
  }
}
