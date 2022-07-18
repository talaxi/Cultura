import { Injectable } from '@angular/core';
import { GrandPrixData } from '../models/races/event-race-data.model';
import { ShopItemTypeEnum } from '../models/shop-item-type-enum.model';
import { ShopItem } from '../models/shop/shop-item.model';
import { Tutorials } from '../models/tutorials.model';
import { Notifications } from '../models/utility/notifications.model';
import { StringNumberPair } from '../models/utility/string-number-pair.model';
import { GlobalService } from './global-service.service';
import { LookupService } from './lookup.service';

@Injectable({
  providedIn: 'root'
})
export class VersionControlService {

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  //add to this in descending order
  gameVersions = [1.02, 1.01, 1.00];

  getListAscended() {
    var ascendedList: number[] = [];

    this.gameVersions.forEach(item => {
      ascendedList.unshift(item);
    });

    return ascendedList;
  }

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
      changes = "Improved UI by adding better notifications and refactoring some clickable text.\n\n" +
        "Breeding Grounds specialization now grants a 10% bonus to Breeding XP from Training, up from 5%.\n\n" +
        "Refactored Breed Progression:\n" +
        "<ul><li>Breed Levels now grant a 5% bonus to racing stats as opposed to 2%. Breed Levels now require twice as much XP.</li>" +
        "<li>Animals have had their breed levels reduced by half to balance this change. Despite this, you should notice a small increase in stats.</li></ul>";
    if (version === 1.02)
      changes = "Event Races now active!\n" +
      "<ul><li>Select an event deck and run the marathon-style Grand Prix.</li>" +
      "<li>Run a single race over the course of multiple days to unlock new rewards.</li>" +
      "<li>Mix and match powerful Relay abilities with strong long distance racers and see how far you can go!</li></ul>\n" +
      "More UI improvements. (better contrast in colors, differentiation of text through various means, etc)\n\n" +
      "Bug fixes.";
    return changes;
  }

  getDateForVersion(version: number) {
    var date = new Date();
    if (version === 1.00)
      date = new Date('2022-07-08 12:00:00');
    if (version === 1.01)
      date = new Date('2022-07-10 12:00:00');

    return date.toDateString().replace(/^\S+\s/, '');
  }

  updatePlayerVersion() {    
    this.getListAscended().forEach(version => {
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
        else if (version === 1.02) {
          this.globalService.globalVar.eventRaceData = new GrandPrixData();

          this.globalService.globalVar.modifiers.push(new StringNumberPair(.1, "exhaustionStatLossMinimumModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(5000000, "metersPerCoinsGrandPrixModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(20000000, "metersPerRenownGrandPrixModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(100, "grandPrixCoinRewardModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(5, "grandPrixRenownRewardModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(50000000, "grandPrixToken1MeterModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(100000000, "grandPrixToken2MeterModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(250000000, "grandPrixToken3MeterModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(500000000, "grandPrixToken4MeterModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(5 * 60, "exhaustionGainTimerCapGrandPrixModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(.02, "exhaustionGainGrandPrixModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(2 * 60 * 60, "weatherClusterTimerCapGrandPrixModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(75, "grandPrixBreedLevelRequiredModifier"));

          this.globalService.globalVar.modifiers.push(new StringNumberPair(2, "scaryMaskEquipmentModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(1.2, "runningShoesEquipmentModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(.9, "incenseEquipmentModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(.5, "athleticTapeEquipmentModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(.2, "weatherMoraleBoostModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(.03, "focusMoraleLossModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(.01, "stumbleMoraleLossModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(.05, "segmentCompleteMoraleBoostModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(5, "whistleModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(10, "goldenWhistleModifier"));

          this.globalService.InitializeTokenShop();

          var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
          if (specialtyShop !== null && specialtyShop !== undefined) {
            var whistle = new ShopItem();
            whistle.name = "Whistle";
            whistle.purchasePrice.push(this.globalService.getCoinsResourceValue(2500));
            whistle.basePurchasePrice.push(this.globalService.getCoinsResourceValue(2500));    
            whistle.totalShopQuantity = 1;
            whistle.canHaveMultiples = false;
            whistle.isAvailable = this.lookupService.isItemUnlocked("coaching");
            whistle.type = ShopItemTypeEnum.Specialty;
            specialtyShop.itemList.push(whistle);
        
            var goldenWhistle = new ShopItem();
            goldenWhistle.name = "Golden Whistle";
            goldenWhistle.purchasePrice.push(this.globalService.getCoinsResourceValue(15000));
            goldenWhistle.basePurchasePrice.push(this.globalService.getCoinsResourceValue(15000));    
            goldenWhistle.totalShopQuantity = 1;
            goldenWhistle.canHaveMultiples = false;
            goldenWhistle.isAvailable = false;
            goldenWhistle.type = ShopItemTypeEnum.Specialty;
            specialtyShop.itemList.push(goldenWhistle);
          }

          //Bonus Breed XP Gain From Local Races
          this.globalService.globalVar.animals.forEach(item => {
            item.allTrainingTracks.noviceTrack.rewards.filter(reward => reward.name === "Bonus Breed XP Gain From Local Races").forEach(name => {
              name.name = "Bonus Breed XP Gain From Free Races";
            });
          });

          this.globalService.globalVar.animals.forEach(item => {
            item.allTrainingTracks.intermediateTrack.rewards.filter(reward => reward.name === "Bonus Breed XP Gain From Local Races").forEach(name => {
              name.name = "Bonus Breed XP Gain From Free Races";
            });
          });

          this.globalService.globalVar.animals.forEach(item => {
            item.allTrainingTracks.masterTrack.rewards.filter(reward => reward.name === "Bonus Breed XP Gain From Local Races").forEach(name => {
              name.name = "Bonus Breed XP Gain From Free Races";
            });
          });

          //messed this up last deploy, need to fix
          this.globalService.globalVar.animals.forEach(animal => {
            animal.breedGaugeMax = 200 + ((animal.breedLevel - 1) * 10);
          });
        }

        this.globalService.globalVar.currentVersion = version;
      }
    });
  }
}
