import { Injectable } from '@angular/core';
import { Race } from 'src/app/models/races/race.model';
import { GlobalService } from '../global-service.service';

@Injectable({
  providedIn: 'root'
})
export class RaceLogicService {

  constructor(private globalService: GlobalService) { }

  
}
