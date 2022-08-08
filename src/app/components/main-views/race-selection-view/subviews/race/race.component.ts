import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnInit, Output, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { race, Subject } from 'rxjs';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Ability } from 'src/app/models/animals/ability.model';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceVariables } from 'src/app/models/animals/race-variables.model';
import { EquipmentEnum } from 'src/app/models/equipment-enum.model';
import { EventRaceTypeEnum } from 'src/app/models/event-race-type-enum.model';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceDesignEnum } from 'src/app/models/race-design-enum.model';
import { RaceDisplayInfoEnum } from 'src/app/models/race-display-info-enum.model';
import { RaceTypeEnum } from 'src/app/models/race-type-enum.model';
import { RacerEffectEnum } from 'src/app/models/racer-effect-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { RacePath } from 'src/app/models/races/race-path.model';
import { RaceResult } from 'src/app/models/races/race-result.model';
import { Race } from 'src/app/models/races/race.model';
import { Terrain } from 'src/app/models/races/terrain.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { StringNumberPair } from 'src/app/models/utility/string-number-pair.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { RaceLogicService } from 'src/app/services/race-logic/race-logic.service';
import { InitializeService } from 'src/app/services/utility/initialize.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.css']
})
export class RaceComponent implements OnInit {
  @Input() selectedRace: Race;
  incrementalRaceUpdates: string = "";
  displayResults: boolean;
  rewardRows: any[][];
  rewardCells: any[];
  @Output() raceFinished = new EventEmitter<boolean>();
  skipRace: Subject<boolean> = new Subject<boolean>();
  pauseRace: Subject<boolean> = new Subject<boolean>();
  @ViewChild('circuitRewardModal', { static: true }) circuitRewardModal: ElementRef;
  raceSkipped = false;
  racePaused = false;
  frameModifier = 60;
  velocityAtCurrentFrame: any;
  maxSpeedAtCurrentFrame: any;
  staminaAtCurrentFrame: any;
  racerEffectAtCurrentFrame: any;
  positionAtCurrentFrame: any;
  totalRacers: number;
  frameByFrameSubscription: any;
  updateSubscription: any;
  displayVisualRace = true;
  displayTextUpdates = true;
  burstEffect = RacerEffectEnum.Burst;
  grandPrixRace: boolean = false;
  eventRaceSubscription: any;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService,
    public lookupService: LookupService, private initializeService: InitializeService, private modalService: NgbModal,
    private sanitizer: DomSanitizer, private raceLogicService: RaceLogicService) { }

  ngOnInit(): void {
    var raceDisplayInfo = this.globalService.globalVar.settings.get("raceDisplayInfo");
    if (raceDisplayInfo === RaceDisplayInfoEnum.draw) {
      this.displayVisualRace = true;
      this.displayTextUpdates = false;
    }
    else if (raceDisplayInfo === RaceDisplayInfoEnum.text) {
      this.displayVisualRace = false;
      this.displayTextUpdates = true;
    }
    else if (raceDisplayInfo === RaceDisplayInfoEnum.both) {
      this.displayVisualRace = true;
      this.displayTextUpdates = true;
    }

    if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)
      this.grandPrixRace = true;

    var raceResult = new RaceResult();
    if (!this.grandPrixRace)
      raceResult = this.raceLogicService.runRace(this.selectedRace);
    else
      raceResult = this.globalService.globalVar.eventRaceData.currentRaceSegmentResult;

    this.setupDisplayRewards(this.selectedRace);
    this.displayRaceUpdates(raceResult);
    this.getFrameByFrameStats();

    if (this.globalService.globalVar.settings.get("skipDrawRace"))
      this.raceSkipped = true;

    if (this.grandPrixRace)
    {
      this.eventRaceSubscription = this.gameLoopService.gameUpdateEvent.subscribe(async () => {
        if (this.globalService.getTimeToEventRace() > 0 && this.globalService.globalVar.eventRaceData.bonusTime === 0) {
          this.raceFinished.emit(true);
        }

        if (!this.globalService.globalVar.eventRaceData.isRunning) {
          this.raceFinished.emit(true);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.frameByFrameSubscription !== null && this.frameByFrameSubscription !== undefined)
      this.frameByFrameSubscription.unsubscribe();

    if (this.updateSubscription !== null && this.updateSubscription !== undefined)
      this.updateSubscription.unsubscribe();

      if (this.eventRaceSubscription !== null && this.eventRaceSubscription !== undefined)
      this.eventRaceSubscription.unsubscribe();

    this.raceFinished.emit(true);
  }

  displayRaceUpdates(raceResult: RaceResult): void {    
    var raceUpdates = raceResult.raceUpdates;    
    var currentTime = 0;
    this.incrementalRaceUpdates = "";
    var framesPassed = 0;

    var eventViewStartFrame = 0;
    var lastEventSegment = this.globalService.globalVar.eventRaceData.currentRaceSegmentCount;

    var subscription = this.updateSubscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {

      //var startTime = performance.now();
      if (!this.racePaused) {
        currentTime += deltaTime;

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {          
           if (this.globalService.globalVar.eventRaceData.currentRaceSegmentCount > lastEventSegment) {
            //eventViewStartFrame = 0;
            framesPassed = 0;
            this.selectedRace = this.globalService.globalVar.eventRaceData.currentRaceSegment;
            raceUpdates = this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.raceUpdates;   
            //console.log(raceUpdates);         
          }

          lastEventSegment = this.globalService.globalVar.eventRaceData.currentRaceSegmentCount;
        }

        framesPassed += 1;
      }
      //TODO: if you hit the back button then this is delayed -- needs to be considered like skipping.
      //run a race that will rank you up, hit back, and wait and you should see this

      if (!(this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix)) {
        if (raceUpdates.length === 0 || this.raceSkipped) //also check if skip button pressed/setting to auto skip is checked
        {
          if (this.raceSkipped) {
            raceUpdates.forEach(update => {
              this.incrementalRaceUpdates += this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(update.text + "\n"));
            });
          }

          if (raceResult.wasSuccessful) {
            this.displayResults = true;

            if (this.selectedRace.circuitIncreaseReward !== null && this.selectedRace.circuitIncreaseReward !== undefined &&
              this.selectedRace.circuitIncreaseReward[0] !== "")
              this.modalService.open(this.circuitRewardModal, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
          }

          subscription.unsubscribe();
          return;
        }
      }

      //if ((currentTime * this.frameModifier) >= raceUpdates[0].value) {
      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        //console.log((this.globalService.globalVar.eventRaceData.segmentTimeCounter * this.frameModifier) + " vs " + raceUpdates[0].value);
        if ((this.globalService.globalVar.eventRaceData.segmentTimeCounter * this.frameModifier) >= raceUpdates[0].value) {
          this.incrementalRaceUpdates += this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(raceUpdates[0].text + "\n"));
          raceUpdates.shift();
        }
      }
      else {
        if (framesPassed >= raceUpdates[0].value) {
          this.incrementalRaceUpdates += this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(raceUpdates[0].text + "\n"));
          raceUpdates.shift();
        }
      }

      //var endTime = performance.now();
      //if (endTime - startTime > 16.7)
      //console.log(`Call to Update took ${endTime - startTime} milliseconds`);
    });
  }

  setupDisplayRewards(race: Race): void {
    this.rewardCells = [];
    this.rewardRows = [];

    var maxColumns = 4;
    if (window.matchMedia("only screen and (max-width: 760px)").matches) //mobile check
      maxColumns = 2;

    if (race.rewards === undefined || race.rewards === null)
      return;

    for (var i = 1; i <= race.rewards.length; i++) {
      this.rewardCells.push({ name: race.rewards[i - 1].name, amount: race.rewards[i - 1].amount });
      if ((i % maxColumns) == 0) {
        this.rewardRows.push(this.rewardCells);
        this.rewardCells = [];
      }
    }

    if (this.rewardCells.length !== 0)
      this.rewardRows.push(this.rewardCells);
  }  

  goToRaceSelection(): void {
    this.raceFinished.emit(true);
  }

  skipRaceAnimation(): void {
    this.raceSkipped = true;
    this.skipRace.next(true);
  }

  pauseRaceAnimation(): void {
    this.racePaused = !this.racePaused;
    this.pauseRace.next(true);
  }

  getFrameByFrameStats() {
    var currentTime = 0;
    this.totalRacers = this.lookupService.getTotalRacersByRace(this.selectedRace);
    var framesPassed = 0;
    var eventViewStartFrame = 0;
    var lastEventSegment = this.globalService.globalVar.eventRaceData.currentRaceSegmentCount;

    this.frameByFrameSubscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      //var startTime = performance.now();   
      if (!this.racePaused) {
        currentTime += deltaTime;

        if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
          if (this.globalService.globalVar.eventRaceData.currentRaceSegmentCount > lastEventSegment) {
            //eventViewStartFrame = 0;
            //framesPassed = 0;
            this.selectedRace = this.globalService.globalVar.eventRaceData.currentRaceSegment;
          }

          lastEventSegment = this.globalService.globalVar.eventRaceData.currentRaceSegmentCount;
        }

        framesPassed += 1;
      }

      var currentFrame = 0;
      if (this.selectedRace.raceType === RaceTypeEnum.event && this.selectedRace.eventRaceType === EventRaceTypeEnum.grandPrix) {
        currentFrame = Math.round(this.globalService.globalVar.eventRaceData.segmentTimeCounter * this.frameModifier);
      }
      else
        currentFrame = framesPassed;

      /*console.log("start");
      console.log(this.selectedRace.raceUI.velocityByFrame[currentFrame]);
      console.log(this.selectedRace.raceUI.staminaPercentByFrame[currentFrame]);
      console.log(this.selectedRace.raceUI.maxSpeedByFrame[currentFrame]);
      console.log(this.selectedRace.raceUI.racerEffectByFrame[currentFrame]);
      console.log(this.selectedRace.raceUI.racePositionByFrame[currentFrame]);
      console.log("end");*/

      try {
        if (this.selectedRace.raceUI.velocityByFrame.length <= currentFrame || this.raceSkipped) {
          var lastFrameCount = this.selectedRace.raceUI.velocityByFrame.length - 1;
          this.velocityAtCurrentFrame = (this.selectedRace.raceUI.velocityByFrame[lastFrameCount] * this.frameModifier).toFixed(2); //needs to be m/s
          this.staminaAtCurrentFrame = (this.selectedRace.raceUI.staminaPercentByFrame[lastFrameCount] * 100).toFixed(2);
          this.maxSpeedAtCurrentFrame = this.selectedRace.raceUI.maxSpeedByFrame[lastFrameCount].toFixed(2);
          this.racerEffectAtCurrentFrame = this.selectedRace.raceUI.racerEffectByFrame[lastFrameCount];
          this.positionAtCurrentFrame = this.utilityService.ordinalSuffixOf(this.selectedRace.raceUI.racePositionByFrame[lastFrameCount]);
        }
        else {
          this.velocityAtCurrentFrame = (this.selectedRace.raceUI.velocityByFrame[currentFrame] * this.frameModifier).toFixed(2);
          this.staminaAtCurrentFrame = (this.selectedRace.raceUI.staminaPercentByFrame[currentFrame] * 100).toFixed(2);
          this.maxSpeedAtCurrentFrame = this.selectedRace.raceUI.maxSpeedByFrame[currentFrame].toFixed(2);
          this.racerEffectAtCurrentFrame = this.selectedRace.raceUI.racerEffectByFrame[currentFrame];
          this.positionAtCurrentFrame = this.utilityService.ordinalSuffixOf(this.selectedRace.raceUI.racePositionByFrame[currentFrame]);
        }
      }
      catch {
        console.log("error");
      }

      //var endTime = performance.now();
      //if (endTime - startTime > 16.7)
      //console.log(`Call to FrameByFrame took ${endTime - startTime} milliseconds`);
    });
  }
}
