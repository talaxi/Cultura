import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimalStatEnum } from 'src/app/models/animal-stat-enum.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { BarnSpecializationEnum } from 'src/app/models/barn-specialization-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { ScrimmageEventEnum } from 'src/app/models/scrimmage-event-enum.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { ThemeService } from 'src/app/theme/theme.service';

@Component({
  selector: 'app-scrimmage',
  templateUrl: './scrimmage.component.html',
  styleUrls: ['./scrimmage.component.css']
})
export class ScrimmageComponent implements OnInit {
  @Input() selectedBarnNumber: number;
  associatedAnimal: Animal;
  incrementalCoachingUpdates: string;
  @ViewChild('coachingCanvas', { static: false, read: ElementRef }) coachingCanvas: ElementRef;
  @ViewChild('drawCoaching', { static: false, read: ElementRef }) drawCoaching: ElementRef;
  @ViewChild('scrimmageContent', { static: true }) scrimmageContent: ElementRef;
  canvasHeight: number;
  canvasWidth: number;
  canvasOffsetX: number;
  canvasOffsetY: number;
  subscription: any;
  context: any;
  animalDisplayName: string;
  xRaceModeModifier: number = 10;
  xDistanceOffset: number;
  yDistanceOffset: number;

  timeToBeat: number = 4;
  timeToFinishScrimmage: number;
  currentDistance: number;
  maxSpeed: number;
  velocity: number;
  frameModifier: number = 60;
  event: ScrimmageEventEnum;
  checkedForEvent: boolean;
  correctOptionSelected: boolean;
  buttonCooldown = .95;
  currentButtonCooldown = 0;
  chainModifier: number = 1;
  currentStatus = "";
  maxEnergy: number;
  remainingEnergy: number;
  energyResetMinutes: number = 15; 

  pauseRace: boolean = false;
  emphasizeWhistle: boolean = false;
  emphasizeFood: boolean = false;
  emphasizeEncouragement: boolean = false;
  colorConditional: any;
  reachedExhaustion = false;
  triggerBurstTimer: boolean = false;
  burstTimer: number = 0;
  burstThreshold: number = .4;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {    
    if (event.key === "F" || event.key === "f") {
      this.showFood();
    }
    if (event.key === "E" || event.key === "e") {
      this.shoutEncouragement();
    }
    if (event.key === "W" || event.key === "w") {
      this.blowWhistle();
    }
  }

  constructor(private gameLoopService: GameLoopService, private globalService: GlobalService, private themeService: ThemeService,
    private utilityService: UtilityService, private lookupService: LookupService, private modalService: NgbModal) { }

  ngOnInit(): void {
    if (this.globalService.globalVar.tutorials.showScrimmageTutorial)
    {
      this.pauseRace = true;
      this.openScrimmageInfoModal();
      this.globalService.globalVar.tutorials.showScrimmageTutorial = false;
    }

    this.timeToBeat = 4;
    this.timeToFinishScrimmage = 0;
    this.currentDistance = 0;
    this.checkedForEvent = false;
    this.correctOptionSelected = false;
    this.currentStatus = "OK";

    if (this.selectedBarnNumber > 0 && this.selectedBarnNumber <= this.globalService.globalVar.barns.length + 1) {
      var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === this.selectedBarnNumber);

      if (globalBarn !== undefined) {
        var associatedAnimal = this.globalService.globalVar.animals.find(item => item.associatedBarnNumber == this.selectedBarnNumber);

        if (associatedAnimal !== undefined && associatedAnimal !== null) {
          this.associatedAnimal = associatedAnimal;

          this.maxEnergy = Math.ceil(this.associatedAnimal.breedLevel / 5);
          if (this.maxEnergy > 30)
            this.maxEnergy = 30;
          this.remainingEnergy = this.maxEnergy - 1;
          this.associatedAnimal.scrimmageEnergyTimer = this.energyResetMinutes * 60;
          var courseClass = "coloredText " + this.associatedAnimal.getCourseTypeClass();
          this.animalDisplayName = "<span class='" + courseClass + "'>" + this.associatedAnimal.name + "</span>";
        }
      }
    }

