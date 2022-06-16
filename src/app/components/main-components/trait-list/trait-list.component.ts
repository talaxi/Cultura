import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AnimalTraits } from 'src/app/models/animals/animal-traits.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-trait-list',
  templateUrl: './trait-list.component.html',
  styleUrls: ['./trait-list.component.css']
})
export class TraitListComponent implements OnInit {
  @Input() availableTraits: AnimalTraits[];
  @Output() selectedTrait = new EventEmitter<AnimalTraits>();
  traitsRows: AnimalTraits[][];
  traitsCells: AnimalTraits[];
  screenHeight: number;
  screenWidth: number;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.setupDisplayTraits();
  }

  setupDisplayTraits(): void {
    this.traitsCells = [];
    this.traitsRows = [];

    var maxColumns = 4;
    if (this.screenHeight <= 650)
      maxColumns = 2;

    for (var i = 1; i <= this.availableTraits.length; i++) {
      this.traitsCells.push(this.availableTraits[i - 1]);
      if ((i % maxColumns) == 0) {
        this.traitsRows.push(this.traitsCells);
        this.traitsCells = [];
      }
    }

    if (this.traitsCells.length !== 0)
      this.traitsRows.push(this.traitsCells);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  selectTrait(trait: AnimalTraits): void {
    this.availableTraits.forEach(item => {
      item.isSelected = false;
    });
    trait.isSelected = true;

    this.selectedTrait.emit(trait);    
  }

  ngOnChanges(changes: any) {
    this.availableTraits = changes.availableTraits.currentValue;
    this.setupDisplayTraits();
  }
}
