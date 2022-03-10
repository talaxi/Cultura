import { Component, OnInit } from '@angular/core';
import { GlobalVariables } from 'src/app/models/global/global-variables.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { plainToInstance } from 'class-transformer';
declare var LZString: any;

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
    var compressedData = LZString.compressToBase64(globalData);
    this.importExportValue = compressedData;
  }

  public LoadGame() {    
    var decompressedData = LZString.decompressFromBase64(this.importExportValue);
    var loadDataJson = <GlobalVariables>JSON.parse(decompressedData);
    this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
  }
}
