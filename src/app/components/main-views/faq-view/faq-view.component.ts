import { Component, OnInit } from '@angular/core';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';

@Component({
  selector: 'app-faq-view',
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.css']
})
export class FaqViewComponent implements OnInit {

  constructor(private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.faqs);
  }

  expandAnswer(id: string) {
    var element = document.getElementById(id);
    if (element !== null && element !== undefined)
    {
      element.classList.toggle("hide");
    } 
  }
}
