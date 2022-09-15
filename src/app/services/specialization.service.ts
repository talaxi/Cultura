import { Injectable } from '@angular/core';
import { AnimalStats } from '../models/animals/animal-stats.model';
import { Animal } from '../models/animals/animal.model';
import { BarnSpecializationEnum } from '../models/barn-specialization-enum.model';
import { Barn } from '../models/barns/barn.model';
import { RaceCourseTypeEnum } from '../models/race-course-type-enum.model';
import { GlobalService } from './global-service.service';
import { LookupService } from './lookup.service';
import { UtilityService } from './utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class SpecializationService {

  constructor(private globalService: GlobalService, private utilityService: UtilityService, private lookupService: LookupService) { }

  getSpecializationPopoverText(specialization: BarnSpecializationEnum, specializationLevel: number, showImprovementValue: boolean = false) {
    var specializationText = "";

    if (specialization === BarnSpecializationEnum.TrainingFacility) {
      if (specializationLevel <= 10)
        specializationText = "Training Time Reduction: " + (specializationLevel * 2) + "%<br/>";
      else
        specializationText = "Training Time Reduction: 20%<br/> All Stat Multiplier: " + ((specializationLevel - 10) / 10) + "<br/>";

      var abilityXpGain = 0;
      if (this.globalService.globalVar.resources.find(item => item.name === "Training Facility Improvements") || showImprovementValue) {
        var trainingFacilityAbilityXpAmountModifier = this.globalService.globalVar.modifiers.find(item => item.text === "trainingFacilityAbilityXpAmountModifier");
        if (trainingFacilityAbilityXpAmountModifier !== undefined) {
          abilityXpGain = trainingFacilityAbilityXpAmountModifier.value;
          var timeToCollect = 60;
          var timeToCollectPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionTimeToCollectModifier");

          if (timeToCollectPair !== undefined && timeToCollectPair !== null)
            timeToCollect = timeToCollectPair.value;

          specializationText += "Ability XP: " + (abilityXpGain * specializationLevel) + " / " + timeToCollect + " seconds <br/>";
        }
      }
    }

    if (specialization === BarnSpecializationEnum.BreedingGrounds) {
      var breedingGroundsImprovementAmount = 0;
      if (this.globalService.globalVar.resources.find(item => item.name === "Breeding Grounds Improvements") || showImprovementValue) {
        var breedingGroundsAdditionalAmountModifier = this.globalService.globalVar.modifiers.find(item => item.text === "breedingGroundsAdditionalAmountModifier");
        if (breedingGroundsAdditionalAmountModifier !== undefined)
          breedingGroundsImprovementAmount = breedingGroundsAdditionalAmountModifier.value;
      }

      var breedingGroundsModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "breedingGroundsSpecializationModifier");
      if (breedingGroundsModifierPair !== null && breedingGroundsModifierPair !== undefined) {
        specializationText = "Training Breed XP Multipler: " + (specializationLevel * ((breedingGroundsModifierPair.value + breedingGroundsImprovementAmount) * 100)).toFixed(0) + "%<br/>";
      }
    }

    if (specialization === BarnSpecializationEnum.Attraction) {
      var timeToCollect = 60;
      var timeToCollectPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionTimeToCollectModifier");

      if (timeToCollectPair !== undefined && timeToCollectPair !== null)
        timeToCollect = timeToCollectPair.value;

      var amountEarned = 0;
      var amountEarnedPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionAmountModifier");

      if (amountEarnedPair !== undefined && amountEarnedPair !== null) {
        for (var i = 1; i <= specializationLevel; i++) {
          amountEarned += 20 * i;
        }
      }

      specializationText = "Amount Earned: " + amountEarned.toFixed(0) + " Coins / " + timeToCollect + " seconds<br/>";
      
      var renownAmountEarned = 0;
      if (this.globalService.globalVar.resources.find(item => item.name === "Attraction Improvements") || showImprovementValue) {
        var renownAmountEarnedPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionRenownAmountModifier");

        if (renownAmountEarnedPair !== undefined && renownAmountEarnedPair !== null) {
          renownAmountEarned = renownAmountEarnedPair.value * specializationLevel;
          specializationText += "Amount Earned: " + renownAmountEarned.toFixed(3) + " Renown / " + timeToCollect + " seconds<br/>";
        }
      }
    }
    else if (specialization === BarnSpecializationEnum.ResearchCenter) {
      //this needs to mirror the logic on how it actually calculates
      var statGainIncrements = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterIncrementsModifier");
      var trainingAnimalDefault = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterTrainingAnimalModifier");
      var studyingAnimalDefault = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterStudyingAnimalModifier");
      var maxStatGain = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterMaxStatGainModifier");

      if (statGainIncrements === undefined || statGainIncrements === null ||
        trainingAnimalDefault === undefined || trainingAnimalDefault === null ||
        studyingAnimalDefault === undefined || studyingAnimalDefault === null ||
        maxStatGain === undefined || maxStatGain === null)
        return "";

      var totalPercentStatGain = specializationLevel * statGainIncrements.value;
      var trainingAnimalStatRatio = trainingAnimalDefault.value;
      if (trainingAnimalDefault.value + totalPercentStatGain < maxStatGain.value)
        trainingAnimalStatRatio = trainingAnimalDefault.value + totalPercentStatGain;
      else
        trainingAnimalStatRatio = maxStatGain.value;

      var text = "Training Animal Stat Gain: " + ((trainingAnimalStatRatio) * 100).toFixed(0) + "%<br />";

      var totalStudyingAnimals = (totalPercentStatGain - (maxStatGain.value - trainingAnimalDefault.value)) /
        (maxStatGain.value - studyingAnimalDefault.value);

      //Get random list of animals with course mates at top of list      
      if (totalStudyingAnimals > 0) {

        if (Math.floor(totalStudyingAnimals) > 0)
          text += "Additional Studying Animal Stat Gain (x" + Math.floor(totalStudyingAnimals) + "): " + ((maxStatGain.value) * 100).toFixed(0) + "%<br />";

        if (totalStudyingAnimals > Math.floor(totalStudyingAnimals)) {
          var studyingAnimalStatRatio = (totalStudyingAnimals - Math.floor(totalStudyingAnimals)) * (maxStatGain.value - studyingAnimalDefault.value);
          text += "Additional Studying Animal Stat Gain: " + ((studyingAnimalStatRatio + studyingAnimalDefault.value) * 100).toFixed(0) + "%<br />";
        }
      }
      else {
        text += "Additional Studying Animal Stat Gain: " + (studyingAnimalDefault.value * 100).toFixed(0) + "%<br />";
      }

      var scrimmageValueIncrease = 0;
      if (this.globalService.globalVar.resources.find(item => item.name === "Research Center Improvements") || showImprovementValue) {
        var researchCenterRewardBonusAmountModifier = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterRewardBonusAmountModifier");

        if (researchCenterRewardBonusAmountModifier !== undefined && researchCenterRewardBonusAmountModifier !== null) {
          scrimmageValueIncrease = researchCenterRewardBonusAmountModifier.value * specializationLevel;
          text += "Scrimmage & Coaching Reward Increase: " + (scrimmageValueIncrease * 100).toFixed(0) + "%<br />";
        }
      }

      specializationText = text;
    }

    var sanitizedText = this.utilityService.getSanitizedHtml(specializationText);
    if (sanitizedText !== null && sanitizedText !== undefined)
      specializationText = sanitizedText;

    return specializationText;
  }

  handleResearchCenterStatIncrease(animal: Animal, researchCenter: Barn) {
    var statGainIncrements = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterIncrementsModifier");
    var trainingAnimalDefault = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterTrainingAnimalModifier");
    var studyingAnimalDefault = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterStudyingAnimalModifier");
    var maxStatGain = this.globalService.globalVar.modifiers.find(item => item.text === "researchCenterMaxStatGainModifier");
    var specLevel = researchCenter.barnUpgrades.specializationLevel;

    if (statGainIncrements === undefined || statGainIncrements === null ||
      trainingAnimalDefault === undefined || trainingAnimalDefault === null ||
      studyingAnimalDefault === undefined || studyingAnimalDefault === null ||
      maxStatGain === undefined || maxStatGain === null ||
      animal.currentTraining === undefined || animal.currentTraining === null)
      return;

    var totalMultiplier = specLevel * statGainIncrements.value;
    var baseTopSpeed = animal.currentTraining.affectedStatRatios.topSpeed;
    var baseAcceleration = animal.currentTraining.affectedStatRatios.acceleration;
    var baseEndurance = animal.currentTraining.affectedStatRatios.endurance;
    var basePower = animal.currentTraining.affectedStatRatios.power;
    var baseFocus = animal.currentTraining.affectedStatRatios.focus;
    var baseAdaptability = animal.currentTraining.affectedStatRatios.adaptability;

    var trainingAnimalStatRatio = trainingAnimalDefault.value;

    if (trainingAnimalDefault.value + totalMultiplier < maxStatGain.value)
      trainingAnimalStatRatio = trainingAnimalDefault.value + totalMultiplier;
    else
      trainingAnimalStatRatio = maxStatGain.value;

    animal.increaseStats(new AnimalStats(trainingAnimalStatRatio * baseTopSpeed, trainingAnimalStatRatio * baseAcceleration,
      trainingAnimalStatRatio * baseEndurance, trainingAnimalStatRatio * basePower, trainingAnimalStatRatio * baseFocus,
      trainingAnimalStatRatio * baseAdaptability));
    this.globalService.calculateAnimalRacingStats(animal);

    var totalStudyingAnimals = (totalMultiplier - (maxStatGain.value - trainingAnimalDefault.value)) /
      (maxStatGain.value - studyingAnimalDefault.value);

    //Get random list of animals with course mates at top of list
    var randomizedAnimalList = this.getAnimalsInRandomOrder(animal.raceCourseType, animal);

    if (totalStudyingAnimals > 0) {
      if (randomizedAnimalList.length < totalStudyingAnimals)
        totalStudyingAnimals = randomizedAnimalList.length;

      var i = 0;
      for (i; i < Math.floor(totalStudyingAnimals); i++) {
        randomizedAnimalList[i].increaseStats(new AnimalStats(maxStatGain.value * baseTopSpeed, maxStatGain.value * baseAcceleration,
          maxStatGain.value * baseEndurance, maxStatGain.value * basePower, maxStatGain.value * baseFocus,
          maxStatGain.value * baseAdaptability));
        this.globalService.calculateAnimalRacingStats(randomizedAnimalList[i]);
      }

      if (totalStudyingAnimals > Math.floor(totalStudyingAnimals) && randomizedAnimalList.length > i) {
        var studyingAnimalStatRatio = studyingAnimalDefault.value + ((totalStudyingAnimals - Math.floor(totalStudyingAnimals)) * (maxStatGain.value - studyingAnimalDefault.value));

        randomizedAnimalList[i].increaseStats(new AnimalStats(studyingAnimalStatRatio * baseTopSpeed, studyingAnimalStatRatio * baseAcceleration,
          studyingAnimalStatRatio * baseEndurance, studyingAnimalStatRatio * basePower, studyingAnimalStatRatio * baseFocus,
          studyingAnimalStatRatio * baseAdaptability));
        this.globalService.calculateAnimalRacingStats(randomizedAnimalList[i]);
      }
    }
    else {
      if (randomizedAnimalList.length >= 1) {
        var studyingAnimalStatRatio = studyingAnimalDefault.value;
        randomizedAnimalList[0].increaseStats(new AnimalStats(studyingAnimalStatRatio * baseTopSpeed, studyingAnimalStatRatio * baseAcceleration,
          studyingAnimalStatRatio * baseEndurance, studyingAnimalStatRatio * basePower, studyingAnimalStatRatio * baseFocus,
          studyingAnimalStatRatio * baseAdaptability));
        this.globalService.calculateAnimalRacingStats(randomizedAnimalList[0]);
      }
    }
  }

  getAnimalsInRandomOrder(primaryCourse: RaceCourseTypeEnum, trainingAnimal: Animal) {
    var randomizedList: Animal[] = [];

    var primaryAnimals = this.globalService.globalVar.animals.filter(item => item.raceCourseType === primaryCourse && item.isAvailable && item.type !== trainingAnimal.type);
    var secondaryAnimals = this.globalService.globalVar.animals.filter(item => item.raceCourseType !== primaryCourse && item.isAvailable);

    var length = primaryAnimals.length;
    for (var i = 0; i < length; i++) {
      var rng = this.utilityService.getRandomInteger(1, primaryAnimals.length);
      randomizedList.push(primaryAnimals[rng - 1]);
      primaryAnimals = primaryAnimals.filter(item => item !== primaryAnimals[rng - 1]);
    }

    length = secondaryAnimals.length;
    for (var i = 0; i < length; i++) {
      var rng = this.utilityService.getRandomInteger(1, secondaryAnimals.length);
      randomizedList.push(secondaryAnimals[rng - 1]);
      secondaryAnimals = secondaryAnimals.filter(item => item !== secondaryAnimals[rng - 1]);
    }

    return randomizedList;
  }

  handleTrainingFacilityImprovementsIncreases(deltaTime: number, trainingAnimal: Animal) {
    var assignedBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === trainingAnimal.associatedBarnNumber);
    var improvementItem = this.globalService.globalVar.resources.find(item => item.name === "Training Facility Improvements");
    if (assignedBarn === undefined || assignedBarn === null ||
      assignedBarn.barnUpgrades.specialization !== BarnSpecializationEnum.TrainingFacility ||
      improvementItem === undefined || improvementItem.amount <= 0)
      return;


    var timeToCollect = 60;
    var timeToCollectPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionTimeToCollectModifier");

    if (timeToCollectPair !== undefined && timeToCollectPair !== null)
      timeToCollect = timeToCollectPair.value;

    var xpAmount = 0;

    var trainingFacilityAbilityXpAmountModifierPair = this.globalService.globalVar.modifiers.find(item => item.text === "trainingFacilityAbilityXpAmountModifier");

    if (trainingFacilityAbilityXpAmountModifierPair !== undefined && trainingFacilityAbilityXpAmountModifierPair !== null) {
      xpAmount = trainingFacilityAbilityXpAmountModifierPair.value * assignedBarn.barnUpgrades.specializationLevel;
    }

    assignedBarn.barnUpgrades.trainingFacilityDeltaTime += deltaTime;

    if (trainingAnimal.currentTraining !== null &&
      assignedBarn.barnUpgrades.trainingFacilityDeltaTime >= trainingAnimal.currentTraining.trainingTimeRemaining) {
      assignedBarn.barnUpgrades.trainingFacilityDeltaTime = trainingAnimal.currentTraining.trainingTimeRemaining;
    }
    
    while (assignedBarn.barnUpgrades.trainingFacilityDeltaTime >= timeToCollect) {
      assignedBarn.barnUpgrades.trainingFacilityDeltaTime -= timeToCollect;      
      this.globalService.increaseAbilityXp(trainingAnimal, xpAmount, false);
    }
  }

  handleAttractionRevenue(deltaTime: number, trainingAnimal: Animal) {
    var assignedBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === trainingAnimal.associatedBarnNumber);
    if (assignedBarn === undefined || assignedBarn === null ||
      assignedBarn.barnUpgrades.specialization !== BarnSpecializationEnum.Attraction)
      return;

    var timeToCollect = 60;
    var timeToCollectPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionTimeToCollectModifier");

    if (timeToCollectPair !== undefined && timeToCollectPair !== null)
      timeToCollect = timeToCollectPair.value;

    var amountEarned = 0;
    var amountEarnedPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionAmountModifier");

    if (amountEarnedPair !== undefined && amountEarnedPair !== null) {
      for (var i = 1; i <= assignedBarn.barnUpgrades.specializationLevel; i++) {
        amountEarned += 20 * i;
      }
    }

    var renownAmountEarned = 0;
    if (this.globalService.globalVar.resources.find(item => item.name === "Attraction Improvements")) {
      var renownAmountEarnedPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionRenownAmountModifier");

      if (renownAmountEarnedPair !== undefined && renownAmountEarnedPair !== null) {
        renownAmountEarned = renownAmountEarnedPair.value * assignedBarn.barnUpgrades.specializationLevel;
      }
    }

    assignedBarn.barnUpgrades.currentDeltaTime += deltaTime;
    var collectedAmount = 0;

    if (trainingAnimal.currentTraining !== null &&
      assignedBarn.barnUpgrades.currentDeltaTime >= trainingAnimal.currentTraining.trainingTimeRemaining) {
      assignedBarn.barnUpgrades.currentDeltaTime = trainingAnimal.currentTraining.trainingTimeRemaining;
    }

    while (assignedBarn.barnUpgrades.currentDeltaTime >= timeToCollect) {
      assignedBarn.barnUpgrades.currentDeltaTime -= timeToCollect;

      var resource = this.globalService.globalVar.resources.find(item => item.name === "Coins");
      if (resource !== undefined)
        resource.amount += amountEarned;

      if (renownAmountEarned > 0) {        
        var resource = this.globalService.globalVar.resources.find(item => item.name === "Renown");
        if (resource !== undefined)
          resource.amount += renownAmountEarned;
      }

      collectedAmount += amountEarned;
    }
  }
}
