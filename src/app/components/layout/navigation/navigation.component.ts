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
  public selectedNavigation = 0;

  constructor() { }

  ngOnInit(): void {
  }

  switchView(selectedView: NavigationEnum) 
  {        
    this.viewChanged.emit(selectedView);
    this.selectedNavigation = selectedView;
  }
}
