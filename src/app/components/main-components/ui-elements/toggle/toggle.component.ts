import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css']
})
export class ToggleComponent implements OnInit {
  @Input() model: any;
  @Input() label: any;
  @Input() callbackFunction: () => void;

  constructor() { }

  ngOnInit(): void {
  }

  toggle(): void {
    this.callbackFunction();
  }
}
