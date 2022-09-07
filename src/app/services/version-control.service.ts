import { Injectable } from '@angular/core';
import { AnimalTypeEnum } from '../models/animal-type-enum.model';
import { AnimalStats } from '../models/animals/animal-stats.model';
import { Warthog, Whale } from '../models/animals/animal.model';
import { OrbStats } from '../models/animals/orb-stats.model';
import { GrandPrixData } from '../models/races/event-race-data.model';
import { PinnacleConditions } from '../models/races/pinnacle-conditions.model';
import { ResourceValue } from '../models/resources/resource-value.model';
import { ShopItemTypeEnum } from '../models/shop-item-type-enum.model';
import { ShopItem } from '../models/shop/shop-item.model';
import { TrainingOptionsEnum } from '../models/training-options-enum.model';
import { Tutorials } from '../models/tutorials.model';
import { Notifications } from '../models/utility/notifications.model';
import { StringNumberPair } from '../models/utility/string-number-pair.model';
import { GlobalService } from './global-service.service';
import { LookupService } from './lookup.service';
import { UtilityService } from './utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class VersionControlService {

  constructor(private globalService: GlobalService, private lookupService: LookupService, private utilityService: UtilityService) { }

  //add to this in descending order
  gameVersions = [1.17, 1.16, 1.15, 1.14, 1.13, 1.12, 1.11, 1.10, 1.09, 1.08, 1.07, 1.06, 1.05, 1.04, 1.03, 1.02, 1.01, 1.00];

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
      changes = "Barns can now reset their specialization. By clicking or tapping your Barn Upgrade level, you'll see an overview of your barn's benefits and the option to reset your specialization at the cost of losing 20% of your Barn Upgrade level.\n\n" +
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
    if (version === 1.08)
      changes = "Increased coin gain from Mono and Duo races. \n\n" +
        "Adjusted free races so that new course types do not show up until you've completed a circuit rank with that type. \n\n" +
        "Added circuit rank up reward for 1000 coins at rank 9 and 1500 coins at rank 23." +
        "<ul><li>Those who have already passed these ranks will immediately receive these coins.</li></ul>\n" +
        "Made Acceleration coaching slightly easier. \n\n" +
        "Added warning before first Breed to better explain what will happen.\n\n" +
        "Minor UI improvements for mobile."
    if (version === 1.09)
      changes = "<em>Just to preface, this is the first set of changes of several intended to make the early game flow better, coin gain and progression feel less punishing, and doing a better job of putting players in the intended gameplay loops. Look forward to more changes soon.</em>\n\n" +
        "Made changes to verbiage in Tutorial and FAQ section for clarity and better guiding on how to play. \n\n" +
        "Readjusted certain trainings so that there was clear progression going up from small to medium barns." +
        "<ul><li><b>Footwork</b> now gives .25 Acceleration as opposed to .5 Acceleration.</li>" +
        "<li><b>Dodge Ball</b> now gives 1 Adaptability as opposed to .5 Adaptability and takes 60 seconds to complete as opposed to 75 seconds.</li></ul>" +
        "Some adjustments were made to passive game time while the game is not active." +
        "<ul><li>Small barns now allow for 4 hours worth of training, up from 2 hours.</li>" +
        "<li>Medium barns now allow for 8 hours worth of training, up from 4 hours.</li>" +
        "<li>Large barns now allow for 12 hours worth of training, up from 8 hours.</li>" +
        "<li>Team Managers will now cover 8 hours of inactive time worth of free races, up from 2 hours.</li></ul>" +
        "The base price for food has been reduced." +
        "<ul><li>All stat increasing food has been reduced to 10 Coins. The goal for these items is to give you a quick boost after breeding to cut down on wait time. This new price should make that a more viable option.</li>" +
        "<li>The base price for Mangoes has been reduced to 100 Coins. For those who have already purchased Mangoes and the price has begun to increase, your total cost will be reduced by 400 Coins to match up with this change.</li></ul>" +
        "Attractions now provide significantly more income. The new formula is 20 Coins * Specialization Level added on top of the previous amount. Check the calculator in the FAQ section to see exactly how much it provides at any given level.\n\n" +
        "For the first 10 barn upgrade levels, the cost is now 50 coins instead of 100.\n\n" +
        "Certain RNG elements were not evenly distributed (Coaching for example) and that issue has been resolved. \n\n" +
        "There have been bugs, balance issues, and some concerns about reward scaling with the Grand Prix. I have taken the Grand Prix down for now while I work on these issues. Look forward to it coming back up in a better state in the next couple of weeks.\n\n" +
        "Additional minor bug fixes.";
    if (version === 1.10)
      changes = "Two new animals have been added to the game!" +
        "<ul><li>The <span class='flatlandColor'>Warthog</span> is a new Flatland racer that you can purchase from the Shop.</li>" +
        "<li>The <span class='waterColor'>Whale</span> is a new Ocean racer that is rewarded for reaching Circuit Rank B (25).</li></ul>" +
        "The <span class='flatlandColor'>Hare</span> is now rewarded for reaching Circuit Rank Q (10). It is no longer listed in the Shop and anyone who has already purchased it will receive 1000 Coins immediately.\n\n" +
        "Buried Treasure (<span class='waterColor'>Octopus</span>) and Cold Blooded (<span class='volcanicColor'>Salamander</span>) have both been reworked.\n\n" +
        "Many Circuit Rank rewards were moved around to make the early game flow better. Of note, the Dolphin is now a reward at Circuit Rank L (15) so that you have more time with only two race course types.\n\n" +
        "Certain items in the shop have been locked behind reaching Circuit Rank AZ (27) before they appear to better guide new players to aim for items better suited for early game.\n\n" +
        "By default, free races now give 1 medal per 50 free race victories.\n\n" +
        "Early game circuit races and free races in general are now easier.\n\n" +
        "After the Attraction change last patch, upgrading barns became a bit too easy at higher levels. Coin cost per upgrade level for barns has been adjusted higher starting at level 100 to keep the time between upgrades balanced.\n\n" +
        "Added option to 'Export to File'/'Import from File' to make saving and loading easier.\n\n" +
        "Removed 'Stats' navigation page. It was really bare bones and just added more to the length of the navigation bar. I will eventually re-implement this in a better fashion.\n\n" +
        "Various bug fixes and UI improvements.";
    if (version === 1.11)
      changes = "The Grand Prix has returned!" +
        "<ul><li>New items have been added as rewards up to the 1 million meter mark for the first rank of the Grand Prix.</li>" +
        "<li>There were some minor adjustments to Token cost of items from the Token shop.</li>" +
        "<li>You can now set the desired energy level of your animals before they relay.</li>" +
        "<li>Bug fixes related to Grand Prix.</li></ul>" +
        "A new item has been added to the shop (Gingko Leaves) that allow you to reset your Breed level and incubator upgrades back to their default levels. In return, you gain 1000% Breed XP until you get back to the Breed Level you were originally at. This will allow those who felt like they want to redo their incubator upgrades to be able to do so quickly.\n\n" +
        "Putting an animal in the incubator now pauses their current training instead of cancelling it.\n\n" +
        "Various bug fixes and UI improvements.";
    if (version === 1.12)
      changes = "Added option to not relay to animals below entered energy amount during Grand Prix.\n\n" +
        "Bug fixes related to Grand Prix.";
    if (version === 1.13)
      changes = "Changed energy floor from 10% to 30%.\n\n" +
        "Refunded a team manager and tokens to those who started on earlier versions and did not correctly receive or had bugs related to them.\n\n" +
        "More bug fixes.";
    if (version === 1.14)
      changes = "Added option to minimize special races/training tracks for better visibility.\n\n" +
        "Added trait % value under the animals when looking at the Incubator to easily see an animal's current status.\n\n" +
        "You can now preview a talent tree before selecting.\n\n" +
        "More bug fixes. (view Discord Change Log for full info)";
    if (version === 1.15)
      changes = "The Pinnacle has been added to the game!" +
        "<ul><li>After reaching Circuit Rank AAAZ (79), you will have access to a new Special Race called The Pinnacle.</li>" +
        "<li>Each floor of the Pinnacle has its own special rules. Pay attention to the conditions and plan your team out to maximize your success!</li>" +
        "<li>As you race, you will pass ritualistic braziers where you place the orbs you received as you ranked up to increase their max level.</li></ul>" +
        "Balance adjustments have been made for Circuit and Special races mostly around the time of being Circuit Rank AA (52) and higher.\n\n" +
        "Incubator upgrade prices have been increased to be more in line with the coin gain increases that were made.\n\n" +
        "Minor bug fixes.";
    if (version === 1.16)
      changes = "Adjustments have been made to the following abilities to be additive instead of multiplicative: On The Hunt (Cheetah), Deep Breathing (Goat), Night Vision (Gecko), Big Brain (Octopus), Quick Toboggan (Penguin), Special Delivery (Caribou)\n\n" +
        "Second Wind (Horse) was nerfed slightly so that you cannot prevent stamina reduction from happening at all. \n\n" +
        "Minor bug fixes.";
    if (version === 1.17)
      changes = "Adjustments have been made to the following abilities: Giving Chase (Cheetah), Sure-footed (Goat), In The Rhythm (Goat), Blood In The Water (Shark), Wild Toboggan (Penguin), Herd Mentality (Caribou), and Fleeting Speed (Fox). Same as the previous round of changes, the intention is to make sure abilities can't become game breaking with scaling multiplicative percents.\n\n" +
        "Endurance and Acceleration coaching are now easier and should take roughly the same amount of time as the others. \n\n" +
        "New setting added so that you can condense your barn view. \n\n" +
        "Code redemption now gives an alert with what your code has given you.\n\n" +
        "Minor bug fixes.";
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
    if (version === 1.08)
      date = new Date('2022-08-07 12:00:00');
    if (version === 1.09)
      date = new Date('2022-08-11 12:00:00');
    if (version === 1.10)
      date = new Date('2022-08-16 12:00:00');
    if (version === 1.11)
      date = new Date('2022-08-21 12:00:00');
    if (version === 1.12)
      date = new Date('2022-08-22 12:00:00');
    if (version === 1.13)
      date = new Date('2022-08-25 12:00:00');
    if (version === 1.14)
      date = new Date('2022-08-28 12:00:00');
    if (version === 1.15)
      date = new Date('2022-09-03 12:00:00');
    if (version === 1.16)
      date = new Date('2022-09-05 12:00:00');
    if (version === 1.17)
      date = new Date('2022-09-07 12:00:00');

    return date.toDateString().replace(/^\S+\s/, '');
  }

  updatePlayerVersion() {
    var baseMaxSpeedModifier = .3;
    var baseAccelerationModifier = .1;
    var baseStaminaModifier = 5;
    var basePowerModifier = 1;
    var baseFocusModifier = 5;
    var baseAdaptabilityModifier = 5;

    var minorImprovement = 1.025;
    var mediumImprovement = 1.05;
    var majorImprovement = 1.1;
    var minorDetriment = .975;
    var mediumDetriment = .95;
    var majorDetriment = .9;

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
        else if (version === 1.08) {
          this.globalService.globalVar.showBreedWarning = false;
          if (this.globalService.globalVar.tutorials === undefined)
            this.globalService.globalVar.tutorials = new Tutorials();

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) > 9) {
            var amount = 1000;
            var resource = this.globalService.globalVar.resources.find(item => item.name === "Coins");
            if (resource === null || resource === undefined)
              this.globalService.globalVar.resources.push(new ResourceValue("Coins", amount));
            else
              resource.amount += amount;
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) > 23) {
            var amount = 1500;
            var resource = this.globalService.globalVar.resources.find(item => item.name === "Coins");
            if (resource === null || resource === undefined)
              this.globalService.globalVar.resources.push(new ResourceValue("Coins", amount));
            else
              resource.amount += amount;
          }
        }
        else if (version === 1.09) {
          var autoFreeRacesMaxIdleTimePeriodModifier = this.globalService.globalVar.modifiers.find(item => item.text === "autoFreeRacesMaxIdleTimePeriodModifier");
          if (autoFreeRacesMaxIdleTimePeriodModifier !== undefined)
            autoFreeRacesMaxIdleTimePeriodModifier.value = (8 * 60 * 60);

          var smallBarnTrainingTimeModifier = this.globalService.globalVar.modifiers.find(item => item.text === "smallBarnTrainingTimeModifier");
          if (smallBarnTrainingTimeModifier !== undefined)
            smallBarnTrainingTimeModifier.value = (4 * 60 * 60);

          var mediumBarnTrainingTimeModifier = this.globalService.globalVar.modifiers.find(item => item.text === "mediumBarnTrainingTimeModifier");
          if (mediumBarnTrainingTimeModifier !== undefined)
            mediumBarnTrainingTimeModifier.value = (8 * 60 * 60);

          var largeBarnTrainingTimeModifier = this.globalService.globalVar.modifiers.find(item => item.text === "largeBarnTrainingTimeModifier");
          if (largeBarnTrainingTimeModifier !== undefined)
            largeBarnTrainingTimeModifier.value = (12 * 60 * 60);

          var footwork = this.globalService.globalVar.trainingOptions.find(item => item.trainingType === TrainingOptionsEnum.Footwork);
          if (footwork !== undefined)
            footwork.affectedStatRatios = new AnimalStats(0, .25, 0, 0, 0, 1);

          var dodgeBall = this.globalService.globalVar.trainingOptions.find(item => item.trainingType === TrainingOptionsEnum.DodgeBall);
          if (dodgeBall !== undefined) {
            dodgeBall.affectedStatRatios = new AnimalStats(0, 2.5, 0, 0, 0, 1);
            dodgeBall.timeToComplete = 60;
          }

          var foodItems = this.globalService.globalVar.shop.find(item => item.name === "Food");
          if (foodItems !== undefined) {
            var baseFoodPrice = 10;

            var apple = foodItems.itemList.find(item => item.name === "Apples");
            if (apple !== undefined) {
              apple.purchasePrice = [];
              apple.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
            }

            var banana = foodItems.itemList.find(item => item.name === "Bananas");
            if (banana !== undefined) {
              banana.purchasePrice = [];
              banana.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
            }

            var strawberries = foodItems.itemList.find(item => item.name === "Strawberries");
            if (strawberries !== undefined) {
              strawberries.purchasePrice = [];
              strawberries.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
            }

            var carrot = foodItems.itemList.find(item => item.name === "Carrots");
            if (carrot !== undefined) {
              carrot.purchasePrice = [];
              carrot.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
            }

            var turnip = foodItems.itemList.find(item => item.name === "Turnips");
            if (turnip !== undefined) {
              turnip.purchasePrice = [];
              turnip.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
            }

            var orange = foodItems.itemList.find(item => item.name === "Oranges");
            if (orange !== undefined) {
              orange.purchasePrice = [];
              orange.purchasePrice.push(new ResourceValue("Coins", baseFoodPrice));
            }

            var mangoes = foodItems.itemList.find(item => item.name === "Mangoes");
            if (mangoes !== undefined) {
              var purchasePrice = mangoes.purchasePrice.find(item => item.name === "Coins");
              if (purchasePrice !== undefined)
                purchasePrice.amount -= 400;
            }

            var attractionAmountModifier = this.globalService.globalVar.modifiers.find(item => item.text === "attractionAmountModifier");
            if (attractionAmountModifier !== undefined)
              attractionAmountModifier.value = 20;

            this.globalService.stopGrandPrixRace();
          }
        }
        else if (version === 1.10) {
          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) < 26) {
            this.globalService.lockTier2ShopItems();
          }
          else {
            this.globalService.unlockTier2ShopItems();
          }

          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * minorImprovement, "warthogDefaultMaxSpeedModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "warthogDefaultAccelerationModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * mediumImprovement, "warthogDefaultStaminaModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * minorImprovement, "warthogDefaultPowerModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * minorDetriment, "warthogDefaultFocusModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * mediumDetriment, "warthogDefaultAdaptabilityModifier"));

          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseMaxSpeedModifier * majorDetriment, "whaleDefaultMaxSpeedModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseAccelerationModifier, "whaleDefaultAccelerationModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseStaminaModifier * mediumImprovement, "whaleDefaultStaminaModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(basePowerModifier * mediumImprovement, "whaleDefaultPowerModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseFocusModifier * majorImprovement, "whaleDefaultFocusModifier"));
          this.globalService.globalVar.modifiers.push(new StringNumberPair(baseAdaptabilityModifier * mediumDetriment, "whaleDefaultAdaptabilityModifier"));

          var warthogAnimal = new Warthog();
          warthogAnimal.name = "Warthog";
          this.globalService.calculateAnimalRacingStats(warthogAnimal);

          var whaleAnimal = new Whale();
          whaleAnimal.name = "Whale";
          this.globalService.calculateAnimalRacingStats(whaleAnimal);

          this.globalService.globalVar.animals.push(warthogAnimal);
          this.globalService.globalVar.animals.push(whaleAnimal);
          this.globalService.sortAnimalOrder();

          var abilityShop = this.globalService.globalVar.shop.find(item => item.name === "Abilities");
          warthogAnimal.availableAbilities.forEach(ability => {
            if (!ability.isAbilityPurchased) {
              var purchasableAbility = new ShopItem();
              purchasableAbility.name = warthogAnimal.getAnimalType() + " Ability: " + ability.name;
              purchasableAbility.purchasePrice.push(new ResourceValue("Coins", ability.purchasePrice));
              purchasableAbility.canHaveMultiples = false;
              purchasableAbility.type = ShopItemTypeEnum.Ability;
              purchasableAbility.additionalIdentifier = ability.name;
              purchasableAbility.isAvailable = warthogAnimal.isAvailable;
              abilityShop?.itemList.push(purchasableAbility);
            }
          });

          whaleAnimal.availableAbilities.forEach(ability => {
            if (!ability.isAbilityPurchased) {
              var purchasableAbility = new ShopItem();
              purchasableAbility.name = whaleAnimal.getAnimalType() + " Ability: " + ability.name;
              purchasableAbility.purchasePrice.push(new ResourceValue("Coins", ability.purchasePrice));
              purchasableAbility.canHaveMultiples = false;
              purchasableAbility.type = ShopItemTypeEnum.Ability;
              purchasableAbility.additionalIdentifier = ability.name;
              purchasableAbility.isAvailable = whaleAnimal.isAvailable;
              abilityShop?.itemList.push(purchasableAbility);
            }
          });

          var animalShop = this.globalService.globalVar.shop.find(item => item.name === "Animals");
          if (animalShop !== null && animalShop !== undefined) {
            var warthog = new ShopItem();
            warthog.name = "Warthog";
            warthog.purchasePrice.push(new ResourceValue("Coins", 1000));
            warthog.canHaveMultiples = false;
            warthog.type = ShopItemTypeEnum.Animal;
            animalShop.itemList.push(warthog);
          }

          this.globalService.globalVar.modifiers.push(new StringNumberPair(50, "freeRacesToMedalModifier"));

          var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
          if (specialtyShop !== null && specialtyShop !== undefined) {
            var teamManager = specialtyShop.itemList.find(item => item.name === "Team Manager");
            if (teamManager !== null && teamManager !== undefined)
              teamManager.totalShopQuantity = 19;

            var talentPoints = new ShopItem();
            talentPoints.name = "Talent Point Voucher";
            talentPoints.purchasePrice.push(this.globalService.getMedalResourceValue(25));
            talentPoints.basePurchasePrice.push(this.globalService.getMedalResourceValue(25));
            talentPoints.infiniteAmount = true;
            talentPoints.canHaveMultiples = true;
            talentPoints.quantityAdditive = 25;
            talentPoints.isAvailable = false;
            if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 53)
              talentPoints.isAvailable = true;
            talentPoints.type = ShopItemTypeEnum.Specialty;
            specialtyShop.itemList.push(talentPoints);
          }

          if (this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Hare)?.isAvailable) {
            var amount = 1000;
            var resource = this.globalService.globalVar.resources.find(item => item.name === "Coins");
            if (resource === null || resource === undefined)
              this.globalService.globalVar.resources.push(new ResourceValue("Coins", amount));
            else
              resource.amount += amount;
          }

          var animalShop = this.globalService.globalVar.shop.find(item => item.name === "Animals");
          if (animalShop !== null && animalShop !== undefined) {
            var hare = animalShop.itemList.find(item => item.name === "Hare");
            if (hare !== null && hare !== undefined)
              hare.isAvailable = false;
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 10) {
            var hareAnimal = this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Hare);
            if (hareAnimal !== undefined) {
              hareAnimal.isAvailable = true;
              this.globalService.unlockAnimalAbilities(hareAnimal);
            }
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 13) {
            this.globalService.globalVar.unlockables.set("barnRow2", true);
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 14) {
            this.globalService.globalVar.unlockables.set("attractionSpecialization", true);
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 25) {
            var alsoWhaleAnimal = this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Whale);
            if (alsoWhaleAnimal !== undefined) {
              alsoWhaleAnimal.isAvailable = true;
              this.globalService.unlockAnimalAbilities(alsoWhaleAnimal);
            }
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 29) {
            this.globalService.globalVar.unlockables.set("barnRow3", true);
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 40) {
            this.globalService.globalVar.unlockables.set("barnRow4", true);
          }

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 58) {
            this.globalService.globalVar.unlockables.set("barnRow5", true);
          }

          var octopus = this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Octopus);
          if (octopus !== undefined) {
            var buriedTreasure = octopus.availableAbilities.find(ability => ability.name === "Buried Treasure");
            if (buriedTreasure !== undefined)
              buriedTreasure.efficiency = 100;

            if (octopus.ability.name === "Buried Treasure")
              octopus.ability.efficiency = 100;
          }

          var salamander = this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Salamander);
          if (salamander !== undefined) {
            var coldBlooded = salamander.availableAbilities.find(ability => ability.name === "Cold Blooded");
            if (coldBlooded !== undefined)
              coldBlooded.efficiency = 45;

            if (salamander.ability.name === "Cold Blooded")
              salamander.ability.efficiency = 45;
          }

        }
        else if (version === 1.11) {
          if (this.globalService.globalVar.eventRaceData !== undefined &&
            (this.globalService.globalVar.eventRaceData.currentEventEndDate === null || this.globalService.globalVar.eventRaceData.currentEventEndDate === undefined)) {
            this.globalService.globalVar.eventRaceData = new GrandPrixData();
            this.globalService.globalVar.eventRaceData.initialSetupComplete = false;
          }

          var specialtyShop = this.globalService.globalVar.shop.find(item => item.name === "Food");
          if (specialtyShop !== null && specialtyShop !== undefined) {
            var gingkoLeaf = new ShopItem();
            gingkoLeaf.name = "Gingko Leaves";
            gingkoLeaf.shortDescription = "Reset Breed Level for a single animal back to 1 and remove all incubator upgrade gains. Increase Breed XP Gain by 900% until Breed Level returns to what it was.";
            gingkoLeaf.purchasePrice.push(new ResourceValue("Coins", 3500));
            gingkoLeaf.canHaveMultiples = true;
            gingkoLeaf.type = ShopItemTypeEnum.Food;
            gingkoLeaf.infiniteAmount = true;
            gingkoLeaf.isAvailable = true;
            specialtyShop.itemList.push(gingkoLeaf);
          }

          var metersPerCoinsGrandPrixModifier = this.globalService.globalVar.modifiers.find(item => item.text === "metersPerCoinsGrandPrixModifier");
          if (metersPerCoinsGrandPrixModifier !== undefined)
            metersPerCoinsGrandPrixModifier.value = 2500000;

          var segmentCompleteMoraleBoostModifier = this.globalService.globalVar.modifiers.find(item => item.text === "segmentCompleteMoraleBoostModifier");
          if (segmentCompleteMoraleBoostModifier !== undefined)
            segmentCompleteMoraleBoostModifier.value = .1;

          var weatherMoraleBoostModifier = this.globalService.globalVar.modifiers.find(item => item.text === "weatherMoraleBoostModifier");
          if (weatherMoraleBoostModifier !== undefined)
            weatherMoraleBoostModifier.value = .5;

          this.globalService.globalVar.relayEnergyFloor = 50;
          this.globalService.globalVar.pinnacleFloor = "Z";
          this.globalService.globalVar.unlockables.set("thePinnacle", false);

          var tier2 = this.globalService.globalVar.tokenShop.find(item => item.name === "Tier 2");
          if (tier2 !== undefined) {
            var coins = tier2.itemList.find(item => item.name === "Coins");
            var breedXpCertificate = tier2.itemList.find(item => item.name === "Training Breed XP Gain Certificate");
            var drCertificate = tier2.itemList.find(item => item.name === "Diminishing Returns Increase Certificate");

            if (coins !== undefined) {
              coins.purchasePrice = [];
              coins.purchasePrice.push(new ResourceValue("Tokens", 1));
            }

            if (breedXpCertificate !== undefined) {
              breedXpCertificate.purchasePrice = [];
              breedXpCertificate.purchasePrice.push(new ResourceValue("Tokens", 2));
            }

            if (drCertificate !== undefined) {
              drCertificate.purchasePrice = [];
              drCertificate.purchasePrice.push(new ResourceValue("Tokens", 4));
            }
          }
        }
        else if (version === 1.12) {
          this.globalService.globalVar.doNotRelayBelowEnergyFloor = false;
        }
        else if (version === 1.13) {
          if (this.globalService.globalVar.startingVersion <= 1.02) {
            var globalResource = this.globalService.globalVar.resources.find(x => x.name === "Tokens");
            if (globalResource !== null && globalResource !== undefined)
              globalResource.amount += 5;
          }

          var incorrectlyLabeledMangoes = this.globalService.globalVar.resources.find(x => x.name === "Mangoes" && x.itemType === ShopItemTypeEnum.Resources);
          if (incorrectlyLabeledMangoes !== undefined) {
            var correctlyLabeledMangoes = this.globalService.globalVar.resources.find(x => x.name === "Mangoes" && x.itemType === ShopItemTypeEnum.Food);
            if (correctlyLabeledMangoes !== undefined && correctlyLabeledMangoes !== null) {
              correctlyLabeledMangoes.amount += incorrectlyLabeledMangoes.amount;
            }
            else {
              this.globalService.globalVar.resources.push(new ResourceValue("Mangoes", incorrectlyLabeledMangoes.amount, ShopItemTypeEnum.Food));
            }

            this.globalService.globalVar.resources = this.globalService.globalVar.resources.filter(item => !(item.name === "Mangoes" && item.itemType === ShopItemTypeEnum.Resources));
          }

          //forgot to give this out when changing ranks to give a free team manager
          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 6 &&
            this.globalService.globalVar.startingVersion <= 1.09) {
            var amount = 1;
            var resource = this.globalService.globalVar.resources.find(item => item.name === "Team Manager");
            if (resource === null || resource === undefined) {
              this.globalService.globalVar.resources.push(new ResourceValue("Team Manager", amount, ShopItemTypeEnum.Specialty));

              if (!this.globalService.globalVar.animalDecks.some(item => item.autoRunFreeRace)) {
                var primaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
                if (primaryDeck !== null && primaryDeck !== undefined) {
                  primaryDeck.autoRunFreeRace = true;
                }
              }
            }
            else
              resource.amount += amount;
          }

          this.globalService.globalVar.orbStats = new OrbStats();

          var exhaustionStatLossMinimumModifier = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionStatLossMinimumModifier");
          if (exhaustionStatLossMinimumModifier !== undefined)
            exhaustionStatLossMinimumModifier.value = .3;

          var tier1 = this.globalService.globalVar.tokenShop.find(item => item.name === "Tier 1");
          var tier2 = this.globalService.globalVar.tokenShop.find(item => item.name === "Tier 2");
          if (tier1 !== undefined) {
            var freeRaceXpCertificate = tier1.itemList.find(item => item.name === "Free Race Breed XP Gain Certificate");
            var circuitRaceXpCertificate = tier1.itemList.find(item => item.name === "Circuit Race Breed XP Gain Certificate");

            if (freeRaceXpCertificate !== undefined) {
              freeRaceXpCertificate.type = ShopItemTypeEnum.Consumable;
            }

            if (circuitRaceXpCertificate !== undefined) {
              circuitRaceXpCertificate.type = ShopItemTypeEnum.Consumable;
            }
          }

          if (tier2 !== undefined) {
            var breedXpCertificate = tier2.itemList.find(item => item.name === "Training Breed XP Gain Certificate");
            var drCertificate = tier2.itemList.find(item => item.name === "Diminishing Returns Increase Certificate");

            if (breedXpCertificate !== undefined) {
              breedXpCertificate.type = ShopItemTypeEnum.Consumable;
            }

            if (drCertificate !== undefined) {
              drCertificate.type = ShopItemTypeEnum.Consumable;
            }
          }
        }
        else if (version === 1.14) {
          if (this.globalService.globalVar.eventRaceData !== undefined && this.globalService.globalVar.eventRaceData !== null) {
            this.globalService.globalVar.eventRaceData.rankDistanceMultiplier = this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.eventRaceData.rank);
          }

          this.globalService.globalVar.settings.set("monoRaceToggled", false);
          this.globalService.globalVar.settings.set("duoRaceToggled", false);
          this.globalService.globalVar.settings.set("rainbowRaceToggled", false);
          this.globalService.globalVar.settings.set("pinnacleRaceToggled", false);
          this.globalService.globalVar.settings.set("noviceTrainingTrackToggled", false);
          this.globalService.globalVar.settings.set("intermediateTrainingTrackToggled", false);
          this.globalService.globalVar.settings.set("masterTrainingTrackToggled", false);
        }
        else if (version === 1.15) {
          this.globalService.globalVar.pinnacleHistory = new PinnacleConditions();

          if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 79) {
            this.globalService.globalVar.unlockables.set("thePinnacle", true);
            this.globalService.globalVar.notifications.isNewSpecialRaceAvailable = true;
          }

          this.globalService.globalVar.settings.set("amberOrbToggled", false);
          this.globalService.globalVar.settings.set("amethystOrbToggled", false);
          this.globalService.globalVar.settings.set("emeraldOrbToggled", false);
          this.globalService.globalVar.settings.set("rubyOrbToggled", false);
          this.globalService.globalVar.settings.set("sapphireOrbToggled", false);
          this.globalService.globalVar.settings.set("topazOrbToggled", false);

          var specialtyItems = this.globalService.globalVar.shop.find(item => item.name === "Specialty");
          if (specialtyItems !== undefined) {
            var incLvl2 = specialtyItems.itemList.find(item => item.name === "Incubator Upgrade Lv2");
            if (incLvl2 !== undefined) {
              incLvl2.purchasePrice = [];
              incLvl2.purchasePrice.push(new ResourceValue("Coins", 25000));
            }

            var incLvl3 = specialtyItems.itemList.find(item => item.name === "Incubator Upgrade Lv3");
            if (incLvl3 !== undefined) {
              incLvl3.purchasePrice = [];
              incLvl3.purchasePrice.push(new ResourceValue("Coins", 100000));
            }

            var incLvl4 = specialtyItems.itemList.find(item => item.name === "Incubator Upgrade Lv4");
            if (incLvl4 !== undefined) {
              incLvl4.purchasePrice = [];
              incLvl4.purchasePrice.push(new ResourceValue("Coins", 1000000));
            }
          }
        }
        if (version === 1.16) {
          this.globalService.globalVar.animals.forEach(item => {
            if (item.type === AnimalTypeEnum.Octopus) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Big Brain");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 4;

              if (item.ability.name === "Big Brain")
                item.ability.efficiency = 4;
            }

            if (item.type === AnimalTypeEnum.Cheetah) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "On The Hunt");
              if (bigBrain !== undefined)
                bigBrain.efficiency = .5;

              if (item.ability.name === "On The Hunt")
                item.ability.efficiency = .5;
            }

            if (item.type === AnimalTypeEnum.Gecko) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Night Vision");
              if (bigBrain !== undefined)
                bigBrain.efficiency = .75;

              if (item.ability.name === "Night Vision")
                item.ability.efficiency = .75;
            }

            if (item.type === AnimalTypeEnum.Penguin) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Quick Toboggan");
              if (bigBrain !== undefined)
                bigBrain.efficiency = .5;

              if (item.ability.name === "Quick Toboggan")
                item.ability.efficiency = .5;
            }

            if (item.type === AnimalTypeEnum.Goat) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Deep Breathing");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 8;

              if (item.ability.name === "Deep Breathing")
                item.ability.efficiency = 8;
            }

            if (item.type === AnimalTypeEnum.Caribou) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Special Delivery");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 5;

              if (item.ability.name === "Special Delivery")
                item.ability.efficiency = 5;
            }
          })
        }
        if (version === 1.17) {
          this.globalService.globalVar.settings.set("quickViewBarnMode", false);
          if (this.globalService.globalVar.eventRaceData !== undefined && this.globalService.globalVar.eventRaceData !== null) {
            this.globalService.globalVar.eventRaceData.eventAbilityData.storingPowerUseCap = 25;
            this.globalService.globalVar.eventRaceData.eventAbilityData.storingPowerUseCount = 0;
          }

          this.globalService.globalVar.animals.forEach(item => {
            if (item.type === AnimalTypeEnum.Cheetah) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Giving Chase");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 1;

              if (item.ability.name === "Giving Chase")
                item.ability.efficiency = 1;
            }

            if (item.type === AnimalTypeEnum.Goat) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Sure-footed");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 50;

              if (item.ability.name === "Sure-footed")
                item.ability.efficiency = 50;

              var inTheRhythm = item.availableAbilities.find(ability => ability.name === "In The Rhythm");
              if (inTheRhythm !== undefined)
                inTheRhythm.efficiency = .2;

              if (item.ability.name === "In The Rhythm")
                item.ability.efficiency = .2;
            }

            if (item.type === AnimalTypeEnum.Shark) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Blood In The Water");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 2;

              if (item.ability.name === "Blood In The Water")
                item.ability.efficiency = 2;
            }

            if (item.type === AnimalTypeEnum.Penguin) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Wild Toboggan");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 1.5;

              if (item.ability.name === "Wild Toboggan")
                item.ability.efficiency = 1.5;
            }

            if (item.type === AnimalTypeEnum.Fox) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Fleeting Speed");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 4;

              if (item.ability.name === "Fleeting Speed")
                item.ability.efficiency = 4;
            }

            if (item.type === AnimalTypeEnum.Caribou) {
              var bigBrain = item.availableAbilities.find(ability => ability.name === "Herd Mentality");
              if (bigBrain !== undefined)
                bigBrain.efficiency = 3;

              if (item.ability.name === "Herd Mentality")
                item.ability.efficiency = 3;
            }
          });
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
