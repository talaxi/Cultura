import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GrandPrixData } from 'src/app/models/races/event-race-data.model';
import { Race } from 'src/app/models/races/race.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent implements OnInit {
  @Output() raceSelected = new EventEmitter<Race>();
  grandPrix: Race;
  grandPrixData: GrandPrixData;
  remainingMeters: number;
  isEventRaceAvailable: boolean;
  popoverText: string = "";
  cannotRace = false;
  eventRaceReleased = false;
  eventRaceNotice = "";
  eventRaceTimer = "";
  grandPrixUnlocked = false;
  subscription: any;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.globalService.getGrandPrixDetails(this.globalService.getEventStartDateTime().toString());
    this.globalService.initialGrandPrixSetup(this.globalService.getEventStartDateTime().toString());
    this.grandPrixData = this.globalService.globalVar.eventRaceData;
    this.grandPrixUnlocked = this.lookupService.isItemUnlocked("grandPrix");
    
    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      this.setupEventTime();
      this.remainingMeters = this.grandPrixData.totalDistance - this.grandPrixData.distanceCovered;
    });
    
    //TODO: this should be its own thing, event deck or something
    var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    if (primaryDeck !== null && primaryDeck !== undefined)
      this.grandPrix = this.globalService.generateGrandPrixSegment(primaryDeck.selectedAnimals[0]);
  }

  selectEventRace() {
    //this can't actually start a race -- the race needs to be running in the background. this should just view it
    if (this.grandPrixData.isRunning === false)
    {
      //do set up
      this.grandPrixData.isRunning = true;
      //flipping that true should start the auto run in gamecheckup
      //should be basically the same time constraints as auto run but it's 1 every 3 min instead of 1-20 every 5 min 
    }
    this.raceSelected.emit(this.grandPrix);

  }

  setupEventTime() {
    var secondsToEvent = this.globalService.getTimeToEventRace();
    if (secondsToEvent > 0) {
      this.isEventRaceAvailable = false;
      this.eventRaceNotice = "Next Grand Prix available in";
      var hours = Math.floor(secondsToEvent / 3600);
      var minutes = Math.floor((secondsToEvent / 60) - (hours * 60));
      var seconds = (secondsToEvent - (hours * 60 * 60) - (minutes * 60));
      var secondsDisplay = Math.floor(seconds).toString();
      var hoursDisplay = hours.toString();
      var minutesDisplay = minutes.toString();

      if (hours < 10) {
        if (hours < 1 || hours > 59)
          hoursDisplay = "00";
        else
          hoursDisplay = String(hoursDisplay).padStart(2, '0');
      }
      if (minutes < 10) {
        if (minutes < 1 || minutes > 59)
          minutesDisplay = "00";
        else
          minutesDisplay = String(minutesDisplay).padStart(2, '0');
      }
      if (seconds < 10) {
        if (seconds < 1 || seconds > 59)
          secondsDisplay = "00";
        else
          secondsDisplay = String(secondsDisplay).padStart(2, '0');
      }

      this.eventRaceTimer = hoursDisplay + ":" + minutesDisplay + ":" + secondsDisplay;
    }
    else {
      var remainingEventTime = this.globalService.getRemainingEventRaceTime();
      if (remainingEventTime > 0) {
        this.eventRaceNotice = "Grand Prix ends in";
        this.isEventRaceAvailable = true;
        var hours = Math.floor(remainingEventTime / 3600);
        var minutes = Math.floor((remainingEventTime / 60) - (hours * 60));
        var seconds = (remainingEventTime - (hours * 60 * 60) - (minutes * 60));

        var hoursDisplay = hours.toString();
        var minutesDisplay = minutes.toString();
        var secondsDisplay = Math.floor(seconds).toString();
        if (hours < 10) {
          if (hours < 1 || hours > 59)
            hoursDisplay = "00";
          else
            hoursDisplay = String(hoursDisplay).padStart(2, '0');
        }
        if (minutes < 10) {
          if (minutes < 1 || minutes > 59)
            minutesDisplay = "00";
          else
            minutesDisplay = String(minutesDisplay).padStart(2, '0');
        }

        if (seconds < 10) {
          if (seconds < 1 || seconds > 59)
            secondsDisplay = "00";
          else
            secondsDisplay = String(secondsDisplay).padStart(2, '0');
        }

        this.eventRaceTimer = hoursDisplay + ":" + minutesDisplay + ":" + secondsDisplay;
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined)
      this.subscription.unsubscribe();
  }
}
