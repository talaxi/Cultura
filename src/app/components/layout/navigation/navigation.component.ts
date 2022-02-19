import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  @Output() viewChanged = new EventEmitter<string>();


  constructor() { }

  ngOnInit(): void {
  }

  switchView(selectedView: string) 
  {
    console.log("Switch view to " + selectedView);
    this.viewChanged.emit(selectedView);   
  }
}
