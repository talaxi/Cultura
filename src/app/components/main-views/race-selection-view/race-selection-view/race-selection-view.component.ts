import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { RaceTypeEnum } from 'src/app/models/race-type-enum.model';
import { Race } from 'src/app/models/races/race.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-race-selection-view',
  templateUrl: './race-selection-view.component.html',
  styleUrls: ['./race-selection-view.component.css']
})
export class RaceSelectionViewComponent implements OnInit {
  //displayCircuitView = true;
  displayRaceView: RaceTypeEnum = RaceTypeEnum.circuit;
  showRace = false;
  trainingTrackRace = false;
  selectedRace: Race;
  public raceTypeEnum = RaceTypeEnum;

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.raceselection);
  }

  /*toggleCircuitRace(toggle: boolean): void {
    this.displayCircuitView = toggle;
  }*/

  changeDisplayRaceView(type: RaceTypeEnum) {
    this.displayRaceView = type;
  }

  raceSelected(race: Race) {
    this.selectedRace = race;
    this.showRace = true;
  }

  raceFinished() {
    if (this.selectedRace.raceType === RaceTypeEnum.event)
    {      
    //if this segment is complete, pull next segment
    var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (primaryDeck !== null && primaryDeck !== undefined)
      this.selectedRace = this.globalService.generateGrandPrixSegment(primaryDeck.selectedAnimals[0]);

    //if time runs out, end event
    }
    else
    {
      this.showRace = false;
    }

  }

  trainingTrackRaceSelected(isSelected: boolean) {    
    this.trainingTrackRace = isSelected;
  }
}
