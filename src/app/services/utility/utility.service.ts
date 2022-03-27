import { Injectable } from '@angular/core';

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

  
  getRenownCircuitRaceModifier(totalRenown: number) {
    return 1 + totalRenown;
  }
}
