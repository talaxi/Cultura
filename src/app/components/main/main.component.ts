import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationEnum } from '../../models/navigation-enum.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  //activeView = "barn";
  public navigationEnum = NavigationEnum;
  activeView = NavigationEnum.barn;

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  changeView(newView: NavigationEnum)
  {    
    this.activeView = newView;    
  }
}
