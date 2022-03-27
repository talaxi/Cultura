import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceDesignEnum } from 'src/app/models/race-design-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { RacePath } from 'src/app/models/races/race-path.model';
import { Race } from 'src/app/models/races/race.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
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


  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService, private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.skipSubscription = this.skip.subscribe(() => { this.skipRace = true; this.isRaceFinished = true; });


    if (this.globalService.globalVar.settings.get("skipDrawRace")) {
      this.skipRace = true;
      this.isRaceFinished = true;
    }
  }

  ngAfterViewInit() {
    this.totalLegs = this.race.raceLegs.length;
    this.setupCanvas();
    this.canvasXDistanceScale = this.canvasWidth / this.race.length; //needs to be 2D
    var raceModeXScale = 2;
    var raceModeYScale = 2;
    this.averageDistancePerSecond = this.race.length / this.race.timeToComplete;

    var context = this.raceCanvas.nativeElement.getContext('2d');
    context.lineWidth = 2;

    var fullRaceXDistance = this.race.length * this.race.timeToComplete;
    var currentTime = 0;

    this.mountainClimbPercent = this.utilityService.getRandomNumber(.3, .7);

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      //clear canvas
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      //keep up with current time
      currentTime += deltaTime;

      //this.displayTestData(context, deltaTime);

      //Two modes: Full Overview (shown at the very beginning of the race and then final view after race ends) and
      //Race Mode (keeps up with your animal as it progresses through each section)      
      if (currentTime >= this.race.timeToComplete || this.isRaceFinished || this.skipRace)
        this.displayOverview(context, true);
      else {
        this.displayRace(context, currentTime);
        //this.displayRacer(context, currentTime);
      }
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
      console.log(this.overviewYOffsetModifier);
    }

    if (raceFinished) {
      context.lineCap = "round";
      context.globalCompositeOperation = "source-atop";

      var secondsTaken = this.race.raceUI.distanceCoveredBySecond.length;
      var completedDistance = this.race.raceUI.distanceCoveredBySecond[secondsTaken - 1] / this.race.length; //as a percentage

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
    this.totalRaceModeXDistance = this.race.length * xRaceModeModifier; //TODO: race.length needs to broken down into x and y

    var yMountainSteepnessScale = .5; //go at a 45 degree angle so x and y are 50%

    //var currentSeconds = Math.floor(currentTime);    
    //var fractionalSeconds = currentTime - currentSeconds;
    var currentFrame = Math.floor(currentTime * this.frameModifier);
    //var fractionalDistance = 0;
    //if (currentSeconds < this.race.timeToComplete - 1)
    //fractionalDistance = this.race.raceUI.distanceCoveredBySecond[currentSeconds + 1] - this.race.raceUI.distanceCoveredBySecond[currentSeconds];
    //var currentDistanceTraveled = this.race.raceUI.distanceCoveredBySecond[currentSeconds] + (fractionalDistance * fractionalSeconds);
    var currentDistanceTraveled = this.race.raceUI.distanceCoveredBySecond[currentFrame];
    var currentYDistanceTraveled = 0;

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



    /*if (currentSeconds < this.race.raceUI.distanceCoveredBySecond.length - 1) {
      if (this.race.raceUI.distanceCoveredBySecond[currentSeconds] < this.currentLeg.distance + previousLegDistance &&
        this.race.raceUI.distanceCoveredBySecond[currentSeconds + 1] >= this.currentLeg.distance + previousLegDistance) {
        console.log("Holding at " + currentDistanceTraveled);

        if (currentDistanceTraveled > this.currentLeg.distance + previousLegDistance)
          currentDistanceTraveled = this.currentLeg.distance + previousLegDistance;
      }
    }*/

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

            //console.log("Found Path at distance: " + totalDistance);
            console.log("Path:" + RaceDesignEnum[path.routeDesign]);
            if (path.routeDesign === RaceDesignEnum.Crevasse) {
              //var offset = path.length * .04;
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
    }

    //current distance traveled, scaled with the canvas and modifier, minus getting the coloring in the middle of the screen
    var xDistanceOffset = (currentDistanceTraveled * this.canvasXDistanceScale * xRaceModeModifier) - (this.canvasWidth / 2);
    var yDistanceOffset = currentYDistanceTraveled * this.canvasXDistanceScale * yRaceModeModifier;
    //could make currentDistanceTraveledY and have that be added to by ySteepness and checking that leg is climb for currentdistainceinleg

    this.visibleDistanceXLeft = xDistanceOffset;
    this.visibleDistanceXRight = xDistanceOffset + (this.canvasWidth);

    context.lineWidth = 5;
    context.globalCompositeOperation = "source-over";
    //move canvas based on distance travelled as a relation to the scale size
    //will go in different directions based on racer type    
    //when setting last x,y distances, you have to ignore xdistanceoffset. 
    //that way you can have the full picture and apply the offset to that    

    if (currentDistanceTraveled >= this.race.length || currentFrame > this.race.raceUI.distanceCoveredBySecond.length) {
      this.isRaceFinished = true;
      return;
    }

    var mountainLegDistance = 0; //used to determine climbing distance
    this.race.raceLegs.forEach(leg => {
      if (leg.pathData !== undefined && leg.pathData.length !== 0) {
        leg.pathData.forEach(path => {

          if (leg.courseType === RaceCourseTypeEnum.Flatland) {
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.S)
              this.drawSFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Bumps)
              this.drawBumpsFlatlandOverview(context, path, xRaceModeModifier, yRaceModeModifier, xDistanceOffset, yDistanceOffset);
          }
          else if (leg.courseType === RaceCourseTypeEnum.Mountain) {
            var goingUp = this.getCurrentAnimalRacingCourse(currentDistanceTraveled) !== RaceCourseTypeEnum.Mountain || mountainLegDistance < leg.distance * this.mountainClimbPercent;
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

          this.lengthCompleted += path.length;
        });
      }
    });


    context.fillStyle = this.getAnimalDistanceColor(currentDistanceTraveled);
    context.lineCap = "round";
    context.globalCompositeOperation = "source-atop";

    context.fillRect(0, 0, this.canvasWidth / 2, this.canvasHeight);

    context.fillStyle = this.getAnimalRacerColor(currentDistanceTraveled);
    context.fillRect(this.canvasWidth / 2 - 5, 0, 5, this.canvasHeight);


    //average speed
    var averageDistance = this.averageDistancePerSecond * currentTime;
    //add canvasWidth to offset the fact that we start at half the screen
    var averageDistanceScaled = (averageDistance * this.canvasXDistanceScale * xRaceModeModifier);// + (this.canvasWidth / 2);
    this.drawRacer(context, averageDistanceScaled, "black");
    this.drawBreakpoints(context, xRaceModeModifier);
  }

  getAnimalDistanceColor(currentDistanceTraveled: number) {
    var color = "";
    var totalDistance = 0;
    this.race.raceLegs.forEach(leg => {
      if (currentDistanceTraveled >= totalDistance && currentDistanceTraveled < totalDistance + leg.distance) {
        //we are in this leg
        if (leg.courseType === RaceCourseTypeEnum.Flatland)
          color = "#8f1c14";
        if (leg.courseType === RaceCourseTypeEnum.Mountain)
          color = "#4d6b48";
      }

      totalDistance += leg.distance;
    });

    return color;
  }

  getAnimalDistanceColorByType(courseType: RaceCourseTypeEnum) {
    var color = "";

    if (courseType === RaceCourseTypeEnum.Flatland)
      color = "#8f1c14";
    if (courseType === RaceCourseTypeEnum.Mountain)
      color = "#4d6b48";

    return color;
  }

  getAnimalRacerColor(currentDistanceTraveled: number) {
    var color = "";
    var totalDistance = 0;
    this.race.raceLegs.forEach(leg => {
      if (currentDistanceTraveled >= totalDistance && currentDistanceTraveled < totalDistance + leg.distance) {
        //we are in this leg
        if (leg.courseType === RaceCourseTypeEnum.Flatland)
          color = "#eb3023";
        if (leg.courseType === RaceCourseTypeEnum.Mountain)
          color = "#a1db97";
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

    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY + yDistanceOffset);
    context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.canvasHeight / 2 + yDistanceOffset);
    //context.fillText('End', this.lastPathEndingX + horizontalLength, this.canvasHeight / 2);    
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
    this.lastPathEndingY = this.canvasHeight / 2;
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

    context.bezierCurveTo(startingX + xRegularOffset, startingY, startingX + curve1Point1XOffset, startingY + curve1Point1YOffset, startingX + curve1Point2XOffset, startingY + curve1Point2YOffset);
    context.bezierCurveTo(startingX + curve1Point2XOffset, startingY + curve1Point2YOffset, startingX + curve2Point1XOffset, startingY + curve2Point1YOffset, startingX + curve2Point2XOffset, startingY);

    //Everything is mirrored here
    context.bezierCurveTo(startingX + curve2Point2XOffset, startingY, startingX + curve3Point1XOffset, startingY - curve3Point1YOffset, startingX + curve3Point2XOffset, startingY - curve3Point2YOffset);
    context.bezierCurveTo(startingX + curve3Point2XOffset, startingY - curve3Point2YOffset, startingX + curve4Point1XOffset, startingY - curve4Point1YOffset, startingX + curve4Point1XOffset, startingY);

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

    context.lineTo(startingX + xRegularOffset + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + xFullBump, startingY);

    context.lineTo(startingX + xRegularOffset + xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 2 * xFullBump, startingY);

    context.lineTo(startingX + xRegularOffset + 2 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 3 * xFullBump, startingY);

    context.lineTo(startingX + xRegularOffset + 3 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 4 * xFullBump, startingY);

    context.lineTo(startingX + xRegularOffset + 4 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 5 * xFullBump, startingY);

    context.lineTo(startingX + xRegularOffset + 5 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 6 * xFullBump, startingY);

    context.lineTo(startingX + xRegularOffset + 6 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 7 * xFullBump, startingY);

    context.lineTo(startingX + xRegularOffset + 7 * xFullBump + xFullBump / 2, startingY - yFullBump);
    context.lineTo(startingX + xRegularOffset + 8 * xFullBump, startingY);

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

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }

    this.skipSubscription.unsubscribe();
  }
}