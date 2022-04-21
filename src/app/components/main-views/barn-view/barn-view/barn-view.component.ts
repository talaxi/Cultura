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
    this.barnRow2IsUnlocked = this.lookupService.isItemUnlocked("barnRow2");    
    this.barnRow3IsUnlocked = this.lookupService.isItemUnlocked("barnRow3");
  }

  goToBarn(selectedBarnNumber: number): void 
  {
    this.selectedBarn = selectedBarnNumber;
  }
}
