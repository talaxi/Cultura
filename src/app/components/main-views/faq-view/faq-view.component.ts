import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq-view',
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.css']
})
export class FaqViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  expandAnswer(id: string) {
    var element = document.getElementById(id);
    if (element !== null && element !== undefined)
    {
      element.classList.toggle("hide");
    } 
  }
}
