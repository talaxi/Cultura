import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-animal-list',
  templateUrl: './animal-list.component.html',
  styleUrls: ['./animal-list.component.css']
})

//despite the name, used globally
export class AnimalListComponent implements OnInit {
  @Input() availableAnimals: Animal[];
  @Input() isTrainingTrackView: boolean = false;
  @Input() isAnimalDetailView: boolean = false;
  @Input() isIncubatorDetailView: boolean = false;
  @Output() selectedAnimal = new EventEmitter<Animal>(); 
  animalRows: Animal[][];
  animalCells: Animal[];
  screenHeight: number;
  screenWidth: number;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.setupDisplayAnimals();
  }

  setupDisplayAnimals(): void {
    this.animalCells = [];
    this.animalRows = [];

    var maxColumns = 4;
    if (this.screenHeight <= 650)
      maxColumns = 2;

    for (var i = 1; i <= this.availableAnimals.length; i++) {
      this.animalCells.push(this.availableAnimals[i - 1]);
      if ((i % maxColumns) == 0) {
        this.animalRows.push(this.animalCells);
        this.animalCells = [];
      }
    }

    if (this.animalCells.length !== 0)
      this.animalRows.push(this.animalCells);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;    
  }

  selectAnimal(animal: Animal): void {
    this.selectedAnimal.emit(animal);
  }
}
