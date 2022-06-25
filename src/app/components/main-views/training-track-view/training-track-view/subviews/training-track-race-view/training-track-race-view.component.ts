import { Component, EventEmitter, Input, OnInit, Output, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { Race } from 'src/app/models/races/race.model';
import { TrackRaceTypeEnum } from 'src/app/models/track-race-type-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
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
  colorConditional: any;
  public trackRaceTypeEnum = TrackRaceTypeEnum;

  constructor(private globalService: GlobalService, private lookupService: LookupService, private sanitizer: DomSanitizer,  
    private modalService: NgbModal, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.practiceTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.practice);
    this.noviceTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.novice);
    this.intermediateTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.intermediate);
    this.masterTrackRace = this.globalService.generateTrackRace(this.selectedAnimal, TrackRaceTypeEnum.master);
    
    this.intermediateTrackAvailable = this.selectedAnimal.allTrainingTracks.intermediateTrackAvailable;
    this.masterTrackAvailable = this.selectedAnimal.allTrainingTracks.masterTrackAvailable;

    this.colorConditional = {
      'flatlandColor': this.selectedAnimal.getRaceCourseType() === 'Flatland',
      'mountainColor': this.selectedAnimal.getRaceCourseType() === 'Mountain',
      'waterColor': this.selectedAnimal.getRaceCourseType() === 'Ocean',
      'tundraColor': this.selectedAnimal.getRaceCourseType() === 'Tundra',
      'volcanicColor': this.selectedAnimal.getRaceCourseType() === 'Volcanic'
    };
  }

  selectTrackRace(race: Race) {
    //TODO: change animal to selected animal, then reset it after. don't think changing decks will work cause your temp won't be in the global set
    var currentPrimaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
      if (currentPrimaryDeck !== null && currentPrimaryDeck !== undefined)
        currentPrimaryDeck.isPrimaryDeck = false;
    
    this.raceSelected.emit(race);
  }

  getTrackRewardsPopover(type: TrackRaceTypeEnum) {
    var popover = "";
    var rewards = this.lookupService.getTrackRaceRewards(type);    
    var trackPaceModifierValue = .25;
    var trackPaceModifierValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingTrackPaceModifier");
    if (trackPaceModifierValuePair !== undefined)
      trackPaceModifierValue = trackPaceModifierValuePair.value;

    for (var i = 0; i < rewards.length; i++)
    {
      var reward = rewards[i];
      var rewardsObtained = this.selectedAnimal.allTrainingTracks.noviceTrack.rewardsObtained;

      if (i < rewardsObtained)
      {
        popover += "<span class='crossed'>(" + (i * trackPaceModifierValue * 100) + "% average pace) " + reward +"</span>\n";
      }
      else
        popover += "<span>(" + (i * trackPaceModifierValue * 100) + "% average pace) " + reward +"</span>\n";
    }    

    return this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(popover));
  }

  openRewardsModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }
  
  goToAnimal() {
    this.componentCommunicationService.setAnimalView(NavigationEnum.animals, this.selectedAnimal);
  }
}
