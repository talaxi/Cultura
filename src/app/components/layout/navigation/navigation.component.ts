import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { NavigationEnum } from '../../../models/navigation-enum.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  @Output() viewChanged = new EventEmitter<NavigationEnum>();
  public navigationEnum = NavigationEnum;
  public selectedNavigation = 0;
  incubatorAvailable: boolean;
  talentsAvailable: boolean;
  tutorialSubscription: any;
  tutorialActive = false;

  constructor(private componentCommunicationService: ComponentCommunicationService, private lookupService: LookupService,
    private globalService: GlobalService, private gameLoopService: GameLoopService) { }

  ngOnInit(): void {
    this.componentCommunicationService.getNewView().subscribe((value) => {
      this.viewChanged.emit(value);
      this.selectedNavigation = value;
    });

    this.incubatorAvailable = this.lookupService.isItemUnlocked("duoRace");
    this.talentsAvailable = this.lookupService.isItemUnlocked("rainbowRace");

    this.tutorialSubscription = this.gameLoopService.gameUpdateEvent.subscribe((value) => {
      if (!this.globalService.globalVar.tutorialCompleted && this.globalService.globalVar.currentTutorialId === 3) {
        this.tutorialActive = true;
      }
      else
        this.tutorialActive = false;

      if (this.globalService.globalVar.tutorialCompleted)
        this.tutorialSubscription.unsubscribe();
    });
  }

  switchView(selectedView: NavigationEnum) {
    this.viewChanged.emit(selectedView);
    this.selectedNavigation = selectedView;

    this.incubatorAvailable = this.lookupService.isItemUnlocked("duoRace");
    this.incubatorAvailable = this.lookupService.isItemUnlocked("rainbowRace");
  }

  handleIntroTutorial() {
    if (!this.globalService.globalVar.tutorialCompleted && this.globalService.globalVar.currentTutorialId === 3) {
      this.globalService.globalVar.showTutorial = true;
    }
  }
}