    this.incrementalCoachingUpdates = "You bring " + this.animalDisplayName + " out for some scrimmage races.\n";
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

    this.setDefaultMaxSpeedAndVelocity();
    this.event = this.getRandomScrimmageType();

    if (this.event === ScrimmageEventEnum.lowDrive) {
      this.checkedForEvent = true;
      this.maxSpeed /= 3;
      this.velocity /= 3;
      this.incrementalCoachingUpdates = this.animalDisplayName + " is off to a slow start, not caring about how well they do.\n";
      this.currentStatus = "Low Drive";
      this.emphasizeFood = true;
      this.triggerBurstTimer = true;
    }

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      //clear canvas
      if (!this.pauseRace && !this.reachedExhaustion) {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.context.lineWidth = 6;
        this.displayScrimmage(this.context, deltaTime);
      }
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

  displayScrimmage(context: any, deltaTime: number) {
    context.lineCap = "round";
    context.strokeStyle = "gray";
    context.globalCompositeOperation = "source-over";
    this.timeToFinishScrimmage += deltaTime;

    this.currentButtonCooldown -= deltaTime;
    if (this.currentButtonCooldown <= 0)
      this.currentButtonCooldown = 0;

    if (this.triggerBurstTimer)
      this.burstTimer += deltaTime;

    this.currentDistance += this.velocity;

    if (this.currentDistance >= (this.canvasWidth / 2) && this.event === ScrimmageEventEnum.lostFocus && !this.checkedForEvent) {
      this.checkedForEvent = true;
      this.velocity = this.velocity * .35;
      this.incrementalCoachingUpdates += this.animalDisplayName + " loses focus!\n";
      this.currentStatus = "Lost Focus";
      this.emphasizeWhistle = true;
      this.triggerBurstTimer = true;
    }

    if (this.currentDistance >= (this.canvasWidth / 4) && this.event === ScrimmageEventEnum.outOfControl && !this.checkedForEvent) {
      this.checkedForEvent = true;
      this.incrementalCoachingUpdates += this.animalDisplayName + " looks like they are losing control and may stumble!\n";
      this.currentStatus = "Stumbling";
      this.emphasizeEncouragement = true;
      this.triggerBurstTimer = true;
    }

    if (this.currentDistance >= (3 * this.canvasWidth / 4) && this.event === ScrimmageEventEnum.outOfControl && this.checkedForEvent &&
      !this.correctOptionSelected && this.currentStatus !== "Stumbled") {
      this.velocity /= 5;
      this.incrementalCoachingUpdates += this.animalDisplayName + " stumbled!\n";
      this.currentStatus = "Stumbled";
      this.emphasizeEncouragement = false;    
    }

    if (this.currentDistance >= this.canvasWidth) {
      this.scrimmageComplete();
    }

    this.drawPath();
    this.drawRacer();
    if (this.associatedAnimal.raceCourseType === RaceCourseTypeEnum.Tundra)
      this.drawIcyBackground();
  }

  blowWhistle() {
    if (this.currentButtonCooldown > 0)
      return;

    this.currentButtonCooldown = this.buttonCooldown;

    if (this.event === ScrimmageEventEnum.lostFocus && this.checkedForEvent) {
      this.setDefaultMaxSpeedAndVelocity();
      this.correctOptionSelected = true;
      this.incrementalCoachingUpdates += "You blow your whistle, jolting " + this.animalDisplayName + " back to focus.\n";
      this.currentStatus = "OK";
      this.emphasizeWhistle = false;

      console.log(this.burstTimer + " vs " + this.burstThreshold);
      if (this.burstTimer <= this.burstThreshold)
      {
        this.incrementalCoachingUpdates += this.animalDisplayName + " BURSTS!\n";
        this.velocity *= 1.25;
        this.currentStatus = "BURST!";
      }
    }
  }

