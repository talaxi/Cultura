import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EventRaceData } from 'src/app/models/races/event-race-data.model';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent implements OnInit {
  @Output() raceSelected = new EventEmitter<Race>();
  eventRace: Race;
  eventRaceData: EventRaceData;
  isEventRaceAvailable: boolean;
  popoverText: string = "";
  cannotRace = false;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.eventRaceData = this.globalService.globalVar.eventRaceData;
    this.globalService.initialEventRaceSetup();

    //build this in segments so you can run whatever courses you need to and also not bog the game down with an insane amount of data
    this.eventRace = this.globalService.generateEventRaceSegment();

  }

  selectEventRace() {

  }
}
