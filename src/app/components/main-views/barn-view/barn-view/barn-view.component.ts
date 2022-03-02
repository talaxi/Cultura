import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-barn-view',
  templateUrl: './barn-view.component.html',
  styleUrls: ['./barn-view.component.css']
})
export class BarnViewComponent implements OnInit {
  selectedBarn = 0;

  constructor() { }

  ngOnInit(): void {    
  }

  goToBarn(selectedBarnNumber: number): void 
  {
    this.selectedBarn = selectedBarnNumber;
  }
}
