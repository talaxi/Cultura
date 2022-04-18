import { Component, OnInit } from '@angular/core';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-barn-view',
  templateUrl: './barn-view.component.html',
  styleUrls: ['./barn-view.component.css']
})
export class BarnViewComponent implements OnInit {
  selectedBarn = 0;
  barnRow2IsUnlocked = false;
  barnRow3IsUnlocked = false;

  constructor(private lookupService: LookupService) { }

  ngOnInit(): void {    
  }

  goToBarn(selectedBarnNumber: number): void 
  {
    this.selectedBarn = selectedBarnNumber;
    this.barnRow2IsUnlocked = this.lookupService.isItemUnlocked("BarnRow2");
    this.barnRow3IsUnlocked = this.lookupService.isItemUnlocked("BarnRow3");
  }
}
