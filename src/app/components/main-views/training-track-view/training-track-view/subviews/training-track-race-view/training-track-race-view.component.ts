import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { Race } from 'src/app/models/races/race.model';
import { TrackRaceTypeEnum } from 'src/app/models/track-race-type-enum.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-training-track-race-view',
  templateUrl: './training-track-race-view.component.html',
  styleUrls: ['./training-track-race-view.component.css']
})
export class TrainingTrackRaceViewComponent implements OnInit {
  practiceTrackRace: Race;
  noviceTrackRace: Race;
  intermediateTrackRace: Race;
  masterTrackRace: Race;
  intermediateTrackAvailable: boolean = false;
  masterTrackAvailable: boolean = false;
  @Output() raceSelected = new EventEmitter<Race>();
  @Input() selectedAnimal: Animal;
  showRace = false;
  selectedRace: Race;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.practiceTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.Practice);
    this.noviceTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.Novice);
    this.intermediateTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.Intermediate);
    this.masterTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.Master);
  }

  selectTrackRace(race: Race) {
    this.raceSelected.emit(race);
  }
}
