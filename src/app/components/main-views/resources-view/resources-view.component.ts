import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-resources-view',
  templateUrl: './resources-view.component.html',
  styleUrls: ['./resources-view.component.css']
})
export class ResourcesViewComponent implements OnInit {

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
  }

  displayResources(): string {
    var totalResources = "";

    this.globalService.globalVar.resources.forEach(item => {      
      totalResources += item.name + " " + item.amount + "\n";
    });

    return totalResources;
  }
}
