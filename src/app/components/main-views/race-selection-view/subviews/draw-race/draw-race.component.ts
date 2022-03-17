import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { RaceDesignEnum } from 'src/app/models/race-design-enum.model';
import { RaceLeg } from 'src/app/models/races/race-leg.model';
import { RacePath } from 'src/app/models/races/race-path.model';
import { Race } from 'src/app/models/races/race.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';

@Component({
  selector: 'app-draw-race',
  templateUrl: './draw-race.component.html',
  styleUrls: ['./draw-race.component.css']
})
export class DrawRaceComponent implements OnInit {
  @ViewChild('raceCanvas', { static: false, read: ElementRef }) raceCanvas: ElementRef;
  @Input() race: Race;
  subscription: any;
  canvasHeight: number;
  canvasWidth: number;
  totalLegs: number;
  isRaceFinished: boolean;
  lengthCompleted = 0;
  canvasXDistanceScale: number;
  averageDistancePerSecond: number;

  lastPathEndingX = 0;
  lastPathEndingY = 0;
  lastPreviousSeconds = 0; //in between seconds, get average speed and do that over the frames

  totalRaceModeXDistance = 0;
  totalRaceModeYDistance = 0;
  previousXTest = 0;

  visibleDistanceXLeft = 0;
  visibleDistanceYTop = 0;
  visibleDistanceXRight = 0;
  visibleDistanceYBottom = 0;


  constructor(private gameLoopService: GameLoopService) { }

  ngOnInit(): void {

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

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {      
      //clear canvas
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      //keep up with current time
      currentTime += deltaTime;

      //this.displayTestData(context, deltaTime);

      //Two modes: Full Overview (shown at the very beginning of the race and then final view after race ends) and
      //Race Mode (keeps up with your animal as it progresses through each section)      
      if (currentTime >= this.race.timeToComplete || this.isRaceFinished)
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

    this.lastPathEndingX = 0;
    this.lastPathEndingY = this.canvasHeight / 2;

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

          this.lengthCompleted += path.length;
        });
      }
    });

    if (raceFinished) {
      context.fillStyle = "maroon";
      context.lineCap = "round";
      context.globalCompositeOperation = "source-atop";

      var secondsTaken = this.race.raceUI.distanceCoveredBySecond.length;
      var completedDistance = this.race.raceUI.distanceCoveredBySecond[secondsTaken - 1] / this.race.length;
      var distanceScaled = completedDistance * this.canvasWidth;

      context.fillRect(0, 0, distanceScaled, this.canvasHeight);
      //display finished distance
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
    this.totalRaceModeXDistance = this.race.length * xRaceModeModifier; //TODO: race.length needs to broken down into x and y

    var currentSeconds = Math.floor(currentTime);
    var fractionalSeconds = currentTime - currentSeconds;
    var fractionalDistance = 0;
    if (currentSeconds < this.race.timeToComplete - 1)
      fractionalDistance = this.race.raceUI.distanceCoveredBySecond[currentSeconds + 1] - this.race.raceUI.distanceCoveredBySecond[currentSeconds];
    var currentDistanceTraveled = this.race.raceUI.distanceCoveredBySecond[currentSeconds] + (fractionalDistance * fractionalSeconds);

    //current distance traveled, scaled with the canvas and modifier, minus getting the coloring in the middle of the screen
    var xDistanceOffset = (currentDistanceTraveled * this.canvasXDistanceScale * xRaceModeModifier) - (this.canvasWidth / 2);

    this.visibleDistanceXLeft = xDistanceOffset;
    this.visibleDistanceXRight = xDistanceOffset + (this.canvasWidth);
    
    context.lineWidth = 5;
    context.globalCompositeOperation = "source-over";
    //move canvas based on distance travelled as a relation to the scale size
    //will go in different directions based on racer type    
    //when setting last x,y distances, you have to ignore xdistanceoffset. 
    //that way you can have the full picture and apply the offset to that    

    if (currentDistanceTraveled >= this.race.length) {
      this.isRaceFinished = true;
      return;
    }

    //console.log("Current Distance Traveled: " + currentDistanceTraveled);
    //console.log("xDistanceOffset: " + xDistanceOffset);
    //console.log("Total Distance Scaled: " + this.totalRaceModeXDistance);
    this.race.raceLegs.forEach(leg => {
      if (leg.pathData !== undefined && leg.pathData.length !== 0) {
        leg.pathData.forEach(path => {

          if (leg.courseType === RaceCourseTypeEnum.Flatland) {
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularFlatlandOverview(context, path, xRaceModeModifier, 1, xDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.S)
              this.drawSFlatlandOverview(context, path, xRaceModeModifier, 1, xDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.Bumps)
              this.drawBumpsFlatlandOverview(context, path, xRaceModeModifier, 1, xDistanceOffset);
          }

          this.lengthCompleted += path.length;
        });
      }
    });

    context.fillStyle = "maroon";
    context.lineCap = "round";
    context.globalCompositeOperation = "source-atop";

    context.fillRect(0, 0, this.canvasWidth / 2, this.canvasHeight);

    context.fillStyle = "red";
    context.fillRect(this.canvasWidth / 2 - 5, 0, 5, this.canvasHeight);

    //break this out into its own function
    //average speed
    var averageDistance = this.averageDistancePerSecond * currentTime;
    //add canvasWidth to offset the fact that we start at half the screen
    var averageDistanceScaled = (averageDistance * this.canvasXDistanceScale * xRaceModeModifier);// + (this.canvasWidth / 2);
    this.drawRacer(context, averageDistanceScaled, "black");    
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
    /*if (this.race === undefined || this.race.raceLegs == undefined)
      return;

    var currentSeconds = Math.floor(currentTime);
    var currentDistanceTraveled = this.race.raceUI.distanceCoveredBySecond[currentSeconds];

    context.fillStyle = "maroon";
    context.lineCap = "round";
    context.lineWidth = 5;
    context.globalCompositeOperation = "source-atop";
    context.fillRect(0, 0, (currentDistanceTraveled / this.race.length) * this.canvasWidth, this.canvasHeight);*/
  }

  drawRegularFlatlandOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    context.moveTo(this.lastPathEndingX - xDistanceOffset, this.lastPathEndingY);
    context.lineTo(this.lastPathEndingX + horizontalLength - xDistanceOffset, this.canvasHeight / 2);
    //context.fillText('End', this.lastPathEndingX + horizontalLength, this.canvasHeight / 2);    
    context.stroke();

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
    this.lastPathEndingY = this.canvasHeight / 2;
  }

  drawSFlatlandOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY;

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

  drawBumpsFlatlandOverview(context: any, path: RacePath, xRaceModeModifier: number, yRaceModeModifier: number, xDistanceOffset?: number): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth * xRaceModeModifier;

    if (xDistanceOffset === undefined || xDistanceOffset === null)
      xDistanceOffset = 0;

    var startingX = this.lastPathEndingX - xDistanceOffset;
    var startingY = this.lastPathEndingY;
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

  ngOnDestroy() {    
    if (this.subscription !== null && this.subscription !== undefined)
    {      
      this.subscription.unsubscribe();          
    }
  }
}