import { Injectable } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { GlobalService } from '../global-service.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  //can't get globalservice here
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
}
