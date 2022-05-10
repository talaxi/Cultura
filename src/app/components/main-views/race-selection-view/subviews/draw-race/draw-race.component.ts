import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceDesignEnum } from 'src/app/models/race-design-enum.model';
import { RacerEffectEnum } from 'src/app/models/racer-effect-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { RacePath } from 'src/app/models/races/race-path.model';
import { Race } from 'src/app/models/races/race.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

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


  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService, 
    private lookupService: LookupService) { }

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
    this.totalLegs = this.race.raceLegs.length;
    this.setupCanvas();
    this.canvasXDistanceScale = this.canvasWidth / this.race.length;

    var context = this.raceCanvas.nativeElement.getContext('2d');
    context.lineWidth = 6;

    var currentTime = 0;

    this.mountainClimbPercent = this.utilityService.getRandomNumber(.3, .7);
    var effectiveTimeToComplete = this.race.raceUI.timeToCompleteByFrame[this.race.raceUI.timeToCompleteByFrame.length - 1];

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      //clear canvas
      //var startTime = performance.now();
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      context.lineWidth = 6;
      //context.lineCap = "round";

      if (!this.pauseRace) {
        //keep up with current time
        currentTime += deltaTime;
      }

      //Two modes: Full Overview (shown at the very beginning of the race and then final view after race ends) and
      //Race Mode (keeps up with your animal as it progresses through each section)      
      if (currentTime >= effectiveTimeToComplete || this.isRaceFinished || this.skipRace)
        this.displayOverview(context, true);
      else {
        this.displayRace(context, currentTime);
      }

      //var endTime = performance.now();
      //console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
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

    context.globalCompositeOperation = "source-over";

    this.lengthCompleted = 0;
    this.lastPathEndingX = 0;
    this.lastPathEndingY = this.canvasHeight / 2;

    var mountainLegDistance = 0;
    var waterGoingUp = true;
    this.race.raceLegs.forEach(leg => {
      if (leg.pathData !== undefined && leg.pathData.length !== 0) {
        leg.pathData.forEach(path => {
          if (leg.courseType === RaceCourseTypeEnum.Flatland) {
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularFlatlandOverview(context, path, 1, 1);
            if (path.routeDesign === RaceDesignEnum.S)
              this.drawSFlatlandOverview(context, path, 1, 1);
            if (path.routeDesign === RaceDesignEnum.Bumps)
              this.drawBumpsFlatlandOverview(context, path, 1, 1);
          }
          else if (leg.courseType === RaceCourseTypeEnum.Mountain) {
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
          else if (leg.courseType === RaceCourseTypeEnum.Water) {
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularWaterOverview(context, path, 1, 1, waterGoingUp);
            if (path.routeDesign === RaceDesignEnum.Waves)
              this.drawWavesWaterOverview(context, path, 1, 1, waterGoingUp);
            if (path.routeDesign === RaceDesignEnum.Dive)
              this.drawDiveWaterOverview(context, path, 1, 1, waterGoingUp);

            waterGoingUp = !waterGoingUp;
          }

          this.lengthCompleted += path.length;

          if (this.lastPathEndingY < 0) {
            this.yOffscreen = this.lastPathEndingY;
          }
        });
      }
    });

    if (this.yOffscreen < 0) {
      this.overviewYOffsetModifier = this.overviewYOffsetModifier / 1.25;
      this.yOffscreen = 0;
    }

    if (raceFinished) {
      this.globalService.globalVar.userIsRacing = false;

      //context.lineCap = "butt";
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
  }

  displayRace(context: any, currentTime: number): void {
    if (this.race === undefined || this.race.raceLegs == undefined)
      return;

    //track color
    context.strokeStyle = "gray";

    this.lastPathEndingX = 0;
    this.lastPathEndingY = this.canvasHeight / 2;

    var xRaceModeModifier = 10;
    var yRaceModeModifier = 10;
    this.totalRaceModeXDistance = this.race.length * xRaceModeModifier;

    var currentFrame = Math.floor(currentTime * this.frameModifier);
    var currentDistanceTraveled = this.race.raceUI.distanceCoveredByFrame[currentFrame];
    var currentYDistanceTraveled = 0;

    this.averageDistancePerSecond = this.race.length / this.race.raceUI.timeToCompleteByFrame[currentFrame];

    var legPinpointDistance = 0;
    var previousLegDistance = 0;
    var foundLeg = false;
    this.race.raceLegs.forEach(leg => {
      if (!foundLeg) {
        if (currentDistanceTraveled >= legPinpointDistance && currentDistanceTraveled < legPinpointDistance + leg.distance) {
          //we are in this leg
          foundLeg = true;
          this.currentLeg = leg;
        }

        if (!foundLeg)
          previousLegDistance += leg.distance;
      }

      legPinpointDistance += leg.distance;
    });

    var currentDistanceInLeg = currentDistanceTraveled - previousLegDistance;
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
    }

    //if the above code is skipped, set Y equal to what mountain ended on
    currentYDistanceTraveled = this.mountainEndingY;

    //current distance traveled, scaled with the canvas and modifier, minus getting the coloring in the middle of the screen
    var xDistanceOffset = (currentDistanceTraveled * this.canvasXDistanceScale * xRaceModeModifier) - (this.canvasWidth / 2);
    var yDistanceOffset = currentYDistanceTraveled * this.canvasXDistanceScale * yRaceModeModifier;
    //could make currentDistanceTraveledY and have that be added to by ySteepness and checking that leg is climb for currentdistainceinleg

    this.visibleDistanceXLeft = xDistanceOffset;
    this.visibleDistanceXRight = xDistanceOffset + (this.canvasWidth);

    context.globalCompositeOperation = "source-over";
    //move canvas based on distance travelled as a relation to the scale size
    //will go in different directions based on racer type    
    //when setting last x,y distances, you have to ignore xdistanceoffset. 
    //that way you can have the full picture and apply the offset to that    

    if (currentDistanceTraveled >= this.race.length || currentFrame > this.race.raceUI.distanceCoveredByFrame.length) {
      this.isRaceFinished = true;
      return;
    }

    var mountainLegDistance = 0; //used to determine climbing distance
    var waterGoingUp = true;
    this.race.raceLegs.forEach(leg => {
      if (leg.pathData !== undefined && leg.pathData.length !== 0) {
        leg.pathData.forEach(path => {

          if (leg.courseType === RaceCourseTypeEnum.Flatland) {
            context.lineCap = "round";
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.S)
              this.drawSFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Bumps)
              this.drawBumpsFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
          }
          else if (leg.courseType === RaceCourseTypeEnum.Mountain) {
            context.lineCap = "round";
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
          }
          else if (leg.courseType === RaceCourseTypeEnum.Water) {
            context.lineCap = "round";
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularWaterOverview(context, path, xRaceModeModifier, yRaceModeModifier, waterGoingUp, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Waves)
              this.drawWavesWaterOverview(context, path, xRaceModeModifier, yRaceModeModifier, waterGoingUp, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Dive)
              this.drawDiveWaterOverview(context, path, xRaceModeModifier, yRaceModeModifier, waterGoingUp, xDistanceOffset, yDistanceOffset);

            waterGoingUp = !waterGoingUp;
          }

          this.lengthCompleted += path.length;
        });
      }
    });

    context.globalCompositeOperation = "source-atop";

    //check to see if breakpoint is visible on screen

    var percentOfVisibleDistance = 0;
    var legScaledEndPoint = previousLegDistance * this.canvasXDistanceScale * xRaceModeModifier;
    var currentLegIndex = this.race.raceLegs.indexOf(this.currentLeg);
    var previousLeg = null;
    if (currentLegIndex > 0)
      previousLeg = this.race.raceLegs[currentLegIndex - 1];

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
      context.fillStyle = this.getAnimalDistanceColor(currentDistanceTraveled);
      context.fillRect(0, 0, this.canvasWidth / 2, this.canvasHeight);
    }

    var racerColor = this.getAnimalRacerColor(currentDistanceTraveled);
    if (this.race.raceUI.racerEffectByFrame[currentFrame] === RacerEffectEnum.LostFocus ||
      this.race.raceUI.racerEffectByFrame[currentFrame] === RacerEffectEnum.LostStamina ||
      this.race.raceUI.racerEffectByFrame[currentFrame] === RacerEffectEnum.Stumble) {
      racerColor = this.utilityService.shadeColor(racerColor, -90);
    }
    context.fillStyle = racerColor;
    context.fillRect(this.canvasWidth / 2 - 5, 0, 5, this.canvasHeight);

    //average speed
    var averageDistance = (this.averageDistancePerSecond / this.frameModifier) * currentFrame;

    var averageDistanceScaled = (averageDistance * this.canvasXDistanceScale * xRaceModeModifier);
    this.drawRacer(context, averageDistanceScaled, "black");

    var moneyMarkIsUnlocked = this.lookupService.getResourceByName("Money Mark");
    if (moneyMarkIsUnlocked > 0) {
      var defaultMoneyMarkPace = .75;
      var moneyMarkPace = this.globalService.globalVar.modifiers.find(item => item.text === "moneyMarkPaceModifier");
      if (moneyMarkPace !== undefined && moneyMarkPace !== null)
        defaultMoneyMarkPace = moneyMarkPace.value;

      var inverseMoneyMarkPace = (1 - defaultMoneyMarkPace) + 1;

      var moneyMarkDistanceScaled = (averageDistance * this.canvasXDistanceScale * xRaceModeModifier) * inverseMoneyMarkPace;
      this.drawRacer(context, moneyMarkDistanceScaled, "gold");
    }
    this.drawBreakpoints(context, xRaceModeModifier);
  }

  getAnimalDistanceColor(currentDistanceTraveled: number) {
    var color = "";
    var totalDistance = 0;
    this.race.raceLegs.forEach(leg => {
      if (currentDistanceTraveled >= totalDistance && currentDistanceTraveled < totalDistance + leg.distance) {
        //we are in this leg
        if (leg.courseType === RaceCourseTypeEnum.Flatland)
          color = "#7d3f00";//"#8f1c14";
        if (leg.courseType === RaceCourseTypeEnum.Mountain)
          color = "#4d6b48";
        if (leg.courseType === RaceCourseTypeEnum.Water)
          color = "#16148f";
      }

      totalDistance += leg.distance;
    });

    return color;
  }

  getAnimalDistanceColorByType(courseType: RaceCourseTypeEnum) {
    var color = "";

    if (courseType === RaceCourseTypeEnum.Flatland)
      color = "#7d3f00";//"#8f1c14";
    if (courseType === RaceCourseTypeEnum.Mountain)
      color = "#4d6b48";
    if (courseType === RaceCourseTypeEnum.Water)
      color = "#16148f";

    return color;
  }

  getAnimalRacerColor(currentDistanceTraveled: number) {
    var color = "";
    var totalDistance = 0;
    this.race.raceLegs.forEach(leg => {
      if (currentDistanceTraveled >= totalDistance && currentDistanceTraveled < totalDistance + leg.distance) {
        //we are in this leg
        if (leg.courseType === RaceCourseTypeEnum.Flatland)
          color = "#d16900";//"#eb3023";
        if (leg.courseType === RaceCourseTypeEnum.Mountain)
          color = "#a1db97";
        if (leg.courseType === RaceCourseTypeEnum.Water)
          color = "#0000ff";
      }

      totalDistance += leg.distance;
    });

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

  drawBreakpoints(context: any, xRaceModeModifier: number): void {
    var distanceSum = 0;
    for (var i = 0; i < this.race.raceLegs.length; i++) {
      var leg = this.race.raceLegs[i];
      var nextLeg = null;
      if (i < this.race.raceLegs.length - 1)
        nextLeg = this.race.raceLegs[i + 1];

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
    //context.fillText('End', this.lastPathEndingX + horizontalLength, this.canvasHeight / 2);    
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
    //console.log("FirstBump: (" + (startingX + xRegularOffset + xFullBump / 2) +", " + (startingY - yFullBump));
    //console.log("FirstBumpEnd: (" + (startingX + xRegularOffset + xFullBump) +", " + (startingY));
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
    var wave1BezierY4 = wave1FinishPointY + (2 / 5) * waveHeight;
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
    var wave2BezierY4 = wave2FinishPointY + (2 / 5) * waveHeight;
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
    var wave3BezierY4 = wave3FinishPointY + (2 / 5) * waveHeight;
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

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }

    this.skipSubscription.unsubscribe();
    this.pauseSubscription.unsubscribe();
    this.globalService.globalVar.userIsRacing = false;
  }
}