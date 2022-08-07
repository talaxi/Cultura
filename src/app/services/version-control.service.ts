import { Injectable } from '@angular/core';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
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
  gameVersions = [1.07, 1.06, 1.05, 1.04, 1.03, 1.02, 1.01, 1.00];

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
        "<ul><li>Select an event deck (now relay team) and run the marathon-style Grand Prix.</li>" +
        "<li>Run a single race over the course of multiple days to unlock new rewards.</li>" +
        "<li>Mix and match powerful Relay abilities with strong long distance racers and see how far you can go!</li></ul>\n" +
        "More UI improvements. (better contrast in colors, differentiation of text through various means, etc)\n\n" +
        "Bug fixes.";
    if (version === 1.03)
      changes = "Talents are now active!\n" +
        "<ul><li>Complete Rainbow Races to start earning Talent Points for your animals.</li>" +
        "<li>Each animal can select a unique talent tree and start racing in its own unique way.</li></ul>\n" +
        "More UI improvements. (specifically around items/equipment)\n\n" +
        "Bug fixes.";
    if (version === 1.04)
      changes = "Ability rebalancing (view Discord Change Log for full info).\n\n" +
        "Changes to Event Races" +
        "<ul><li>Leg length adjusts based on your game progress so that the race always feels smooth.</li>" +
        "<li>Certain abilities have different effects during events, viewable when changing abilities.</li>" +
        "<li>Abilities that can trigger multiple times or have a cap are now displayed on the Event Race Info page.</li></ul>\n" +
        "Bug fixes (view Discord Change Log for full info).";
    if (version === 1.05)
      changes = "Changed all references of 'Decks' to 'Relay Teams' for ease of understanding and better theming.\n\n" +
        "Bug fixes and UI improvements (view Discord Change Log for full info).";
    if (version === 1.06)
      changes = "Barns can now reset their specialization. By clicking or tapping your Barn Upgrade level, you'll see an overview of your barn’s benefits and the option to reset your specialization at the cost of losing 20% of your Barn Upgrade level.\n\n" +
        "Cost for Mangoes now scale. 1 Mango from the shop costs an extra 50 per purchase and 2 Mangoes from the event shop costs an extra 1 token per purchase.\n\n" +
        "The impact that Renown has on coin gain from race is now logarithmic. After reaching 50 renown, the coin gain will start to slightly fall off. \n\n" +
        "Attractions now give slightly more Coins per specialization level.\n\n" +
        "Added setting to automatically start the event race when the time period begins. This will also catch up on any time you were away between the start of the race and when you first return to the game.\n\n" +
        "Grand Prix now requires breed level 25 instead of 50.\n\n" +
        "Incubator now takes 2 minutes instead of 5 minutes.\n\n" +
        "UI Improvements and Bug Fixes (view Discord Change Log for full info).";
    if (version === 1.07)
      changes = "Sectioned out FAQs, added calculators to make planning easier.\n\n" +
        "Various minor bug fixes and UI improvements.";

    return changes;
  }

  getDateForVersion(version: number) {
    var date = new Date();
    if (version === 1.00)
      date = new Date('2022-07-08 12:00:00');
    if (version === 1.01)
      date = new Date('2022-07-10 12:00:00');
    if (version === 1.02)
      date = new Date('2022-07-18 12:00:00');
    if (version === 1.03)
      date = new Date('2022-07-24 12:00:00');
    if (version === 1.04)
      date = new Date('2022-07-27 12:00:00');
    if (version === 1.05)
      date = new Date('2022-07-29 12:00:00');
    if (version === 1.06)
      date = new Date('2022-08-04 12:00:00');
    if (version === 1.07)
      date = new Date('2022-08-06 12:00:00');

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
        else if (version === 1.03) {
          this.globalService.globalVar.animals.forEach(animal => {
            if (isNaN(Number(animal.breedLevel)) || animal.breedLevel === null || animal.breedLevel === undefined) {
              animal.breedLevel = 1;
            }
          });
        }
        else if (version === 1.04) {
          this.fixTrackRewardsBug();

          this.globalService.globalVar.notifications.isEventRaceNowActive = false;

          this.globalService.globalVar.animals.forEach(item => {
            if (item.type === AnimalTypeEnum.Cheetah) {
              var givingChase = item.availableAbilities.find(ability => ability.name === "Giving Chase");
              if (givingChase !== undefined)
                givingChase.efficiency = .5;

              if (item.ability.name === "Giving Chase")
                item.ability.efficiency = .5;

              var onTheHunt = item.availableAbilities.find(ability => ability.name === "On The Hunt");
              if (onTheHunt !== undefined)
                onTheHunt.efficiency = .1;

              if (item.ability.name === "On The Hunt")
                item.ability.efficiency = .1;
            }

            if (item.type === AnimalTypeEnum.Goat) {
              var deepBreathing = item.availableAbilities.find(ability => ability.name === "Deep Breathing");
              if (deepBreathing !== undefined)
                deepBreathing.efficiency = .25;

              if (item.ability.name === "Deep Breathing")
                item.ability.efficiency = .25;

              var inTheRhythm = item.availableAbilities.find(ability => ability.name === "In The Rhythm");
              if (inTheRhythm !== undefined)
                inTheRhythm.efficiency = .1;


              if (item.ability.name === "In The Rhythm")
                item.ability.efficiency = .1;

              var sureFooted = item.availableAbilities.find(ability => ability.name === "Sure-footed");
              if (sureFooted !== undefined) {
                sureFooted.efficiency = .5;
              }

              if (item.ability.name === "Sure-footed")
                item.ability.efficiency = .5;
            }

            if (item.type === AnimalTypeEnum.Gecko) {
              var nightVision = item.availableAbilities.find(ability => ability.name === "Night Vision");
              if (nightVision !== undefined)
                nightVision.efficiency = .2;


              if (item.ability.name === "Night Vision")
                item.ability.efficiency = .2;
            }

            if (item.type === AnimalTypeEnum.Shark) {
              var bloodInTheWater = item.availableAbilities.find(ability => ability.name === "Blood In The Water");
              if (bloodInTheWater !== undefined)
                bloodInTheWater.efficiency = .1;


              if (item.ability.name === "Blood In The Water")
                item.ability.efficiency = .1;
            }

            if (item.type === AnimalTypeEnum.Octopus) {
              var buriedTreasure = item.availableAbilities.find(ability => ability.name === "Buried Treasure");
              if (buriedTreasure !== undefined)
                buriedTreasure.efficiency = 1;

              if (item.ability.name === "Buried Treasure")
                item.ability.efficiency = 1;

              var bigBrain = item.availableAbilities.find(ability => ability.name === "Big Brain");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 2;

              if (item.ability.name === "Big Brain")
                item.ability.efficiency = 2;
            }

            if (item.type === AnimalTypeEnum.Penguin) {
              var wildToboggan = item.availableAbilities.find(ability => ability.name === "Wild Toboggan");
              if (wildToboggan !== undefined)
                wildToboggan.efficiency = 4;

              if (item.ability.name === "Wild Toboggan")
                item.ability.efficiency = 4;

              var quickToboggan = item.availableAbilities.find(ability => ability.name === "Quick Toboggan");
              if (quickToboggan !== undefined)
                quickToboggan.efficiency = .1;

              if (item.ability.name === "Quick Toboggan")
                item.ability.efficiency = .1;
            }

            if (item.type === AnimalTypeEnum.Caribou) {
              var herdMentality = item.availableAbilities.find(ability => ability.name === "Herd Mentality");
              if (herdMentality !== undefined)
                herdMentality.efficiency = .5;


              if (item.ability.name === "Herd Mentality")
                item.ability.efficiency = .5;

              var specialDelivery = item.availableAbilities.find(ability => ability.name === "Special Delivery");
              if (specialDelivery !== undefined)
                specialDelivery.efficiency = .05;


              if (item.ability.name === "Special Delivery")
                item.ability.efficiency = .05;
            }

            if (item.type === AnimalTypeEnum.Fox) {
              var fleetingSpeed = item.availableAbilities.find(ability => ability.name === "Fleeting Speed");
              if (fleetingSpeed !== undefined)
                fleetingSpeed.efficiency = 1.5;


              if (item.ability.name === "Fleeting Speed")
                item.ability.efficiency = 1.5;
            }
          });

          var autoFreeRacesMaxIdleTimePeriodModifier = this.globalService.globalVar.modifiers.find(item => item.text === "autoFreeRacesMaxIdleTimePeriodModifier");
          if (autoFreeRacesMaxIdleTimePeriodModifier !== undefined)
            autoFreeRacesMaxIdleTimePeriodModifier.value = (2 * 60 * 60);
        }
        else if (version === 1.05) {
          if (this.globalService.globalVar.eventRaceData !== null && this.globalService.globalVar.eventRaceData !== undefined &&
            (this.globalService.globalVar.eventRaceData.isCatchingUp === null || this.globalService.globalVar.eventRaceData.isCatchingUp === undefined))
            this.globalService.globalVar.eventRaceData.isCatchingUp = false;

          var grandPrixBreedLevelRequiredModifier = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixBreedLevelRequiredModifier");
          if (grandPrixBreedLevelRequiredModifier !== undefined)
            grandPrixBreedLevelRequiredModifier.value = 50;
        }
        else if (version === 1.06) {
          this.globalService.globalVar.previousEventRewards = [];

          this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => item.name !== "Bonus Breed XP Gain From Training");
          this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => item.name !== "Bonus Breed XP Gain From Free Races");
          this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => item.name !== "Diminishing Returns per Facility Level");
          this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => item.name !== "Training Time Reduction");
          this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => item.name !== "Bonus Breed XP Gain From Circuit Races");
          this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => item.name !== "Bonus Talents");
          this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => item.name !== "Orb Pendant");

          this.fixTrackRewardsBug();

          this.globalService.globalVar.modifiers.push(new StringNumberPair(.02, "burstMoraleBoostModifier"));

          var grandPrixRenownRewardModifier = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixRenownRewardModifier");
          if (grandPrixRenownRewardModifier !== undefined)
            grandPrixRenownRewardModifier.value = 3;

          var grandPrixBreedLevelRequiredModifier = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixBreedLevelRequiredModifier");
          if (grandPrixBreedLevelRequiredModifier !== undefined)
            grandPrixBreedLevelRequiredModifier.value = 25;

          if (this.globalService.globalVar.incubator !== undefined)
            this.globalService.globalVar.incubator.timeToComplete = 120;

          this.globalService.globalVar.settings.set("autoStartEventRace", false);
        }
        else if (version === 1.07) {
          //if you bought a headband or blue baton prior to rank 8, the two were not adding together correctly
          var headbandCount = 0;
          var headbandTotalAmount = 0;
          this.globalService.globalVar.resources.forEach(item => {
            if (item.name === "Headband") {
              headbandCount += 1;
              headbandTotalAmount += item.amount;
            }
          });

          if (headbandCount > 1) {
            var firstOccurrence = this.globalService.globalVar.resources.findIndex(item => item.name === "Headband");
            this.globalService.globalVar.resources.splice(firstOccurrence, 1);
            var otherOccurrence = this.globalService.globalVar.resources.find(item => item.name === "Headband");
            if (otherOccurrence !== undefined)
              otherOccurrence.amount = headbandTotalAmount;
          }

          var blueBatonCount = 0;
          var blueBatonTotalAmount = 0;
          this.globalService.globalVar.resources.forEach(item => {
            if (item.name === "Blue Baton") {
              blueBatonCount += 1;
              blueBatonTotalAmount += item.amount;
            }
          });

          if (blueBatonCount > 1) {
            var firstOccurrence = this.globalService.globalVar.resources.findIndex(item => item.name === "Blue Baton");
            this.globalService.globalVar.resources.splice(firstOccurrence, 1);
            var otherOccurrence = this.globalService.globalVar.resources.find(item => item.name === "Blue Baton");
            if (otherOccurrence !== undefined)
              otherOccurrence.amount = blueBatonTotalAmount;
          }
        }

        this.globalService.globalVar.currentVersion = version;
      }
    });
  }

  fixTrackRewardsBug() {
    this.globalService.globalVar.animals.filter(item => item.isAvailable).forEach(animal => {
      var freeRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusBreedXpFromFreeRaces();
      var circuitRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusBreedXpFromCircuitRaces();
      var trainingRaceBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusBreedXpFromTraining();
      var drBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusDiminishingReturnsPerFacilityLevel();
      var trainingTimeReductionBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusTrainingTimeReduction();
      var talentsBonus = animal.allTrainingTracks.getTotalTrainingTrackBonusTalents();

      if (animal.miscStats.bonusLocalBreedXpCertificateCount === 0)
        animal.miscStats.bonusBreedXpGainFromLocalRaces = freeRaceBonus;
      else
        animal.miscStats.bonusBreedXpGainFromLocalRaces = freeRaceBonus + animal.miscStats.bonusLocalBreedXpCertificateCount;

      if (animal.miscStats.bonusCircuitBreedXpCertificateCount === 0)
        animal.miscStats.bonusBreedXpGainFromCircuitRaces = circuitRaceBonus;
      else
        animal.miscStats.bonusBreedXpGainFromCircuitRaces = circuitRaceBonus + (2 * animal.miscStats.bonusCircuitBreedXpCertificateCount);

      if (animal.miscStats.bonusTrainingBreedXpCertificateCount === 0)
        animal.miscStats.bonusBreedXpGainFromTraining = trainingRaceBonus;
      else
        animal.miscStats.bonusBreedXpGainFromTraining = trainingRaceBonus + animal.miscStats.bonusTrainingBreedXpCertificateCount;

      if (animal.miscStats.bonusDiminishingReturnsCertificateCount === 0)
        animal.miscStats.diminishingReturnsBonus = drBonus;
      else
        animal.miscStats.diminishingReturnsBonus = drBonus + animal.miscStats.bonusDiminishingReturnsCertificateCount;

      animal.miscStats.trainingTimeReduction = trainingTimeReductionBonus;
      animal.miscStats.bonusTalents = talentsBonus;
    });
  }
}
