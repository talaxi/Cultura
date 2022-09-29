import { Component, OnInit } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Barn } from 'src/app/models/barns/barn.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
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
  refreshTrainingPopoverText = "";

  showBarnOptions: boolean = true;
  swapBarnMode: boolean = false;
  swapBarnModePopoverText: string;
  quickViewBarnModePopoverText: string;
  dragSourceElement: any;
  allBarns: Barn[];

  constructor(private lookupService: LookupService, private componentCommunicationService: ComponentCommunicationService,
    private globalService: GlobalService, private gameLoopService: GameLoopService) { }

  ngOnInit(): void {
    this.allBarns = this.globalService.getBarnListInOrder();
    this.componentCommunicationService.setNewView(NavigationEnum.barn);
    this.refreshTrainingPopoverText = "Click here to restart your current training for all barns or, if no training is selected, restart your previous training.";
    if (this.globalService.globalVar.settings.get("quickViewBarnMode"))
      this.isCondensedView = true;

    if (this.globalService.globalVar.settings.get("swapBarnMode"))
      this.swapBarnMode = true;


    if (this.globalService.globalVar.settings.get("showBarnOptions"))
      this.showBarnOptions = true;
    else
      this.showBarnOptions = false;

    this.barnRow2IsUnlocked = this.lookupService.isItemUnlocked("barnRow2");
    this.barnRow3IsUnlocked = this.lookupService.isItemUnlocked("barnRow3");
    this.barnRow4IsUnlocked = this.lookupService.isItemUnlocked("barnRow4");
    this.barnRow5IsUnlocked = this.lookupService.isItemUnlocked("barnRow5");

    this.swapBarnModePopoverText = this.lookupService.getSettingDescriptions("Swap Barn Mode");
    this.quickViewBarnModePopoverText = this.lookupService.getSettingDescriptions("Quick View Barn");

    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 1) {
      this.tutorialActive = true;
    }
    if (!this.globalService.globalVar.tutorials.tutorialCompleted && this.globalService.globalVar.tutorials.currentTutorialId === 6 &&
      this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Monkey)?.isAvailable) {
      this.tutorialActive = true;
    }

    this.subscription = this.componentCommunicationService.getBarnView().subscribe((value) => {
      this.selectedBarn = value;
    });
  }

  quickViewBarnToggle = () => {
    this.isCondensedView = !this.isCondensedView;
    this.globalService.globalVar.settings.set("quickViewBarnMode", this.isCondensedView);
  }

  swapBarnModeToggle = () => {
    this.swapBarnMode = !this.swapBarnMode;
    this.globalService.globalVar.settings.set("swapBarnMode", this.swapBarnMode);
  }

  refreshTraining() {
    this.globalService.globalVar.barns.forEach(barn => {
      var animal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber === barn.barnNumber);
      if (animal !== undefined && animal !== null && animal.previousTraining !== undefined && animal.previousTraining !== null) {
        var newTraining = Object.assign({}, animal.previousTraining);
        newTraining.timeTrained = 0;
      
        if (animal.currentTraining !== null && animal.currentTraining !== undefined && animal.currentTraining.trainingTimeRemaining > 0 &&
          this.globalService.globalVar.settings.get("finishTrainingBeforeSwitching")) {
          animal.queuedTraining = newTraining;
        }
        else {
          animal.currentTraining = newTraining;
        }
      }
    });
  }

  dragStart(event: any) {
    if (this.swapBarnMode) {
      this.dragSourceElement = event;
      event.dataTransfer.setData("text", event.target.id);
    }
  }

  allowDrop(event: any) {
    if (this.swapBarnMode) {
      event.preventDefault();
    }
  }

  dropBarn(event: any) {
    if (this.swapBarnMode) {
      event.preventDefault();
      event.stopPropagation();

      var data = event.dataTransfer.getData("text");
      var dataElement = document.getElementById(data);
      var targetEvent = event.target;

      if (dataElement === null)
        return;

      if (targetEvent === null)
        return;

      var swapFromId = dataElement.id.substring(4);
      var swapToId = targetEvent.id.substring(4);

      if (swapFromId === undefined || swapToId === undefined || Number(swapFromId) === NaN || Number(swapToId) === NaN)
        return;

      var swappingFromBarnNumber = this.globalService.globalVar.barnOrder[Number(swapFromId) - 1];
      var swappingToBarnNumber = this.globalService.globalVar.barnOrder[Number(swapToId) - 1];

      var swappingFromIndex = this.globalService.globalVar.barnOrder.findIndex(item => item === swappingFromBarnNumber);
      var swappingToIndex = this.globalService.globalVar.barnOrder.findIndex(item => item === swappingToBarnNumber);

      if (swappingFromIndex < 0 || swappingToIndex < 0)
        return;

      var actualSwapFromValue = this.globalService.globalVar.barnOrder[swappingFromIndex];
      var actualSwapToValue = this.globalService.globalVar.barnOrder[swappingToIndex];

      this.globalService.globalVar.barnOrder[swappingFromIndex] = actualSwapToValue;
      this.globalService.globalVar.barnOrder[swappingToIndex] = actualSwapFromValue;
      this.allBarns = this.globalService.getBarnListInOrder();
    }
  }

  goToBarn(selectedBarnNumber: number): void {
    if (!this.swapBarnMode) {
      this.selectedBarn = selectedBarnNumber;
      this.componentCommunicationService.setBarnView(NavigationEnum.barn, selectedBarnNumber);
    }
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
