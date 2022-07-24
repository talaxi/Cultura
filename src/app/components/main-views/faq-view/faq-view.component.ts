import { Component, OnInit } from '@angular/core';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-faq-view',
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.css']
})
export class FaqViewComponent implements OnInit {

  seeAttractionSpoiler: boolean = false;
  seeResearchCenterSpoiler: boolean = false;

  constructor(private componentCommunicationService: ComponentCommunicationService, public lookupService: LookupService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.faqs);

    if (this.lookupService.isItemUnlocked("attractionSpecialization"))
      this.seeAttractionSpoiler = true;

    if (this.lookupService.isItemUnlocked("researchCenterSpecialization"))
      this.seeResearchCenterSpoiler = true;
  }

  viewSpoiler(name: string) {
    if (name === "Attraction Specialization")
      this.seeAttractionSpoiler = true;
      if (name === "Research Center Specialization")
      this.seeResearchCenterSpoiler = true;
  }

  expandAnswer(id: string) {
    var element = document.getElementById(id);
    if (element !== null && element !== undefined) {
      element.classList.toggle("hide");
    }
  }
}
