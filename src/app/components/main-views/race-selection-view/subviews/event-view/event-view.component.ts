import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Race } from 'src/app/models/races/race.model';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent implements OnInit {
  @Output() raceSelected = new EventEmitter<Race>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
