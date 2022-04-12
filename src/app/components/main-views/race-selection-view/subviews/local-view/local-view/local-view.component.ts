import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-local-view',
  templateUrl: './local-view.component.html',
  styleUrls: ['./local-view.component.css']
})
export class LocalViewComponent implements OnInit {
  availableLocalRaces: Race[];
  availableMonoRace: Race;
  areMonoRacesAvailable: boolean;
  areDuoRacesAvailable: boolean;
  areRainbowRacesAvailable: boolean;
  @Output() raceSelected = new EventEmitter<Race>();

  constructor(private globalService: GlobalService, private utilityService: UtilityService) { }

  ngOnInit(): void {
    var uncompletedMonoRaces = this.globalService.globalVar.localRaces.filter(item => item.localRaceType === LocalRaceTypeEnum.Mono && !item.isCompleted).sort();
    if (uncompletedMonoRaces !== undefined && uncompletedMonoRaces !== null && uncompletedMonoRaces.length > 0)
    {
      if (this.utilityService.getNumericValueOfCircuitRank(uncompletedMonoRaces[0].requiredRank) <= 
      this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank))
        this.availableMonoRace = uncompletedMonoRaces[0];
    }
  }

  sortByRankRequired(a: Race, b: Race): number {
    if (a.requiredRank > b.requiredRank)
      return 1;
    else if (b.requiredRank > a.requiredRank)
      return -1;
    else
      return 0;
  }

  selectLocalRace(race: Race) {    
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
