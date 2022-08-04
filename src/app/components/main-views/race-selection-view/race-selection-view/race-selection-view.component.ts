import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { RaceTypeEnum } from 'src/app/models/race-type-enum.model';
import { Race } from 'src/app/models/races/race.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
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
  newSpecialRaceAvailable = false;
  eventRaceNowAvailable = false;
  subscription: any;
  communicationSubscription: any;

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService,
    private gameLoopService: GameLoopService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.raceselection);

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      this.newSpecialRaceAvailable = this.globalService.globalVar.notifications.isNewSpecialRaceAvailable;
      this.eventRaceNowAvailable = this.globalService.globalVar.notifications.isEventRaceNowActive;
    });

    this.communicationSubscription = this.componentCommunicationService.getRaceView().subscribe((value) => {
      this.displayRaceView = value;
    });
  }

  /*toggleCircuitRace(toggle: boolean): void {
    this.displayCircuitView = toggle;
  }*/

  changeDisplayRaceView(type: RaceTypeEnum) {
    this.displayRaceView = type;

    if (type === RaceTypeEnum.special)
      this.newSpecialRaceAvailable = this.globalService.globalVar.notifications.isNewSpecialRaceAvailable = false;
      if (type === RaceTypeEnum.event)
      this.eventRaceNowAvailable = this.globalService.globalVar.notifications.isEventRaceNowActive = false;
  }

  raceSelected(race: Race) {
    this.selectedRace = race;
    this.showRace = true;
  }

  //this is back button not race ending
  raceFinished() {
    this.showRace = false;
  }

  trainingTrackRaceSelected(isSelected: boolean) {
    this.trainingTrackRace = isSelected;
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined)
      this.subscription.unsubscribe();

    if (this.communicationSubscription !== null && this.communicationSubscription !== undefined)
      this.communicationSubscription.unsubscribe();

      //these will regenerate when needed
      this.globalService.globalVar.localRaces = [];
  }
}
