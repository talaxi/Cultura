import { Component, Input, OnInit } from '@angular/core';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-race-description',
  templateUrl: './race-description.component.html',
  styleUrls: ['./race-description.component.css']
})
export class RaceDescriptionComponent implements OnInit {
  @Input() index: number;
  @Input() race: Race;
  @Input() showStartText: boolean;
  cannotRace: boolean;
  popoverText: string;
  missingRacers: RaceCourseTypeEnum[] = [];

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.cannotRace = false;

    var selectedDeck = this.lookupService.getPrimaryDeck();
    this.race.raceLegs.forEach(leg => {
      if (selectedDeck === undefined || selectedDeck === null || selectedDeck.selectedAnimals.length === 0) {
        this.cannotRace = true;
        this.missingRacers.push(leg.courseType);
      }
      else {
        if (!selectedDeck?.selectedAnimals.some(item => item.raceCourseType === leg.courseType))
          this.cannotRace = true;
        this.missingRacers.push(leg.courseType);
      }
    });

    if (this.cannotRace)
      this.popoverText = this.getErrorPopoverText();
    else
      this.popoverText = this.getSuccessfulPopoverText();
  }

  getColorClass(leg: RaceLeg) {
    if (leg !== null && leg !== undefined) {
      var colorConditional = {
        'flatlandColor': leg.getCourseTypeName() === 'Flatland',
        'mountainColor': leg.getCourseTypeName() === 'Mountain',
        'waterColor': leg.getCourseTypeName() === 'Water'
      };
      return colorConditional;
    }
    else {
      return {};
    }
  }

  getNoRacerClass(leg: RaceLeg) {
    var conditional = { 'noRacer': !this.hasRacerForLeg(leg) };
    return conditional;
  }

  hasRacerForLeg(leg: RaceLeg): boolean {
    var hasRacer = false;
    var selectedDeck = this.lookupService.getPrimaryDeck();
    if (selectedDeck === undefined || selectedDeck === null || selectedDeck.selectedAnimals.length === 0) {
      return hasRacer;
    }

    if (selectedDeck.selectedAnimals.some(item => item.raceCourseType === leg.courseType))
      hasRacer = true;

    return hasRacer;
  }

  getErrorPopoverText() {
    var popoverText = "You cannot do this race for the following reasons: \n\n";

    this.missingRacers.forEach(racer => {
      popoverText += "-Missing " + RaceCourseTypeEnum[racer] + " racer\n";
    });

    return popoverText;
  }

  getSuccessfulPopoverText() {
    var popoverText = "";

    var legCount = 1;
    this.race.raceLegs.forEach(leg => {
      if (leg.terrain !== undefined && leg.terrain !== null)
        popoverText += this.lookupService.getTerrainPopoverText(leg.terrain, leg);

      if (legCount < this.race.raceLegs.length)
        popoverText += "\n";

      legCount+=1;
    });
    

    return popoverText;
  }
}
