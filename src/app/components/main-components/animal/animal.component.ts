import { Component, Input, OnInit } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-animal',
  templateUrl: './animal.component.html',
  styleUrls: ['./animal.component.css']
})

//TODO: switch this to input all available animals and create the entire table here so you can use it in various spots
export class AnimalComponent implements OnInit {
  @Input() selectedAnimal: Animal;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
  }

}
