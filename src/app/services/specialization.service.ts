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

  getSpecializationPopoverText(specialization: BarnSpecializationEnum, specializationLevel: number) {
    if (specialization === BarnSpecializationEnum.Attraction) {
      var timeToCollect = 60;
      var timeToCollectPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionTimeToCollectModifier");

      if (timeToCollectPair !== undefined && timeToCollectPair !== null)
        timeToCollect = timeToCollectPair.value;

      var amountEarned = 0;
      var amountEarnedPair = this.globalService.globalVar.modifiers.find(item => item.text === "attractionAmountModifier");

      if (amountEarnedPair !== undefined && amountEarnedPair !== null)
        amountEarned = amountEarnedPair.value * specializationLevel;

      return "Amount Earned: " + amountEarned + " Coins / " + timeToCollect + " seconds\n";
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

      var text = "Training Animal Stat Gain: " + ((trainingAnimalStatRatio) * 100).toFixed(0) + "%\n";

      var totalStudyingAnimals = (totalPercentStatGain - (maxStatGain.value - trainingAnimalDefault.value)) /
        (maxStatGain.value - studyingAnimalDefault.value);

      //Get random list of animals with course mates at top of list      
      if (totalStudyingAnimals > 0) {

        if (Math.floor(totalStudyingAnimals) > 0)
          text += "Additional Studying Animal Stat Gain (x" + Math.floor(totalStudyingAnimals) + "): " + ((maxStatGain.value) * 100).toFixed(0) + "%\n";

        if (totalStudyingAnimals > Math.floor(totalStudyingAnimals)) {
          var studyingAnimalStatRatio = (totalStudyingAnimals - Math.floor(totalStudyingAnimals)) * (maxStatGain.value - studyingAnimalDefault.value);
          text += "Additional Studying Animal Stat Gain: " + ((studyingAnimalStatRatio + studyingAnimalDefault.value) * 100).toFixed(0) + "%\n";
        }
      }
      else {
        text += "Additional Studying Animal Stat Gain: " + (studyingAnimalDefault.value * 100).toFixed(0) + "%\n";
      }

      return text;
    }

    return "";
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
      }

      if (totalStudyingAnimals > Math.floor(totalStudyingAnimals) && randomizedAnimalList.length > i) {
        var studyingAnimalStatRatio = studyingAnimalDefault.value + ((totalStudyingAnimals - Math.floor(totalStudyingAnimals)) * (maxStatGain.value - studyingAnimalDefault.value));

        randomizedAnimalList[i].increaseStats(new AnimalStats(studyingAnimalStatRatio * baseTopSpeed, studyingAnimalStatRatio * baseAcceleration,
          studyingAnimalStatRatio * baseEndurance, studyingAnimalStatRatio * basePower, studyingAnimalStatRatio * baseFocus,
          studyingAnimalStatRatio * baseAdaptability));
      }
    }
    else {
      if (randomizedAnimalList.length >= 1) {
        var studyingAnimalStatRatio = studyingAnimalDefault.value;
        randomizedAnimalList[0].increaseStats(new AnimalStats(studyingAnimalStatRatio * baseTopSpeed, studyingAnimalStatRatio * baseAcceleration,
          studyingAnimalStatRatio * baseEndurance, studyingAnimalStatRatio * basePower, studyingAnimalStatRatio * baseFocus,
          studyingAnimalStatRatio * baseAdaptability));
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

    if (amountEarnedPair !== undefined && amountEarnedPair !== null)
      amountEarned = amountEarnedPair.value;

    assignedBarn.barnUpgrades.currentDeltaTime += deltaTime;
    var collectedAmount = 0;
    var originalDeltaTime = assignedBarn.barnUpgrades.currentDeltaTime; 

    if (trainingAnimal.currentTraining !== null && 
      assignedBarn.barnUpgrades.currentDeltaTime >= trainingAnimal.currentTraining.trainingTimeRemaining)
    {
      assignedBarn.barnUpgrades.currentDeltaTime = trainingAnimal.currentTraining.trainingTimeRemaining;
    }

    if (assignedBarn.barnUpgrades.currentDeltaTime >= timeToCollect)
      console.log("Coins Before Attraction While: " + this.lookupService.getCoins());

    while (assignedBarn.barnUpgrades.currentDeltaTime >= timeToCollect) {
      //console.log("Success Delta Time: " + assignedBarn.barnUpgrades.currentDeltaTime);
      assignedBarn.barnUpgrades.currentDeltaTime -= timeToCollect;

      amountEarned *= assignedBarn.barnUpgrades.specializationLevel;
      var resource = this.globalService.globalVar.resources.find(item => item.name === "Coins");
      if (resource !== undefined)
        resource.amount += amountEarned;

      collectedAmount += amountEarned;      
    }    

    if (collectedAmount > 0)
    {
      console.log("Collected Amount: " + collectedAmount);
      console.log("Original Delta Time: " + originalDeltaTime);      
      console.log("Coins After Attraction While: " + this.lookupService.getCoins());
    }
  }
}
