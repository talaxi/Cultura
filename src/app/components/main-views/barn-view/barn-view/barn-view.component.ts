import { Component, OnInit } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-barn-view',
  templateUrl: './barn-view.component.html',
  styleUrls: ['./barn-view.component.css']
})
export class BarnViewComponent implements OnInit {
  selectedBarn = 0;
  isCoaching = false;
  tutorialActive = false;
  barnRow2IsUnlocked = false;
  barnRow3IsUnlocked = false;
  barnRow4IsUnlocked = false;
  barnRow5IsUnlocked = false;
  subscription: any;
  isCondensedView = false;

  constructor(private lookupService: LookupService, private componentCommunicationService: ComponentCommunicationService,
    private globalService: GlobalService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.barn);
    if (this.globalService.globalVar.settings.get("quickViewBarnMode"))
        this.isCondensedView = true;
    
    this.barnRow2IsUnlocked = this.lookupService.isItemUnlocked("barnRow2");
    this.barnRow3IsUnlocked = this.lookupService.isItemUnlocked("barnRow3");
    this.barnRow4IsUnlocked = this.lookupService.isItemUnlocked("barnRow4");
    this.barnRow5IsUnlocked = this.lookupService.isItemUnlocked("barnRow5");

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 1) {
      this.tutorialActive = true;
    }
    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 6 &&
      this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey)?.isAvailable) {      
      this.tutorialActive = true;
    }

    this.subscription = this.componentCommunicationService.getBarnView().subscribe((value) => {
      //if (value > 0) {
        this.selectedBarn = value;
      //}
    });
  }

  goToBarn(selectedBarnNumber: number): void {    
    this.selectedBarn = selectedBarnNumber;
    this.componentCommunicationService.setBarnView(NavigationEnum.barn, selectedBarnNumber);
  }

  goToCoaching(isCoaching: boolean): void {    
    this.isCoaching = isCoaching;
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }

    this.componentCommunicationService.setBarnNumber(0);
  }
}
