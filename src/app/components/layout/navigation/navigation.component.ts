import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { NavigationEnum } from '../../../models/navigation-enum.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  @Output() viewChanged = new EventEmitter<NavigationEnum>();  
  public navigationEnum = NavigationEnum;


  constructor() { }

  ngOnInit(): void {
  }

  switchView(selectedView: NavigationEnum) 
  {
    console.log("Switch view to " + selectedView);
    this.viewChanged.emit(selectedView);   
  }
}
