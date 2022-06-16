import { Component, Input, OnInit } from '@angular/core';
import { TrainingOption } from 'src/app/models/training/training-option.model';

@Component({
  selector: 'app-training-option',
  templateUrl: './training-option.component.html',
  styleUrls: ['./training-option.component.css']
})
export class TrainingOptionComponent implements OnInit {
  @Input() trainingOption: TrainingOption;

  constructor() { }

  ngOnInit(): void {
  }
}
