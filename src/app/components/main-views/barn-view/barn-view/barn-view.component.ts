import { Component, OnInit } from '@angular/core';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
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
  subscription: any;

  constructor(private lookupService: LookupService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {    
    this.barnRow2IsUnlocked = this.lookupService.isItemUnlocked("barnRow2");    
    this.barnRow3IsUnlocked = this.lookupService.isItemUnlocked("barnRow3");

    this.subscription = this.componentCommunicationService.getBarnView().subscribe((value) => {
      if (value > 0) {
        this.selectedBarn = value;
      }
    });
  }

  goToBarn(selectedBarnNumber: number): void 
  {
    this.selectedBarn = selectedBarnNumber;
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }
}
