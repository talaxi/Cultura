import { Component, OnInit, ChangeDetectorRef, Input, ElementRef, ViewChild, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { TutorialService } from 'src/app/services/tutorial-service.service';
import { NavigationEnum } from '../../models/navigation-enum.model';
import { GlobalService } from '../../services/global-service.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public navigationEnum = NavigationEnum;
  activeView = NavigationEnum.barn;
  tutorialText: string | null;
  @ViewChild('tutorialContent', { static: true }) tutorialContent: ElementRef;
  @ViewChild('eventLoadingContent', { static: true }) eventLoadingContent: ElementRef;
  eventPrixSubscription: any;
  loadingScreenDisplayed = false;

  constructor(private ref: ChangeDetectorRef, private globalService: GlobalService, private modalService: NgbModal,
    private tutorialService: TutorialService, private componentCommunicationService: ComponentCommunicationService,
    private sanitizer: DomSanitizer, private gameLoopService: GameLoopService) {
  }

  ngOnInit(): void {
    this.openTutorialModal();

    this.eventPrixSubscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      if (this.globalService.globalVar.eventRaceData !== undefined && this.globalService.globalVar.eventRaceData !== null &&
        this.globalService.globalVar.eventRaceData.isCatchingUp && !this.loadingScreenDisplayed) {        
        this.loadingScreenDisplayed = true;
        this.openLoadingModal();
      }
      else if (this.globalService.globalVar.eventRaceData !== undefined && this.globalService.globalVar.eventRaceData !== null &&
        !this.globalService.globalVar.eventRaceData.isCatchingUp && this.loadingScreenDisplayed)
      {
        this.loadingScreenDisplayed = false;
        this.closeModals();
      }
    });

    var subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      if (this.globalService.globalVar.tutorials.showTutorial)
        this.openTutorialModal();

      if (this.globalService.globalVar.tutorials.tutorialCompleted)
        subscription.unsubscribe();
    });
  }

  changeView(newView: NavigationEnum) {
    this.activeView = newView;
  }

  openTutorialModal() {
    if (!this.globalService.globalVar.tutorials.tutorialCompleted) {
      var getTutorialState = this.tutorialService.getTutorialState(this.globalService.globalVar.tutorials.currentTutorialId);

      if (this.activeView === getTutorialState.associatedTab) {
        this.tutorialText = this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(getTutorialState.tutorialText + "\n"));
        this.globalService.globalVar.tutorials.showTutorial = false;
        if (getTutorialState.id === 5)
          this.globalService.globalVar.tutorials.currentTutorialId += 1;
        this.modalService.open(this.tutorialContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then(
          result => {
            this.closeTutorialModal();
          },
          reason => {
            this.closeTutorialModal();
          }
        );
      }
    }
  }

  openLoadingModal() {
    this.modalService.open(this.eventLoadingContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then(
      result => {
        this.closeModals();
      },
      reason => {
        this.closeModals();
      }
    );
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  closeTutorialModal() {
    this.modalService.dismissAll();
  }

  skipTutorial() {
    this.tutorialService.skipTutorial();
    this.closeTutorialModal();
  }

  continueTutorial() {
    this.closeTutorialModal();
  }
}
