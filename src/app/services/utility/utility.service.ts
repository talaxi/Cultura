import { Injectable } from '@angular/core';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { TerrainTypeEnum } from 'src/app/models/terrain-type-enum.model';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  
  //circular dependency with global, use lookup for global variables instead
  constructor() { }
  
  getRandomInteger(min: number, max: number): number {
    return Math.round((Math.random()  * (max - min) + min));
  }

  getRandomNumber(min: number, max: number): number {
    return (Math.random()  * (max - min) + min);
  }

  getRandomNumberPercent(): number {
    return (Math.random()  * (99) + 1);
  }  

  getRandomTerrain(): TerrainTypeEnum {
    return TerrainTypeEnum.Sunny;
  }

  getRandomRaceCourseType(): RaceCourseTypeEnum {
    return RaceCourseTypeEnum.Flatland;
  } 
  
  getRenownCircuitRaceModifier(totalRenown: number) {
    return 1 + totalRenown;
  }

  getNumericValueOfCircuitRank(circuitRank: string) {
    var circuitValue = 0;
    if (circuitRank.length > 1)
    {
      circuitValue = 26 * circuitRank.length - 1;
    }

    circuitValue += 91 - circuitRank.charCodeAt(circuitRank.length - 1);
    return circuitValue;
  }

  getCircuitRankFromNumericValue(numericValue: number) {
    var circuitValue = "";
    while (numericValue > 26)
    {
      circuitValue += "A";
      numericValue -= 26;
    }
    
    circuitValue += String.fromCharCode(65 + numericValue);
    return circuitValue;
  }
}
