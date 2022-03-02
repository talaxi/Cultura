import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { NavigationEnum } from '../../models/navigation-enum.model';
import { GlobalService } from '../../services/global-service.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public navigationEnum = NavigationEnum;
  activeView = NavigationEnum.barn;

  constructor(private ref: ChangeDetectorRef, private globalService: GlobalService) {    
   }

  ngOnInit(): void {
  }

  changeView(newView: NavigationEnum)
  {    
    this.activeView = newView;    
  }
}
