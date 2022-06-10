import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
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
  tutorial3Active = false;
  tutorial6Active = false;

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
        this.tutorial3Active = true;
      }
      else
        this.tutorial3Active = false;

        if (!this.globalService.globalVar.tutorialCompleted && this.globalService.globalVar.currentTutorialId === 6 && 
          this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey)?.isAvailable) {
          this.tutorial6Active = true;
        }
        else
          this.tutorial6Active = false;

      if (this.globalService.globalVar.tutorialCompleted)
        this.tutorialSubscription.unsubscribe();
    });
  }

  switchView(selectedView: NavigationEnum) {
    this.viewChanged.emit(selectedView);
    this.selectedNavigation = selectedView;

    this.incubatorAvailable = this.lookupService.isItemUnlocked("duoRace");
    this.talentsAvailable = this.lookupService.isItemUnlocked("rainbowRace");
  }

  handleIntroTutorial() {
    if (!this.globalService.globalVar.tutorialCompleted && this.globalService.globalVar.currentTutorialId === 3) {
      this.globalService.globalVar.showTutorial = true;
    }
  }
}
