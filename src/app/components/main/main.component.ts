import { Component, OnInit, ChangeDetectorRef, Input, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
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
  tutorialText: string;
  @ViewChild('tutorialContent', { static: true }) tutorialContent: ElementRef;

  constructor(private ref: ChangeDetectorRef, private globalService: GlobalService, private modalService: NgbModal,
    private componentCommunicationService: ComponentCommunicationService, private tutorialService: TutorialService) {
  }

  ngOnInit(): void {    
    this.openTutorialModal();
  }

  changeView(newView: NavigationEnum) {
    this.activeView = newView;
  }

  openTutorialModal() {
    if (!this.globalService.globalVar.tutorialCompleted) {
      var getTutorialState = this.tutorialService.getTutorialState(this.globalService.globalVar.currentTutorialId);
      this.componentCommunicationService.setNewView(getTutorialState.associatedTab);
      this.tutorialText = getTutorialState.tutorialText;
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

  closeTutorialModal() {
    this.modalService.dismissAll();
    this.globalService.globalVar.currentTutorialId += 1;
    this.openTutorialModal();
  }
}
