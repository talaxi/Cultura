import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DrawnRaceObjectEnum } from 'src/app/models/drawn-race-object-enum.model';
import { EventRaceTypeEnum } from 'src/app/models/event-race-type-enum.model';
import { LocalRaceTypeEnum } from 'src/app/models/local-race-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceDesignEnum } from 'src/app/models/race-design-enum.model';
import { RaceTypeEnum } from 'src/app/models/race-type-enum.model';
import { RacerEffectEnum } from 'src/app/models/racer-effect-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { RacePath } from 'src/app/models/races/race-path.model';
import { Race } from 'src/app/models/races/race.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-draw-race',
  templateUrl: './draw-race.component.html',
  styleUrls: ['./draw-race.component.css']
})
export class DrawRaceComponent implements OnInit {
  @ViewChild('raceCanvas', { static: false, read: ElementRef }) raceCanvas: ElementRef;
  @Input() race: Race;
  private skipSubscription: Subscription;
  @Input() skip: Observable<boolean>;
  skipRace = false;
  private pauseSubscription: Subscription;
  @Input() pause: Observable<boolean>;
  pauseRace = false;
  subscription: any;
  canvasHeight: number;
  canvasWidth: number;
  totalLegs: number;
  isRaceFinished: boolean;
  lengthCompleted = 0;
  canvasXDistanceScale: number;
  averageDistancePerSecond: number;
  currentLeg: RaceLeg;
  frameModifier = 60;
  mountainEndingY = 0;
  icyPatchBackgroundLines: (string | number[])[][] = [];
  volcanoStartingAngle: number;
  volcanoYOffset = 0;
  volcanoRadiusXModifier = 6;
  backgroundVolcanoYStart = 0;
  currentRaceFrame = 0;

  lastPathEndingX = 0;
  lastPathEndingY = 0;
  lastPreviousSeconds = 0; //in between seconds, get average speed and do that over the frames

  totalRaceModeXDistance = 0;
  totalRaceModeYDistance = 0;
  deltaY = 0;

  yOffscreen = 0;
  overviewYOffsetModifier = 1;

  visibleDistanceXLeft = 0;
  visibleDistanceYTop = 0;
  visibleDistanceXRight = 0;
  visibleDistanceYBottom = 0;

  //leg specific data
  mountainClimbPercent = .5; //what percentage of mountain is going up vs going down

