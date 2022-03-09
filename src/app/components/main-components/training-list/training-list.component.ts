import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { TrainingOption } from 'src/app/models/training/training-option.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.css']
})
export class TrainingListComponent implements OnInit {
  @Input() availableTrainingOptions: TrainingOption[];
  @Output() selectedTrainingOption = new EventEmitter<TrainingOption>();
  trainingsRows: TrainingOption[][];
  trainingsCells: TrainingOption[];
  screenHeight: number;
  screenWidth: number;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.setupDisplayTrainings();
  }

  setupDisplayTrainings(): void {
    this.trainingsCells = [];
    this.trainingsRows = [];

    var maxColumns = 4;
    if (this.screenHeight <= 650)
      maxColumns = 2;

    for (var i = 1; i <= this.availableTrainingOptions.length; i++) {
      this.trainingsCells.push(this.availableTrainingOptions[i - 1]);
      if ((i % maxColumns) == 0) {
        this.trainingsRows.push(this.trainingsCells);
        this.trainingsCells = [];
      }
    }

    if (this.trainingsCells.length !== 0)
      this.trainingsRows.push(this.trainingsCells);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  selectTrainingOption(trainingOption: TrainingOption): void {
    this.selectedTrainingOption.emit(trainingOption);
  }

  ngOnChanges(changes: any) {
    this.availableTrainingOptions = changes.availableTrainingOptions.currentValue;
    this.setupDisplayTrainings();
  }
}
