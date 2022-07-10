import { Injectable } from '@angular/core';
import { Tutorials } from '../models/tutorials.model';
import { Notifications } from '../models/utility/notifications.model';
import { GlobalService } from './global-service.service';

@Injectable({
  providedIn: 'root'
})
export class VersionControlService {

  constructor(private globalService: GlobalService) { }

  //add to this in descending order
  gameVersions = [1.01, 1.00];

  getLatestChanges() {
    return this.getVersionChanges(this.gameVersions[0]);
  }

  getAllChanges() {
    var allChanges: string[] = [];
    this.gameVersions.forEach(version => {
      allChanges.push(this.getVersionChanges(version));
    });
    return allChanges;
  }

  getVersionChanges(version: number) {
    var changes = "";

    if (version === 1.00)
      changes = "Initial Launch!";
    if (version === 1.01)
      changes = "-Improved UI by adding better notifications and refactoring some clickable text\n" +
        "-Breeding Grounds specialization now grants a 10% bonus to Breeding XP from Training, up from 5%\n" +
        "-Refactored Breed Progression\n" +
        "*Breed Levels now grant a 5% bonus to racing stats as opposed to 2%. Breed Levels now require twice as much XP.\n" +
        "*Animals have had their breed levels reduced by half to balance this change. Despite this, you should notice a small increase in stats.";

    return changes;
  }

  updatePlayerVersion() {
    this.gameVersions.forEach(version => {
      if (this.globalService.globalVar.currentVersion < version) {
        if (version === 1.01) {
          this.globalService.globalVar.notifications = new Notifications();
          var breedLevelStatModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedLevelStatModifier");
          if (breedLevelStatModifier !== undefined)
            breedLevelStatModifier.value = .05;

          var breedGaugeMaxIncreaseModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedGaugeMaxIncreaseModifier");
          if (breedGaugeMaxIncreaseModifier !== undefined)
            breedGaugeMaxIncreaseModifier.value = 10;

          var breedingGroundsSpecializationModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedingGroundsSpecializationModifier");
          if (breedingGroundsSpecializationModifier !== undefined)
            breedingGroundsSpecializationModifier.value = .10;

          this.globalService.globalVar.animals.forEach(animal => {
            animal.breedLevel = Math.round(animal.breedLevel / 2);
            animal.breedGaugeXp = animal.breedGaugeXp * 2;
          });

          var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
          if (primaryDeck !== null && primaryDeck !== undefined) {
            primaryDeck.isEventDeck = true;
          }
        }

        this.globalService.globalVar.currentVersion = version;
      }
    });
  }
}