  //event specific data
  eventViewStartFrame = 0;
  //lastFrame = 0;  
  lastEventSegment = this.globalService.globalVar.eventRaceData.currentRaceSegmentCount;
  newSegment = false;

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService,
    private lookupService: LookupService, private themeService: ThemeService) { }

  ngOnInit(): void {
    this.globalService.globalVar.userIsRacing = true;
    this.skipSubscription = this.skip.subscribe(() => { this.skipRace = true; this.isRaceFinished = true; });
    this.pauseSubscription = this.pause.subscribe(() => { this.pauseRace = !this.pauseRace; });

    if (this.globalService.globalVar.settings.get("skipDrawRace")) {
      this.skipRace = true;
      this.isRaceFinished = true;
    }
  }

  ngAfterViewInit() {
    if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {
      this.eventViewStartFrame = Math.round(this.globalService.globalVar.eventRaceData.segmentTimeCounter * this.frameModifier);
    }

    this.totalLegs = this.race.raceLegs.length;
    this.setupCanvas();
    this.canvasXDistanceScale = this.canvasWidth / this.race.length;

    var context = this.raceCanvas.nativeElement.getContext('2d');
    context.lineWidth = 6;

    var currentTime = 0;
    //var eventFrameTimeCounter = 0;

    this.mountainClimbPercent = this.utilityService.getRandomNumber(.3, .7);
    if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {
      if (this.globalService.globalVar.eventRaceData.mountainClimbPercent === 0)
        this.globalService.globalVar.eventRaceData.mountainClimbPercent = this.mountainClimbPercent;
      else
        this.mountainClimbPercent = this.globalService.globalVar.eventRaceData.mountainClimbPercent;
    }


    var effectiveTimeToComplete = this.race.raceUI.timeToCompleteByFrame[this.race.raceUI.timeToCompleteByFrame.length - 1];

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      //clear canvas
      var startTime = performance.now();
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      context.lineWidth = 6;

      if (!this.pauseRace) {
        //keep up with current time
        currentTime += deltaTime;

        if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {

          if (this.globalService.globalVar.eventRaceData.currentRaceSegmentCount > this.lastEventSegment) {
            this.eventViewStartFrame = 0;
            this.currentRaceFrame = 0;
            this.race = this.globalService.globalVar.eventRaceData.currentRaceSegment;
            this.newSegment = true;
          }
          else
            this.newSegment = false;

          this.lastEventSegment = this.globalService.globalVar.eventRaceData.currentRaceSegmentCount;
        }


        this.currentRaceFrame += 1;
      }

      var ignoreOverview = false;
      if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {
        //don't show race end unless the entire event is over

        if (this.globalService.getRemainingEventRaceTime() > 0)
          ignoreOverview = true;
      }

      //Two modes: Full Overview (shown at the very beginning of the race and then final view after race ends) and
      //Race Mode (keeps up with your animal as it progresses through each section)      

      if ((this.currentRaceFrame >= effectiveTimeToComplete * this.frameModifier || this.isRaceFinished || this.skipRace) &&
        !ignoreOverview) {
        this.displayOverview(context, true);
      }
      else {
        this.displayRace(context, currentTime);
      }

      var endTime = performance.now();
      //if (endTime - startTime > 16.7)
      //console.log(`Call to Draw took ${endTime - startTime} milliseconds`);
    });
  }

  setupCanvas() {
    this.raceCanvas.nativeElement.style.width = '100%';
    this.raceCanvas.nativeElement.style.height = '100%';
    this.raceCanvas.nativeElement.width = this.raceCanvas.nativeElement.offsetWidth;
    this.raceCanvas.nativeElement.height = this.raceCanvas.nativeElement.offsetHeight;
    this.canvasHeight = this.raceCanvas.nativeElement.height;
    this.canvasWidth = this.raceCanvas.nativeElement.width;

  }

  displayOverview(context: any, raceFinished: boolean): void {
    if (this.race === undefined || this.race.raceLegs == undefined)
      return;

    this.icyPatchBackgroundLines = [];
    //track color
    context.strokeStyle = "gray";

    context.globalCompositeOperation = "source-over";

    this.lengthCompleted = 0;
    this.lastPathEndingX = 0;
    this.lastPathEndingY = this.canvasHeight / 2;

    var mountainLegDistance = 0;
    var waterGoingUp = true;
    var legDistanceCompleted = 0;
    var legCounter = 0;
    var pathCounter = 0;

    this.race.raceLegs.forEach(leg => {
      if (leg.pathData !== undefined && leg.pathData.length !== 0) {
        pathCounter = 0;

        leg.pathData.forEach(path => {
          if (leg.courseType === RaceCourseTypeEnum.Flatland) {
            context.lineCap = "round";
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularFlatlandOverview(context, path, 1, 1);
            if (path.routeDesign === RaceDesignEnum.S)
              this.drawSFlatlandOverview(context, path, 1, 1);
            if (path.routeDesign === RaceDesignEnum.Bumps)
              this.drawBumpsFlatlandOverview(context, path, 1, 1);
          }
          else if (leg.courseType === RaceCourseTypeEnum.Mountain) {
            context.lineCap = "round";
            var goingUp = this.getCurrentAnimalRacingCourse(this.lengthCompleted) !== RaceCourseTypeEnum.Mountain || mountainLegDistance < leg.distance * this.mountainClimbPercent;
            if (path.routeDesign === RaceDesignEnum.Regular) {
              this.drawRegularMountainOverview(context, path, 1, this.overviewYOffsetModifier, goingUp);
            }
            if (path.routeDesign === RaceDesignEnum.Crevasse) {
              this.drawCrevasseMountainOverview(context, path, 1, this.overviewYOffsetModifier, goingUp);
            }
            if (path.routeDesign === RaceDesignEnum.Gaps) {
              this.drawGapsMountainOverview(context, path, 1, this.overviewYOffsetModifier, goingUp);
            }

            mountainLegDistance += path.length;
          }
          else if (leg.courseType === RaceCourseTypeEnum.Ocean) {
            context.lineCap = "round";
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularWaterOverview(context, path, 1, 1, waterGoingUp);
            if (path.routeDesign === RaceDesignEnum.Waves)
              this.drawWavesWaterOverview(context, path, 1, 1, waterGoingUp);
            if (path.routeDesign === RaceDesignEnum.Dive)
              this.drawDiveWaterOverview(context, path, 1, 1, waterGoingUp);

            waterGoingUp = !waterGoingUp;
          }
          if (leg.courseType === RaceCourseTypeEnum.Tundra) {
            context.lineCap = "round";
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularTundraOverview(context, path, 1, 1);
            if (path.routeDesign === RaceDesignEnum.Cavern)
              this.drawCavernTundraOverview(context, path, 1, 1);
            if (path.routeDesign === RaceDesignEnum.Hills)
              this.drawHillsTundraOverview(context, path, 1, 1);
          }
          if (leg.courseType === RaceCourseTypeEnum.Volcanic) {
            context.lineCap = "round";
            this.backgroundVolcanoYStart = this.lastPathEndingY;
            if (path.routeDesign === RaceDesignEnum.Regular || path.routeDesign === RaceDesignEnum.FirstRegular || path.routeDesign === RaceDesignEnum.LastRegular)
              this.drawRegularVolcanoOverview(context, 0, pathCounter, path, leg.pathData.length, 1, 1);
            if (path.routeDesign === RaceDesignEnum.SteppingStones)
              this.drawSteppingStonesVolcanoOverview(context, 0, pathCounter, path, leg.pathData.length, 1, 1);
          }

          this.lengthCompleted += path.length;
          pathCounter += 1;

          if (this.lastPathEndingY < 0) {
            this.yOffscreen = this.lastPathEndingY;
          }
        });
      }

      legCounter += 1;
      legDistanceCompleted += leg.distance;
    });

    if (this.yOffscreen < 0) {
      this.overviewYOffsetModifier = this.overviewYOffsetModifier / 1.25;
      this.yOffscreen = 0;
    }

    if (raceFinished) {
      this.globalService.globalVar.userIsRacing = false;

      context.globalCompositeOperation = "source-atop";

      var secondsTaken = this.race.raceUI.distanceCoveredByFrame.length;
      var completedDistance = this.race.raceUI.distanceCoveredByFrame[secondsTaken - 1] / this.race.length; //as a percentage

      var totalDistance = 0;
      var previousPercent = 0;
      var reachedCompletedDistance = false;

      this.race.raceLegs.forEach(leg => {
        if (!reachedCompletedDistance) {
          totalDistance += leg.distance;
          var legDistancePercentage = totalDistance / this.race.length;
          if (legDistancePercentage > completedDistance) {
            legDistancePercentage = completedDistance;
            reachedCompletedDistance = true;
          }
          var totalDistanceScaled = (legDistancePercentage - previousPercent) * this.canvasWidth;

          context.fillStyle = this.getAnimalDistanceColorByType(leg.courseType);
          context.fillRect(previousPercent * this.canvasWidth, 0, totalDistanceScaled, this.canvasHeight);
          previousPercent = legDistancePercentage;
        }
      });
    }

    if (this.icyPatchBackgroundLines.length > 0) {
      this.icyPatchBackgroundLines.forEach(item => {
        if (item[0] === "Hills")
          this.drawHillsBackgroundTundraOverview(context, item);
        else
          this.drawIcyPatchBackgroundTundraOverview(context, item);
      });
    }

    if (this.race.raceLegs.some(item => item.courseType === RaceCourseTypeEnum.Volcanic)) {
      var volcanicStartDistance = 0;
      var volcanicFound = false;
      this.race.raceLegs.forEach(leg => {
        //get volcano start point
        if (this.race.raceLegs.some(item => item.courseType === RaceCourseTypeEnum.Volcanic)) {
          if (leg.courseType !== RaceCourseTypeEnum.Volcanic && !volcanicFound)
            volcanicStartDistance += leg.distance;

          if (leg.courseType === RaceCourseTypeEnum.Volcanic)
            volcanicFound = true;
        }
      });

      var volcanoDistance = 0;
      volcanoDistance = this.race.raceLegs.find(item => item.courseType === RaceCourseTypeEnum.Volcanic)!.distance;

      var existingContentDestinationType = context.globalCompositeOperation;
      context.globalCompositeOperation = "destination-over";

      context.strokeStyle = "dimgray";

      this.drawBackgroundVolcano(context, 0, volcanicStartDistance, volcanicStartDistance + volcanoDistance, 1, 1);

      context.globalCompositeOperation = existingContentDestinationType;
    }


    //draw additional objects
    /*if (this.race.drawnObjects !== undefined && this.race.drawnObjects !== null && this.race.drawnObjects.length > 0) {
      var existingContentDestinationType = context.globalCompositeOperation;
      context.globalCompositeOperation = "destination-over";
      
      this.race.drawnObjects.forEach(object => {
        if (object.objectType === DrawnRaceObjectEnum.brazier) {
          this.drawBrazier(object.xDistance, context, 0, 1, 1);
        }
      });
      
    context.globalCompositeOperation = existingContentDestinationType;
    }*/
  }

  displayRace(context: any, currentTime: number): void {
    if (this.race === undefined || this.race.raceLegs == undefined)
      return;

    this.icyPatchBackgroundLines = [];

    //track color
    context.lineCap = "round";
    context.strokeStyle = "gray";

    this.lastPathEndingX = 0;
    this.lastPathEndingY = this.canvasHeight / 2;

    var xRaceModeModifier = 10;
    var yRaceModeModifier = 10;
    this.totalRaceModeXDistance = this.race.length * xRaceModeModifier;

    var currentFrame = 0;
    var raceLegs: RaceLeg[] = [];
    this.race.raceLegs.forEach(leg => {
      raceLegs.push(leg);
    });

    var isGrandPrix = false;

    if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {
      //currentFrame = this.currentRaceFrame + this.eventViewStartFrame;
      isGrandPrix = true;
      var currentFrame = Math.round(this.globalService.globalVar.eventRaceData.segmentTimeCounter * this.frameModifier);
      raceLegs.push(this.globalService.globalVar.eventRaceData.nextRaceSegment.raceLegs[0]);
    }
    else
      currentFrame = this.currentRaceFrame;

    var currentDistanceTraveled = this.race.raceUI.distanceCoveredByFrame[currentFrame];
    var currentYDistanceTraveled = 0;

    if (isGrandPrix) {
      if (this.globalService.globalVar.eventRaceData.previousRaceSegment !== undefined) {
        raceLegs.unshift(this.globalService.globalVar.eventRaceData.previousRaceSegment.raceLegs[0]);
        currentDistanceTraveled += raceLegs[0].distance;
      }
    }

    if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix)
      this.averageDistancePerSecond = this.globalService.globalVar.eventRaceData.totalDistance / this.globalService.globalVar.eventRaceData.grandPrixTimeLength;
    else
      this.averageDistancePerSecond = this.race.length / this.race.raceUI.timeToCompleteByFrame[currentFrame];
    //console.log("ADPS: " + this.averageDistancePerSecond + " Length: " + this.race.length + " TTC: " + this.race.raceUI.timeToCompleteByFrame[currentFrame]);

    var legPinpointDistance = 0;
    var previousLegDistance = 0;
    var foundLeg = false;
    var legCounter = 0;

    raceLegs.forEach(leg => {
      if (!foundLeg) {
        if (currentDistanceTraveled >= legPinpointDistance && currentDistanceTraveled < legPinpointDistance + leg.distance) {
          //we are in this leg
          foundLeg = true;
          this.currentLeg = leg;
        }

        if (!foundLeg) {
          previousLegDistance += leg.distance;
          legCounter += 1;
        }
      }

      legPinpointDistance += leg.distance;
    });

    var currentDistanceInLeg = currentDistanceTraveled - previousLegDistance;
    //console.log("Current Leg: " + legCounter + " Current Leg Distance: " + currentDistanceInLeg + " LastX: " + this.lastPathEndingX);
    var currentCrevasseDistance = 0;
    //handle translating screen up and down with Mountain race course type

    if (this.currentLeg.courseType === RaceCourseTypeEnum.Mountain) {
      var goingUpCalculatedTotal = this.currentLeg.distance * this.mountainClimbPercent;

      var offsetPathDistance = 0;
      var foundCurrentPath = false;
      var totalDistance = 0;
      this.currentLeg.pathData.forEach(path => {
        if (!foundCurrentPath) {
          if (goingUpCalculatedTotal >= totalDistance && goingUpCalculatedTotal < totalDistance + path.length) {
            foundCurrentPath = true;
            offsetPathDistance = totalDistance + path.length - goingUpCalculatedTotal;
          }

          totalDistance += path.length;
        }
      });

      foundCurrentPath = false;
      var totalPathDistance = 0;
      var pathDistanceCovered = 0;
      this.currentLeg.pathData.forEach(path => {
        if (!foundCurrentPath) {
          if (currentDistanceInLeg >= totalPathDistance && currentDistanceInLeg < totalPathDistance + path.length) {
            foundCurrentPath = true;
            pathDistanceCovered = currentDistanceInLeg - totalPathDistance;

            if (path.routeDesign === RaceDesignEnum.Crevasse) {
              var scaledHalfPath = (path.length / 2) * 3;
              var scaledPathCovered = pathDistanceCovered * 3;
              if (pathDistanceCovered < path.length / 2)
                currentCrevasseDistance -= scaledPathCovered;
              else
                currentCrevasseDistance -= scaledHalfPath - (scaledPathCovered - scaledHalfPath);
            }
          }

          totalPathDistance += path.length;
        }
      });

      var goingUpTotal = goingUpCalculatedTotal + offsetPathDistance;

      if (currentDistanceInLeg < goingUpTotal)
        currentYDistanceTraveled = currentDistanceInLeg + currentCrevasseDistance;
      else
        currentYDistanceTraveled = goingUpTotal - (currentDistanceInLeg - goingUpTotal) + currentCrevasseDistance;

      this.mountainEndingY = currentYDistanceTraveled;

      //console.log("Current Y Dist Traveled: " + currentYDistanceTraveled + " Saved Y: " + this.globalService.globalVar.eventRaceData.mountainEndingY +
      //"GoingUpCalc: " + goingUpCalculatedTotal + " OffsetPathDistance: " + offsetPathDistance + "Dist In Leg: " + currentDistanceInLeg + " UpTotal: " + goingUpTotal);

      //console.log(currentFrame + " vs " + this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed + ": " + currentYDistanceTraveled);
      if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix &&
        currentFrame === this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed - 2) {
        this.globalService.globalVar.eventRaceData.mountainEndingY = currentYDistanceTraveled;
      }
    }

    //if the above code is skipped, set Y equal to what mountain ended on
    if (!this.race.raceLegs.some(item => item.courseType === RaceCourseTypeEnum.Mountain))
      this.mountainEndingY = 0;

    currentYDistanceTraveled = this.mountainEndingY;
    if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {
      /*if (this.globalService.globalVar.eventRaceData.mountainEndingY === 0 && this.currentLeg.courseType !== RaceCourseTypeEnum.Mountain)
      {    
        this.lastPathEndingY = this.canvasHeight / 2;        
      }*/

      currentYDistanceTraveled += this.globalService.globalVar.eventRaceData.mountainEndingY;
      if (this.globalService.globalVar.eventRaceData.previousRaceSegment !== null &&
        this.globalService.globalVar.eventRaceData.previousRaceSegment !== undefined &&
        this.currentLeg.courseType !== RaceCourseTypeEnum.Mountain &&
        this.globalService.globalVar.eventRaceData.previousRaceSegment.raceLegs[0].courseType !== RaceCourseTypeEnum.Mountain) {
        currentYDistanceTraveled = 0;
      }
    }
    //console.log("Current Y Dist Traveled: " + currentYDistanceTraveled + " Saved Y: " + this.globalService.globalVar.eventRaceData.mountainEndingY + " Mountain Ending Y: " + this.mountainEndingY);

    if (this.currentLeg.courseType === RaceCourseTypeEnum.Volcanic && !this.pauseRace) {
      //add to currentYDistanceTraveled here as necessary
      //needs to be percentage based on radius of ellipse and distance covered
      //it is X because the ellipse has been flipped
      var xOffsetDistance = this.currentLeg.pathData[0].length / xRaceModeModifier;
      if (currentDistanceInLeg > xOffsetDistance) {
        var radiusOfOvalX = this.currentLeg.distance / this.volcanoRadiusXModifier;
        var offsetPercent = xOffsetDistance / this.currentLeg.distance;
        var percentOfLegComplete = currentDistanceInLeg / this.currentLeg.distance;
        var halfwayPointPercentage = ((this.currentLeg.distance - (2 * xOffsetDistance)) / this.currentLeg.distance) / 2;

        if (percentOfLegComplete > offsetPercent && percentOfLegComplete < (1 - offsetPercent)) {
          var percentScale = 100 / (100 - 2 * offsetPercent);
          var truePercent = 0;
          if (percentOfLegComplete > .5) {
            truePercent = 2 * (halfwayPointPercentage - (((percentOfLegComplete - offsetPercent) * percentScale) - halfwayPointPercentage));
          }
          else {
            truePercent = 2 * ((percentOfLegComplete - offsetPercent) * percentScale);
          }

          var a = radiusOfOvalX;
          var b = 1.05;
          var c = -(radiusOfOvalX);
          var factor = (a * (Math.pow(b, -(truePercent * 100))) + c);

          this.volcanoYOffset = factor;
        }
      }
    }

    currentYDistanceTraveled += this.volcanoYOffset;
    //current distance traveled, scaled with the canvas and modifier, minus getting the coloring in the middle of the screen
    var xDistanceOffset = (currentDistanceTraveled * this.canvasXDistanceScale * xRaceModeModifier) - (this.canvasWidth / 2);
    var yDistanceOffset = currentYDistanceTraveled * this.canvasXDistanceScale * yRaceModeModifier;
    //could make currentDistanceTraveledY and have that be added to by ySteepness and checking that leg is climb for currentdistainceinleg

    this.visibleDistanceXLeft = xDistanceOffset;
    this.visibleDistanceXRight = xDistanceOffset + (this.canvasWidth);
    //console.log("Visible X Distance: " + this.visibleDistanceXLeft + " , " + this.visibleDistanceXRight);    

    context.globalCompositeOperation = "source-over";

    if ((currentDistanceTraveled >= this.race.length || currentFrame > this.race.raceUI.distanceCoveredByFrame.length) &&
      !isGrandPrix) {
      this.isRaceFinished = true;
      return;
    }

    var mountainLegDistance = 0; //used to determine climbing distance
    var waterGoingUp = true;
    var legDistanceCompleted = 0;
    var pathCounter = 0;

    raceLegs.forEach(leg => {
      if (leg.pathData !== undefined && leg.pathData.length !== 0) {
        pathCounter = 0;

        if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix)
          mountainLegDistance = 0;

        leg.pathData.forEach(path => {
          if (leg.courseType === RaceCourseTypeEnum.Flatland) {
            //this.grandPrixMountainYReset();

            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.S)
              this.drawSFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Bumps)
              this.drawBumpsFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
          }
          else if (leg.courseType === RaceCourseTypeEnum.Mountain) {
            //context.lineCap = "round";
            var goingUp = mountainLegDistance < leg.distance * this.mountainClimbPercent;

            if (path.routeDesign === RaceDesignEnum.Regular) {
              this.drawRegularMountainOverview(context, path, xRaceModeModifier, yRaceModeModifier, goingUp, xDistanceOffset, yDistanceOffset);
            }
            if (path.routeDesign === RaceDesignEnum.Crevasse) {
              this.drawCrevasseMountainOverview(context, path, xRaceModeModifier, yRaceModeModifier, goingUp, xDistanceOffset, yDistanceOffset);
            }
            if (path.routeDesign === RaceDesignEnum.Gaps) {
              this.drawGapsMountainOverview(context, path, xRaceModeModifier, yRaceModeModifier, goingUp, xDistanceOffset, yDistanceOffset);
            }

            mountainLegDistance += path.length;
            this.grandPrixMountainYReset(legCounter);
          }
          else if (leg.courseType === RaceCourseTypeEnum.Ocean) {
            //this.grandPrixMountainYReset();
            //context.lineCap = "round";
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularWaterOverview(context, path, xRaceModeModifier, yRaceModeModifier, waterGoingUp, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Waves)
              this.drawWavesWaterOverview(context, path, xRaceModeModifier, yRaceModeModifier, waterGoingUp, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Dive)
              this.drawDiveWaterOverview(context, path, xRaceModeModifier, yRaceModeModifier, waterGoingUp, xDistanceOffset, yDistanceOffset);

            waterGoingUp = !waterGoingUp;
          }
          if (leg.courseType === RaceCourseTypeEnum.Tundra) {
            //this.grandPrixMountainYReset();
            //context.lineCap = "round";
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularTundraOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Cavern)
              this.drawCavernTundraOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Hills)
              this.drawHillsTundraOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
          }
          if (leg.courseType === RaceCourseTypeEnum.Volcanic) {
            //this.grandPrixMountainYReset();
            //context.lineCap = "round";
            this.backgroundVolcanoYStart = this.lastPathEndingY;
            if (path.routeDesign === RaceDesignEnum.Regular || path.routeDesign === RaceDesignEnum.FirstRegular || path.routeDesign === RaceDesignEnum.LastRegular)
              this.drawRegularVolcanoOverview(context, 0, pathCounter, path, leg.pathData.length, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.SteppingStones)
              this.drawSteppingStonesVolcanoOverview(context, 0, pathCounter, path, leg.pathData.length, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
          }

          pathCounter += 1;
          this.lengthCompleted += path.length;
        });
      }

      legDistanceCompleted += leg.distance;
      legCounter += 1;
    });

    context.globalCompositeOperation = "source-atop";

    //check to see if breakpoint is visible on screen

    var percentOfVisibleDistance = 0;
    var legScaledEndPoint = previousLegDistance * this.canvasXDistanceScale * xRaceModeModifier;
    var currentLegIndex = raceLegs.indexOf(this.currentLeg);
    var previousLeg = null;
    if (currentLegIndex > 0)
      previousLeg = raceLegs[currentLegIndex - 1];

    if (previousLeg !== undefined && previousLeg !== null &&
      legScaledEndPoint >= this.visibleDistanceXLeft && legScaledEndPoint <= this.visibleDistanceXRight) {
      var totalVisibleDistance = this.visibleDistanceXRight - this.visibleDistanceXLeft;
      var amountOfVisibleDistance = legScaledEndPoint - this.visibleDistanceXLeft;
      percentOfVisibleDistance = amountOfVisibleDistance / totalVisibleDistance;

      context.fillStyle = this.getAnimalDistanceColorByType(previousLeg.courseType);
      context.fillRect(0, 0, (this.canvasWidth * percentOfVisibleDistance), this.canvasHeight);
      context.fillStyle = this.getAnimalDistanceColorByType(this.currentLeg.courseType);
      context.fillRect((this.canvasWidth * percentOfVisibleDistance), 0, (this.canvasWidth / 2) - (this.canvasWidth * percentOfVisibleDistance), this.canvasHeight);
    }
    else {
      context.fillStyle = this.getAnimalDistanceColor(currentDistanceTraveled, raceLegs);
      context.fillRect(0, 0, this.canvasWidth / 2, this.canvasHeight);
    }

    var racerColor = this.getAnimalRacerColor(currentDistanceTraveled, raceLegs);
    if (this.race.raceUI.racerEffectByFrame[currentFrame] === RacerEffectEnum.LostFocus ||
      this.race.raceUI.racerEffectByFrame[currentFrame] === RacerEffectEnum.LostStamina ||
      this.race.raceUI.racerEffectByFrame[currentFrame] === RacerEffectEnum.Stumble) {
      racerColor = this.utilityService.shadeColor(racerColor, -90);
    }
    if (this.race.raceUI.racerEffectByFrame[currentFrame] === RacerEffectEnum.Burst) {
      racerColor = this.utilityService.shadeColor(racerColor, 90);
    }
    context.fillStyle = racerColor;

    context.fillRect(this.canvasWidth / 2 - 5, 0, 5, this.canvasHeight);

    //Draw background effects -- still covered by other racers
    if (this.icyPatchBackgroundLines.length > 0) {
      this.icyPatchBackgroundLines.forEach(item => {
        if (item[0] === "Hills")
          this.drawHillsBackgroundTundraOverview(context, item);
        else
          this.drawIcyPatchBackgroundTundraOverview(context, item);
      });
    }

    context.globalCompositeOperation = "source-atop";

    //draw additional racers
    //average speed
    var averageDistance = (this.averageDistancePerSecond / this.frameModifier) * currentFrame;
    if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {
      var timePassed = this.globalService.globalVar.eventRaceData.grandPrixTimeLength - this.globalService.getRemainingEventRaceTime();
      var averageDistancePassed = this.averageDistancePerSecond * timePassed;
      averageDistance += averageDistancePassed;
    }

    //console.log("Racer at " + averageDistance + " You're at " + (currentDistanceTraveled + this.globalService.globalVar.eventRaceData.distanceCovered));
    var averageDistanceScaled = (averageDistance * this.canvasXDistanceScale * xRaceModeModifier);
    this.drawRacer(context, averageDistanceScaled, "black");

    if (this.race.localRaceType !== LocalRaceTypeEnum.Track) {
      var moneyMarkIsUnlocked = this.lookupService.getResourceByName("Money Mark");
      if (moneyMarkIsUnlocked > 0) {
        var defaultMoneyMarkPace = .75;
        var moneyMarkPace = this.globalService.globalVar.modifiers.find(item => item.text === "moneyMarkPaceModifier");
        if (moneyMarkPace !== undefined && moneyMarkPace !== null)
          defaultMoneyMarkPace = moneyMarkPace.value;

        var moneyMarkDistancePerSecond = this.race.length / (this.race.raceUI.timeToCompleteByFrame[currentFrame] * defaultMoneyMarkPace);
        var moneyMarkDistance = (moneyMarkDistancePerSecond / this.frameModifier) * currentFrame;

        var moneyMarkDistanceScaled = (moneyMarkDistance * this.canvasXDistanceScale * xRaceModeModifier);
        this.drawRacer(context, moneyMarkDistanceScaled, "gold");
      }
    }
    else {
      //only need 11 racers as the average distance is already drawn above
      var totalRacers = 11;
      var trackPaceModifierValue = .25;
      var trackPaceModifierValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingTrackPaceModifier");
      if (trackPaceModifierValuePair !== undefined)
        trackPaceModifierValue = trackPaceModifierValuePair.value;

      for (var j = 0; j < totalRacers; j++) {
        var paceModifier = 1 + (trackPaceModifierValue * (j + 1));
        var racerDistancePerSecond = this.race.length / (this.race.raceUI.timeToCompleteByFrame[currentFrame] / paceModifier);
        var racerDistance = (racerDistancePerSecond / this.frameModifier) * currentFrame;

        var racerDistanceScaled = (racerDistance * this.canvasXDistanceScale * xRaceModeModifier);
        var trackRacerColor = this.getTrackRacerColor(j);
        this.drawRacer(context, racerDistanceScaled, trackRacerColor);
      }
    }

    this.drawBreakpoints(context, xRaceModeModifier, raceLegs);

    if (raceLegs.some(item => item.courseType === RaceCourseTypeEnum.Volcanic)) {
      var volcanicStartDistance = 0;
      var volcanicFound = false;
      raceLegs.forEach(leg => {
        //get volcano start point
        if (raceLegs.some(item => item.courseType === RaceCourseTypeEnum.Volcanic)) {
          if (leg.courseType !== RaceCourseTypeEnum.Volcanic && !volcanicFound)
            volcanicStartDistance += leg.distance;

          if (leg.courseType === RaceCourseTypeEnum.Volcanic)
            volcanicFound = true;
        }
      });

      var volcanoDistance = 0;
      volcanoDistance = raceLegs.find(item => item.courseType === RaceCourseTypeEnum.Volcanic)!.distance;

      var existingContentDestinationType = context.globalCompositeOperation;
      context.globalCompositeOperation = "destination-over";

      context.strokeStyle = "dimgray";

      //Draw background effects -- not covered by other racers      
      this.drawBackgroundVolcano(context, currentFrame, volcanicStartDistance, volcanicStartDistance + volcanoDistance, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);

      context.globalCompositeOperation = existingContentDestinationType;
    }


    //draw additional objects
    /*if (this.race.drawnObjects !== undefined && this.race.drawnObjects !== null && this.race.drawnObjects.length > 0) {
      var existingContentDestinationType = context.globalCompositeOperation;
      context.globalCompositeOperation = "destination-over";
      
      this.race.drawnObjects.forEach(object => {
        if (object.objectType === DrawnRaceObjectEnum.brazier) {
          this.drawBrazier(object.xDistance, context, currentFrame, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
        }
      });
      
      context.globalCompositeOperation = existingContentDestinationType;
    }*/
  }

  getAnimalDistanceColor(currentDistanceTraveled: number, raceLegs?: RaceLeg[]) {
    var color = "";
    var totalDistance = 0;

    if (raceLegs === undefined || raceLegs === null)
      raceLegs = this.race.raceLegs;

    raceLegs.forEach(leg => {
      if (currentDistanceTraveled >= totalDistance && currentDistanceTraveled < totalDistance + leg.distance) {
        //we are in this leg        
        if (leg.courseType === RaceCourseTypeEnum.Flatland)
          color = "#7d3f00";//"#8f1c14";
        if (leg.courseType === RaceCourseTypeEnum.Mountain) {
          color = "#1b630d";
        }
        if (leg.courseType === RaceCourseTypeEnum.Ocean) {
          if (this.themeService.getActiveThemeName() === "night")
            color = "#5044ab";
          else
            color = "#16148f";
        }
        if (leg.courseType === RaceCourseTypeEnum.Tundra)
          color = "#28809c";
        if (leg.courseType === RaceCourseTypeEnum.Volcanic)
          color = "#8f1a1a";
      }

      totalDistance += leg.distance;
    });

    return color;
  }

  getAnimalDistanceColorByType(courseType: RaceCourseTypeEnum) {
    var color = "";

    if (courseType === RaceCourseTypeEnum.Flatland)
      color = "#7d3f00";
    if (courseType === RaceCourseTypeEnum.Mountain) {
      //if (this.themeService.getActiveThemeName() === "light")
      color = "#1b630d";
      //else
      //color = "#4d6b48";
    }
    if (courseType === RaceCourseTypeEnum.Ocean) {
      if (this.themeService.getActiveThemeName() === "night")
        color = "#5044ab";
      else
        color = "#16148f";
    }
    if (courseType === RaceCourseTypeEnum.Tundra)
      color = "#28809c";
    if (courseType === RaceCourseTypeEnum.Volcanic)
      color = "#8f1a1a";

    return color;
  }

  getAnimalRacerColor(currentDistanceTraveled: number, raceLegs?: RaceLeg[]) {
    var color = "";
    var totalDistance = 0;

    if (raceLegs === undefined || raceLegs === null)
      raceLegs = this.race.raceLegs;

    raceLegs.forEach(leg => {
      if (currentDistanceTraveled >= totalDistance && currentDistanceTraveled < totalDistance + leg.distance) {
        //we are in this leg
        if (leg.courseType === RaceCourseTypeEnum.Flatland) {
          if (this.themeService.getActiveThemeName() === "night")
            color = "#E18B07";
          else if (this.themeService.getActiveThemeName() === "light")
            color = "#c66900";
          else
            color = "#c66900";
        }
        if (leg.courseType === RaceCourseTypeEnum.Mountain) {
          if (this.themeService.getActiveThemeName() === "night")
            color = "#30b001";
          else if (this.themeService.getActiveThemeName() === "light")
            color = "#279113";
          else
            color = "#279113";
        }
        if (leg.courseType === RaceCourseTypeEnum.Ocean) {
          if (this.themeService.getActiveThemeName() === "night")
            color = "#9289CF";
          else if (this.themeService.getActiveThemeName() === "light")
            color = "#0000FF";
          else
            color = "#0000FF";
        }
        if (leg.courseType === RaceCourseTypeEnum.Tundra) {
          if (this.themeService.getActiveThemeName() === "night")
            color = "#019DDE";
          else if (this.themeService.getActiveThemeName() === "light")
            color = "#1CA1C9";
          else
            color = "#1CA1C9";
        }
        if (leg.courseType === RaceCourseTypeEnum.Volcanic) {
          if (this.themeService.getActiveThemeName() === "night")
            color = "#E56C6E";
          else if (this.themeService.getActiveThemeName() === "light")
            color = "#D92525";
          else
            color = "#D92525";
        }
      }

      totalDistance += leg.distance;
    });

    return color;
  }

  getTrackRacerColor(count: number) {
    var color = "";

    if (count === 0)
      color = "#cfc800";
    if (count === 1)
      color = "#00cf68";
    if (count === 2)
      color = "#cf00c5";
    if (count === 3)
      color = "#cfb8e6";
    if (count === 4)
      color = "#4a1d1d";
    if (count === 5)
      color = "#1b5054";
    if (count === 6)
      color = "#541b3c";
    if (count === 7)
      color = "#aeb85a";
    if (count === 8)
      color = "#ffffff";
    if (count === 9)
      color = "#01253b";
    if (count === 10)
      color = "#790dde";

    return color;
  }

  getCurrentAnimalRacingCourse(currentDistanceTraveled: number): RaceCourseTypeEnum {
    var courseType: RaceCourseTypeEnum;
    courseType = RaceCourseTypeEnum.Flatland;
    var totalDistance = 0;
    this.race.raceLegs.forEach(leg => {
      if (currentDistanceTraveled >= totalDistance && currentDistanceTraveled < totalDistance + leg.distance) {
        //we are in this leg
        courseType = leg.courseType;
      }

      totalDistance += leg.distance;
    });

    return courseType;
  }

  getNextAnimalRacingCourse(currentLeg: RaceLeg): RaceCourseTypeEnum {
    var courseType: RaceCourseTypeEnum;
    courseType = RaceCourseTypeEnum.Flatland;

    var indexOfLeg = this.race.raceLegs.indexOf(currentLeg);

    if (this.race.raceLegs.length > indexOfLeg) {
      var nextLeg = this.race.raceLegs[indexOfLeg + 1];
      courseType = nextLeg.courseType;
    }

    return courseType;
  }

  drawRacer(context: any, scaledDistanceInRace: number, color: string): void {
    var percentOfVisibleDistance = 0;
    //get visible distance on the canvas currently
    //if the average distance is within that range, display it as a percentage
    if (scaledDistanceInRace >= this.visibleDistanceXLeft && scaledDistanceInRace <= this.visibleDistanceXRight) {
      var totalVisibleDistance = this.visibleDistanceXRight - this.visibleDistanceXLeft;
      var amountOfVisibleDistance = scaledDistanceInRace - this.visibleDistanceXLeft;
      percentOfVisibleDistance = amountOfVisibleDistance / totalVisibleDistance;

      context.fillStyle = color;
      context.fillRect((this.canvasWidth * percentOfVisibleDistance) - 5, 0, 5, this.canvasHeight);
    }
  }

  drawBreakpoints(context: any, xRaceModeModifier: number, raceLegs?: RaceLeg[]): void {
    var distanceSum = 0;

    if (raceLegs === undefined || raceLegs === null)
      raceLegs = this.race.raceLegs;

    for (var i = 0; i < raceLegs.length; i++) {
      var leg = raceLegs[i];
      var nextLeg = null;
      if (i < raceLegs.length - 1)
        nextLeg = raceLegs[i + 1];

      var percentOfVisibleDistance = 0;
      var legScaledEndPoint = (distanceSum + leg.distance) * this.canvasXDistanceScale * xRaceModeModifier;

      if (legScaledEndPoint >= this.visibleDistanceXLeft && legScaledEndPoint <= this.visibleDistanceXRight) {
        var totalVisibleDistance = this.visibleDistanceXRight - this.visibleDistanceXLeft;
        var amountOfVisibleDistance = legScaledEndPoint - this.visibleDistanceXLeft;
        percentOfVisibleDistance = amountOfVisibleDistance / totalVisibleDistance;

        if (nextLeg !== null)
          context.fillStyle = this.getAnimalDistanceColorByType(nextLeg.courseType);
        else
          context.fillStyle = "pink"; //finish flag
        context.fillRect((this.canvasWidth * percentOfVisibleDistance) - 5, 0, 5, this.canvasHeight);
      }

      distanceSum += leg.distance;
    }
  }

  drawRegularFlatlandOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    context.beginPath();
    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + yDistanceOffset);
    context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + yDistanceOffset);
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawSFlatlandOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + yDistanceOffset;

    var xRegularOffset = .04 * horizontalLength;//20;
    var xCurveOffset = .23 * horizontalLength;//115;
    var yCurveOffset = xCurveOffset * 1.2173;

    var curve1Point1XOffset = .04 * horizontalLength;//20;
    var curve1Point1YOffset = yCurveOffset;
    var curve1Point2XOffset = curve1Point1XOffset + xCurveOffset;
    var curve1Point2YOffset = yCurveOffset;

    var curve2Point1XOffset = curve1Point2XOffset + xCurveOffset;
    var curve2Point1YOffset = yCurveOffset;
    var curve2Point2XOffset = curve2Point1XOffset;
    var curve2Point2YOffset = startingY;

    var curve3Point1XOffset = curve2Point1XOffset;
    var curve3Point1YOffset = yCurveOffset;
    var curve3Point2XOffset = curve3Point1XOffset + xCurveOffset;
    var curve3Point2YOffset = yCurveOffset;

    var curve4Point1XOffset = curve3Point2XOffset + xCurveOffset;
    var curve4Point1YOffset = yCurveOffset;
    var curve4Point2XOffset = curve4Point1XOffset;
    var curve4Point2YOffset = startingY;

    context.beginPath();
    context.moveTo(startingX, startingY);
    context.lineTo(startingX + xRegularOffset, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset, startingY);
    context.bezierCurveTo(startingX + xRegularOffset, startingY, startingX + curve1Point1XOffset, startingY + curve1Point1YOffset, startingX + curve1Point2XOffset, startingY + curve1Point2YOffset);
    context.bezierCurveTo(startingX + curve1Point2XOffset, startingY + curve1Point2YOffset, startingX + curve2Point1XOffset, startingY + curve2Point1YOffset, startingX + curve2Point2XOffset, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + curve2Point2XOffset, startingY);
    context.bezierCurveTo(startingX + curve2Point2XOffset, startingY, startingX + curve3Point1XOffset, startingY - curve3Point1YOffset, startingX + curve3Point2XOffset, startingY - curve3Point2YOffset);
    context.bezierCurveTo(startingX + curve3Point2XOffset, startingY - curve3Point2YOffset, startingX + curve4Point1XOffset, startingY - curve4Point1YOffset, startingX + curve4Point1XOffset, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + curve4Point1XOffset, startingY);
    context.lineTo(startingX + curve4Point2XOffset + xRegularOffset, startingY);

    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + curve4Point2XOffset + xRegularOffset;
    //ending Y doesn't change
  }

  drawBumpsFlatlandOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + yDistanceOffset;
    var xRegularOffset = .04 * horizontalLength; //straight lines on either side

    var xFullBump = .115 * horizontalLength;
    var yFullBump = xFullBump / 3;

    context.beginPath();
    context.moveTo(startingX, startingY);
    context.lineTo(startingX + xRegularOffset, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset, startingY);
    context.lineTo(startingX + xRegularOffset + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 2 * xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + 2 * xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + 2 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 3 * xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + 3 * xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + 3 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 4 * xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + 4 * xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + 4 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 5 * xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + 5 * xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + 5 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 6 * xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + 6 * xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + 6 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 7 * xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + 7 * xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + 7 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 8 * xFullBump, startingY);
    context.stroke();

    context.beginPath();
    context.moveTo(startingX + xRegularOffset + 8 * xFullBump, startingY);
    context.lineTo(startingX + xRegularOffset + 8 * xFullBump + xRegularOffset, startingY);
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawRegularMountainOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, goingUp: boolean, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;
    var verticalLength = (path.length / this.race.length) * this.canvasWidth * yRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    context.beginPath();
    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + yDistanceOffset);

    if (goingUp) {
      context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY - verticalLength + yDistanceOffset);
    }
    else {
      context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + verticalLength + yDistanceOffset);
    }
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
    this.lastPathEndingY = goingUp ? this.lastPathEndingY - verticalLength : this.lastPathEndingY + verticalLength;
  }

  drawCrevasseMountainOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, goingUp: boolean, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;
    var verticalLength = (path.length / this.race.length) * this.canvasWidth * yRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + yDistanceOffset;

    var regularOffset = 0; //straight lines on either side
    var regularDistanceX = horizontalLength;
    var regularDistanceY = verticalLength;
    var crevasseLength = regularDistanceY * 2;

    context.beginPath();
    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + yDistanceOffset);

    if (goingUp) { //small x, big x
      //crevasse length should be determined by the big x
      crevasseLength = regularDistanceY * 2 - (regularDistanceY - 2 * regularOffset);

      context.lineTo(startingX + regularOffset, startingY - regularOffset);
      context.lineTo(startingX + regularOffset + regularDistanceX / 2, startingY + crevasseLength - regularOffset);
      context.lineTo(startingX + regularOffset + regularDistanceX, startingY - regularDistanceY - regularOffset);
      context.lineTo(startingX + 2 * regularOffset + regularDistanceX, startingY - regularDistanceY - 2 * regularOffset);
    }
    else { //big x, small x
      context.lineTo(startingX + regularOffset, startingY + regularOffset);
      context.lineTo(startingX + regularOffset + regularDistanceX / 2, startingY + crevasseLength + regularOffset);
      context.lineTo(startingX + regularOffset + regularDistanceX, startingY + regularDistanceY + regularOffset);
      context.lineTo(startingX + 2 * regularOffset + regularDistanceX, startingY + regularDistanceY + 2 * regularOffset);
    }
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
    this.lastPathEndingY = goingUp ? this.lastPathEndingY - verticalLength : this.lastPathEndingY + verticalLength;
  }

  drawGapsMountainOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, goingUp: boolean, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;
    var verticalLength = (path.length / this.race.length) * this.canvasWidth * yRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + yDistanceOffset;

    var regularOffset = .04 * horizontalLength; //straight lines on either side
    var gapSizeX = horizontalLength * .115;
    var gapSizeY = verticalLength * .115;
    var regularOffsetY = .04 * verticalLength;

    context.beginPath();
    context.moveTo(startingX, startingY);

    if (goingUp) {
      context.lineTo(startingX + regularOffset, startingY - regularOffsetY);
      context.moveTo(startingX + gapSizeX + regularOffset, startingY - gapSizeY - regularOffsetY);
      context.lineTo(startingX + 2 * gapSizeX + regularOffset, startingY - 2 * gapSizeY - regularOffsetY);
      context.moveTo(startingX + 3 * gapSizeX + regularOffset, startingY - 3 * gapSizeY - regularOffsetY);
      context.lineTo(startingX + 4 * gapSizeX + regularOffset, startingY - 4 * gapSizeY - regularOffsetY);
      context.moveTo(startingX + 5 * gapSizeX + regularOffset, startingY - 5 * gapSizeY - regularOffsetY);
      context.lineTo(startingX + 6 * gapSizeX + regularOffset, startingY - 6 * gapSizeY - regularOffsetY);
      context.moveTo(startingX + 7 * gapSizeX + regularOffset, startingY - 7 * gapSizeY - regularOffsetY);
      context.lineTo(startingX + 8 * gapSizeX + regularOffset, startingY - 8 * gapSizeY - regularOffsetY);
      context.lineTo(startingX + 8 * gapSizeX + 2 * regularOffset, startingY - 8 * gapSizeY - 2 * regularOffsetY);
    }
    else {
      context.lineTo(startingX + regularOffset, startingY + regularOffsetY);
      context.moveTo(startingX + gapSizeX + regularOffset, startingY + gapSizeY + regularOffsetY);
      context.lineTo(startingX + 2 * gapSizeX + regularOffset, startingY + 2 * gapSizeY + regularOffsetY);
      context.moveTo(startingX + 3 * gapSizeX + regularOffset, startingY + 3 * gapSizeY + regularOffsetY);
      context.lineTo(startingX + 4 * gapSizeX + regularOffset, startingY + 4 * gapSizeY + regularOffsetY);
      context.moveTo(startingX + 5 * gapSizeX + regularOffset, startingY + 5 * gapSizeY + regularOffsetY);
      context.lineTo(startingX + 6 * gapSizeX + regularOffset, startingY + 6 * gapSizeY + regularOffsetY);
      context.moveTo(startingX + 7 * gapSizeX + regularOffset, startingY + 7 * gapSizeY + regularOffsetY);
      context.lineTo(startingX + 8 * gapSizeX + regularOffset, startingY + 8 * gapSizeY + regularOffsetY);
      context.lineTo(startingX + 8 * gapSizeX + 2 * regularOffset, startingY + 8 * gapSizeY + 2 * regularOffsetY);
    }
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
    this.lastPathEndingY = goingUp ? this.lastPathEndingY - verticalLength : this.lastPathEndingY + verticalLength;
  }

  drawRegularWaterOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, goingUp: boolean, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + yDistanceOffset;
    var horizontalDistanceBetweenPoints = horizontalLength / 3;
    var waveAmplitude = horizontalLength / 6;

    var bezierX1 = startingX + horizontalDistanceBetweenPoints;
    var bezierY1 = goingUp ? startingY + waveAmplitude : startingY - waveAmplitude;
    var bezierX2 = startingX + (2 * horizontalDistanceBetweenPoints);
    var bezierY2 = goingUp ? startingY + waveAmplitude : startingY - waveAmplitude;
    var finishPointX = startingX + (3 * horizontalDistanceBetweenPoints);
    var finishPointY = startingY;

    context.beginPath();
    context.moveTo(startingX, startingY);
    context.bezierCurveTo(bezierX1, bezierY1, bezierX2, bezierY2, finishPointX, finishPointY);
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawWavesWaterOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, goingUp: boolean, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + yDistanceOffset;
    var horizontalWaveLength = horizontalLength / 3;
    var waveHeight = horizontalLength / 3;

    var wave1BezierX1 = startingX + horizontalWaveLength / 3;
    var wave1BezierY1 = startingY;
    var wave1BezierX2 = startingX + horizontalWaveLength / 3;
    var wave1BezierY2 = startingY - waveHeight;
    var wave1FinishPointX = startingX + horizontalWaveLength;
    var wave1FinishPointY = startingY - (3 / 5) * waveHeight;

    context.beginPath();
    context.moveTo(startingX, startingY);
    context.bezierCurveTo(wave1BezierX1, wave1BezierY1, wave1BezierX2, wave1BezierY2, wave1FinishPointX, wave1FinishPointY);
    context.stroke();

    var wave1BezierX3 = wave1FinishPointX - horizontalWaveLength / 3;
    var wave1BezierY3 = wave1FinishPointY - (waveHeight / 10);
    var wave1BezierX4 = wave1FinishPointX - horizontalWaveLength / 3;
    var wave1BezierY4 = wave1FinishPointY + (3 / 5) * waveHeight;
    var wave1FinishPoint2X = wave1FinishPointX;
    var wave1FinishPoint2Y = startingY;

    context.beginPath();
    context.moveTo(wave1FinishPointX, wave1FinishPointY);
    context.bezierCurveTo(wave1BezierX3, wave1BezierY3, wave1BezierX4, wave1BezierY4, wave1FinishPoint2X, wave1FinishPoint2Y);
    context.stroke();

    //wave 2
    var wave2BezierX1 = wave1FinishPoint2X + horizontalWaveLength / 3;
    var wave2BezierY1 = wave1FinishPoint2Y;
    var wave2BezierX2 = wave1FinishPoint2X + horizontalWaveLength / 3;
    var wave2BezierY2 = wave1FinishPoint2Y - waveHeight;
    var wave2FinishPointX = wave1FinishPoint2X + horizontalWaveLength;
    var wave2FinishPointY = wave1FinishPoint2Y - (3 / 5) * waveHeight;

    context.beginPath();
    context.moveTo(wave1FinishPoint2X, wave1FinishPoint2Y);
    context.bezierCurveTo(wave2BezierX1, wave2BezierY1, wave2BezierX2, wave2BezierY2, wave2FinishPointX, wave2FinishPointY);
    context.stroke();

    var wave2BezierX3 = wave2FinishPointX - horizontalWaveLength / 3;
    var wave2BezierY3 = wave2FinishPointY - (waveHeight / 10);
    var wave2BezierX4 = wave2FinishPointX - horizontalWaveLength / 3;
    var wave2BezierY4 = wave2FinishPointY + (3 / 5) * waveHeight;
    var wave2FinishPoint2X = wave2FinishPointX;
    var wave2FinishPoint2Y = startingY;

    context.beginPath();
    context.moveTo(wave2FinishPointX, wave2FinishPointY);
    context.bezierCurveTo(wave2BezierX3, wave2BezierY3, wave2BezierX4, wave2BezierY4, wave2FinishPoint2X, wave2FinishPoint2Y);
    context.stroke();

    //wave 3
    var wave3BezierX1 = wave2FinishPoint2X + horizontalWaveLength / 3;
    var wave3BezierY1 = wave2FinishPoint2Y;
    var wave3BezierX2 = wave2FinishPoint2X + horizontalWaveLength / 3;
    var wave3BezierY2 = wave2FinishPoint2Y - waveHeight;
    var wave3FinishPointX = wave2FinishPoint2X + horizontalWaveLength;
    var wave3FinishPointY = wave2FinishPoint2Y - (3 / 5) * waveHeight;

    context.beginPath();
    context.moveTo(wave2FinishPoint2X, wave2FinishPoint2Y);
    context.bezierCurveTo(wave3BezierX1, wave3BezierY1, wave3BezierX2, wave3BezierY2, wave3FinishPointX, wave3FinishPointY);
    context.stroke();

    var wave3BezierX3 = wave3FinishPointX - horizontalWaveLength / 3;
    var wave3BezierY3 = wave3FinishPointY - (waveHeight / 10);
    var wave3BezierX4 = wave3FinishPointX - horizontalWaveLength / 3;
    var wave3BezierY4 = wave3FinishPointY + (3 / 5) * waveHeight;
    var wave3FinishPoint2X = wave3FinishPointX;
    var wave3FinishPoint2Y = startingY;

    context.beginPath();
    context.moveTo(wave3FinishPointX, wave3FinishPointY);
    context.bezierCurveTo(wave3BezierX3, wave3BezierY3, wave3BezierX4, wave3BezierY4, wave3FinishPoint2X, wave3FinishPoint2Y);
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawDiveWaterOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, goingUp: boolean, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + yDistanceOffset;
    var horizontalDistanceBetweenPoints = horizontalLength / 3;
    var waveAmplitude = horizontalLength / 2;

    var bezierX1 = startingX;
    var bezierY1 = goingUp ? startingY + waveAmplitude * 2 : startingY - waveAmplitude * 2;
    var bezierX2 = startingX + (2 * horizontalDistanceBetweenPoints);
    var bezierY2 = goingUp ? startingY + waveAmplitude / 4 : startingY - waveAmplitude / 4;
    var finishPointX = startingX + (3 * horizontalDistanceBetweenPoints);
    var finishPointY = startingY;

    context.beginPath();
    context.moveTo(startingX, startingY);
    context.bezierCurveTo(bezierX1, bezierY1, bezierX2, bezierY2, finishPointX, finishPointY);
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawRegularTundraOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var verticalDistance = horizontalLength / 4;
    var raceableVerticalDistance = verticalDistance * .97;

    var yRatio = (path.driftAmount / 80) * raceableVerticalDistance;
    var totalAmount = ((path.totalTundraYAmount - path.driftAmount) / 80) * raceableVerticalDistance;

    context.beginPath();
    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + totalAmount + yDistanceOffset);
    context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + totalAmount + yRatio + yDistanceOffset);
    context.stroke();

    var lineSet = [];
    lineSet.push("Regular");
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + verticalDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + verticalDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY - verticalDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY - verticalDistance + yDistanceOffset]);
    this.icyPatchBackgroundLines.push(lineSet);

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawCavernTundraOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var regularMaxYAmount = 80;
    var cavernMaxYAmount = 60;

    var verticalDistance = (horizontalLength / 4);
    var raceableVerticalDistance = verticalDistance * .97;

    var yRatio = (path.driftAmount / 80) * raceableVerticalDistance;
    var totalAmount = ((path.totalTundraYAmount - path.driftAmount) / 80) * raceableVerticalDistance;

    context.beginPath();
    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + totalAmount + yDistanceOffset);
    context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + totalAmount + yRatio + yDistanceOffset);
    context.stroke();


    var cavernModifier = 1 - ((regularMaxYAmount - cavernMaxYAmount) / regularMaxYAmount);
    var cavernDistance = (horizontalLength / 4) * cavernModifier;

    var lineSet = [];
    lineSet.push("Cavern");
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + cavernDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + cavernDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY - cavernDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY - cavernDistance + yDistanceOffset]);
    this.icyPatchBackgroundLines.push(lineSet);

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawHillsTundraOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var verticalDistance = horizontalLength / 4;
    var raceableVerticalDistance = verticalDistance * .97;

    var yRatio = (path.driftAmount / 80) * raceableVerticalDistance;
    var totalAmount = ((path.totalTundraYAmount - path.driftAmount) / 80) * raceableVerticalDistance;

    context.beginPath();
    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + totalAmount + yDistanceOffset);
    context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + totalAmount + yRatio + yDistanceOffset);
    context.stroke();

    var lineSet = [];
    lineSet.push("Hills");
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + verticalDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + verticalDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY - verticalDistance + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY - verticalDistance + yDistanceOffset]);

    var hillHorizontalLength = horizontalLength / 12;
    var hillSpacing = horizontalLength / 4; //1, 2, 3 * hillspacing - hillhorizontallength / 2 is the hills
    var sideHillVerticalPlacement = verticalDistance / 2; //40 / 80
    var middleHillVerticalPlacement = verticalDistance * (3 / 4); //60 / 80
    var hillHeight = verticalDistance / 4; //needs to take up most of the entire lane
    var hillColumns = 3;

    //hill column 1
    lineSet.push([this.lastPathEndingX + (hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, this.lastPathEndingY - sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + (hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, //x1
    this.lastPathEndingY - sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y1
    this.lastPathEndingX + (hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x2
    this.lastPathEndingY - sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y2
    this.lastPathEndingX + (hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x3
    this.lastPathEndingY - sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);  //y3

    lineSet.push([this.lastPathEndingX + (hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, this.lastPathEndingY + sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + (hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, //x1
    this.lastPathEndingY + sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y1
    this.lastPathEndingX + (hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x2
    this.lastPathEndingY + sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y2
    this.lastPathEndingX + (hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x3
    this.lastPathEndingY + sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);  //y3

    //hill column 2
    lineSet.push([this.lastPathEndingX + (2 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, this.lastPathEndingY - middleHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + (2 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, //x1
    this.lastPathEndingY - middleHillVerticalPlacement - hillHeight + yDistanceOffset,  //y1
    this.lastPathEndingX + (2 * hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x2
    this.lastPathEndingY - middleHillVerticalPlacement - hillHeight + yDistanceOffset,  //y2
    this.lastPathEndingX + (2 * hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x3
    this.lastPathEndingY - middleHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);  //y3

    lineSet.push([this.lastPathEndingX + (2 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, this.lastPathEndingY + middleHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + (2 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, //x1
    this.lastPathEndingY + middleHillVerticalPlacement - hillHeight + yDistanceOffset,  //y1
    this.lastPathEndingX + (2 * hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x2
    this.lastPathEndingY + middleHillVerticalPlacement - hillHeight + yDistanceOffset,  //y2
    this.lastPathEndingX + (2 * hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x3
    this.lastPathEndingY + middleHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);  //y3

    //hill column 3
    lineSet.push([this.lastPathEndingX + (3 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, this.lastPathEndingY - sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + (3 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, //x1
    this.lastPathEndingY - sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y1
    this.lastPathEndingX + (3 * hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x2
    this.lastPathEndingY - sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y2
    this.lastPathEndingX + (3 * hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x3
    this.lastPathEndingY - sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);  //y3

    lineSet.push([this.lastPathEndingX + (3 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, this.lastPathEndingY + sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);
    lineSet.push([this.lastPathEndingX + (3 * hillSpacing) - (hillHorizontalLength / 2) - xDistanceOffset, //x1
    this.lastPathEndingY + sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y1
    this.lastPathEndingX + 3 * (hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x2
    this.lastPathEndingY + sideHillVerticalPlacement - hillHeight + yDistanceOffset,  //y2
    this.lastPathEndingX + (3 * hillSpacing) + (hillHorizontalLength / 2) - xDistanceOffset,  //x3
    this.lastPathEndingY + sideHillVerticalPlacement + (hillHeight / 2) + yDistanceOffset]);  //y3


    this.icyPatchBackgroundLines.push(lineSet);

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  drawIcyPatchBackgroundTundraOverview(context: any, coordinates: any): void {
    var existingContentDestinationType = context.globalCompositeOperation;
    context.globalCompositeOperation = "destination-over";

    context.beginPath();
    context.moveTo(coordinates[1][0], coordinates[1][1]);
    context.lineTo(coordinates[2][0], coordinates[2][1]);
    context.lineTo(coordinates[3][0], coordinates[3][1]);
    context.lineTo(coordinates[4][0], coordinates[4][1]);
    context.lineTo(coordinates[5][0], coordinates[5][1]);

    context.fillStyle = "gray";
    context.fill();

    context.globalCompositeOperation = existingContentDestinationType;
  }

  drawHillsBackgroundTundraOverview(context: any, coordinates: any): void {
    var existingContentDestinationType = context.globalCompositeOperation;
    context.strokeStyle = "dimgray";

    //Draw hills once over content and once over so they always persist no matter what
    context.globalCompositeOperation = "source-atop";

    if (coordinates.length >= 17) {
      context.beginPath();
      context.moveTo(coordinates[6][0], coordinates[6][1]);
      context.bezierCurveTo(coordinates[7][0], coordinates[7][1], coordinates[7][2], coordinates[7][3], coordinates[7][4], coordinates[7][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[8][0], coordinates[8][1]);
      context.bezierCurveTo(coordinates[9][0], coordinates[9][1], coordinates[9][2], coordinates[9][3], coordinates[9][4], coordinates[9][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[10][0], coordinates[10][1]);
      context.bezierCurveTo(coordinates[11][0], coordinates[11][1], coordinates[11][2], coordinates[11][3], coordinates[11][4], coordinates[11][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[12][0], coordinates[12][1]);
      context.bezierCurveTo(coordinates[13][0], coordinates[13][1], coordinates[13][2], coordinates[13][3], coordinates[13][4], coordinates[13][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[14][0], coordinates[14][1]);
      context.bezierCurveTo(coordinates[15][0], coordinates[15][1], coordinates[15][2], coordinates[15][3], coordinates[15][4], coordinates[15][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[16][0], coordinates[16][1]);
      context.bezierCurveTo(coordinates[17][0], coordinates[17][1], coordinates[17][2], coordinates[17][3], coordinates[17][4], coordinates[17][5]);
      context.stroke();
    }

    context.globalCompositeOperation = "destination-over";

    if (coordinates.length >= 17) {
      context.beginPath();
      context.moveTo(coordinates[6][0], coordinates[6][1]);
      context.bezierCurveTo(coordinates[7][0], coordinates[7][1], coordinates[7][2], coordinates[7][3], coordinates[7][4], coordinates[7][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[8][0], coordinates[8][1]);
      context.bezierCurveTo(coordinates[9][0], coordinates[9][1], coordinates[9][2], coordinates[9][3], coordinates[9][4], coordinates[9][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[10][0], coordinates[10][1]);
      context.bezierCurveTo(coordinates[11][0], coordinates[11][1], coordinates[11][2], coordinates[11][3], coordinates[11][4], coordinates[11][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[12][0], coordinates[12][1]);
      context.bezierCurveTo(coordinates[13][0], coordinates[13][1], coordinates[13][2], coordinates[13][3], coordinates[13][4], coordinates[13][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[14][0], coordinates[14][1]);
      context.bezierCurveTo(coordinates[15][0], coordinates[15][1], coordinates[15][2], coordinates[15][3], coordinates[15][4], coordinates[15][5]);
      context.stroke();

      context.beginPath();
      context.moveTo(coordinates[16][0], coordinates[16][1]);
      context.bezierCurveTo(coordinates[17][0], coordinates[17][1], coordinates[17][2], coordinates[17][3], coordinates[17][4], coordinates[17][5]);
      context.stroke();
    }

    context.beginPath();
    context.moveTo(coordinates[1][0], coordinates[1][1]);
    context.lineTo(coordinates[2][0], coordinates[2][1]);
    context.lineTo(coordinates[3][0], coordinates[3][1]);
    context.lineTo(coordinates[4][0], coordinates[4][1]);
    context.lineTo(coordinates[5][0], coordinates[5][1]);

    context.fillStyle = "gray";
    context.fill();

    context.globalCompositeOperation = existingContentDestinationType;
    context.strokeStyle = "gray";
  }

  //ellipse is rotated so X handles Y and Y handles X
  drawRegularVolcanoOverview(context: any, volcanicYOffset: number, pathCounter: number, path: RacePath, numberOfPaths: number, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number) {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;
    var verticalLength = (path.length / this.race.length) * this.canvasWidth * yRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var xCenterOfOvalOffset = horizontalLength * (pathCounter);
    var xRegularOffset = horizontalLength / xRaceModeModifier;

    volcanicYOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + volcanicYOffset + yDistanceOffset;
    var xCenterOfOval = startingX - (xCenterOfOvalOffset) + ((horizontalLength * numberOfPaths) / 2);
    var yCenterOfOval = startingY;
    var radiusOfOvalX = (horizontalLength * numberOfPaths) / this.volcanoRadiusXModifier;

    var radiusOfOvalY = ((horizontalLength * numberOfPaths) / 2) - xRegularOffset;
    var rotationOfOval = Math.PI / 2;
    var baselineStartingAngle = 90; //go from 90 to 270
    var baselineEndingAngle = 270;
    var anglePerPath = (baselineEndingAngle - baselineStartingAngle) / numberOfPaths;
    var endingAngle = 0;

    if (path.routeDesign === RaceDesignEnum.FirstRegular) {
      endingAngle = baselineStartingAngle;
      this.volcanoStartingAngle = endingAngle;
      context.beginPath();
      context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + volcanicYOffset + yDistanceOffset);
      context.lineTo(this.lastPathEndingX + (horizontalLength / xRaceModeModifier) - xDistanceOffset, this.lastPathEndingY + volcanicYOffset + yDistanceOffset);
      context.stroke();
    }
    else if (path.routeDesign === RaceDesignEnum.LastRegular) {
      context.beginPath();
      context.moveTo(this.lastPathEndingX + (horizontalLength - (horizontalLength / xRaceModeModifier)) - xDistanceOffset, this.lastPathEndingY + volcanicYOffset + yDistanceOffset);
      context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.lastPathEndingY + volcanicYOffset + yDistanceOffset);
      context.stroke();

      //this.volcanoYEndPosition = startingY;
    }

    var endingAngle = this.volcanoStartingAngle - anglePerPath;
    if (endingAngle < 0)
      endingAngle = 360 - Math.abs(endingAngle);

    context.beginPath();
    context.ellipse(xCenterOfOval, yCenterOfOval, radiusOfOvalX, radiusOfOvalY, rotationOfOval, this.volcanoStartingAngle * (Math.PI / 180), endingAngle * (Math.PI / 180), true);
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
    this.volcanoStartingAngle = endingAngle;
  }

  //ellipse is rotated so X handles Y and Y handles X
  drawSteppingStonesVolcanoOverview(context: any, volcanicYOffset: number, pathCounter: number, path: RacePath, numberOfPaths: number, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number) {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;
    var verticalLength = (path.length / this.race.length) * this.canvasWidth * yRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var xCenterOfOvalOffset = horizontalLength * (pathCounter);
    var xRegularOffset = horizontalLength / xRaceModeModifier;
    volcanicYOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY + volcanicYOffset + yDistanceOffset;
    var xCenterOfOval = startingX - (xCenterOfOvalOffset) + ((horizontalLength * numberOfPaths) / 2);
    var yCenterOfOval = startingY;
    var radiusOfOvalX = (horizontalLength * numberOfPaths) / this.volcanoRadiusXModifier;
    var radiusOfOvalY = ((horizontalLength * numberOfPaths) / 2) - xRegularOffset;
    var rotationOfOval = Math.PI / 2;
    var baselineStartingAngle = 90; //go from 90 to 270
    var baselineEndingAngle = 270;
    var anglePerPath = (baselineEndingAngle - baselineStartingAngle) / numberOfPaths;
    var endingAngle = 0;

    var steppingStoneAngle = anglePerPath / 20;

    //var alternatingOffset = false;
    for (var i = 0; i < 10; i++) {
      //var offsetXDistance = .01; 
      //var offsetYDistance = .01;

      var startingAngle = this.volcanoStartingAngle - (steppingStoneAngle * (2 * i));
      if (startingAngle < 0)
        startingAngle = 360 - Math.abs(startingAngle);

      endingAngle = startingAngle - steppingStoneAngle;
      if (endingAngle < 0)
        endingAngle = 360 - Math.abs(endingAngle);

      /*      var distanceFromZero = 0;
            if (startingAngle >= 270)
              distanceFromZero = 360 - startingAngle;
            else
              distanceFromZero = startingAngle;
      
            offsetXDistance += distanceFromZero / 5000;
      
            offsetXDistance = alternatingOffset ? offsetXDistance : -offsetXDistance; 
            offsetYDistance = alternatingOffset ? offsetYDistance : -offsetYDistance; 
            alternatingOffset = !alternatingOffset;*/

      //console.log("Radius: " + radiusOfOvalX + " Offset: " + offsetDistance + " Total: " + (radiusOfOvalX + offsetDistance));
      context.beginPath();
      context.ellipse(xCenterOfOval, yCenterOfOval, radiusOfOvalX, radiusOfOvalY, rotationOfOval, startingAngle * (Math.PI / 180), endingAngle * (Math.PI / 180), true);
      context.stroke();
    }

    var endingAngle = this.volcanoStartingAngle - anglePerPath;
    if (endingAngle < 0)
      endingAngle = 360 - Math.abs(endingAngle);

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
    this.volcanoStartingAngle = endingAngle;
  }

  drawBackgroundVolcano(context: any, currentFrame: number, legStartX: number, legEndX: number, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number) {
    //var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;
    //var verticalLength = (path.length / this.race.length) * this.canvasWidth * yRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    var volcanoXOffset = .10 * (legEndX - legStartX);
    var volcanoStartX = (legStartX + volcanoXOffset) * this.canvasXDistanceScale * xRaceModeModifier - xDistanceOffset;
    var volcanoEndX = (legEndX - volcanoXOffset) * this.canvasXDistanceScale * xRaceModeModifier - xDistanceOffset;
    var volcanoXLength = volcanoEndX - volcanoStartX;

    //already verified that this radius matches the one in race view
    var volcanoYRadius = ((legEndX - legStartX) * this.canvasXDistanceScale * xRaceModeModifier) / this.volcanoRadiusXModifier;
    var volcanoStartY = this.canvasHeight * xRaceModeModifier;
    var volcanoEndY = this.backgroundVolcanoYStart - (volcanoYRadius * .75) + yDistanceOffset;

    var volcanoBezier1X1 = volcanoStartX + (volcanoXLength * .15);
    var volcanoBezier1Y1 = volcanoStartY - (10 * yRaceModeModifier);
    var volcanoBezier1X2 = volcanoStartX + (volcanoXLength * .35);
    var volcanoBezier1Y2 = volcanoEndY + (20 * yRaceModeModifier);
    var volcanoBezier1X3 = volcanoStartX + (volcanoXLength * .4);
    var volcanoBezier1Y3 = volcanoEndY;

    var volcanoBezier2X1 = volcanoEndX - (volcanoXLength * .15);
    var volcanoBezier2Y1 = volcanoStartY - (10 * yRaceModeModifier);
    var volcanoBezier2X2 = volcanoEndX - (volcanoXLength * .35);
    var volcanoBezier2Y2 = volcanoEndY + (20 * yRaceModeModifier);
    var volcanoBezier2X3 = volcanoEndX - (volcanoXLength * .4);
    var volcanoBezier2Y3 = volcanoEndY;

    //lava
    var originalFillColor = context.fillStyle;
    //lava gradient
    var grd = context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
    grd.addColorStop(0, "red");
    grd.addColorStop(1, "orange");
    context.fillStyle = grd;

    //lava top fill
    //top of volcano
    var volcanoBezier3X1 = volcanoBezier1X3 + ((volcanoBezier2X3 - volcanoBezier1X3) / 3);
    var volcanoBezier3Y1 = volcanoEndY + volcanoYRadius / 4;// + (20 * yRaceModeModifier);
    var volcanoBezier3X2 = volcanoBezier1X3 + (2 * (volcanoBezier2X3 - volcanoBezier1X3) / 3);
    var volcanoBezier3Y2 = volcanoEndY + volcanoYRadius / 4;// + (20 * yRaceModeModifier);
    var volcanoTopBezierX1 = volcanoBezier1X3 * .75;
    var volcanoTopBezierY1 = volcanoBezier1Y3 + (volcanoYRadius / 2);
    var volcanoTopBezierX2 = volcanoBezier2X3 * 1.25;
    var volcanoTopBezierY2 = volcanoBezier1Y3 + (volcanoYRadius / 2);

    var leftSideXEndingPoint = volcanoBezier1X3 - (volcanoXLength * .075);
    var leftSideYEndingPoint = volcanoBezier1Y3 + volcanoYRadius / 2;
    var rightSideXEndingPoint = volcanoBezier2X3 + (volcanoXLength * .075);
    var rightSideYEndingPoint = volcanoBezier2Y3 + volcanoYRadius / 2;
    var lavaFallXBezier1 = leftSideXEndingPoint + (1.7 * (rightSideXEndingPoint - leftSideXEndingPoint) / 5);
    var lavaFallYBezier1 = leftSideYEndingPoint + .5 * volcanoYRadius;
    var lavaFallXBezier2 = leftSideXEndingPoint + (1.4 * (rightSideXEndingPoint - leftSideXEndingPoint) / 5);
    var lavaFallYBezier2 = leftSideYEndingPoint + volcanoYRadius / 2;
    var xEndPointBezier1 = leftSideXEndingPoint + (2.5 * (rightSideXEndingPoint - leftSideXEndingPoint) / 5);
    var yEndPointBezier1 = leftSideYEndingPoint;
    var lavaFallXBezier3 = leftSideXEndingPoint + (3.6 * (rightSideXEndingPoint - leftSideXEndingPoint) / 5);
    var lavaFallYBezier3 = leftSideYEndingPoint + volcanoYRadius;
    var lavaFallXBezier4 = leftSideXEndingPoint + (3.3 * (rightSideXEndingPoint - leftSideXEndingPoint) / 5);
    var lavaFallYBezier4 = leftSideYEndingPoint - .25 * volcanoYRadius;

    context.beginPath();
    //draw top curved part
    context.moveTo(volcanoBezier1X3, volcanoBezier1Y3);
    context.bezierCurveTo(volcanoBezier3X1, volcanoBezier3Y1, volcanoBezier3X2, volcanoBezier3Y2, volcanoBezier2X3, volcanoBezier2Y3);

    //draw straight sides
    context.lineTo(rightSideXEndingPoint, rightSideYEndingPoint);

    //draw bezier curves that looks like lava fall
    context.moveTo(rightSideXEndingPoint, rightSideYEndingPoint);
    context.bezierCurveTo(lavaFallXBezier3, lavaFallYBezier3, lavaFallXBezier4, lavaFallYBezier4, xEndPointBezier1, yEndPointBezier1);
    context.bezierCurveTo(lavaFallXBezier1, lavaFallYBezier1, lavaFallXBezier2, lavaFallYBezier2, leftSideXEndingPoint, leftSideYEndingPoint);

    context.lineTo(volcanoBezier1X3, volcanoBezier1Y3);
    context.fill();

    //left side of volcano
    context.beginPath();
    context.moveTo(volcanoStartX, volcanoStartY);
    context.bezierCurveTo(volcanoBezier1X1, volcanoBezier1Y1, volcanoBezier1X2, volcanoBezier1Y2, volcanoBezier1X3, volcanoBezier1Y3);
    context.stroke();

    //right side of volcano
    context.beginPath();
    context.moveTo(volcanoEndX, volcanoStartY);
    context.bezierCurveTo(volcanoBezier2X1, volcanoBezier2Y1, volcanoBezier2X2, volcanoBezier2Y2, volcanoBezier2X3, volcanoBezier2Y3);
    context.stroke();

    var originalLineWidth = context.lineWidth;
    context.lineWidth = 2;

    //quarter 1 of volcano
    var xQuarterOffset = (70 / 4) / 100;
    var volcanoBezier4X1 = volcanoStartX + (volcanoXLength * (xQuarterOffset + .025));
    var volcanoBezier4Y1 = volcanoStartY - (volcanoYRadius / 4);
    var volcanoBezier4X2 = volcanoStartX + (volcanoXLength * (xQuarterOffset + .2));
    var volcanoBezier4Y2 = volcanoEndY + (volcanoYRadius / 3);
    var volcanoBezier4X3 = volcanoStartX + (volcanoXLength * (xQuarterOffset + .25));
    var volcanoBezier4Y3 = volcanoEndY + (volcanoYRadius / 4);

    context.beginPath();
    context.moveTo(volcanoStartX + (volcanoXLength * xQuarterOffset), volcanoStartY * .95);
    context.bezierCurveTo(volcanoBezier4X1, volcanoBezier4Y1, volcanoBezier4X2, volcanoBezier4Y2, volcanoBezier4X3, volcanoBezier4Y3);
    context.stroke();

    //quarter 2 of volcano
    xQuarterOffset = (70 / 2) / 100;
    var volcanoBezier5X1 = volcanoStartX + (volcanoXLength * (xQuarterOffset + .025));
    var volcanoBezier5Y1 = volcanoStartY - (volcanoYRadius / 4);
    var volcanoBezier5X2 = volcanoStartX + (volcanoXLength * (xQuarterOffset + .075));
    var volcanoBezier5Y2 = volcanoEndY + (volcanoYRadius / 2);
    var volcanoBezier5X3 = volcanoStartX + (volcanoXLength * (xQuarterOffset + .1));
    var volcanoBezier5Y3 = volcanoEndY + (volcanoYRadius / 3);

    context.beginPath();
    context.moveTo(volcanoStartX + (volcanoXLength * xQuarterOffset), volcanoStartY * .95);
    context.bezierCurveTo(volcanoBezier5X1, volcanoBezier5Y1, volcanoBezier5X2, volcanoBezier5Y2, volcanoBezier5X3, volcanoBezier5Y3);
    context.stroke();


    //quarter 3 of volcano
    xQuarterOffset = (70 / 2) / 100;
    var volcanoBezier6X1 = volcanoEndX - (volcanoXLength * (xQuarterOffset + .025));
    var volcanoBezier6Y1 = volcanoStartY - (volcanoYRadius / 4);
    var volcanoBezier6X2 = volcanoEndX - (volcanoXLength * (xQuarterOffset + .075));
    var volcanoBezier6Y2 = volcanoEndY + (volcanoYRadius / 2);
    var volcanoBezier6X3 = volcanoEndX - (volcanoXLength * (xQuarterOffset + .1));
    var volcanoBezier6Y3 = volcanoEndY + (volcanoYRadius / 3);

    context.beginPath();
    context.moveTo(volcanoEndX - (volcanoXLength * xQuarterOffset), volcanoStartY * .95);
    context.bezierCurveTo(volcanoBezier6X1, volcanoBezier6Y1, volcanoBezier6X2, volcanoBezier6Y2, volcanoBezier6X3, volcanoBezier6Y3);
    context.stroke();

    //quarter 4 of volcano
    xQuarterOffset = (70 / 4) / 100;
    var volcanoBezier7X1 = volcanoEndX - (volcanoXLength * (xQuarterOffset + .025));
    var volcanoBezier7Y1 = volcanoStartY - (volcanoYRadius / 4);
    var volcanoBezier7X2 = volcanoEndX - (volcanoXLength * (xQuarterOffset + .2));
    var volcanoBezier7Y2 = volcanoEndY + (volcanoYRadius / 3);
    var volcanoBezier7X3 = volcanoEndX - (volcanoXLength * (xQuarterOffset + .25));
    var volcanoBezier7Y3 = volcanoEndY + (volcanoYRadius / 4);

    context.beginPath();
    context.moveTo(volcanoEndX - (volcanoXLength * xQuarterOffset), volcanoStartY * .95);
    context.bezierCurveTo(volcanoBezier7X1, volcanoBezier7Y1, volcanoBezier7X2, volcanoBezier7Y2, volcanoBezier7X3, volcanoBezier7Y3);
    context.stroke();

    context.lineWidth = originalLineWidth;

    if (this.race.raceUI.lavaFallPercentByFrame[currentFrame] === undefined ||
      this.race.raceUI.lavaFallPercentByFrame[currentFrame].length === 0 ||
      this.race.raceUI.lavaFallPercentByFrame[currentFrame][0] === undefined) {
      context.fillStyle = originalFillColor;
      return;
    }

    var racerXOffset = 0;
    if (xRaceModeModifier === 1) //overview mode
    {
      currentFrame = this.race.raceUI.lavaFallPercentByFrame.length - 1;
    }

    //currentframe doesn't work because the array is only populated with volcano
    var lavaFallPercentByFrame = this.race.raceUI.lavaFallPercentByFrame[currentFrame]; //array of values between 0-1 that represent how far lava has fallen
    var legDistanceX = (legEndX - legStartX) * this.canvasXDistanceScale * xRaceModeModifier;
    var volcanicLegStartX = legStartX * this.canvasXDistanceScale * xRaceModeModifier;
    var lava1FallXDropPoint = volcanicLegStartX + (legDistanceX * .4) - xDistanceOffset + racerXOffset;
    var lava2FallXDropPoint = volcanicLegStartX + (legDistanceX * .45) - xDistanceOffset + racerXOffset;
    var lava3FallXDropPoint = volcanicLegStartX + (legDistanceX * .5) - xDistanceOffset + racerXOffset;
    var lava4FallXDropPoint = volcanicLegStartX + (legDistanceX * .55) - xDistanceOffset + racerXOffset;
    var lava5FallXDropPoint = volcanicLegStartX + (legDistanceX * .6) - xDistanceOffset + racerXOffset;
    var lavaFallXOffset = (legEndX - legStartX) * .01 * this.canvasXDistanceScale * xRaceModeModifier;

    var lavaFallYRadius = lavaFallXOffset / 2;
    var lavaFallYStart = volcanoEndY + volcanoYRadius / 4;
    var bottomOfPath = this.backgroundVolcanoYStart + volcanoYRadius + yDistanceOffset;

    //lava drop 1
    var lava1YAmountFallen = (bottomOfPath - lavaFallYStart) * lavaFallPercentByFrame[0];
    context.beginPath();
    context.ellipse(lava1FallXDropPoint, (lavaFallYStart + lava1YAmountFallen) - lavaFallYRadius, lavaFallXOffset, lavaFallYRadius, 0, 0, 1 * Math.PI);
    context.fill();
    context.beginPath();
    context.fillRect(lava1FallXDropPoint - lavaFallXOffset, lavaFallYStart, lavaFallXOffset * 2, lava1YAmountFallen - (lavaFallYRadius - 1));

    //lava drop 2
    var lava2YAmountFallen = (bottomOfPath - lavaFallYStart) * lavaFallPercentByFrame[1];
    context.beginPath();
    context.ellipse(lava2FallXDropPoint, (lavaFallYStart + lava2YAmountFallen) - lavaFallYRadius, lavaFallXOffset, lavaFallYRadius, 0, 0, 1 * Math.PI);
    context.fill();
    context.beginPath();
    context.fillRect(lava2FallXDropPoint - lavaFallXOffset, lavaFallYStart, lavaFallXOffset * 2, lava2YAmountFallen - (lavaFallYRadius - 1));

    //lava drop 3
    var lava3YAmountFallen = (bottomOfPath - lavaFallYStart) * lavaFallPercentByFrame[2];
    context.beginPath();
    context.ellipse(lava3FallXDropPoint, (lavaFallYStart + lava3YAmountFallen) - lavaFallYRadius, lavaFallXOffset, lavaFallYRadius, 0, 0, 1 * Math.PI);
    context.fill();
    context.beginPath();
    context.fillRect(lava3FallXDropPoint - lavaFallXOffset, lavaFallYStart, lavaFallXOffset * 2, lava3YAmountFallen - (lavaFallYRadius - 1));

    //lava drop 4
    var lava4YAmountFallen = (bottomOfPath - lavaFallYStart) * lavaFallPercentByFrame[3];
    context.beginPath();
    context.ellipse(lava4FallXDropPoint, (lavaFallYStart + lava4YAmountFallen) - lavaFallYRadius, lavaFallXOffset, lavaFallYRadius, 0, 0, 1 * Math.PI);
    context.fill();
    context.beginPath();
    context.fillRect(lava4FallXDropPoint - lavaFallXOffset, lavaFallYStart, lavaFallXOffset * 2, lava4YAmountFallen - (lavaFallYRadius - 1));

    //lava drop 5
    var lava5YAmountFallen = (bottomOfPath - lavaFallYStart) * lavaFallPercentByFrame[4];
    context.beginPath();
    context.ellipse(lava5FallXDropPoint, (lavaFallYStart + lava5YAmountFallen) - lavaFallYRadius, lavaFallXOffset, lavaFallYRadius, 0, 0, 1 * Math.PI);
    context.fill();
    context.beginPath();
    context.fillRect(lava5FallXDropPoint - lavaFallXOffset, lavaFallYStart, lavaFallXOffset * 2, lava5YAmountFallen - (lavaFallYRadius - 1));

    context.fillStyle = originalFillColor;
  }

  drawBrazier(objectXDistance: number, context: any, currentFrame: number, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number, yDistanceOffset?: number) {
    var horizontalLength = (this.race.length * .01) * this.canvasXDistanceScale * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    if (yDistanceOffset === undefined || yDistanceOffset === null)
      yDistanceOffset = 0;

    //this.lastPathEndingX - xDistanceOffset
    var startingXPoint = objectXDistance * this.canvasXDistanceScale * xRaceModeModifier - xDistanceOffset;
    var startingYPoint = this.canvasHeight / 2;

    var sidePanelXDistance = horizontalLength * .166667;
    var frontPanelXDistance = horizontalLength * .333333;
    var panelYDistance = horizontalLength * .8;

    console.log("Starting X: " + startingXPoint);

    context.strokeStyle = 'black';
    context.lineWidth = '6';
    context.fillStyle = 'gray';

    //fully 2d version
    //first panel from left
    context.beginPath();
    context.moveTo(startingXPoint, startingYPoint);
    context.lineTo(startingXPoint + sidePanelXDistance, startingYPoint);
    context.lineTo(startingXPoint + sidePanelXDistance, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint, startingYPoint);
    context.stroke();
    context.fill();

    //second panel from left
    context.beginPath();
    context.moveTo(startingXPoint + sidePanelXDistance, startingYPoint);
    context.lineTo(startingXPoint + sidePanelXDistance + frontPanelXDistance, startingYPoint);
    context.lineTo(startingXPoint + sidePanelXDistance + frontPanelXDistance, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint + sidePanelXDistance, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint + sidePanelXDistance, startingYPoint);
    context.stroke();
    context.fill();

    //third panel from left
    context.beginPath();
    context.moveTo(startingXPoint + sidePanelXDistance + frontPanelXDistance, startingYPoint);
    context.lineTo(startingXPoint + sidePanelXDistance + 2 * frontPanelXDistance, startingYPoint);
    context.lineTo(startingXPoint + sidePanelXDistance + 2 * frontPanelXDistance, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint + sidePanelXDistance + frontPanelXDistance, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint + sidePanelXDistance + frontPanelXDistance, startingYPoint);
    context.stroke();
    context.fill();

    //first panel from left
    context.beginPath();
    context.moveTo(startingXPoint + sidePanelXDistance + 2 * frontPanelXDistance, startingYPoint);
    context.lineTo(startingXPoint + 2 * sidePanelXDistance + 2 * frontPanelXDistance, startingYPoint);
    context.lineTo(startingXPoint + 2 * sidePanelXDistance + 2 * frontPanelXDistance, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint + sidePanelXDistance + 2 * frontPanelXDistance, startingYPoint - panelYDistance);
    context.lineTo(startingXPoint + sidePanelXDistance + 2 * frontPanelXDistance, startingYPoint);
    context.stroke();
    context.fill();


    context.fillStyle = 'brown';
    context.strokeStyle = "black";

    //bottom stones
    var width = (horizontalLength / 6) - (context.lineWidth / 2);
    var bottomStoneStartingX = 225 - 1;
    var xDifferential = (horizontalLength / 6) + 1;
    var stoneHeight = panelYDistance / 6;
    var bottomStoneStartingY = startingYPoint + panelYDistance - stoneHeight;
    this.drawRoundedRectangle(context, bottomStoneStartingX, bottomStoneStartingY, width, stoneHeight, 3);
    this.drawRoundedRectangle(context, bottomStoneStartingX + xDifferential, bottomStoneStartingY, width, stoneHeight, 3);
    this.drawRoundedRectangle(context, bottomStoneStartingX + 2 * xDifferential, bottomStoneStartingY, width, stoneHeight, 3);
    this.drawRoundedRectangle(context, bottomStoneStartingX + 3 * xDifferential, bottomStoneStartingY, width, stoneHeight, 3);
    this.drawRoundedRectangle(context, bottomStoneStartingX + 4 * xDifferential, bottomStoneStartingY, width, stoneHeight, 3);
    this.drawRoundedRectangle(context, bottomStoneStartingX + 5 * xDifferential, bottomStoneStartingY, width, stoneHeight, 3);


    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }

  grandPrixMountainYReset(legCounter: number) {
    if (this.race.raceType === RaceTypeEnum.event && this.race.eventRaceType === EventRaceTypeEnum.grandPrix) {
      if (this.globalService.globalVar.eventRaceData.mountainEndingY === 0 &&
        this.globalService.globalVar.eventRaceData.previousRaceSegment !== null &&
        this.globalService.globalVar.eventRaceData.previousRaceSegment !== undefined &&
        this.globalService.globalVar.eventRaceData.previousRaceSegment.raceLegs !== undefined &&
        this.globalService.globalVar.eventRaceData.previousRaceSegment.raceLegs[0].courseType === RaceCourseTypeEnum.Mountain &&
        legCounter === 1) {
        this.lastPathEndingY = this.canvasHeight / 2;
      }
    }
  }

  drawRoundedRectangle(context: any, x: number, y: number, w: number, h: number, radius: number) {
    var r = x + w;
    var b = y + h;
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(r - radius, y);
    context.quadraticCurveTo(r, y, r, y + radius);
    context.lineTo(r, y + h - radius);
    context.quadraticCurveTo(r, b, r - radius, b);
    context.lineTo(x + radius, b);
    context.quadraticCurveTo(x, b, x, b - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.stroke();
    context.fill();
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }

    this.skipSubscription.unsubscribe();
    this.pauseSubscription.unsubscribe();
    this.globalService.globalVar.userIsRacing = false;

    if (this.race.raceType !== RaceTypeEnum.event) {
      this.race.raceUI.staminaPercentByFrame = [];
      this.race.raceUI.timeToCompleteByFrame = [];
      this.race.raceUI.yAdjustmentByFrame = [];
      this.race.raceUI.velocityByFrame = [];
      this.race.raceUI.distanceCoveredByFrame = [];
      this.race.raceUI.lavaFallPercentByFrame = [];
      this.race.raceUI.maxSpeedByFrame = [];
      this.race.raceUI.racerEffectByFrame = [];
    }

    //if (this.globalService.globalVar.eventRaceData !== null && this.globalService.globalVar.eventRaceData !== undefined)
    //this.globalService.globalVar.eventRaceData.mountainEndingY = 0;
  }
}