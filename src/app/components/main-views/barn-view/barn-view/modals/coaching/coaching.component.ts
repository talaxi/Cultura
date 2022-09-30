import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { CoachingCourseTypeEnum } from 'src/app/models/coaching-course-type-enum.model';
import { CoachingTypeEnum } from 'src/app/models/coaching-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-coaching',
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.css']
})
export class CoachingComponent implements OnInit {
  @Input() selectedBarnNumber: number;
  @Output() isCoachingEmitter = new EventEmitter<boolean>();
  associatedAnimal: Animal;
  incrementalCoachingUpdates: string;
  @ViewChild('coachingCanvas', { static: false, read: ElementRef }) coachingCanvas: ElementRef;
  @ViewChild('drawCoaching', { static: false, read: ElementRef }) drawCoaching: ElementRef;
  canvasHeight: number;
  canvasWidth: number;
  canvasOffsetX: number;
  canvasOffsetY: number;
  subscription: any;
  isPointerDown: boolean = false;
  context: any;
  activePoints: number[][] = [];
  currentEndPoint: number = 0;
  currentX: number = 0;
  currentY: number = 0;
  getNewPath: boolean = false;
  currentPathType: CoachingCourseTypeEnum;
  animalDisplayName: string;
  successfulAttemptStreak: number;
  displayCoachingView: CoachingTypeEnum;  
  public coachingTypeEnum = CoachingTypeEnum;
  showScrimmageIcon = false;
  restingForScrimmage: boolean;
  scrimmageRestingTimeRemaining: string;
  scrimmagesUnlocked: boolean = false;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService,
    private lookupService: LookupService) { }

  ngOnInit(): void {
    this.displayCoachingView = CoachingTypeEnum.coaching; 

    if (this.lookupService.isItemUnlocked("scrimmages"))
    {      
      this.scrimmagesUnlocked = true;
    }

    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.associatedAnimal = associatedAnimal;
        }
      }
    }
        
    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      this.showScrimmageIcon = this.globalService.globalVar.tutorials.showScrimmageTutorial;
      this.restingForScrimmage = this.associatedAnimal.scrimmageEnergyTimer > 0;
      this.scrimmageRestingTimeRemaining = this.utilityService.convertSecondsToMMSS(this.associatedAnimal.scrimmageEnergyTimer);
    });
  }

  returnToSelectedBarnView() {
    this.isCoachingEmitter.emit(false);
  }

  changeDisplayCoachingView(type: CoachingTypeEnum) {
    this.displayCoachingView = type;
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }

    this.isCoachingEmitter.emit(false);
  }
}
