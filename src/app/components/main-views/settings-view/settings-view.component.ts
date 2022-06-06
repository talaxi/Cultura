import { Component, OnInit } from '@angular/core';
import { GlobalVariables } from 'src/app/models/global/global-variables.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { plainToInstance } from 'class-transformer';
import { ThemeService } from 'src/app/theme/theme.service';
import { RaceDisplayInfoEnum } from 'src/app/models/race-display-info-enum.model';
import { night, Theme } from 'src/app/theme/theme';
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
  hideTips: boolean;
  useNumbersForCircuitRank: boolean;
  raceDisplayInfo: RaceDisplayInfoEnum;
  finishTrainingBeforeSwitchingPopoverText: string;
  skipDrawRacePopoverText: string;
  hideTipsPopoverText: string;
  useNumbersForCircuitRankPopoverText: string;
  raceDisplayInfoPopoverText: string;
  public raceDisplayInfoEnum = RaceDisplayInfoEnum;

  constructor(private globalService: GlobalService, private themeService: ThemeService) { }

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

    var raceDisplayInfoOptions = this.globalService.globalVar.settings.get("raceDisplayInfo");
    if (raceDisplayInfoOptions === undefined)
      this.raceDisplayInfo = RaceDisplayInfoEnum.both;
    else
      this.raceDisplayInfo = raceDisplayInfoOptions;
    this.raceDisplayInfoPopoverText = "Choose how to view races. Draw only shows the visual aspect, text only shows the textual updates, and both shows both. Both is default.";

    var hideTips = this.globalService.globalVar.settings.get("hideTips");
    if (hideTips === undefined)
      this.hideTips = false;
    else
      this.hideTips = hideTips;
    this.hideTipsPopoverText = "Stop displaying tips in the footer.";


    var useNumbersForCircuitRank = this.globalService.globalVar.settings.get("useNumbersForCircuitRank");
    if (useNumbersForCircuitRank === undefined)
      this.useNumbersForCircuitRank = false;
    else
      this.useNumbersForCircuitRank = useNumbersForCircuitRank;
    this.useNumbersForCircuitRankPopoverText = "Use numbers instead of letters when displaying ranks.";

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

  hideTipsToggle = () => {
    this.hideTips = !this.hideTips;
    this.globalService.globalVar.settings.set("hideTips", this.hideTips);
  }

  useNumbersForCircuitRankToggle = () => {
    this.useNumbersForCircuitRank = !this.useNumbersForCircuitRank;
    this.globalService.globalVar.settings.set("useNumbersForCircuitRank", this.useNumbersForCircuitRank);
  }

  saveRaceDisplayInfo() {
    this.globalService.globalVar.settings.set("raceDisplayInfo", this.raceDisplayInfo);
  }

  changeTheme(newTheme: any) {
    var theme = night;

    if (newTheme === "White")
      theme = this.themeService.setWhiteTheme();
    if (newTheme === "Light")
      theme = this.themeService.setLightTheme();
    if (newTheme === "Twilight")
      theme = this.themeService.setTwilightTheme();
    if (newTheme === "Night")
      theme = this.themeService.setNightTheme();


    this.globalService.globalVar.settings.set("theme", theme);
  }
}
