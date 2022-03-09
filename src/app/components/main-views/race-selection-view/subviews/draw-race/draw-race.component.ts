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
  canvasHeight: number;
  canvasWidth: number;
  totalLegs: number;
  isRaceFinished: boolean;
  lengthCompleted = 0;

  lastPathEndingX = 0;
  lastPathEndingY = 0;
  lastPreviousSeconds = 0; //in between seconds, get average speed and do that over the frames

  constructor(private gameLoopService: GameLoopService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.totalLegs = this.race.raceLegs.length;
    this.raceCanvas.nativeElement.width = 900;
    this.raceCanvas.nativeElement.height = 600;
    this.canvasHeight = this.raceCanvas.nativeElement.height;
    this.canvasWidth = this.raceCanvas.nativeElement.width;
    var raceModeXScale = 2;
    var raceModeYScale = 2;

    var context = this.raceCanvas.nativeElement.getContext('2d');
    context.lineWidth = 2;

    var fullRaceXDistance = this.race.length * this.race.timeToComplete;
    var currentTime = 0;

    this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
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
              this.drawBumpsFlatlandOverview(context, path);
          }

          this.lengthCompleted += path.length;
        });
      }
    });

    if (raceFinished) {
      //display finished distance
    }
  }

  displayRacer(context: any, currentTime: number): void {
    if (this.race === undefined || this.race.raceLegs == undefined)
      return;

    var currentSeconds = Math.floor(currentTime);
    var currentDistanceTraveled = this.race.raceUI.distanceCoveredBySecond[currentSeconds];

    context.fillStyle = "maroon";
    context.lineCap = "round";
    context.lineWidth = 5;
    context.globalCompositeOperation = "source-atop";
    context.fillRect(0, 0, (currentDistanceTraveled / this.race.length) * this.canvasWidth, this.canvasHeight);
  }

  displayRace(context: any, currentTime: number): void {
    if (this.race === undefined || this.race.raceLegs == undefined)
      return;

    this.lastPathEndingX = 0;
    this.lastPathEndingY = this.canvasHeight / 2;

    var xRaceModeModifier = 10;

    var currentSeconds = Math.floor(currentTime);
    var fractionalSeconds = currentTime - currentSeconds;
    var fractionalDistance = 0;
    if (currentSeconds < this.race.timeToComplete - 1)
      fractionalDistance = this.race.raceUI.distanceCoveredBySecond[currentSeconds + 1] - this.race.raceUI.distanceCoveredBySecond[currentSeconds];
    var currentDistanceTraveled = this.race.raceUI.distanceCoveredBySecond[currentSeconds] + (fractionalDistance * fractionalSeconds);

    var oneSecondDistanceDifference = 0;   //Give the racer overlay one second of time to get on the screen ahead of the translate
    if (currentSeconds > 0 && this.race.raceUI.distanceCoveredBySecond.length > 0)
      oneSecondDistanceDifference = this.race.raceUI.distanceCoveredBySecond[currentSeconds] - this.race.raceUI.distanceCoveredBySecond[currentSeconds - 1];

    console.log("Fractional");
    console.log(fractionalDistance * fractionalSeconds);

    var xDistanceOffset = (currentDistanceTraveled * this.race.timeToComplete) - oneSecondDistanceDifference;
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

    this.race.raceLegs.forEach(leg => {
      if (leg.pathData !== undefined && leg.pathData.length !== 0) {
        leg.pathData.forEach(path => {

          if (leg.courseType === RaceCourseTypeEnum.Flatland) {
            if (path.routeDesign === RaceDesignEnum.Regular)
              this.drawRegularFlatlandOverview(context, path, xRaceModeModifier, 1, xDistanceOffset);
            if (path.routeDesign === RaceDesignEnum.S)
              this.drawSFlatlandOverview(context, path, xRaceModeModifier, 1, xDistanceOffset);
            //if (path.routeDesign === RaceDesignEnum.Bumps)
            //this.drawBumpsFlatlandOverview(context, path,);
          }

          this.lengthCompleted += path.length;
        });
      }
    });

    context.fillStyle = "maroon";
    context.lineCap = "round";
    context.globalCompositeOperation = "source-atop";
    //context.fillRect(0, 0, 0, 0);

    //if less than half a second or so, fill up to that and then keep it at that distance or some set distance ahead of the translation
    context.fillRect(0, 0, 50, this.canvasHeight);
    //shouldn't this always just fill up a certain part of the screen, not necessarily track with distance?
    //the translation tracks with distance and moves this baby along.
    //maybe do the math to figure out where you are in the current view and have it at that point
  }

  displayTestData(context: any, deltaTime: number) {
    var fullRaceXDistance = this.race.length * this.race.timeToComplete;
    var currentTime = 0;
    context.font = '48px serif';
    currentTime += deltaTime;

    var currentSeconds = Math.floor(currentTime);
    var currentDistanceTraveled = this.race.raceUI.distanceCoveredBySecond[currentSeconds];
    var scaledDistanceTraveled = currentDistanceTraveled * this.race.timeToComplete;

    console.log(fullRaceXDistance / 6 - scaledDistanceTraveled);

    context.fillText('1', fullRaceXDistance / 6 - scaledDistanceTraveled, this.canvasHeight / 2);
    context.fillText('2', 2 * fullRaceXDistance / 6 - scaledDistanceTraveled, this.canvasHeight / 2);
    context.fillText('3', 3 * fullRaceXDistance / 6 - scaledDistanceTraveled, this.canvasHeight / 2);
    context.fillText('4', 4 * fullRaceXDistance / 6 - scaledDistanceTraveled, this.canvasHeight / 2);
    context.fillText('5', 5 * fullRaceXDistance / 6 - scaledDistanceTraveled, this.canvasHeight / 2);
    context.fillText('6', 6 * fullRaceXDistance / 6 - scaledDistanceTraveled, this.canvasHeight / 2);
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

  drawBumpsFlatlandOverview(context: any, path: RacePath): void {
    var horizontalLength = (path.length / this.race.length) * this.canvasWidth;

    console.log("Draw Bumps");

    this.lastPathEndingX = this.lastPathEndingX + horizontalLength;
  }
}


//maybe useful??
/*//get the leg this distance is in, then the route
   this.race.raceLegs.forEach(leg => {
     if (!legFound) {
       if (currentDistanceTraveled <= leg.distance + previousLegDistance)
         legFound = true;
       else {
         currentLegCount += 1;
         previousLegDistance += leg.distance;
       }
     }
   });

   this.race.raceLegs[currentLegCount].pathData.forEach(route => {
     if (!routeFound) {
       if (currentDistanceTraveled <= route.length + previousRouteDistance + previousLegDistance)
         routeFound = true;
       else {
         currentRouteCount += 1;
         previousRouteDistance += route.length;
       }
     }
   });

   currentLeg = this.race.raceLegs[currentLegCount];
   currentRoute = this.race.raceLegs[currentLegCount].pathData[currentRouteCount];
   currentDistanceInRoute = currentRoute.length - (currentDistanceTraveled - (previousRouteDistance + previousLegDistance));

   if (currentLeg.courseType === RaceCourseTypeEnum.Flatland) {
     //if (path.routeDesign === RaceDesignEnum.Regular)
     this.drawRegularFlatlandOverview(context, currentRoute, startingX, 60, 3);
   }*/