import { Component, OnInit } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-resources-view',
  templateUrl: './resources-view.component.html',
  styleUrls: ['./resources-view.component.css']
})
export class ResourcesViewComponent implements OnInit {
  resources: ResourceValue[] = [];

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.resources = this.globalService.globalVar.resources;
  }

  displayResources(): string {
    var totalResources = "";

    this.globalService.globalVar.resources.forEach(item => {      
      totalResources += item.name + " " + item.amount + "\n";
    });

    return totalResources;
  }

  getPopover(name: string) {
    return this.lookupService.getResourcePopover(name);
  }
}
