import { Component, OnInit } from '@angular/core';
import { GlobalVariables } from 'src/app/models/global/global-variables.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { plainToInstance } from 'class-transformer';
import { ThemeService } from 'src/app/theme/theme.service';
import { RaceDisplayInfoEnum } from 'src/app/models/race-display-info-enum.model';
import { night, Theme } from 'src/app/theme/theme';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { CodeRedemptionService } from 'src/app/services/settings/code-redemption.service';
import { CodeCreationService } from 'src/app/services/settings/code-creation.service';
import { DeploymentService } from 'src/app/services/utility/deployment.service';
import { LookupService } from 'src/app/services/lookup.service';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { VersionControlService } from 'src/app/services/version-control.service';
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
  autoStartEventRace: boolean;
  quickViewBarnMode: boolean;
  displayAverageDistancePace: boolean;
  showBarnOptions: boolean;
  raceDisplayInfo: string;
  finishTrainingBeforeSwitchingPopoverText: string;
  skipDrawRacePopoverText: string;
  hideTipsPopoverText: string;
  useNumbersForCircuitRankPopoverText: string;
  raceDisplayInfoPopoverText: string;
  autoStartEventRacePopoverText: string;
  quickViewBarnModePopoverText: string;
  showBarnOptionsPopoverText: string;
  displayAverageDistancePacePopoverText: string;
  enteredRedemptionCode: string;
  currentTheme: string;
  public raceDisplayInfoEnum = RaceDisplayInfoEnum;
  file: any;

  constructor(private globalService: GlobalService, private themeService: ThemeService, private lookupService: LookupService,
    private codeRedemptionService: CodeRedemptionService, private codeCreationService: CodeCreationService, private deploymentService: DeploymentService,
    private componentCommunicationService: ComponentCommunicationService, private versionControlService: VersionControlService,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.settings);

    if (this.deploymentService.codeCreationMode)
      console.log(this.codeCreationService.createCode());

    this.currentTheme = this.themeService.getActiveTheme().name.charAt(0).toUpperCase() + this.themeService.getActiveTheme().name.slice(1);

    var globalSkipDrawRace = this.globalService.globalVar.settings.get("skipDrawRace");
    if (globalSkipDrawRace === undefined)
      this.skipDrawRace = false;
    else
      this.skipDrawRace = globalSkipDrawRace;
    this.skipDrawRacePopoverText = this.lookupService.getSettingDescriptions("Auto Skip Race Info");

    var finishTrainingBeforeSwitching = this.globalService.globalVar.settings.get("finishTrainingBeforeSwitching");
    if (finishTrainingBeforeSwitching === undefined)
      this.finishTrainingBeforeSwitching = false;
    else
      this.finishTrainingBeforeSwitching = finishTrainingBeforeSwitching;
    this.finishTrainingBeforeSwitchingPopoverText = this.lookupService.getSettingDescriptions("Finish Training Before Switching");

    var raceDisplayInfoOptions = this.globalService.globalVar.settings.get("raceDisplayInfo");
    if (raceDisplayInfoOptions === undefined)
      this.raceDisplayInfo = this.getRaceDisplayInfoName(RaceDisplayInfoEnum.both);
    else
      this.raceDisplayInfo = this.getRaceDisplayInfoName(raceDisplayInfoOptions);
    this.raceDisplayInfoPopoverText = this.lookupService.getSettingDescriptions("Race Display Info");

    var hideTips = this.globalService.globalVar.settings.get("hideTips");
    if (hideTips === undefined)
      this.hideTips = false;
    else
      this.hideTips = hideTips;
    this.hideTipsPopoverText = this.lookupService.getSettingDescriptions("Hide Tips");


    var useNumbersForCircuitRank = this.globalService.globalVar.settings.get("useNumbersForCircuitRank");
    if (useNumbersForCircuitRank === undefined)
      this.useNumbersForCircuitRank = false;
    else
      this.useNumbersForCircuitRank = useNumbersForCircuitRank;
    this.useNumbersForCircuitRankPopoverText = this.lookupService.getSettingDescriptions("Use Numbers For Circuit Rank");

    var autoStartEventRace = this.globalService.globalVar.settings.get("autoStartEventRace");
    if (autoStartEventRace === undefined)
      this.autoStartEventRace = false;
    else
      this.autoStartEventRace = autoStartEventRace;
    this.autoStartEventRacePopoverText = this.lookupService.getSettingDescriptions("Auto Start Event Race");

    var quickViewBarnMode = this.globalService.globalVar.settings.get("quickViewBarnMode");
    if (quickViewBarnMode === undefined)
      this.quickViewBarnMode = false;
    else
      this.quickViewBarnMode = quickViewBarnMode;
    this.quickViewBarnModePopoverText = this.lookupService.getSettingDescriptions("Quick View Barn");
    
    var displayAverageDistancePace = this.globalService.globalVar.settings.get("displayAverageDistancePace");
    if (displayAverageDistancePace === undefined)
      this.displayAverageDistancePace = false;
    else
      this.displayAverageDistancePace = displayAverageDistancePace;
    this.displayAverageDistancePacePopoverText = this.lookupService.getSettingDescriptions("Display Average Distance Pace");

    var showBarnOptions = this.globalService.globalVar.settings.get("showBarnOptions");
    if (showBarnOptions === undefined)
      this.showBarnOptions = false;
    else
      this.showBarnOptions = showBarnOptions;
    this.showBarnOptionsPopoverText = this.lookupService.getSettingDescriptions("Show Barn Options");
    
  }

  public SaveGame() {
    var globalData = JSON.stringify(this.globalService.globalVar);
    var compressedData = LZString.compressToBase64(globalData);
    this.importExportValue = compressedData;
  }

  fileChanged(e: any) {
    this.file = e.target.files[0];
  }

  public LoadGame() {
    if (confirm("This will overwrite your existing game data. Continue?")) {
      var decompressedData = LZString.decompressFromBase64(this.importExportValue);
      var loadDataJson = <GlobalVariables>JSON.parse(decompressedData);
      if (loadDataJson !== null && loadDataJson !== undefined) {
        this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
        this.versionControlService.updatePlayerVersion();
      }
    }
  }

  public SaveGameToFile() {
    var globalData = JSON.stringify(this.globalService.globalVar);
    var compressedData = LZString.compressToBase64(globalData);

    let file = new Blob([compressedData], { type: '.txt' });
    let a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = "Cultura-v" + this.globalService.globalVar.currentVersion.toString().replace(".", "_") + "-" + new Date().toLocaleDateString();
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  public LoadGameFromFile() {
    if (this.file === null || this.file === undefined || this.file.length === 0)
      alert("First select a file to import.");

    if (confirm("This will overwrite your existing game data. Continue?")) {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        var decompressedData = LZString.decompressFromBase64(fileReader.result);
        var loadDataJson = <GlobalVariables>JSON.parse(decompressedData);
        if (loadDataJson !== null && loadDataJson !== undefined) {
          this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
          this.versionControlService.updatePlayerVersion();
        }
      }
      fileReader.readAsText(this.file);
    }
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

  autoStartEventRaceToggle = () => {
    this.autoStartEventRace = !this.autoStartEventRace;
    this.globalService.globalVar.settings.set("autoStartEventRace", this.autoStartEventRace);
  }

  quickViewBarnToggle = () => {
    this.quickViewBarnMode = !this.quickViewBarnMode;
    this.globalService.globalVar.settings.set("quickViewBarnMode", this.quickViewBarnMode);
  }
  
  displayAverageDistancePaceToggle = () => {
    this.displayAverageDistancePace = !this.displayAverageDistancePace;
    this.globalService.globalVar.settings.set("displayAverageDistancePace", this.displayAverageDistancePace);
  }

  showBarnOptionsToggle = () => {
    this.showBarnOptions = !this.showBarnOptions;
    this.globalService.globalVar.settings.set("showBarnOptions", this.showBarnOptions);
  }

  saveRaceDisplayInfo() {
    this.globalService.globalVar.settings.set("raceDisplayInfo", this.raceDisplayInfo);
  }

  changeRaceDisplayInfo(raceDisplayInfo: RaceDisplayInfoEnum) {
    this.globalService.globalVar.settings.set("raceDisplayInfo", raceDisplayInfo);
    this.raceDisplayInfo = this.getRaceDisplayInfoName(raceDisplayInfo);
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
    this.getThemeName();
  }

  getThemeName() {
    this.currentTheme = this.themeService.getActiveTheme().name.charAt(0).toUpperCase() + this.themeService.getActiveTheme().name.slice(1);
  }

  getRaceDisplayInfoName(raceDisplayInfoEnum: RaceDisplayInfoEnum) {
    if (raceDisplayInfoEnum === RaceDisplayInfoEnum.both)
      return "Both";
    else if (raceDisplayInfoEnum === RaceDisplayInfoEnum.text)
      return "Text";
    else if (raceDisplayInfoEnum === RaceDisplayInfoEnum.draw)
      return "Draw";

    return "";
  }

  enterRedemptionCode() {
    var wasSuccessful = this.codeRedemptionService.redeemCode(this.enteredRedemptionCode);

    if (wasSuccessful) {
      var items = this.codeRedemptionService.getCodeItems(this.enteredRedemptionCode);
      if (items !== undefined) {
        var itemList = "";
        items.forEach(item => itemList += item.amount + " " + item.name + ", ");
        itemList = itemList.replace(/,\s*$/, "")
        alert("You received: " + itemList);        
      }
    }
  }
}
