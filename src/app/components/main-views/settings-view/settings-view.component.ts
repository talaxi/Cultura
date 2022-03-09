import { Component, OnInit } from '@angular/core';
import { GlobalVariables } from 'src/app/models/global/global-variables.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { plainToInstance } from 'class-transformer';

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.css']
})
export class SettingsViewComponent implements OnInit {
  importExportValue: string;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
  }

  public SaveGame() {
    var globalData = JSON.stringify(this.globalService.globalVar);
    this.importExportValue = globalData;
    console.log(this.globalService.globalVar);
  }

  public LoadGame() {    
    var loadDataJson = <GlobalVariables>JSON.parse(this.importExportValue);
    this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);    
    console.log(this.globalService.globalVar);
  }
}
