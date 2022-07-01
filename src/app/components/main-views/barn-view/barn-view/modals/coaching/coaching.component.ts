import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { CoachingCourseTypeEnum } from 'src/app/models/coaching-course-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-coaching',
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.css']
})
export class CoachingComponent implements OnInit {
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

  constructor(private gameLoopService: GameLoopService, private globalService: GlobalService, private themeService: ThemeService,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.incrementalCoachingUpdates = "Test\n";

    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.associatedAnimal = associatedAnimal;
        }
      }
    }
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
    var timeToCompletePath = 5;
    this.currentPathType = CoachingCourseTypeEnum.acceleration;//this.getRandomPathType();

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      //clear canvas
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.context.lineWidth = 6;
      this.displayTrace(this.context, currentTime);
    });
  }

  setupCanvas() {
    this.coachingCanvas.nativeElement.style.width = '100%';
    this.coachingCanvas.nativeElement.style.height = '100%';
    this.coachingCanvas.nativeElement.width = this.coachingCanvas.nativeElement.offsetWidth;
    this.coachingCanvas.nativeElement.height = this.coachingCanvas.nativeElement.offsetHeight;
    this.canvasHeight = this.coachingCanvas.nativeElement.height;
    this.canvasWidth = this.coachingCanvas.nativeElement.width;
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
    if (this.currentPathType === CoachingCourseTypeEnum.special)
      this.activePoints = this.drawSpecialTrace(context);

    context.strokeStyle = this.getAnimalDistanceColor(this.associatedAnimal.raceCourseType);
    context.globalCompositeOperation = "source-atop";
    for (var i = 0; i < this.currentEndPoint; i++) {
      if (i < this.currentEndPoint - 1) {
        //console.log("Fill completed section: " + (this.activePoints[i][0] - this.context.lineWidth / 2) + ", " + (this.activePoints[i][1] - this.context.lineWidth / 2) + ", " + (this.activePoints[i + 1][0] + this.context.lineWidth / 2) + ", " + (this.activePoints[i + 1][1] + this.context.lineWidth / 2));
        //completed sections

        if (this.currentPathType === CoachingCourseTypeEnum.power) {
          if (i === 0)
            context.ellipse(this.activePoints[0][0], this.activePoints[0][1], this.activePoints[0][2], this.activePoints[0][3], this.activePoints[0][4], this.activePoints[0][5], this.activePoints[0][6], true);
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
        if (this.currentPathType === CoachingCourseTypeEnum.power) {
          if (i === 0 || i === 2) {
            context.fillRect(this.activePoints[i][0] - this.activePoints[i][2], this.activePoints[i][1] - this.activePoints[i][3],
              2 * this.activePoints[i][2], 2 * this.activePoints[i][3]);

            context.fillStyle = this.getAnimalRacerColor(this.associatedAnimal.raceCourseType);
            context.fillRect(this.currentX - 5, this.activePoints[i][1] - this.activePoints[i][3], 10, 2 * this.activePoints[i][3]);
          }
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
      if (this.currentPathType === CoachingCourseTypeEnum.power) {
        this.currentX = this.activePoints[0][0];
        this.currentY = this.activePoints[0][1];
      }
      else {
        this.currentX = this.activePoints[0][0];
        this.currentY = this.activePoints[0][1];
      }
      this.currentEndPoint = 1;
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


    //you'll have to do this uniquely for each path        
    if (mouseX >= drawingMinXPoint && mouseX <= drawingMaxXPoint && mouseY >= drawingMinYPoint && mouseY <= drawingMaxYPoint) {
      if (!xStaysSame && !yStaysSame) {
        if (((!xGoingBackwards && mouseX > this.currentX) || (xGoingBackwards && mouseX < this.currentX))) {
          var percentThroughX = (mouseX - minXPoint) / (maxXPoint - minXPoint);
          if (xGoingBackwards)
            percentThroughX = 1 - percentThroughX;

          //console.log(percentThroughX + " " + drawingMinXPoint + " " + drawingMaxXPoint);
          var estimatedYPosition = ((maxYPoint - minYPoint) * percentThroughX) + minYPoint;
          //console.log("Est Y: " + estimatedYPosition + "MinY: " + minYPoint + " MaxY: " + maxYPoint + " %X: " + percentThroughX);

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

      //console.log("CEP: " + this.currentEndPoint + " current X: " + this.currentX + " current Y: " + this.currentY + " MaxX: " + maxXPoint + " MaxY: " + maxYPoint);
      if (((!xGoingBackwards && this.currentX >= maxXPoint) || (xGoingBackwards && this.currentX <= minXPoint)) &&
        ((!yGoingBackwards && this.currentY >= maxYPoint) || (yGoingBackwards && this.currentY <= minYPoint))) {
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
    var offsetX = this.canvasWidth * .1;
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
  drawAccelerationTrace(context: any) {
    var offsetX = this.canvasWidth * .1;
    var offsetY = this.canvasHeight * .1;

    var numberOfPeaks = 7;
    var xPeakOffset = (this.canvasWidth - 2*offsetX) / (numberOfPeaks*2);
    var yPeakOffset = (this.canvasHeight - 2*offsetY) / numberOfPeaks;

    var linePoints = [];
    linePoints.push([offsetX, this.canvasHeight / 2]);
    linePoints.push([offsetX + xPeakOffset, this.canvasHeight / 2 - yPeakOffset]);
    linePoints.push([offsetX + 2*xPeakOffset, this.canvasHeight / 2 + yPeakOffset]);
    
    linePoints.push([offsetX + 3*xPeakOffset, this.canvasHeight / 2 - 2 * yPeakOffset]);
    linePoints.push([offsetX + 4*xPeakOffset, this.canvasHeight / 2 + 2 * yPeakOffset]);

    linePoints.push([offsetX + 5*xPeakOffset, this.canvasHeight / 2 - 3 * yPeakOffset]);
    linePoints.push([offsetX + 6*xPeakOffset, this.canvasHeight / 2 + 3 * yPeakOffset]);

    linePoints.push([offsetX + 7*xPeakOffset, this.canvasHeight / 2 - 4 * yPeakOffset]);
    linePoints.push([offsetX + 8*xPeakOffset, this.canvasHeight / 2 + 4 * yPeakOffset]);

    linePoints.push([offsetX + 9*xPeakOffset, this.canvasHeight / 2 - 5 * yPeakOffset]);
    linePoints.push([offsetX + 10*xPeakOffset, this.canvasHeight / 2 + 5 * yPeakOffset]);

    linePoints.push([offsetX + 11*xPeakOffset, this.canvasHeight / 2 - 6 * yPeakOffset]);
    linePoints.push([offsetX + 12*xPeakOffset, this.canvasHeight / 2 + 6 * yPeakOffset]);

    linePoints.push([offsetX + 13*xPeakOffset, this.canvasHeight / 2 - 7 * yPeakOffset]);
    linePoints.push([offsetX + 14*xPeakOffset, this.canvasHeight / 2 + 7 * yPeakOffset]);

    
    for (var i=1;i<linePoints.length;i++)
    {
      context.beginPath();
      context.moveTo(linePoints[i-1][0], linePoints[i-1][1]);
      context.lineTo(linePoints[i][0], linePoints[i][1]);
      context.stroke();      
    }

    return linePoints;
  }

  //finalized?
  drawPowerTrace(context: any) {
    var offsetX = this.canvasWidth * .1;
    var offsetY = this.canvasHeight * .1;

    var linePoints = [];
    linePoints.push([this.canvasWidth / 2, this.canvasHeight / 4, this.canvasWidth / 2 - offsetX, this.canvasHeight / 4 - offsetY, 0, 0, Math.PI]);
    linePoints.push([(this.canvasWidth / 2) - (this.canvasWidth / 2 - offsetX), 3 * this.canvasHeight / 4]);
    linePoints.push([(this.canvasWidth / 2) + (this.canvasWidth / 2 - offsetX), this.canvasHeight / 4]);
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
    var offsetX = this.canvasWidth * .1;
    var offsetY = this.canvasHeight * .1;

    var xSquareOffset = this.canvasWidth * .15;
    var ySquareOffset = this.canvasHeight * .15;

    var linePoints = [];
    linePoints.push([offsetX, offsetY]);
    linePoints.push([this.canvasWidth - offsetX, offsetY]);
    linePoints.push([this.canvasWidth - offsetX, this.canvasHeight - offsetY]);
    linePoints.push([offsetX, this.canvasHeight - offsetY]);

    linePoints.push([offsetX, offsetY + ySquareOffset]);
    linePoints.push([this.canvasWidth - (offsetX + xSquareOffset), offsetY + ySquareOffset]);
    linePoints.push([this.canvasWidth - (offsetX + xSquareOffset), this.canvasHeight - (offsetY + ySquareOffset)]);
    linePoints.push([offsetX + xSquareOffset, this.canvasHeight - (offsetY + ySquareOffset)]);

    linePoints.push([offsetX + xSquareOffset, offsetY + 2*ySquareOffset]);
    linePoints.push([this.canvasWidth - (offsetX + 2*xSquareOffset), offsetY + 2*ySquareOffset]);
    linePoints.push([this.canvasWidth - (offsetX + 2*xSquareOffset), this.canvasHeight - (offsetY + 2*ySquareOffset)]);
    linePoints.push([offsetX + 2*xSquareOffset, this.canvasHeight - (offsetY + 2*ySquareOffset)]);

    linePoints.push([offsetX + 2* xSquareOffset, this.canvasHeight / 2]);
    linePoints.push([this.canvasWidth / 2, this.canvasHeight / 2]);

    for (var i=1;i<linePoints.length;i++)
    {
      context.beginPath();
      context.moveTo(linePoints[i-1][0], linePoints[i-1][1]);
      context.lineTo(linePoints[i][0], linePoints[i][1]);
      context.stroke();      
    }

    return linePoints;
  }

  //TODO
  drawFocusTrace(context: any) {
    var offsetX = this.canvasWidth * .1;
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

  //TODO
  drawAdaptabilityTrace(context: any) {
    var offsetX = this.canvasWidth * .1;
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

  //TODO
  drawSpecialTrace(context: any) {
    var offsetX = this.canvasWidth * .1;
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

  getAnimalDistanceColor(courseType: RaceCourseTypeEnum) {
    var color = "";

    if (courseType === RaceCourseTypeEnum.Flatland)
      color = "#7d3f00";
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

    if (courseType === RaceCourseTypeEnum.Flatland)
      color = "#c66900";
    if (courseType === RaceCourseTypeEnum.Mountain) {
      color = "#279113";
    }
    if (courseType === RaceCourseTypeEnum.Ocean) {
      if (this.themeService.getActiveThemeName() === "night")
        color = "#7463f7";
      else
        color = "#0000FF";
    }
    if (courseType === RaceCourseTypeEnum.Tundra)
      color = "#1CA1C9";
    if (courseType === RaceCourseTypeEnum.Volcanic)
      color = "#D92525";

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
    this.getReward(this.currentPathType);
    this.currentPathType = this.getRandomPathType(this.currentPathType);
  }

  getReward(pathType: CoachingCourseTypeEnum) {
    var courseClass = "coloredText " + this.associatedAnimal.getCourseTypeClass();
    var animalDisplayName = "<span class='" + courseClass + "'>" + this.associatedAnimal.name + "</span>";

    var statGainAmount = 1;

    if (pathType === CoachingCourseTypeEnum.speed) {
      this.associatedAnimal.currentStats.topSpeed += 1;
      this.incrementalCoachingUpdates += animalDisplayName + " completes the course and gains " + statGainAmount + " speed. (" + this.associatedAnimal.currentStats.topSpeed + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.acceleration) {
      this.associatedAnimal.currentStats.acceleration += 1;
      this.incrementalCoachingUpdates += animalDisplayName + " completes the course and gains " + statGainAmount + " acceleration. (" + this.associatedAnimal.currentStats.acceleration + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.endurance) {
      this.associatedAnimal.currentStats.endurance += 1;
      this.incrementalCoachingUpdates += animalDisplayName + " completes the course and gains " + statGainAmount + " endurance. (" + this.associatedAnimal.currentStats.endurance + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.power) {
      this.associatedAnimal.currentStats.power += 1;
      this.incrementalCoachingUpdates += animalDisplayName + " completes the course and gains " + statGainAmount + " power. (" + this.associatedAnimal.currentStats.power + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.focus) {
      this.associatedAnimal.currentStats.focus += 1;
      this.incrementalCoachingUpdates += animalDisplayName + " completes the course and gains " + statGainAmount + " focus. (" + this.associatedAnimal.currentStats.focus + ")\n";
    }
    if (pathType === CoachingCourseTypeEnum.adaptability) {
      this.associatedAnimal.currentStats.adaptability += 1;
      this.incrementalCoachingUpdates += animalDisplayName + " completes the course and gains " + statGainAmount + " adaptability. (" + this.associatedAnimal.currentStats.adaptability + ")\n";
    }

    this.globalService.calculateAnimalRacingStats(this.associatedAnimal);
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