  showFood() {
    if (this.currentButtonCooldown > 0)
      return;

    this.currentButtonCooldown = this.buttonCooldown;

    if (this.event === ScrimmageEventEnum.lowDrive && this.checkedForEvent) {
      this.setDefaultMaxSpeedAndVelocity();
      this.correctOptionSelected = true;
      this.incrementalCoachingUpdates += "You hold a treat at the end of the finish line, giving " + this.animalDisplayName + " the inspiration to continue.\n";
      this.currentStatus = "OK";
      this.emphasizeFood = false;

      console.log(this.burstTimer + " vs " + this.burstThreshold);
      if (this.burstTimer <= this.burstThreshold)
      {
        this.incrementalCoachingUpdates += this.animalDisplayName + " BURSTS!\n";
        this.velocity *= 1.25;
        this.currentStatus = "BURST!";
      }
    }
  }

  shoutEncouragement() {
    if (this.currentButtonCooldown > 0)
      return;

    this.currentButtonCooldown = this.buttonCooldown;

    if (this.event === ScrimmageEventEnum.outOfControl && this.checkedForEvent && this.currentStatus !== "Stumbled") {
      this.setDefaultMaxSpeedAndVelocity();
      this.correctOptionSelected = true;
      this.incrementalCoachingUpdates += "You shout encouragement at " + this.animalDisplayName + " and they regain their composure.\n";
      this.currentStatus = "OK";
      this.emphasizeEncouragement = false;

      console.log(this.burstTimer + " vs " + this.burstThreshold);
      if (this.burstTimer <= this.burstThreshold)
      {
        this.incrementalCoachingUpdates += this.animalDisplayName + " BURSTS!\n";
        this.velocity *= 1.25;
        this.currentStatus = "BURST!";
      }
    }
  }

