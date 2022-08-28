import { Component, ElementRef, EventEmitter, OnInit, Output, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { GrandPrixData } from 'src/app/models/races/event-race-data.model';
import { Race } from 'src/app/models/races/race.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopsEnum } from 'src/app/models/shops-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { RaceLogicService } from 'src/app/services/race-logic/race-logic.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent implements OnInit {
  @Output() raceSelected = new EventEmitter<Race>();
  grandPrix: Race;
  grandPrixData: GrandPrixData;
  requiredBreedLevel: number;
  remainingMeters: number;
  isEventRaceAvailable: boolean;
  popoverText: string = "";
  cannotRace = false;
  eventRaceReleased = true;
  raceRank = "";
  eventRaceNotice = "";
  eventRaceTimer = "";
  bonusTime = "";
  grandPrixUnlocked = false;
  subscription: any;
  coinRewardInterval: number;
  coinRewardAmount: number;
  renownRewardInterval: number;
  renownRewardAmount: number;
  weekDayGrandPrixTimeSpan: string;
  weekEndGrandPrixTimeSpan: string;
  previousRaceRewardList: ResourceValue[];
  rewardRows: any[][];
  rewardCells: any[];
  @ViewChild('loadingModal', { static: true }) loadingContent: ElementRef;
  relayEnergy = 50;
  doNotAutoRelayBelowEnergyFloor = false;

  constructor(public globalService: GlobalService, private gameLoopService: GameLoopService, public lookupService: LookupService,
    private raceLogicService: RaceLogicService, private sanitizer: DomSanitizer, private modalService: NgbModal,
    private componentCommunicationService: ComponentCommunicationService, private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.grandPrixData = this.globalService.globalVar.eventRaceData;
    this.previousRaceRewardList = this.globalService.globalVar.previousEventRewards;
    this.relayEnergy = this.globalService.globalVar.relayEnergyFloor;
    this.doNotAutoRelayBelowEnergyFloor = this.globalService.globalVar.doNotRelayBelowEnergyFloor;

    this.grandPrixUnlocked = this.lookupService.isItemUnlocked("grandPrix");
    this.weekDayGrandPrixTimeSpan = this.lookupService.getWeekDayGrandPrixTimeSpan();
    this.weekEndGrandPrixTimeSpan = this.lookupService.getWeekEndGrandPrixTimeSpan();
    this.requiredBreedLevel = this.lookupService.getBreedLevelRequiredForGrandPrix();

    this.popoverText = this.getForecastPopoverText();

    this.raceRank = this.grandPrixData.rank;
    if (this.globalService.globalVar.settings.get("useNumbersForCircuitRank")) {
      this.raceRank = this.utilityService.getNumericValueOfCircuitRank(this.raceRank).toString();
    }

    var racingAnimal = this.globalService.getGrandPrixRacingAnimal();
    if (!this.globalService.globalVar.eventRaceData.animalData.some(item => item.isCurrentlyRacing)) {
      var matchingAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType == racingAnimal.type);
      if (matchingAnimalData !== undefined) {
        matchingAnimalData.isCurrentlyRacing = true;
      }
    }

    var numericRankModifier = this.globalService.globalVar.eventRaceData.rankDistanceMultiplier;//this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.eventRaceData.rank);

    var coinRewardAmountValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixCoinRewardModifier");
    if (coinRewardAmountValuePair !== null && coinRewardAmountValuePair !== undefined)
      this.coinRewardAmount = coinRewardAmountValuePair.value;

    var renownRewardAmountValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixRenownRewardModifier");
    if (renownRewardAmountValuePair !== null && renownRewardAmountValuePair !== undefined)
      this.renownRewardAmount = renownRewardAmountValuePair.value;

    var metersPerCoinRewardValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "metersPerCoinsGrandPrixModifier");
    if (metersPerCoinRewardValuePair !== null && metersPerCoinRewardValuePair !== undefined)
      this.coinRewardInterval = metersPerCoinRewardValuePair.value * numericRankModifier;

    var metersPerRenownRewardValuePair = this.globalService.globalVar.modifiers.find(item => item.text === "metersPerRenownGrandPrixModifier");
    if (metersPerRenownRewardValuePair !== null && metersPerRenownRewardValuePair !== undefined)
      this.renownRewardInterval = metersPerRenownRewardValuePair.value * numericRankModifier;

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async (deltaTime: number) => {
      this.setupEventTime();
      this.grandPrixData = this.globalService.globalVar.eventRaceData;
      this.previousRaceRewardList = this.globalService.globalVar.previousEventRewards;
      
      if (metersPerCoinRewardValuePair !== null && metersPerCoinRewardValuePair !== undefined)
        this.coinRewardInterval = metersPerCoinRewardValuePair.value * this.globalService.globalVar.eventRaceData.rankDistanceMultiplier;
      if (metersPerRenownRewardValuePair !== null && metersPerRenownRewardValuePair !== undefined)
        this.renownRewardInterval = metersPerRenownRewardValuePair.value * this.globalService.globalVar.eventRaceData.rankDistanceMultiplier;
      
      if (this.grandPrixData !== undefined) {
        this.raceRank = this.grandPrixData.rank;
        if (this.globalService.globalVar.settings.get("useNumbersForCircuitRank")) {
          this.raceRank = this.utilityService.getNumericValueOfCircuitRank(this.raceRank).toString();
        }      
      }

      if (this.previousRaceRewardList.length > 0)
        this.setupDisplayRewards();

      this.remainingMeters = this.globalService.globalVar.eventRaceData.totalDistance - this.globalService.globalVar.eventRaceData.distanceCovered;

      if (this.globalService.globalVar.eventRaceData !== undefined && this.globalService.globalVar.eventRaceData !== null &&
        this.globalService.globalVar.eventRaceData.currentRaceSegment !== undefined && this.globalService.globalVar.eventRaceData.currentRaceSegment !== null) {
          var timeToComplete = this.globalService.globalVar.eventRaceData.currentRaceSegmentResult.totalFramesPassed / 60;

        if (this.globalService.globalVar.eventRaceData.segmentTimeCounter >= timeToComplete * 2) {
          this.grandPrixData.isCatchingUp = true;
        }
        else {
          this.grandPrixData.isCatchingUp = false;
        }
      }
    });
  }

  selectEventRace(content: any) {
    //this can't actually start a race -- the race needs to be running in the background. this should just view it
    if (this.globalService.globalVar.eventRaceData.isRunning === false) {
      //do set up
      var racingAnimal = this.globalService.getGrandPrixRacingAnimal();

      if (racingAnimal.type === undefined || racingAnimal.type === null) {
        alert("None of the animals in your event deck are capable of entering the Grand Prix. Swap to new animals or make adjustments to your existing animals to meet the criteria.");
        return;
      }
      else {
        var showSlowSegmentWarning = this.globalService.shouldShowSlowSegmentWarning(racingAnimal);

        if (this.lookupService.slowSegmentWarning(showSlowSegmentWarning)) {
          this.globalService.globalVar.eventRaceData.isRunning = true;

          this.globalService.globalVar.eventRaceData.currentRaceSegment = this.globalService.generateGrandPrixSegment(racingAnimal);
          this.globalService.globalVar.eventRaceData.currentRaceSegmentResult = this.raceLogicService.runRace(this.globalService.globalVar.eventRaceData.currentRaceSegment);
          this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(racingAnimal);

          if (this.globalService.globalVar.eventRaceData.currentRaceSegmentCount === 0) {
            this.globalService.globalVar.eventRaceData.currentRaceSegmentCount += 1;
          }
        }
        else
          return;
      }

      //flipping that true should start the auto run in gamecheckup
      //should be basically the same time constraints as auto run but it's 1 every 3 min instead of 1-20 every 5 min       
    }

    if (!this.globalService.globalVar.eventRaceData.isGrandPrixCompleted && !this.globalService.globalVar.eventRaceData.isCatchingUp)
      this.raceSelected.emit(this.globalService.globalVar.eventRaceData.currentRaceSegment);
    //view race
  }

  setupEventTime() {
    var secondsToEvent = this.globalService.getTimeToEventRace();
    //console.log("Seconds To Event: " + secondsToEvent + " Bonus Time: " + this.globalService.globalVar.eventRaceData.bonusTime);
    if (secondsToEvent > 0) {
      if (this.globalService.globalVar.eventRaceData.bonusTime > 0)
        this.isEventRaceAvailable = true;
      else
        this.isEventRaceAvailable = false;

      this.eventRaceNotice = "Next Grand Prix available in";
      var hours = Math.floor(secondsToEvent / 3600);
      var minutes = Math.floor((secondsToEvent / 60) - (hours * 60));
      var seconds = (secondsToEvent - (hours * 60 * 60) - (minutes * 60));
      var secondsDisplay = Math.floor(seconds).toString();
      var hoursDisplay = hours.toString();
      var minutesDisplay = minutes.toString();

      if (hours < 10) {
        if (hours < 1 || hours > 59)
          hoursDisplay = "00";
        else
          hoursDisplay = String(hoursDisplay).padStart(2, '0');
      }
      if (minutes < 10) {
        if (minutes < 1 || minutes > 59)
          minutesDisplay = "00";
        else
          minutesDisplay = String(minutesDisplay).padStart(2, '0');
      }
      if (seconds < 10) {
        if (seconds < 1 || seconds > 59)
          secondsDisplay = "00";
        else
          secondsDisplay = String(secondsDisplay).padStart(2, '0');
      }

      this.eventRaceTimer = hoursDisplay + ":" + minutesDisplay + ":" + secondsDisplay;
    }
    else {
      var remainingEventTime = this.globalService.getRemainingEventRaceTime();
      if (remainingEventTime > 0) {
        this.eventRaceNotice = "Grand Prix ends in";
        this.isEventRaceAvailable = true;
        var hours = Math.floor(remainingEventTime / 3600);
        var minutes = Math.floor((remainingEventTime / 60) - (hours * 60));
        var seconds = (remainingEventTime - (hours * 60 * 60) - (minutes * 60));

        var hoursDisplay = hours.toString();
        var minutesDisplay = minutes.toString();
        var secondsDisplay = Math.floor(seconds).toString();
        if (hours < 10) {
          if (hours < 1 || hours > 59)
            hoursDisplay = "00";
          else
            hoursDisplay = String(hoursDisplay).padStart(2, '0');
        }
        if (minutes < 10) {
          if (minutes < 1 || minutes > 59)
            minutesDisplay = "00";
          else
            minutesDisplay = String(minutesDisplay).padStart(2, '0');
        }

        if (seconds < 10) {
          if (seconds < 1 || seconds > 59)
            secondsDisplay = "00";
          else
            secondsDisplay = String(secondsDisplay).padStart(2, '0');
        }

        this.eventRaceTimer = hoursDisplay + ":" + minutesDisplay + ":" + secondsDisplay;
      }
    }


    if (this.globalService.globalVar.eventRaceData.bonusTime > 0)
      this.bonusTime = this.utilityService.convertSecondsToHHMMSS(this.globalService.globalVar.eventRaceData.bonusTime);
    else
      this.bonusTime = "";
  }

  openRewardsModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  openInfoModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  openLoadingModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }

  getGrandPrixFoodRewardsPopover() {
    var text = "";
    var rewardsObtained = 0;
    var totalRewards = 0;
    var numericRankModifier = this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.eventRaceData.rank);

    if (numericRankModifier > 1)
      return text;

    var strawberryRewardDistance = 25000;
    var appleRewardDistance = 50000;
    var orangeRewardDistance = 75000;
    var mangoRewardDistance = 100000;
    var turnipRewardDistance = 250000;
    var bananaRewardDistance = 500000;
    var carrotRewardDistance = 750000;
    var mangoReward2Distance = 1000000;
    var baseFoodAmount = 100;
    var firstMangoAmount = 5;
    var secondMangoAmount = 10;

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= strawberryRewardDistance)
      text += "<span class='crossed'>" + strawberryRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Strawberries</span><br/>";
    else
      text += strawberryRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Strawberries<br/>";

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= appleRewardDistance)
      text += "<span class='crossed'>" + appleRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Apples</span><br/>";
    else
      text += appleRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Apples<br/>";

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= orangeRewardDistance)
      text += "<span class='crossed'>" + orangeRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Oranges</span><br/>";
    else
      text += orangeRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Oranges<br/>";

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= mangoRewardDistance)
      text += "<span class='crossed'>" + mangoRewardDistance.toLocaleString() + " meters - +" + firstMangoAmount + " Mangoes</span><br/>";
    else
      text += mangoRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Mangoes<br/>";

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= turnipRewardDistance)
      text += "<span class='crossed'>" + turnipRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Turnips</span><br/>";
    else
      text += turnipRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Turnips<br/>";

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= bananaRewardDistance)
      text += "<span class='crossed'>" + bananaRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Bananas</span><br/>";
    else
      text += bananaRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Bananas<br/>";

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= carrotRewardDistance)
      text += "<span class='crossed'>" + carrotRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Carrots</span><br/>";
    else
      text += carrotRewardDistance.toLocaleString() + " meters - +" + baseFoodAmount + " Carrots<br/>";

    if (this.globalService.globalVar.eventRaceData.distanceCovered >= mangoReward2Distance)
      text += "<span class='crossed'>" + mangoReward2Distance.toLocaleString() + " meters - +" + secondMangoAmount + " Mangoes</span><br/>";
    else
      text += mangoReward2Distance.toLocaleString() + " meters - +" + secondMangoAmount + " Mangoes<br/>";


    return text;
  }

  getGrandPrixRenownRewardsPopover() {
    var text = "";
    var rewardsObtained = 0;
    var totalRewards = 0;
    var numericRankModifier = this.globalService.globalVar.eventRaceData.rankDistanceMultiplier;//this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.eventRaceData.rank);

    totalRewards = this.globalService.globalVar.eventRaceData.totalDistance / this.renownRewardInterval;
    rewardsObtained = Math.floor(this.globalService.globalVar.eventRaceData.distanceCovered / this.renownRewardInterval);

    text = (rewardsObtained * this.renownRewardAmount) + "/" + (totalRewards * this.renownRewardAmount) + " Renown obtained";

    return text;
  }

  getGrandPrixCoinRewardsPopover() {
    var text = "";
    var rewardsObtained = 0;
    var totalRewards = 0;
    

    totalRewards = this.globalService.globalVar.eventRaceData.totalDistance / this.coinRewardInterval;
    rewardsObtained = Math.floor(this.globalService.globalVar.eventRaceData.distanceCovered / this.coinRewardInterval);

    text = (rewardsObtained * this.coinRewardAmount) + "/" + (totalRewards * this.coinRewardAmount) + " Coins obtained";

    return text;
  }

  getGrandPrixTokenRewardsPopover() {
    var popover = "";
    var rewards = this.lookupService.getGrandPrixTokenRewards();
    var numericRankModifier = this.globalService.globalVar.eventRaceData.rankDistanceMultiplier;//this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.eventRaceData.rank);

    var token1MeterCount = 50000000;
    var token1MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken1MeterModifier");
    if (token1MeterCountPair !== null && token1MeterCountPair !== undefined)
      token1MeterCount = token1MeterCountPair.value;
    var token1Reward = rewards[0];

    var token2MeterCount = 50000000;
    var token2MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken2MeterModifier");
    if (token2MeterCountPair !== null && token2MeterCountPair !== undefined)
      token2MeterCount = token2MeterCountPair.value;
    var token2Reward = rewards[1];

    var token3MeterCount = 50000000;
    var token3MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken3MeterModifier");
    if (token3MeterCountPair !== null && token3MeterCountPair !== undefined)
      token3MeterCount = token3MeterCountPair.value;
    var token3Reward = rewards[2];

    var token4MeterCount = 50000000;
    var token4MeterCountPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixToken4MeterModifier");
    if (token4MeterCountPair !== null && token4MeterCountPair !== undefined)
      token4MeterCount = token4MeterCountPair.value;
    var token4Reward = rewards[3];

    var distanceCovered = this.globalService.globalVar.eventRaceData.distanceCovered;

    if (distanceCovered >= token1MeterCount * numericRankModifier) {
      popover += "<span class='crossed'>" + token1Reward + "</span>\n";
    }
    else
      popover += "<span>" + token1Reward + "</span>\n";

    if (distanceCovered >= token2MeterCount * numericRankModifier) {
      popover += "<span class='crossed'>" + token2Reward + "</span>\n";
    }
    else
      popover += "<span>" + token2Reward + "</span>\n";

    if (distanceCovered >= token3MeterCount * numericRankModifier) {
      popover += "<span class='crossed'>" + token3Reward + "</span>\n";
    }
    else
      popover += "<span>" + token3Reward + "</span>\n";

    if (distanceCovered >= token4MeterCount * numericRankModifier) {
      popover += "<span class='crossed'>" + token4Reward + "</span>\n";
    }
    else
      popover += "<span>" + token4Reward + "</span>\n";

    return this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(popover));
  }

  getForecastPopoverText() {
    var popover = "";

    popover = this.lookupService.getWeatherClusterDescription(this.grandPrixData.weatherCluster);

    return popover;
  }

  goToTokenShop() {
    this.componentCommunicationService.setShopView(NavigationEnum.shop, ShopsEnum.token);
  }

  setupDisplayRewards(): void {
    this.rewardCells = [];
    this.rewardRows = [];

    var maxColumns = 4;

    if (this.previousRaceRewardList === undefined || this.previousRaceRewardList === null)
      return;

    for (var i = 1; i <= this.previousRaceRewardList.length; i++) {
      this.rewardCells.push({ name: this.previousRaceRewardList[i - 1].name, amount: this.previousRaceRewardList[i - 1].amount });
      if ((i % maxColumns) == 0) {
        this.rewardRows.push(this.rewardCells);
        this.rewardCells = [];
      }
    }

    if (this.rewardCells.length !== 0)
      this.rewardRows.push(this.rewardCells);
  }

  updateRelayEnergy() {
    if (this.relayEnergy < 50)
      this.relayEnergy = 50;

    if (this.relayEnergy > 99)
      this.relayEnergy = 99;

    if (this.globalService.globalVar.eventRaceData !== null && this.globalService.globalVar.eventRaceData !== undefined)
      this.globalService.globalVar.relayEnergyFloor = this.relayEnergy;
  }

  doNotAutoRelayBelowEnergyFloorToggle = () => {
    this.doNotAutoRelayBelowEnergyFloor = !this.doNotAutoRelayBelowEnergyFloor;
    this.globalService.globalVar.doNotRelayBelowEnergyFloor = this.doNotAutoRelayBelowEnergyFloor;
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined)
      this.subscription.unsubscribe();
  }
}
