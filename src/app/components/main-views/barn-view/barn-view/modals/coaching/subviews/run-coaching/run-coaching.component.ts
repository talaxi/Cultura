import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { BarnSpecializationEnum } from 'src/app/models/barn-specialization-enum.model';
import { CoachingCourseTypeEnum } from 'src/app/models/coaching-course-type-enum.model';
import { CoachingTypeEnum } from 'src/app/models/coaching-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-run-coaching',
  templateUrl: './run-coaching.component.html',
  styleUrls: ['./run-coaching.component.css']
})
export class RunCoachingComponent implements OnInit {
  @Input() selectedBarnNumber: number;
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

  constructor(private gameLoopService: GameLoopService, private globalService: GlobalService, private themeService: ThemeService,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.successfulAttemptStreak = 0;

    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.associatedAnimal = associatedAnimal;

          var courseClass = "coloredText " + this.associatedAnimal.getCourseTypeClass();
          this.animalDisplayName = "<span class='" + courseClass + "'>" + this.associatedAnimal.name + "</span>";
        }
      }
    }

    this.incrementalCoachingUpdates = "You bring " + this.animalDisplayName + " out into an open area for practice.\n";
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    if (this.drawCoaching !== null && this.drawCoaching !== undefined) {
      this.canvasOffsetX = this.drawCoaching.nativeElement.offsetLeft;
      this.canvasOffsetY = this.drawCoaching.nativeElement.offsetTop;
    }

    this.context = this.coachingCanvas.nativeElement.getContext('2d');
    this.context.lineWidth = 6;

    var currentTime = 0;
    this.currentPathType = this.getRandomPathType();

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      //clear canvas
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.context.lineWidth = 6;
      this.displayTrace(this.context, currentTime);
    });
  }

  setupCanvas() {
    if (this.coachingCanvas !== undefined) {
      this.coachingCanvas.nativeElement.style.width = '100%';
      this.coachingCanvas.nativeElement.style.height = '100%';
      this.coachingCanvas.nativeElement.width = this.coachingCanvas.nativeElement.offsetWidth;
      this.coachingCanvas.nativeElement.height = this.coachingCanvas.nativeElement.offsetHeight;
      this.canvasHeight = this.coachingCanvas.nativeElement.height;
      this.canvasWidth = this.coachingCanvas.nativeElement.width;
    }
  }

  displayTrace(context: any, currentTime: number) {
    context.lineCap = "round";
    context.strokeStyle = "gray";
    context.globalCompositeOperation = "source-over";

    if (this.currentPathType === CoachingCourseTypeEnum.speed)
      this.activePoints = this.drawSpeedTrace(context);
    if (this.currentPathType === CoachingCourseTypeEnum.acceleration)
      this.activePoints = this.drawAccelerationTrace(context);
    if (this.currentPathType === CoachingCourseTypeEnum.endurance)
      this.activePoints = this.drawEnduranceTrace(context);
    if (this.currentPathType === CoachingCourseTypeEnum.power)
      this.activePoints = this.drawPowerTrace(context);
    if (this.currentPathType === CoachingCourseTypeEnum.focus)
      this.activePoints = this.drawFocusTrace(context);
    if (this.currentPathType === CoachingCourseTypeEnum.adaptability)
      this.activePoints = this.drawAdaptabilityTrace(context);    

    context.strokeStyle = this.getAnimalDistanceColor(this.associatedAnimal.raceCourseType);
    context.globalCompositeOperation = "source-atop";
    for (var i = 0; i < this.currentEndPoint; i++) {
      if (i < this.currentEndPoint - 1) {
        //console.log("Fill completed section: " + (this.activePoints[i][0] - this.context.lineWidth / 2) + ", " + (this.activePoints[i][1] - this.context.lineWidth / 2) + ", " + (this.activePoints[i + 1][0] + this.context.lineWidth / 2) + ", " + (this.activePoints[i + 1][1] + this.context.lineWidth / 2));
        //completed sections

        if (this.currentPathType === CoachingCourseTypeEnum.power && i === 0) {
          context.beginPath();
          context.ellipse(this.activePoints[0][0], this.activePoints[0][1], this.activePoints[0][2], this.activePoints[0][3], this.activePoints[0][4], this.activePoints[0][5], this.activePoints[0][6], true);
          context.stroke();
        }
        else {
          context.beginPath();
          context.moveTo(this.activePoints[i][0], this.activePoints[i][1]);
          context.lineTo(this.activePoints[i + 1][0], this.activePoints[i + 1][1]);
          context.stroke();
        }

      }
      else {
        //console.log("Drawn Line: (" + this.activePoints[i][0] + ", " + this.activePoints[i][1] + ") to (" + this.currentX + ", " + this.currentY + ")");
        //current section
        if (this.currentPathType === CoachingCourseTypeEnum.power && (i === 0 || i === 2)) {
          var index = 0;
          if (i === 2)
            index = 3;

          context.fillStyle = this.getAnimalDistanceColor(this.associatedAnimal.raceCourseType);
          if (index === 0)
            context.fillRect(this.activePoints[index][0] - this.activePoints[index][2] - 5, this.activePoints[index][1] - 2 * this.activePoints[index][3],
              this.currentX - (this.activePoints[index][0] - this.activePoints[index][2]), 2 * this.activePoints[index][3] + 2);
          else
            context.fillRect(this.activePoints[index][0] - this.activePoints[index][2] - 5, this.activePoints[index][1],
              this.currentX - (this.activePoints[index][0] - this.activePoints[index][2]), 2 * this.activePoints[index][3] + 2);

          context.fillStyle = this.getAnimalRacerColor(this.associatedAnimal.raceCourseType);

          if (index === 0)
            context.fillRect(this.currentX - 5, this.activePoints[index][1] - 2 * this.activePoints[index][3], 10, 2 * this.activePoints[index][3]);
          else
            context.fillRect(this.currentX - 5, this.activePoints[index][1], 10, 2 * this.activePoints[index][3]);
        }
        else {
          context.beginPath();
          context.moveTo(this.activePoints[i][0], this.activePoints[i][1]);
          context.lineTo(this.currentX, this.currentY);
          context.stroke();

          context.fillStyle = this.getAnimalRacerColor(this.associatedAnimal.raceCourseType);
          context.fillRect(this.currentX - 5, this.currentY - 5, 10, 10);
        }
      }
    }
  }

  pointerMove(event: any) {
    if (!this.isPointerDown || this.activePoints === null || this.activePoints === undefined || this.activePoints.length === 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    var mouseX = event.clientX - this.canvasOffsetX;
    var mouseY = event.clientY - this.canvasOffsetY;
    var xGraceAmount = this.canvasWidth * .1;
    var yGraceAmount = this.canvasHeight * .1;

    //do initial set up here maybe
    if (this.currentEndPoint === 0) {
      this.currentX = this.activePoints[0][0];
      this.currentY = this.activePoints[0][1];

      if (this.currentPathType === CoachingCourseTypeEnum.power) {
        this.currentX = this.activePoints[0][0] - this.activePoints[0][2];
        this.currentY = this.activePoints[0][1];
      }

      this.currentEndPoint = 1;
    }

    if (this.currentPathType === CoachingCourseTypeEnum.power) {
      yGraceAmount = this.canvasHeight * .25;
    }

    //console.log("Current End Point: " + this.currentEndPoint + " Total Points: " + this.activePoints.length);
    var minXPoint = this.activePoints[this.currentEndPoint - 1][0] < this.activePoints[this.currentEndPoint][0] ? this.activePoints[this.currentEndPoint - 1][0] : this.activePoints[this.currentEndPoint][0];
    var maxXPoint = this.activePoints[this.currentEndPoint - 1][0] < this.activePoints[this.currentEndPoint][0] ? this.activePoints[this.currentEndPoint][0] : this.activePoints[this.currentEndPoint - 1][0];
    var minYPoint = this.activePoints[this.currentEndPoint - 1][1] < this.activePoints[this.currentEndPoint][1] ? this.activePoints[this.currentEndPoint - 1][1] : this.activePoints[this.currentEndPoint][1];
    var maxYPoint = this.activePoints[this.currentEndPoint - 1][1] < this.activePoints[this.currentEndPoint][1] ? this.activePoints[this.currentEndPoint][1] : this.activePoints[this.currentEndPoint - 1][1];
    var drawingMinXPoint = minXPoint - xGraceAmount;
    var drawingMaxXPoint = maxXPoint + xGraceAmount;
    var drawingMinYPoint = minYPoint - yGraceAmount;
    var drawingMaxYPoint = maxYPoint + yGraceAmount;

    var xGoingBackwards = false;
    var yGoingBackwards = false;
    var xStaysSame = false;
    var yStaysSame = false;

    if (this.activePoints[this.currentEndPoint - 1][0] > this.activePoints[this.currentEndPoint][0])
      xGoingBackwards = true;
    if (this.activePoints[this.currentEndPoint - 1][1] > this.activePoints[this.currentEndPoint][1])
      yGoingBackwards = true;
    if (this.activePoints[this.currentEndPoint - 1][0] === this.activePoints[this.currentEndPoint][0])
      xStaysSame = true;
    if (this.activePoints[this.currentEndPoint - 1][1] === this.activePoints[this.currentEndPoint][1])
      yStaysSame = true;

    //currentendpoint is 1 or 3
    if (this.currentPathType === CoachingCourseTypeEnum.power && (this.currentEndPoint === 1 || this.currentEndPoint === 3)) {
      if (this.currentEndPoint === 1) {
        minXPoint = this.activePoints[this.currentEndPoint - 1][0] - this.activePoints[this.currentEndPoint - 1][2];
        maxXPoint = this.activePoints[this.currentEndPoint - 1][0] + this.activePoints[this.currentEndPoint - 1][2];
        minYPoint = this.activePoints[this.currentEndPoint - 1][1];
        maxYPoint = this.activePoints[this.currentEndPoint - 1][1];
      }
      else {
        minXPoint = this.activePoints[this.currentEndPoint][0] - this.activePoints[this.currentEndPoint][2];
        maxXPoint = this.activePoints[this.currentEndPoint][0] + this.activePoints[this.currentEndPoint][2];
        minYPoint = this.activePoints[this.currentEndPoint][1];
        maxYPoint = this.activePoints[this.currentEndPoint][1];
      }
      drawingMinXPoint = minXPoint - xGraceAmount;
      drawingMaxXPoint = maxXPoint + xGraceAmount;
      drawingMinYPoint = minYPoint - yGraceAmount;
      drawingMaxYPoint = maxYPoint + yGraceAmount;
      xGoingBackwards = false;
      yGoingBackwards = false;
      xStaysSame = false;
      yStaysSame = true;

      //console.log("Arc 2 current X: " + this.currentX + " current Y: " + this.currentY + " MaxX: " + maxXPoint + " MaxY: " + maxYPoint + " XBackwards: " + xGoingBackwards + " YBackwards: " + yGoingBackwards);
    }
    else if (this.currentPathType === CoachingCourseTypeEnum.power && this.currentEndPoint === 2) {
      minXPoint = this.activePoints[2][0];
      maxXPoint = this.activePoints[1][0];
      minYPoint = this.activePoints[1][1];
      maxYPoint = this.activePoints[2][1];
      drawingMinXPoint = minXPoint - xGraceAmount;
      drawingMaxXPoint = maxXPoint + xGraceAmount;
      drawingMinYPoint = minYPoint - yGraceAmount;
      drawingMaxYPoint = maxYPoint + yGraceAmount;
      xGoingBackwards = true;
      yGoingBackwards = false;
      xStaysSame = false;
      yStaysSame = false;
    }

    //you'll have to do this uniquely for each path        
    if (mouseX >= drawingMinXPoint && mouseX <= drawingMaxXPoint && mouseY >= drawingMinYPoint && mouseY <= drawingMaxYPoint) {
      if (!xStaysSame && !yStaysSame) {
        if (((!xGoingBackwards && mouseX > this.currentX) || (xGoingBackwards && mouseX < this.currentX))) {
          var percentThroughX = (mouseX - minXPoint) / (maxXPoint - minXPoint);
          if (xGoingBackwards)
            percentThroughX = 1 - percentThroughX;

          //console.log(percentThroughX + " " + this.currentX + " " + minXPoint + " " + maxXPoint);
          if (yGoingBackwards)
            percentThroughX = 1 - percentThroughX;
          var estimatedYPosition = ((maxYPoint - minYPoint) * percentThroughX) + minYPoint;
          //console.log("Est Y: " + estimatedYPosition + " MinY: " + minYPoint + " MaxY: " + maxYPoint + " %X: " + percentThroughX);

          this.currentX = mouseX;
          this.currentY = estimatedYPosition;
          //console.log("Current: " + this.currentX + ", " + this.currentY + " Target: " + maxXPoint + ", " + maxYPoint);
        }
      }
      else {
        if (((!yGoingBackwards && mouseY > this.currentY) || (yGoingBackwards && mouseY < this.currentY)) && !yStaysSame) {
          this.currentY = mouseY;
        }

        if (((!xGoingBackwards && mouseX > this.currentX) || (xGoingBackwards && mouseX < this.currentX)) && !xStaysSame) {
          //console.log("new MaxX: " + this.currentX);
          this.currentX = mouseX;
        }
      }

      var graceX = this.canvasWidth * .005;
      var graceY = this.canvasHeight * .005;
      //console.log("CEP: " + this.currentEndPoint + " current X: " + this.currentX + " current Y: " + this.currentY + " MaxX: " + maxXPoint + " MaxY: " + maxYPoint + " XBackwards: " + xGoingBackwards + " YBackwards: " + yGoingBackwards);
      if (((!xGoingBackwards && this.currentX >= maxXPoint - graceX) || (xGoingBackwards && this.currentX <= minXPoint + graceX)) &&
        ((!yGoingBackwards && this.currentY >= maxYPoint - graceY) || (yGoingBackwards && this.currentY <= minYPoint + graceY))) {
        this.currentX = xGoingBackwards ? minXPoint : maxXPoint;
        this.currentY = yGoingBackwards ? minYPoint : maxYPoint;
        this.currentEndPoint += 1;

        if (this.currentEndPoint > this.activePoints.length - 1)
          this.completePath();
      }
    }
    else {
      /*console.log("Not Drawing: ");
      console.log("Mouse X: " + mouseX + " minX: " + minXPoint + " maxX: " + maxXPoint);
      console.log("Mouse Y: " + mouseY + " minY: " + minYPoint + " maxY: " + maxYPoint);*/
    }
  }

  pointerUp() {
    this.isPointerDown = false;
  }

  pointerDown() {
    this.isPointerDown = true;
  }

  //finalized
  drawSpeedTrace(context: any) {
    var offsetX = this.canvasWidth * .15;
    var offsetY = this.canvasHeight * .1;

    var linePoints = [];
    linePoints.push([offsetX, offsetY]);
    linePoints.push([this.canvasWidth - offsetX, offsetY]);
    linePoints.push([this.canvasWidth / 2, this.canvasHeight / 2]);
    linePoints.push([this.canvasWidth - offsetX, this.canvasHeight - offsetY]);
    linePoints.push([offsetX, this.canvasHeight - offsetY]);

    context.beginPath();
    context.moveTo(linePoints[0][0], linePoints[0][1]);
    context.lineTo(linePoints[1][0], linePoints[1][1]);
    context.stroke();
    context.beginPath();
    context.moveTo(linePoints[1][0], linePoints[1][1]);
    context.lineTo(linePoints[2][0], linePoints[2][1]);
    context.stroke();
    context.beginPath();
    context.moveTo(linePoints[2][0], linePoints[2][1]);
    context.lineTo(linePoints[3][0], linePoints[3][1]);
    context.stroke();
    context.beginPath();
    context.moveTo(linePoints[3][0], linePoints[3][1]);
    context.lineTo(linePoints[4][0], linePoints[4][1]);
    context.stroke();

    return linePoints;
  }

  //finalized
  drawAdaptabilityTrace(context: any) {
    var offsetX = this.canvasWidth * .15;
    var offsetY = this.canvasHeight * .1;

    var numberOfPeaks = 7;
    var xPeakOffset = (this.canvasWidth - 2 * offsetX) / (numberOfPeaks * 2);
    var yPeakOffset = (this.canvasHeight - 2 * offsetY) / numberOfPeaks;

    var linePoints = [];
    linePoints.push([offsetX, this.canvasHeight / 2]);
    linePoints.push([offsetX + xPeakOffset, this.canvasHeight / 2 - yPeakOffset]);

    linePoints.push([offsetX + 2 * xPeakOffset, this.canvasHeight / 2 + yPeakOffset]);
    linePoints.push([offsetX + 3 * xPeakOffset, this.canvasHeight / 2 - 2 * yPeakOffset]);

    linePoints.push([offsetX + 4 * xPeakOffset, this.canvasHeight / 2 + 2 * yPeakOffset]);
    linePoints.push([offsetX + 5 * xPeakOffset, this.canvasHeight / 2 - 3 * yPeakOffset]);

    linePoints.push([offsetX + 6 * xPeakOffset, this.canvasHeight / 2 + 3 * yPeakOffset]);

    linePoints.push([offsetX + 7 * xPeakOffset, this.canvasHeight / 2 - 4 * yPeakOffset]);
    linePoints.push([offsetX + 8 * xPeakOffset, this.canvasHeight / 2 + 3 * yPeakOffset]);
    linePoints.push([offsetX + 9 * xPeakOffset, this.canvasHeight / 2 - 3 * yPeakOffset]);

    linePoints.push([offsetX + 10 * xPeakOffset, this.canvasHeight / 2 + 2 * yPeakOffset]);

    linePoints.push([offsetX + 11 * xPeakOffset, this.canvasHeight / 2 - 2 * yPeakOffset]);
    linePoints.push([offsetX + 12 * xPeakOffset, this.canvasHeight / 2 + yPeakOffset]);

    linePoints.push([offsetX + 13 * xPeakOffset, this.canvasHeight / 2 - yPeakOffset]);
    /*linePoints.push([offsetX + 14 * xPeakOffset, this.canvasHeight / 2 + yPeakOffset]);
    
    linePoints.push([offsetX + 15 * xPeakOffset, this.canvasHeight / 2 - yPeakOffset]);*/
    linePoints.push([offsetX + 14 * xPeakOffset, this.canvasHeight / 2]);


    for (var i = 1; i < linePoints.length; i++) {
      context.beginPath();
      context.moveTo(linePoints[i - 1][0], linePoints[i - 1][1]);
      context.lineTo(linePoints[i][0], linePoints[i][1]);
      context.stroke();
    }

    return linePoints;
  }

  //finalized
  drawPowerTrace(context: any) {
    var offsetX = this.canvasWidth * .15;
    var offsetY = this.canvasHeight * .1

    var linePoints = [];
    linePoints.push([this.canvasWidth / 2, this.canvasHeight / 4, this.canvasWidth / 2 - offsetX, this.canvasHeight / 4 - offsetY, 0, 0, Math.PI]);
    linePoints.push([(this.canvasWidth / 2) + (this.canvasWidth / 2 - offsetX), this.canvasHeight / 4]);
    linePoints.push([(this.canvasWidth / 2) - (this.canvasWidth / 2 - offsetX), 3 * this.canvasHeight / 4]);
    linePoints.push([this.canvasWidth / 2, 3 * this.canvasHeight / 4, this.canvasWidth / 2 - offsetX, this.canvasHeight / 4 - offsetY, 0, 0, Math.PI]);

    context.beginPath();
    context.ellipse(linePoints[0][0], linePoints[0][1], linePoints[0][2], linePoints[0][3], linePoints[0][4], linePoints[0][5], linePoints[0][6], true);
    context.stroke();
    context.beginPath();
    context.moveTo(linePoints[1][0], linePoints[1][1]);
    context.lineTo(linePoints[2][0], linePoints[2][1]);
    context.stroke();
    context.beginPath();
    context.ellipse(linePoints[3][0], linePoints[3][1], linePoints[3][2], linePoints[3][3], linePoints[3][4], linePoints[3][5], linePoints[3][6], false);
    context.stroke();

    return linePoints;
  }

  //finalized
  drawEnduranceTrace(context: any) {
    var offsetX = this.canvasWidth * .15;
    var offsetY = this.canvasHeight * .1;

    var xSquareOffset = this.canvasWidth * .15;
    var ySquareOffset = this.canvasHeight * .15;

    var linePoints = [];
    linePoints.push([offsetX, offsetY]);
    linePoints.push([this.canvasWidth - offsetX, offsetY]);
    linePoints.push([this.canvasWidth - offsetX, this.canvasHeight - offsetY]);
    linePoints.push([offsetX, this.canvasHeight - offsetY]);

    linePoints.push([offsetX, this.canvasHeight / 2]);
    //linePoints.push([offsetX, offsetY + ySquareOffset]);
    //linePoints.push([this.canvasWidth - (offsetX + xSquareOffset), offsetY + ySquareOffset]);
    //linePoints.push([this.canvasWidth - (offsetX + xSquareOffset), this.canvasHeight / 2]);
    /*linePoints.push([this.canvasWidth - (offsetX + xSquareOffset), this.canvasHeight - (offsetY + ySquareOffset)]);
    linePoints.push([offsetX + xSquareOffset, this.canvasHeight - (offsetY + ySquareOffset)]);

    linePoints.push([offsetX + xSquareOffset, offsetY + 2 * ySquareOffset]);
    linePoints.push([this.canvasWidth - (offsetX + 2 * xSquareOffset), offsetY + 2 * ySquareOffset]);
    linePoints.push([this.canvasWidth - (offsetX + 2 * xSquareOffset), this.canvasHeight - (offsetY + 2 * ySquareOffset)]);
    linePoints.push([offsetX + 2 * xSquareOffset, this.canvasHeight - (offsetY + 2 * ySquareOffset)]);
*/
    //linePoints.push([offsetX + 2 * xSquareOffset, this.canvasHeight / 2]);
    linePoints.push([this.canvasWidth / 2, this.canvasHeight / 2]);

    for (var i = 1; i < linePoints.length; i++) {
      context.beginPath();
      context.moveTo(linePoints[i - 1][0], linePoints[i - 1][1]);
      context.lineTo(linePoints[i][0], linePoints[i][1]);
      context.stroke();
    }

    return linePoints;
  }

  //finalized
  drawFocusTrace(context: any) {
    var offsetX = this.canvasWidth * .15;
    var offsetY = this.canvasHeight * .1;

    var linePoints = [];
    linePoints.push([this.canvasWidth / 3, offsetY]);
    linePoints.push([this.canvasWidth / 3, this.canvasHeight / 6]);
    linePoints.push([offsetX, this.canvasHeight / 6]);
    linePoints.push([this.canvasWidth / 2, this.canvasHeight - offsetY]);
    linePoints.push([this.canvasWidth - offsetX, this.canvasHeight / 6]);
    linePoints.push([2 * this.canvasWidth / 3, this.canvasHeight / 6]);
    linePoints.push([2 * this.canvasWidth / 3, offsetY]);

    for (var i = 1; i < linePoints.length; i++) {
      context.beginPath();
      context.moveTo(linePoints[i - 1][0], linePoints[i - 1][1]);
      context.lineTo(linePoints[i][0], linePoints[i][1]);
      context.stroke();
    }

    return linePoints;
  }

  //finalized
  drawAccelerationTrace(context: any) {
    var offsetX = this.canvasWidth * .15;
    var offsetY = this.canvasHeight * .1;

    var numberOfDropOffs = 5;
    var availableWidth = this.canvasWidth - (2 * offsetX);
    var availableHeight = this.canvasHeight - (2 * offsetY);

    var linePoints = [];
    linePoints.push([offsetX, offsetY]);
    linePoints.push([availableWidth / numberOfDropOffs + offsetX, offsetY]);
    linePoints.push([availableWidth / numberOfDropOffs + offsetX, 2 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([2 * availableWidth / numberOfDropOffs + offsetX, 2 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([2 * availableWidth / numberOfDropOffs + offsetX, 4 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([3 * availableWidth / numberOfDropOffs + offsetX, 4 * availableHeight / numberOfDropOffs + offsetY]);
    /*linePoints.push([3 * availableWidth / numberOfDropOffs + offsetX, 6 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([4 * availableWidth / numberOfDropOffs + offsetX, 6 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([4 * availableWidth / numberOfDropOffs + offsetX, 8 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([5 * availableWidth / numberOfDropOffs + offsetX, 8 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([5 * availableWidth / numberOfDropOffs + offsetX, 6 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([6 * availableWidth / numberOfDropOffs + offsetX, 6 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([6 * availableWidth / numberOfDropOffs + offsetX, 4 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([7 * availableWidth / numberOfDropOffs + offsetX, 4 * availableHeight / numberOfDropOffs + offsetY]);*/
    linePoints.push([3 * availableWidth / numberOfDropOffs + offsetX, 2 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([4 * availableWidth / numberOfDropOffs + offsetX, 2 * availableHeight / numberOfDropOffs + offsetY]);
    linePoints.push([4 * availableWidth / numberOfDropOffs + offsetX, offsetY]);
    linePoints.push([5 * availableWidth / numberOfDropOffs + offsetX, offsetY]);

    for (var i = 1; i < linePoints.length; i++) {
      context.beginPath();
      context.moveTo(linePoints[i - 1][0], linePoints[i - 1][1]);
      context.lineTo(linePoints[i][0], linePoints[i][1]);
      context.stroke();
    }

    return linePoints;
  }

  getAnimalDistanceColor(courseType: RaceCourseTypeEnum) {
    var color = "";

    if (courseType === RaceCourseTypeEnum.Flatland)
      color = "#7d3f00";//"#8f1c14";
    if (courseType === RaceCourseTypeEnum.Mountain) {
      color = "#1b630d";
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

  getAnimalRacerColor(courseType: RaceCourseTypeEnum) {
    var color = "";

    if (courseType === RaceCourseTypeEnum.Flatland) {
      if (this.themeService.getActiveThemeName() === "night")
        color = "#E18B07";
      else if (this.themeService.getActiveThemeName() === "light")
        color = "#c66900";
      else
        color = "#c66900";
    }
    if (courseType === RaceCourseTypeEnum.Mountain) {
      if (this.themeService.getActiveThemeName() === "night")
        color = "#30b001";
      else if (this.themeService.getActiveThemeName() === "light")
        color = "#279113";
      else
        color = "#279113";
    }
    if (courseType === RaceCourseTypeEnum.Ocean) {
      if (this.themeService.getActiveThemeName() === "night")
        color = "#9289CF";
      else if (this.themeService.getActiveThemeName() === "light")
        color = "#0000FF";
      else
        color = "#0000FF";
    }
    if (courseType === RaceCourseTypeEnum.Tundra) {
      if (this.themeService.getActiveThemeName() === "night")
        color = "#019DDE";
      else if (this.themeService.getActiveThemeName() === "light")
        color = "#1CA1C9";
      else
        color = "#1CA1C9";
    }
    if (courseType === RaceCourseTypeEnum.Volcanic) {
      if (this.themeService.getActiveThemeName() === "night")
        color = "#E56C6E";
      else if (this.themeService.getActiveThemeName() === "light")
        color = "#D92525";
      else
        color = "#D92525";
    }
    return color;
  }

  getRandomPathType(previousPathType?: CoachingCourseTypeEnum): CoachingCourseTypeEnum {
    var enumValues = Object.keys(CoachingCourseTypeEnum);
    var options: number[] = [];
    enumValues.forEach((obj, index) => {
      if (!isNaN(Number(obj)) && Number(obj) !== 6) {
        options.push(Number(obj));
      }
    });

    var rng = this.utilityService.getRandomInteger(0, options.length - 1);

    return options[rng];
  }

  completePath() {
    this.getNewPath = true;
    this.currentEndPoint = 0;
    this.activePoints = [];
    this.currentX = 0;
    this.currentY = 0;
    this.isPointerDown = false;
    this.successfulAttemptStreak += 1;
    this.getReward(this.currentPathType);
    this.associatedAnimal.trackedAnimalStats.successfulCoachingAttempts += 1;
    this.currentPathType = this.getRandomPathType(this.currentPathType);
  }

  getReward(pathType: CoachingCourseTypeEnum) {
    var statGainAmount = 1;

    var whistle = this.globalService.globalVar.resources.find(item => item.name === "Whistle");

    if (whistle !== undefined && whistle !== null && whistle.amount > 0) {
      var whistleStatGainModifier = this.globalService.globalVar.modifiers.find(item => item.text === "whistleModifier");
      if (whistleStatGainModifier !== undefined && whistleStatGainModifier !== null)
        statGainAmount = whistleStatGainModifier.value;
    }

    var goldenWhistle = this.globalService.globalVar.resources.find(item => item.name === "Golden Whistle");
    if (goldenWhistle !== undefined && goldenWhistle !== null && goldenWhistle.amount > 0) {
      var goldenWhistleStatGainModifier = this.globalService.globalVar.modifiers.find(item => item.text === "goldenWhistleModifier");
      if (goldenWhistleStatGainModifier !== undefined && goldenWhistleStatGainModifier !== null)
        statGainAmount = goldenWhistleStatGainModifier.value;
    }

    var scrimmageValueIncrease = 1;
    if (this.globalService.globalVar.resources.find(item => item.name === "Research Center Improvements")) {
      var researchCenterRewardBonusAmountModifier = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterRewardBonusAmountModifier");

      if (researchCenterRewardBonusAmountModifier !== undefined && researchCenterRewardBonusAmountModifier !== null) {
        var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

        if (globalBarn !== undefined && globalBarn.barnUpgrades.specialization === BarnSpecializationEnum.ResearchCenter)
          scrimmageValueIncrease = 1 + (researchCenterRewardBonusAmountModifier.value * globalBarn.barnUpgrades.specializationLevel);
      }
    }

    statGainAmount *= scrimmageValueIncrease;

    if (pathType === CoachingCourseTypeEnum.speed) {
      this.associatedAnimal.currentStats.topSpeed += statGainAmount;
      this.incrementalCoachingUpdates += this.animalDisplayName + " completes the course and gains " + statGainAmount + " speed. (" + this.associatedAnimal.currentStats.topSpeed.toFixed(2) + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.acceleration) {
      this.associatedAnimal.currentStats.acceleration += statGainAmount;
      this.incrementalCoachingUpdates += this.animalDisplayName + " completes the course and gains " + statGainAmount + " acceleration. (" + this.associatedAnimal.currentStats.acceleration.toFixed(2) + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.endurance) {
      this.associatedAnimal.currentStats.endurance += statGainAmount;
      this.incrementalCoachingUpdates += this.animalDisplayName + " completes the course and gains " + statGainAmount + " endurance. (" + this.associatedAnimal.currentStats.endurance.toFixed(2) + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.power) {
      this.associatedAnimal.currentStats.power += statGainAmount;
      this.incrementalCoachingUpdates += this.animalDisplayName + " completes the course and gains " + statGainAmount + " power. (" + this.associatedAnimal.currentStats.power.toFixed(2) + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.focus) {
      this.associatedAnimal.currentStats.focus += statGainAmount;
      this.incrementalCoachingUpdates += this.animalDisplayName + " completes the course and gains " + statGainAmount + " focus. (" + this.associatedAnimal.currentStats.focus.toFixed(2) + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.adaptability) {
      this.associatedAnimal.currentStats.adaptability += statGainAmount;
      this.incrementalCoachingUpdates += this.animalDisplayName + " completes the course and gains " + statGainAmount + " adaptability. (" + this.associatedAnimal.currentStats.adaptability.toFixed(2) + ")\n";
    }

    if (this.successfulAttemptStreak % 5 === 0) {
      this.globalService.increaseAbilityXp(this.associatedAnimal, statGainAmount);
      this.incrementalCoachingUpdates += this.animalDisplayName + " also gains " + statGainAmount + " XP towards their ability " + this.associatedAnimal.ability.name + "!\n";
    }

    this.globalService.calculateAnimalRacingStats(this.associatedAnimal);
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

}
