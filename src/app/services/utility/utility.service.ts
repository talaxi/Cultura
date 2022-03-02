import { Injectable } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { GlobalService } from '../global-service.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  //can't get globalservice here
  constructor() { }
  
  getRandomNumber(min: number, max: number): number {
    return (Math.random()  * (max - min) + min);
  }
}
