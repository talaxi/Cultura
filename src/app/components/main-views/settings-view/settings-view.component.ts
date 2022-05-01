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
  skipDrawRace: boolean;
  finishTrainingBeforeSwitching: boolean;
  finishTrainingBeforeSwitchingPopoverText: string;
  skipDrawRacePopoverText: string;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    var globalSkipDrawRace = this.globalService.globalVar.settings.get("skipDrawRace");
    if (globalSkipDrawRace === undefined)
      this.skipDrawRace = false;
    else
      this.skipDrawRace = globalSkipDrawRace;
    this.skipDrawRacePopoverText = "Turn on to immediately skip to the end of any race.";

    var finishTrainingBeforeSwitching = this.globalService.globalVar.settings.get("finishTrainingBeforeSwitching");
    if (finishTrainingBeforeSwitching === undefined)
      this.finishTrainingBeforeSwitching = false;
    else
      this.finishTrainingBeforeSwitching = finishTrainingBeforeSwitching;
    this.finishTrainingBeforeSwitchingPopoverText = "Turn on to wait until finishing your current training before switching to the next training you select.";
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

  skipDrawRaceToggle = () => {    
    this.skipDrawRace = !this.skipDrawRace;
    this.globalService.globalVar.settings.set("skipDrawRace", this.skipDrawRace);
  }

  finishTrainingBeforeSwitchingToggle = () => {    
    this.finishTrainingBeforeSwitching = !this.finishTrainingBeforeSwitching;
    this.globalService.globalVar.settings.set("finishTrainingBeforeSwitching", this.finishTrainingBeforeSwitching);
  }
}
