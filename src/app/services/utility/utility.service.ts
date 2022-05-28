import { Injectable } from '@angular/core';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { TerrainTypeEnum } from 'src/app/models/terrain-type-enum.model';
import * as seedrandom from "seedrandom"

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  //circular dependency with global, use lookup for global variables instead
  constructor() { }

  getRandomSeededInteger(min: number, max: number, seedValue: string = "seeded"): number {
    var prng = seedrandom(seedValue);
    return Math.round(prng() * (max - min) + min);
  }

  getRandomInteger(min: number, max: number): number {
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

  /*getRandomTerrain(): TerrainTypeEnum {
    return TerrainTypeEnum.Sunny;
  }

  getRandomRaceCourseType(): RaceCourseTypeEnum {
    return RaceCourseTypeEnum.Flatland;
  }*/

  /*getRenownCircuitRaceModifier(totalRenown: number) {
    return totalRenown;
  }

  getRenownCircuitRaceModifierPopover(totalRenown: number) {
    return totalRenown * 100;
  }*/

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

  convertDegreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  //brighten(positive percent) or darken(negative percent) colors -- see https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  shadeColor(color: string, percent: number) {
    var newColor = '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + percent)).toString(16)).substr(-2));
    return newColor;
  }
}
