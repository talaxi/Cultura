import { Injectable, SecurityContext } from '@angular/core';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { TerrainTypeEnum } from 'src/app/models/terrain-type-enum.model';
import * as seedrandom from "seedrandom"
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  //circular dependency with global, use lookup for global variables instead
  constructor(public sanitizer: DomSanitizer) { }

  getRandomSeededInteger(min: number, max: number, seedValue: string = "seeded"): number {
    var prng = seedrandom(seedValue);
    return Math.round(prng() * (max - min) + min);
  }

  getRandomInteger(min: number, max: number): number {
    min -= .500000001;
    max += .499999999;
    return Math.round((Math.random() * (max - min) + min));
  }

  getRandomSeededNumber(min: number, max: number, seedValue: string = "seeded") {
    var prng = seedrandom(seedValue);
    return (prng() * (max - min) + min);
  }

  getRandomNumber(min: number, max: number): number {
    return (Math.random() * (max - min) + min);
  }

  getRandomNumberPercent(): number {
    return (Math.random() * (99) + 1);
  }

  getNumericValueOfCircuitRank(circuitRank: string) {
    var circuitValue = 0;
    if (circuitRank.length > 1) {
      circuitValue = 26 * (circuitRank.length - 1);
    }

    circuitValue += 91 - circuitRank.charCodeAt(circuitRank.length - 1);
    return circuitValue;
  }

  getCircuitRankFromNumericValue(numericValue: number) {
    var circuitValue = "";
    while (numericValue > 26) {
      circuitValue += "A";
      numericValue -= 26;
    }

    circuitValue += String.fromCharCode(91 - numericValue);
    return circuitValue;
  }

  getHoursRemainingFromSeconds(seconds: number) {
    return Math.floor(seconds / 3600);
  }

  getMinutesLeftInHourRemainingFromSeconds(seconds: number) {
    var hours = Math.floor(seconds / 3600);
    return Math.floor((seconds / 60) - (hours * 60));
  }

  getSecondsLeftInMinuteRemainingFromSeconds(seconds: number) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds / 60) - (hours * 60));
    return (seconds - (hours * 60 * 60) - (minutes * 60));
  }

  convertSecondsToHHMMSS(secondsRemaining: number) {
    var hours = Math.floor(secondsRemaining / 3600);
    var minutes = Math.floor((secondsRemaining / 60) - (hours * 60));
    var seconds = (secondsRemaining - (hours * 60 * 60) - (minutes * 60));

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

    return hoursDisplay + ":" + minutesDisplay + ":" + secondsDisplay;
  }

  convertSecondsToMMSS(secondsRemaining: number) {
    var hours = Math.floor(secondsRemaining / 3600);
    var minutes = Math.floor((secondsRemaining / 60) - (hours * 60));
    var seconds = (secondsRemaining - (hours * 60 * 60) - (minutes * 60));

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

    return minutesDisplay + ":" + secondsDisplay;
  }

  getClosestWholeNumber(adjustedCircuitRaceDistance: number, totalDistance: number) {
    var resultingSegments = totalDistance / adjustedCircuitRaceDistance;
    var floorValue = Math.floor(resultingSegments);
    var segmentLength = totalDistance / floorValue;

    return segmentLength;
  }

  getDayOfWeekFromNumber(day: number) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    if (day <= days.length - 1)
      return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
    else
      return "";
  }

  getAmPmTimeFromHours(hours: number) {
    var time = "";

    if (hours === 0)
      time = "12:00 AM";
    else if (hours < 12)
      time = hours + ":00 AM";
    else if (hours === 12)
      time = "12:00 PM";
    else
      time = (hours - 12) + ":00 PM";

    return time;
  }

  get24HourFormat(hour: number) {
    var time = "";

    if (hour <= 9)
      time = "0" + hour + ":00";
    else
      time = hour + ":00";

    return time;
  }

  convertDegreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  reduceToProperUnits(amount: number) {
    var reducedAmount = "";

    var numReductions = 0;

    while (amount.toString().length > 3 && numReductions < 8) {
      amount /= 1000;
      amount = Math.round(amount);
      numReductions += 1;
    }
    reducedAmount = amount.toString();

    if (numReductions === 0)
      reducedAmount += " m";
    if (numReductions === 1)
      reducedAmount += " km";
    if (numReductions === 2)
      reducedAmount += " Mm";
    if (numReductions === 3)
      reducedAmount += " Gm";
    if (numReductions === 4)
      reducedAmount += " Tm";
    if (numReductions === 5)
      reducedAmount += " Pm";
    if (numReductions === 6)
      reducedAmount += " Em";
    if (numReductions === 7)
      reducedAmount += " Zm";
    if (numReductions === 8)
      reducedAmount += " Ym";

    return reducedAmount;
  }

  getSanitizedHtml(text: string) {
    var sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(text));

    if (sanitizedHtml === null)
      return "";

    return sanitizedHtml;
  }

  addDaysToDate(date: Date, numberOfDays: number) {
    var result = new Date(date);
    result.setDate(result.getDate() + numberOfDays);
    return result;
  }

  //brighten(positive percent) or darken(negative percent) colors -- see https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  shadeColor(color: string, percent: number) {
    var newColor = '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + percent)).toString(16)).substr(-2));
    return newColor;
  }

  getProperNoun(noun: string) {
    return noun.charAt(0).toUpperCase() + noun.slice(1);
  }

  //if list contains string and number, all instances of the same string will be added together and additional instances will be removed
  condenseList(list: ResourceValue[]) {
    var newList: ResourceValue[] = [];

    list.forEach(item => {
      if (newList.some(val => val.name === item.name)) {
        newList.find(val => val.name === item.name)!.amount += item.amount;
      }
      else {
        var itemCopy = item.makeCopy(item);
        newList.push(itemCopy);
      }
    });

    return newList;
  }

  ordinalSuffixOf(i: number) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  }
}
