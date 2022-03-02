import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';

@Component({
  selector: 'app-selected-animal',
  templateUrl: './selected-animal.component.html',
  styleUrls: ['./selected-animal.component.css']
})
export class SelectedAnimalComponent implements OnInit {
  @Input() selectedAnimal: Animal;
  @Output() returnEmitter = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  returnToAnimalView(): void {
    this.returnEmitter.emit(false);
  }
}
