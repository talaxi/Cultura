import { Component, OnInit } from '@angular/core';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-event-animal-deck',
  templateUrl: './event-animal-deck.component.html',
  styleUrls: ['./event-animal-deck.component.css']
})
export class EventAnimalDeckComponent implements OnInit {
  deck: AnimalDeck;
  breedLevelRequired: number;
  organizedAnimals: Animal[] = [];

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService,
    private lookupService: LookupService, private utilityService: UtilityService) { }

  ngOnInit(): void {
    var eventDeck = this.globalService.globalVar.animalDecks.find(item => item.isEventDeck);
    if (eventDeck !== undefined)
      this.deck = eventDeck;

    if (this.deck !== undefined && this.deck !== null) {
      if (this.deck.isCourseOrderActive) {
        for (var i = 0; i < this.deck.selectedAnimals.length; i++) {
          if (this.deck.courseTypeOrder.length > i) {
            var type = this.deck.courseTypeOrder[i];
            var matchingAnimal = this.deck.selectedAnimals.find(animal => animal.raceCourseType === type);
            if (matchingAnimal !== undefined)
              this.organizedAnimals.push(matchingAnimal);
          }
        }
      }
      else {
        this.deck.selectedAnimals.forEach(animal => {
          this.organizedAnimals.push(animal);
        });
      }
    }


    this.breedLevelRequired = this.getBreedLevelRequired();
  }

  getMorale(animal: Animal) {
    if (this.globalService.globalVar.eventRaceData.animalData === null || this.globalService.globalVar.eventRaceData.animalData === undefined ||
      this.globalService.globalVar.eventRaceData.animalData.length === 0)
      return 0;

    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return 0;

    var moraleLevel = associatedAnimalData.morale;

    return moraleLevel * 100;
  }

  getExhaustion(animal: Animal) {
    if (this.globalService.globalVar.eventRaceData.animalData === null || this.globalService.globalVar.eventRaceData.animalData === undefined ||
      this.globalService.globalVar.eventRaceData.animalData.length === 0)
      return 0;

    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return 0;

    var exhaustionLevel = associatedAnimalData.exhaustionStatReduction;

    return exhaustionLevel * 100;
  }

  eventCompleted() {
    return this.globalService.globalVar.eventRaceData.isGrandPrixCompleted;
  }

  hasEventStarted() {
    var secondsToEvent = this.globalService.getTimeToEventRace();
    if (secondsToEvent > 0 && this.globalService.globalVar.eventRaceData.bonusTime === 0)
      return false;

    return true;
  }

  enteredEvent() {
    return this.globalService.globalVar.eventRaceData.isRunning;
  }

  canEnterGrandPrix(animal: Animal) {
    var canEnter = false;

    var grandPrixBreedLevelRequired = this.getBreedLevelRequired();

    var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === animal.type);

    if (globalAnimal !== undefined) {
      if (globalAnimal.breedLevel >= grandPrixBreedLevelRequired)
        canEnter = true;
    }
    return canEnter;
  }

  getBreedLevelRequired() {
    var grandPrixBreedLevelRequired = 50;
    var grandPrixBreedLevelRequiredPair = this.globalService.globalVar.modifiers.find(item => item.text === "grandPrixBreedLevelRequiredModifier");
    if (grandPrixBreedLevelRequiredPair !== null && grandPrixBreedLevelRequiredPair !== undefined)
      grandPrixBreedLevelRequired = grandPrixBreedLevelRequiredPair.value;

    return grandPrixBreedLevelRequired;
  }

  chooseToStartRace(animal: Animal) {
    var animalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);

    if (animalData !== undefined) {
      var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === animalData?.associatedAnimalType);
      if (globalAnimal !== null && globalAnimal !== undefined) {
        this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(globalAnimal);

        var showSlowSegmentWarning = this.globalService.shouldShowSlowSegmentWarning(globalAnimal);

        if (this.lookupService.slowSegmentWarning(showSlowSegmentWarning)) {
          this.globalService.globalVar.eventRaceData.animalData.forEach(item => {
            item.isCurrentlyRacing = false;
          });

          animalData.isCurrentlyRacing = true;
        }
      }
    }
  }

  isCurrentlyRacing(animal: Animal): boolean {
    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return false;

    return associatedAnimalData.isCurrentlyRacing;
  }

  isSetToRelay(animal: Animal): boolean {
    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return false;

    return associatedAnimalData.isSetToRelay;
  }

  canRelay(animal: Animal) {
    var associatedAnimalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);
    if (associatedAnimalData === null || associatedAnimalData === undefined)
      return false;

    return associatedAnimalData.exhaustionStatReduction > .5;
  }

  relayAnimal(animal: Animal) {
    var animalData = this.globalService.globalVar.eventRaceData.animalData.find(item => item.associatedAnimalType === animal.type);

    if (animalData !== undefined) {
      var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === animalData?.associatedAnimalType);
      if (globalAnimal !== null && globalAnimal !== undefined) {
        this.globalService.globalVar.eventRaceData.nextRaceSegment = this.globalService.generateGrandPrixSegment(globalAnimal);

        var showSlowSegmentWarning = this.globalService.shouldShowSlowSegmentWarning(globalAnimal);

        if (this.lookupService.slowSegmentWarning(showSlowSegmentWarning)) {
          this.globalService.globalVar.eventRaceData.animalData.forEach(item => {
            item.isSetToRelay = false;
          });

          animalData.isSetToRelay = true;
        }
      }
    }
  }

  pullFromRace(animal: Animal) {
    this.globalService.stopGrandPrixRace();
  }

  getColorClass(animal: Animal) {
    if (animal !== null && animal !== undefined) {
      var colorConditional = {
        'flatlandColor': animal.getRaceCourseType() === 'Flatland',
        'mountainColor': animal.getRaceCourseType() === 'Mountain',
        'waterColor': animal.getRaceCourseType() === 'Ocean',
        'tundraColor': animal.getRaceCourseType() === 'Tundra',
        'volcanicColor': animal.getRaceCourseType() === 'Volcanic'
      };
      return colorConditional;
    }
    else
      return {};
  }

  getRestingPopover() {
    return "Racer must be above 50% energy to race";
  }

  getMoralePopover(animal: Animal) {
    var popover = "";

    var morale = this.getMorale(animal);

    if (morale !== undefined) {
      var exhaustionStatLossModifier = .9;
      var exhaustionStatLossPair = this.globalService.globalVar.modifiers.find(item => item.text === "exhaustionStatLossModifier");
      if (exhaustionStatLossPair !== undefined)
        exhaustionStatLossModifier = exhaustionStatLossPair.value;

      var statLoss = 1 - exhaustionStatLossModifier;
      statLoss = statLoss * (1 / (morale / 100));
      exhaustionStatLossModifier = 1 - statLoss;

      popover = "Your current Morale is " + morale.toFixed(2) + "%. Your energy will reduce by " + ((1 - exhaustionStatLossModifier) * 100).toFixed(2) + "% every time you run out of stamina.";
    }

    return popover;
  }

  getEnergyPopover(animal: Animal) {
    var popover = "";

    var energy = this.getExhaustion(animal);
    popover += "Your current Energy is " + energy.toFixed(2) + "%. Your stats are reduced to this amount while racing in the grand prix."

    return popover;
  }

  getUseCountInformation(animal: Animal) {
    var useCountInfo = "";
    var data = this.globalService.globalVar.eventRaceData.eventAbilityData;
    var globalAnimal = this.globalService.globalVar.animals.find(item => item.type === animal.type);
    if (globalAnimal === undefined || globalAnimal === null)
      return;

    if (globalAnimal.type === AnimalTypeEnum.Horse) {
      if (globalAnimal.ability.name === "Inspiration")
        useCountInfo += "Inspiration Relay Count: " + data.inspirationUseCount;
    }

    if (globalAnimal.type === AnimalTypeEnum.Cheetah) {
      if (globalAnimal.ability.name === "On The Hunt")
        useCountInfo += "On The Hunt Use Count: " + data.onTheHuntUseCount + " / " + data.onTheHuntUseCap;
    }

    if (globalAnimal.type === AnimalTypeEnum.Goat) {
      if (globalAnimal.ability.name === "Sure-footed")
        useCountInfo += "Sure-footed Use Count: " + data.sureFootedUseCount + " / " + data.sureFootedUseCap;

      if (globalAnimal.ability.name === "Deep Breathing")
        useCountInfo += "Deep Breathing Relay Count: " + data.deepBreathingUseCount + " / " + data.deepBreathingUseCap;
    }

    if (globalAnimal.type === AnimalTypeEnum.Gecko) {
      if (globalAnimal.ability.name === "Night Vision")
        useCountInfo += "Night Vision Use Count: " + data.nightVisionUseCount + " / " + data.nightVisionUseCap;
    }

    if (globalAnimal.type === AnimalTypeEnum.Dolphin) {
      if (globalAnimal.ability.name === "Flowing Current")
        useCountInfo += "Flowing Current Relay Count: " + data.flowingCurrentUseCount;

      if (globalAnimal.ability.name === "Navigator")
        useCountInfo += "Navigator Relay Count: " + data.navigatorUseCount;
    }

    if (globalAnimal.type === AnimalTypeEnum.Octopus) {
      if (globalAnimal.ability.name === "Big Brain")
        useCountInfo += "Big Brain Relay Count: " + data.bigBrainUseCount + " / " + data.bigBrainUseCap;
    }

    if (globalAnimal.type === AnimalTypeEnum.Penguin) {
      if (globalAnimal.ability.name === "Quick Toboggan")
        useCountInfo += "Quick Toboggan Use Count: " + data.quickTobogganUseCount + " / " + data.quickTobogganUseCap;
    }

    if (globalAnimal.type === AnimalTypeEnum.Caribou) {
      if (globalAnimal.ability.name === "Herd Mentality")
        useCountInfo += "Herd Mentality Relay Count: " + data.herdMentalityUseCount + " / " + data.herdMentalityUseCap;

      if (globalAnimal.ability.name === "Special Delivery")
        useCountInfo += "Special Delivery Relay Count: " + data.specialDeliveryUseCount + " / " + data.specialDeliveryUseCap;
    }

    return this.utilityService.getSanitizedHtml(useCountInfo);
  }

  goToDeckView() {
    this.componentCommunicationService.setNewView(NavigationEnum.relayTeams);
  }
}