  drawRacer() {
    this.context.fillStyle = this.getAnimalDistanceColor(this.associatedAnimal.raceCourseType);
    this.context.globalCompositeOperation = "source-atop";

    //canvas width = max distance
    this.context.fillRect(0, 0, this.currentDistance - 5, this.canvasHeight);

    var racerColor = this.getAnimalRacerColor(this.associatedAnimal.raceCourseType);
    if (this.currentStatus === "BURST!")
      racerColor = this.utilityService.shadeColor(racerColor, 90);
    else if (this.currentStatus === "Lost Focus" || this.currentStatus === "Stumbling" || this.currentStatus === "Low Drive")
      racerColor = this.utilityService.shadeColor(racerColor, -90);

    this.context.fillStyle = racerColor;
    this.context.fillRect(this.currentDistance - 5, 0, 5, this.canvasHeight);
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

  scrimmageComplete() {
    //handle rewards
    var randomStat = this.getRandomStatType();
    var value = (7 - this.timeToFinishScrimmage) / 100;
    if (value < .005)
      value = .005;

    value *= this.chainModifier;

    if (this.timeToFinishScrimmage <= this.timeToBeat) {
      value *= 4;
      this.chainModifier += (this.timeToBeat - this.timeToFinishScrimmage) / 5;
      this.chainModifier = Math.round((this.chainModifier + Number.EPSILON) * 10000) / 10000;
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

    value *= scrimmageValueIncrease;

    //go through and add to each corresponding stat. also display this under the stat popover
    if (randomStat === AnimalStatEnum.topSpeed)
      this.associatedAnimal.increasedDefaultStats.topSpeed += value;
    if (randomStat === AnimalStatEnum.acceleration)
      this.associatedAnimal.increasedDefaultStats.acceleration += value;
    if (randomStat === AnimalStatEnum.endurance)
      this.associatedAnimal.increasedDefaultStats.endurance += value;
    if (randomStat === AnimalStatEnum.power)
      this.associatedAnimal.increasedDefaultStats.power += value;
    if (randomStat === AnimalStatEnum.focus)
      this.associatedAnimal.increasedDefaultStats.focus += value;
    if (randomStat === AnimalStatEnum.adaptability)
      this.associatedAnimal.increasedDefaultStats.adaptability += value;

    this.incrementalCoachingUpdates += "Finished the scrimmage in " + this.timeToFinishScrimmage.toFixed(2) + " seconds and raised the default value of its base " + this.lookupService.getStatNameFromEnum(randomStat) + " by " + value.toFixed(3) + ".\n";

    this.currentDistance = 0;
    this.timeToFinishScrimmage = 0;

    if (this.remainingEnergy <= 0) {      
      this.remainingEnergy = 0;
      this.currentButtonCooldown = 0;
      this.currentStatus = "Tired";
      this.reachedExhaustion = true;
      this.incrementalCoachingUpdates += this.animalDisplayName + " needs to stop and take a breather before they can continue. Revisit this page to continue another time. Final chain modifier: <b>" + this.chainModifier + "</b>\n";
      return;
    }

    this.event = this.getRandomScrimmageType();
    this.maxSpeed = this.canvasWidth / (this.timeToBeat * this.frameModifier);
    this.velocity = this.maxSpeed;
    this.checkedForEvent = false;
    this.correctOptionSelected = false;
    this.currentStatus = "OK";
    this.emphasizeWhistle = false;
    this.emphasizeFood = false;
    this.emphasizeEncouragement = false;
    this.triggerBurstTimer = false;
    this.burstTimer = 0;    
    this.remainingEnergy -= 1;

    if (this.event === ScrimmageEventEnum.lowDrive) {
      this.checkedForEvent = true;
      this.maxSpeed /= 3;
      this.velocity /= 3;
      this.incrementalCoachingUpdates += this.animalDisplayName + " is off to a slow start, not really caring how well they do.\n";
      this.currentStatus = "Low Drive";
      this.emphasizeFood = true;
      this.triggerBurstTimer = true;
    }

  }

  drawPath() {
    this.context.globalCompositeOperation = "source-over";

    if (this.associatedAnimal.raceCourseType === RaceCourseTypeEnum.Flatland) {
      this.drawFlatlandScrimmage();
    }
    if (this.associatedAnimal.raceCourseType === RaceCourseTypeEnum.Mountain) {
      this.drawMountainScrimmage();
    }
    if (this.associatedAnimal.raceCourseType === RaceCourseTypeEnum.Ocean) {
      this.drawOceanScrimmage();
    }
    if (this.associatedAnimal.raceCourseType === RaceCourseTypeEnum.Tundra) {
      this.drawTundraScrimmage();
    }
    if (this.associatedAnimal.raceCourseType === RaceCourseTypeEnum.Volcanic) {
      this.drawVolcanicScrimmage();
    }
  }

  drawFlatlandScrimmage() {
    var horizontalLength = .05 * this.canvasWidth * this.xRaceModeModifier;

    if (this.xDistanceOffset === undefined || this.xDistanceOffset === null)
      this.xDistanceOffset = 0;

    if (this.yDistanceOffset === undefined || this.yDistanceOffset === null)
      this.yDistanceOffset = 0;

    this.context.beginPath();
    this.context.moveTo(this.xDistanceOffset, this.canvasHeight / 2);
    this.context.lineTo(horizontalLength - this.xDistanceOffset, this.canvasHeight / 2);
    this.context.stroke();

    var startingX = horizontalLength - this.xDistanceOffset;
    var startingY = this.canvasHeight / 2;

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

    this.context.beginPath();
    this.context.moveTo(startingX, startingY);
    this.context.lineTo(startingX + xRegularOffset, startingY);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(startingX + xRegularOffset, startingY);
    this.context.bezierCurveTo(startingX + xRegularOffset, startingY, startingX + curve1Point1XOffset, startingY + curve1Point1YOffset, startingX + curve1Point2XOffset, startingY + curve1Point2YOffset);
    this.context.bezierCurveTo(startingX + curve1Point2XOffset, startingY + curve1Point2YOffset, startingX + curve2Point1XOffset, startingY + curve2Point1YOffset, startingX + curve2Point2XOffset, startingY);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(startingX + curve2Point2XOffset, startingY);
    this.context.bezierCurveTo(startingX + curve2Point2XOffset, startingY, startingX + curve3Point1XOffset, startingY - curve3Point1YOffset, startingX + curve3Point2XOffset, startingY - curve3Point2YOffset);
    this.context.bezierCurveTo(startingX + curve3Point2XOffset, startingY - curve3Point2YOffset, startingX + curve4Point1XOffset, startingY - curve4Point1YOffset, startingX + curve4Point1XOffset, startingY);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(startingX + curve4Point1XOffset, startingY);
    this.context.lineTo(startingX + curve4Point2XOffset + xRegularOffset, startingY);

    this.context.stroke();
  }

  drawMountainScrimmage() {
    this.context.beginPath();
    this.context.moveTo(0, 4 * this.canvasHeight / 5);
    this.context.lineTo(this.canvasWidth / 2, this.canvasHeight / 5);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(this.canvasWidth / 2, this.canvasHeight / 5);
    this.context.lineTo(this.canvasWidth, 4 * this.canvasHeight / 5);
    this.context.stroke();
  }

  drawOceanScrimmage() {
    var horizontalLength = .05 * this.canvasWidth * this.xRaceModeModifier;

    if (this.xDistanceOffset === undefined || this.xDistanceOffset === null)
      this.xDistanceOffset = 0;

    if (this.yDistanceOffset === undefined || this.yDistanceOffset === null)
      this.yDistanceOffset = 0;

    var startingX = this.xDistanceOffset;
    var startingY = this.canvasHeight / 2;
    var horizontalDistanceBetweenPoints = horizontalLength / 3;
    var waveAmplitude = horizontalLength / 6;
    var goingUp = false;

    var bezierX1 = startingX + horizontalDistanceBetweenPoints;
    var bezierY1 = goingUp ? startingY + waveAmplitude : startingY - waveAmplitude;
    var bezierX2 = startingX + (2 * horizontalDistanceBetweenPoints);
    var bezierY2 = goingUp ? startingY + waveAmplitude : startingY - waveAmplitude;
    var finishPointX = startingX + (3 * horizontalDistanceBetweenPoints);
    var finishPointY = startingY;

    this.context.beginPath();
    this.context.moveTo(startingX, startingY);
    this.context.bezierCurveTo(bezierX1, bezierY1, bezierX2, bezierY2, finishPointX, finishPointY);
    this.context.stroke();

    var startingX = horizontalLength;
    var startingY = this.canvasHeight / 2;
    var horizontalWaveLength = horizontalLength / 3;
    var waveHeight = horizontalLength / 3;
    goingUp = true;

    var wave1BezierX1 = startingX + horizontalWaveLength / 3;
    var wave1BezierY1 = startingY;
    var wave1BezierX2 = startingX + horizontalWaveLength / 3;
    var wave1BezierY2 = startingY - waveHeight;
    var wave1FinishPointX = startingX + horizontalWaveLength;
    var wave1FinishPointY = startingY - (3 / 5) * waveHeight;

    this.context.beginPath();
    this.context.moveTo(startingX, startingY);
    this.context.bezierCurveTo(wave1BezierX1, wave1BezierY1, wave1BezierX2, wave1BezierY2, wave1FinishPointX, wave1FinishPointY);
    this.context.stroke();

    var wave1BezierX3 = wave1FinishPointX - horizontalWaveLength / 3;
    var wave1BezierY3 = wave1FinishPointY - (waveHeight / 10);
    var wave1BezierX4 = wave1FinishPointX - horizontalWaveLength / 3;
    var wave1BezierY4 = wave1FinishPointY + (3 / 5) * waveHeight;
    var wave1FinishPoint2X = wave1FinishPointX;
    var wave1FinishPoint2Y = startingY;

    this.context.beginPath();
    this.context.moveTo(wave1FinishPointX, wave1FinishPointY);
    this.context.bezierCurveTo(wave1BezierX3, wave1BezierY3, wave1BezierX4, wave1BezierY4, wave1FinishPoint2X, wave1FinishPoint2Y);
    this.context.stroke();

    //wave 2
    var wave2BezierX1 = wave1FinishPoint2X + horizontalWaveLength / 3;
    var wave2BezierY1 = wave1FinishPoint2Y;
    var wave2BezierX2 = wave1FinishPoint2X + horizontalWaveLength / 3;
    var wave2BezierY2 = wave1FinishPoint2Y - waveHeight;
    var wave2FinishPointX = wave1FinishPoint2X + horizontalWaveLength;
    var wave2FinishPointY = wave1FinishPoint2Y - (3 / 5) * waveHeight;

    this.context.beginPath();
    this.context.moveTo(wave1FinishPoint2X, wave1FinishPoint2Y);
    this.context.bezierCurveTo(wave2BezierX1, wave2BezierY1, wave2BezierX2, wave2BezierY2, wave2FinishPointX, wave2FinishPointY);
    this.context.stroke();

    var wave2BezierX3 = wave2FinishPointX - horizontalWaveLength / 3;
    var wave2BezierY3 = wave2FinishPointY - (waveHeight / 10);
    var wave2BezierX4 = wave2FinishPointX - horizontalWaveLength / 3;
    var wave2BezierY4 = wave2FinishPointY + (3 / 5) * waveHeight;
    var wave2FinishPoint2X = wave2FinishPointX;
    var wave2FinishPoint2Y = startingY;

    this.context.beginPath();
    this.context.moveTo(wave2FinishPointX, wave2FinishPointY);
    this.context.bezierCurveTo(wave2BezierX3, wave2BezierY3, wave2BezierX4, wave2BezierY4, wave2FinishPoint2X, wave2FinishPoint2Y);
    this.context.stroke();

    //wave 3
    var wave3BezierX1 = wave2FinishPoint2X + horizontalWaveLength / 3;
    var wave3BezierY1 = wave2FinishPoint2Y;
    var wave3BezierX2 = wave2FinishPoint2X + horizontalWaveLength / 3;
    var wave3BezierY2 = wave2FinishPoint2Y - waveHeight;
    var wave3FinishPointX = wave2FinishPoint2X + horizontalWaveLength;
    var wave3FinishPointY = wave2FinishPoint2Y - (3 / 5) * waveHeight;

    this.context.beginPath();
    this.context.moveTo(wave2FinishPoint2X, wave2FinishPoint2Y);
    this.context.bezierCurveTo(wave3BezierX1, wave3BezierY1, wave3BezierX2, wave3BezierY2, wave3FinishPointX, wave3FinishPointY);
    this.context.stroke();

    var wave3BezierX3 = wave3FinishPointX - horizontalWaveLength / 3;
    var wave3BezierY3 = wave3FinishPointY - (waveHeight / 10);
    var wave3BezierX4 = wave3FinishPointX - horizontalWaveLength / 3;
    var wave3BezierY4 = wave3FinishPointY + (3 / 5) * waveHeight;
    var wave3FinishPoint2X = wave3FinishPointX;
    var wave3FinishPoint2Y = startingY;

    this.context.beginPath();
    this.context.moveTo(wave3FinishPointX, wave3FinishPointY);
    this.context.bezierCurveTo(wave3BezierX3, wave3BezierY3, wave3BezierX4, wave3BezierY4, wave3FinishPoint2X, wave3FinishPoint2Y);
    this.context.stroke();
  }

  drawTundraScrimmage() {
    var horizontalLength = .05 * this.canvasWidth * this.xRaceModeModifier;

    var verticalDistance = horizontalLength / 4;

    this.context.beginPath();
    this.context.moveTo(0, this.canvasHeight / 2);
    this.context.lineTo(horizontalLength * 2, this.canvasHeight / 2);
    this.context.stroke();
  }

  drawIcyBackground() {
    var horizontalLength = .05 * this.canvasWidth * this.xRaceModeModifier;
    var verticalDistance = horizontalLength / 4;

    var originalCompositeOperation = this.context.globalCompositeOperation;
    this.context.globalCompositeOperation = "destination-over";
    this.context.fillStyle = "gray";

    this.context.beginPath();
    this.context.moveTo(0, this.canvasHeight / 2);
    this.context.lineTo(0, this.canvasHeight / 2 + verticalDistance);
    this.context.lineTo(horizontalLength, this.canvasHeight / 2 + verticalDistance);
    this.context.lineTo(horizontalLength, this.canvasHeight / 2 - verticalDistance);
    this.context.lineTo(0, this.canvasHeight / 2 - verticalDistance);
    this.context.fill();


    verticalDistance = horizontalLength / 6;

    this.context.beginPath();
    this.context.moveTo(horizontalLength, this.canvasHeight / 2);
    this.context.lineTo(horizontalLength, this.canvasHeight / 2 + verticalDistance);
    this.context.lineTo(horizontalLength * 2, this.canvasHeight / 2 + verticalDistance);
    this.context.lineTo(horizontalLength * 2, this.canvasHeight / 2 - verticalDistance);
    this.context.lineTo(horizontalLength, this.canvasHeight / 2 - verticalDistance);
    this.context.fill();

    this.context.globalCompositeOperation = originalCompositeOperation;
  }

  drawVolcanicScrimmage() {
    var horizontalLength = .05 * this.canvasWidth * this.xRaceModeModifier;

    var xCenterOfOvalOffset = horizontalLength;
    var xRegularOffset = horizontalLength * .05;

    var volcanicYOffset = 0;

    var startingX = 0;
    var startingY = this.canvasHeight / 2;
    var xCenterOfOval = xCenterOfOvalOffset;
    var yCenterOfOval = startingY;
    var radiusOfOvalX = this.canvasHeight / 3;

    var radiusOfOvalY = horizontalLength - xRegularOffset;//((horizontalLength * numberOfPaths) / 2) - xRegularOffset;
    //console.log("Radius of Oval X: " + radiusOfOvalX + " Radius of Oval Y: " + radiusOfOvalY);
    //console.log("Radius of Oval Y: (((" + path.length + " / " + this.race.length +") * " + this.canvasWidth + " * " + xRaceModeModifier + ")" + " * " + numberOfPaths + ") / 2) - " + xRegularOffset + " = " + radiusOfOvalY);
    var rotationOfOval = Math.PI / 2;
    var baselineStartingAngle = 90; //go from 90 to 270
    var baselineEndingAngle = 270;
    var anglePerPath = baselineEndingAngle - baselineStartingAngle;
    var endingAngle = 0;

    this.context.beginPath();
    this.context.moveTo(0, this.canvasHeight / 2);
    this.context.lineTo(xRegularOffset, this.canvasHeight / 2);
    this.context.stroke();
    this.context.beginPath();
    this.context.moveTo(this.canvasWidth - xRegularOffset, this.canvasHeight / 2);
    this.context.lineTo(this.canvasWidth, this.canvasHeight / 2);
    this.context.stroke();

    this.context.beginPath();
    this.context.ellipse(xCenterOfOval, yCenterOfOval, radiusOfOvalX, radiusOfOvalY, rotationOfOval, baselineStartingAngle * (Math.PI / 180), baselineEndingAngle * (Math.PI / 180), true);
    this.context.stroke();
  }

  getRandomScrimmageType(): ScrimmageEventEnum {
    var enumValues = Object.keys(ScrimmageEventEnum);
    var options: number[] = [];
    enumValues.forEach((obj, index) => {
      if (!isNaN(Number(obj)) && Number(obj) !== 6) {
        options.push(Number(obj));
      }
    });

    var rng = this.utilityService.getRandomInteger(0, options.length - 1);

    return options[rng];
  }

  setDefaultMaxSpeedAndVelocity() {
    this.maxSpeed = this.canvasWidth / ((this.timeToBeat - 1.75) * this.frameModifier);
    this.velocity = this.maxSpeed;
  }

  pauseRaceAnimation() {
    this.pauseRace = !this.pauseRace;
  }

  getRandomStatType(): AnimalStatEnum {
    var enumValues = Object.keys(AnimalStatEnum);
    var options: number[] = [];
    enumValues.forEach((obj, index) => {
      if (!isNaN(Number(obj)) && Number(obj) !== 6) {
        options.push(Number(obj));
      }
    });

    var rng = this.utilityService.getRandomInteger(0, options.length - 1);

    return options[rng];
  }

  openScrimmageInfoModal() {
    this.modalService.open(this.scrimmageContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then(
      result => {
        this.closeModals();
      },
      reason => {
        this.closeModals();
      }
    );
  }


  closeModals() {
    this.pauseRace = false;
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
