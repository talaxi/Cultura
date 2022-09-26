import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AnimalTypeEnum } from 'src/app/models/animal-type-enum.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { BarnSpecializationEnum } from 'src/app/models/barn-specialization-enum.model';
import { FaqSectionsEnum } from 'src/app/models/faq-sections-enum.model';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { Terrain } from 'src/app/models/races/terrain.model';
import { TerrainTypeEnum } from 'src/app/models/terrain-type-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { SpecializationService } from 'src/app/services/specialization.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-faq-view',
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.css']
})
export class FaqViewComponent implements OnInit {

  calculatorSubscription: any;
  seeAttractionSpoiler: boolean = false;
  seeResearchCenterSpoiler: boolean = false;
  seeOceanCourseTypeSpoiler: boolean = false;
  seeTundraCourseTypeSpoiler: boolean = false;
  seeVolcanicCourseTypeSpoiler: boolean = false;
  seeItemSet2Spoiler: boolean = false;
  seePinnacleSpoiler: boolean = false;
  currentSection: FaqSectionsEnum = FaqSectionsEnum.basics;
  public faqSectionsEnum = FaqSectionsEnum;
  sunnyTerrainInfo = "";
  stormyTerrainInfo = "";
  rainyTerrainInfo = "";
  snowfallTerrainInfo = "";
  ashfallTerrainInfo = "";
  maelstromTerrainInfo = "";
  hailstormTerrainInfo = "";
  torridTerrainInfo = "";
  legacyTrackAvailable = false;

  coinGainRenownAmount: number = 0;
  facilityLevel = 0;
  incubatorUpgradeLevel = 0;
  selectedAnimalType: number = 0;
  animalSelected = true;
  availableAnimals: Animal[] = [];
  bonusBreedXp = 0;
  breedingGroundsSpecializationLevel = 0;
  selectedSpecialization = 1;
  barnUpgradeLevel = 0;
  barnSpecializationLevel = 0;
  hasBarnImprovements = false;

  renownCoinGain = 0;
  incubatorModifierAmount = 0;
  trainingBreedXpGain = 0;
  barnSpecializationLevelAmount = "";

  notgBreedLevel: number;
  notgBreedModifierGain: number;
  notgOrbInfuserGain: number;
  notgSelectedAnimalType: number = 0;
  notgAnimalSelected = true;
  hasOrbInfuser = false;

  constructor(private componentCommunicationService: ComponentCommunicationService, public lookupService: LookupService,
    private gameLoopService: GameLoopService, public globalService: GlobalService, private specializationService: SpecializationService,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.faqs);

    if (this.utilityService.getNumericValueOfCircuitRank(this.globalService.globalVar.circuitRank) >= 27)
      this.seeItemSet2Spoiler = true;

    if (this.lookupService.isItemUnlocked("attractionSpecialization"))
      this.seeAttractionSpoiler = true;

    if (this.lookupService.isItemUnlocked("researchCenterSpecialization"))
      this.seeResearchCenterSpoiler = true;

    if (this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Dolphin)?.isAvailable)
      this.seeOceanCourseTypeSpoiler = true;

    if (this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Penguin)?.isAvailable)
      this.seeTundraCourseTypeSpoiler = true;

    if (this.globalService.globalVar.animals.find(item => item.type === AnimalTypeEnum.Salamander)?.isAvailable)
      this.seeVolcanicCourseTypeSpoiler = true;

      if (this.lookupService.isItemUnlocked("thePinnacle"))
      this.seePinnacleSpoiler = true;

    this.sunnyTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Sunny));
    this.stormyTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Stormy));
    this.rainyTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Rainy));
    this.torridTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Torrid));
    this.maelstromTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Maelstrom));
    this.hailstormTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Hailstorm));
    this.ashfallTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Ashfall));
    this.snowfallTerrainInfo = this.lookupService.getTerrainPopoverText(new Terrain(TerrainTypeEnum.Snowfall));

    this.availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);
    this.coinGainRenownAmount = this.lookupService.getRenown();
    this.facilityLevel = this.lookupService.getFacilityLevel();

    var incubatorUpgradeLv1 = this.globalService.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv1");
    var incubatorUpgradeLv2 = this.globalService.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv2");
    var incubatorUpgradeLv3 = this.globalService.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv3");
    var incubatorUpgradeLv4 = this.globalService.globalVar.resources.find(item => item.name === "Incubator Upgrade Lv4");

    if (incubatorUpgradeLv1 !== null && incubatorUpgradeLv1 !== undefined) {
      this.incubatorUpgradeLevel = 1;
    }
    if (incubatorUpgradeLv2 !== null && incubatorUpgradeLv2 !== undefined) {
      this.incubatorUpgradeLevel = 2;
    }
    if (incubatorUpgradeLv3 !== null && incubatorUpgradeLv3 !== undefined) {
      this.incubatorUpgradeLevel = 3;
    }
    if (incubatorUpgradeLv4 !== null && incubatorUpgradeLv4 !== undefined) {
      this.incubatorUpgradeLevel = 4;
    }

    this.globalService.globalVar.animals.forEach(item => {
      if (item.allTrainingTracks.legacyTrackAvailable)
        this.legacyTrackAvailable = true;
    });

    this.newAnimalSelected(); //default the breed xp calculator
    this.newNotgAnimalSelected();

    this.calculatorSubscription = this.gameLoopService.gameUpdateEvent.subscribe(async () => {
      this.handleRenownModifierCalculation();

      this.handleIncubatorModifierCalculation();

      this.handleTrainingBreedXpGainCalculation();

      this.handleBarnSpecializationLevelAmountCalculation();

      this.handleNectarOfTheGodsCalculation();
    });
  }

  handleRenownModifierCalculation() {
    if (this.coinGainRenownAmount !== undefined && this.coinGainRenownAmount !== null) {
      this.renownCoinGain = this.lookupService.getRenownCoinModifier(this.coinGainRenownAmount, true);
    }
  }

  handleIncubatorModifierCalculation() {
    if (this.incubatorUpgradeLevel !== undefined && this.incubatorUpgradeLevel !== null &&
      this.facilityLevel !== undefined && this.facilityLevel !== null) {
      var increasedAmount = 0;
      var incubatorUpgradeIncrease = .001;
      var incubatorUpgradeIncreaseModifier = this.globalService.globalVar.modifiers.find(item => item.text === "incubatorUpgradeIncreaseModifier");
      if (incubatorUpgradeIncreaseModifier !== null && incubatorUpgradeIncreaseModifier !== undefined)
        incubatorUpgradeIncrease = incubatorUpgradeIncreaseModifier.value;

      var increasedAmount = this.facilityLevel * incubatorUpgradeIncrease;
      if (!isNaN(this.incubatorUpgradeLevel))
        this.incubatorUpgradeLevel = +this.incubatorUpgradeLevel;

      if (this.incubatorUpgradeLevel >= 4) {
        if (increasedAmount > .1)
          increasedAmount = .1;

        this.incubatorUpgradeLevel = 4;
      }
      else if (this.incubatorUpgradeLevel === 3) {
        if (increasedAmount > .05)
          increasedAmount = .05;
      }
      else if (this.incubatorUpgradeLevel === 2) {
        if (increasedAmount > .025)
          increasedAmount = .025;
      }
      else if (this.incubatorUpgradeLevel === 1) {
        if (increasedAmount > .01)
          increasedAmount = .01;
      }
      else if (this.incubatorUpgradeLevel <= 0) {
        increasedAmount = 0;
      }

      this.incubatorModifierAmount = Math.round(increasedAmount * 1e3) / 1e3;
    }
  }

  handleTrainingBreedXpGainCalculation() {
    var defaultAnimal = new Animal();
    defaultAnimal.miscStats.bonusBreedXpGainFromTraining = this.bonusBreedXp;

    this.trainingBreedXpGain = this.lookupService.getTrainingBreedGaugeIncrease(this.breedingGroundsSpecializationLevel, defaultAnimal);
  }

  handleNectarOfTheGodsCalculation() {
    var precisionModifier = 1e2;

    if (this.notgAnimalSelected) {
      var globalAnimal: Animal | undefined = undefined;
      if (this.notgSelectedAnimalType !== undefined && this.notgSelectedAnimalType !== null) {
        globalAnimal = this.globalService.globalVar.animals.find(item => item.getAnimalType() === AnimalTypeEnum[this.notgSelectedAnimalType]);

        if (globalAnimal !== undefined) {          
          this.notgBreedModifierGain = Math.round((this.globalService.getNectarOfTheGodsIncrease(globalAnimal) * 100) * precisionModifier)  / precisionModifier;
          this.notgOrbInfuserGain = this.globalService.getNectarOfTheGodsOrbInfusionIncrease(globalAnimal);          
        }
      }
    }
    else {
      var defaultAnimal = new Animal();      
      this.notgBreedModifierGain = Math.round((this.globalService.getNectarOfTheGodsIncrease(defaultAnimal, this.notgBreedLevel) * 100) * precisionModifier)  / precisionModifier;
      this.notgOrbInfuserGain = this.globalService.getNectarOfTheGodsOrbInfusionIncrease(defaultAnimal, this.notgBreedLevel);      
    }
  }

  newAnimalSelected() {
    this.animalSelected = true;
    var globalAnimal: Animal | undefined = undefined;
    if (this.selectedAnimalType !== undefined && this.selectedAnimalType !== null) {
      globalAnimal = this.globalService.globalVar.animals.find(item => item.getAnimalType() === AnimalTypeEnum[this.selectedAnimalType]);

      if (globalAnimal !== undefined) {
        this.bonusBreedXp = globalAnimal.miscStats.bonusBreedXpGainFromTraining; //TODO: include certificates

        if (globalAnimal.associatedBarnNumber >= 0)
          var globalBarn = this.globalService.globalVar.barns.find(item => item.barnNumber === globalAnimal?.associatedBarnNumber);
        if (globalBarn !== undefined && globalBarn.barnUpgrades.specialization === BarnSpecializationEnum.BreedingGrounds) {
          this.breedingGroundsSpecializationLevel = globalBarn.barnUpgrades.specializationLevel;
        }
      }
    }
  }

  newNotgAnimalSelected() {
    console.log("Animal selected");
    this.notgAnimalSelected = true;
    var globalAnimal: Animal | undefined = undefined;
    if (this.notgSelectedAnimalType !== undefined && this.notgSelectedAnimalType !== null) {
      globalAnimal = this.globalService.globalVar.animals.find(item => item.getAnimalType() === AnimalTypeEnum[this.notgSelectedAnimalType]);
      if (globalAnimal !== undefined)
        this.notgBreedLevel = globalAnimal.breedLevel;
    }
  }

  animalNotSelected() {
    this.animalSelected = false;
  }

  notgAnimalNotSelected() {
    this.notgAnimalSelected = false;
  }

  handleBarnSpecializationLevelAmountCalculation() {
    if (+this.selectedSpecialization === 1) {
      this.barnSpecializationLevelAmount = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.BreedingGrounds, this.barnSpecializationLevel, this.hasBarnImprovements);
    }
    else if (+this.selectedSpecialization === 2) {
      this.barnSpecializationLevelAmount = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.TrainingFacility, this.barnSpecializationLevel, this.hasBarnImprovements);
    }
    else if (+this.selectedSpecialization === 3) {
      this.barnSpecializationLevelAmount = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.Attraction, this.barnSpecializationLevel, this.hasBarnImprovements);
    }
    else if (+this.selectedSpecialization === 4) {
      this.barnSpecializationLevelAmount = this.specializationService.getSpecializationPopoverText(BarnSpecializationEnum.ResearchCenter, this.barnSpecializationLevel, this.hasBarnImprovements);
    }
  }

  checkForImprovements() {
    var hasImprovements = false;
    if (+this.selectedSpecialization === 1) {
      hasImprovements = this.globalService.globalVar.resources.some(item => item.name === "Breeding Grounds Improvements");
    }
    else if (+this.selectedSpecialization === 2) {
      hasImprovements = this.globalService.globalVar.resources.some(item => item.name === "Training Facility Improvements");
    }
    else if (+this.selectedSpecialization === 3) {
      hasImprovements = this.globalService.globalVar.resources.some(item => item.name === "Attraction Improvements");
    }
    else if (+this.selectedSpecialization === 4) {
      hasImprovements = this.globalService.globalVar.resources.some(item => item.name === "Research Center Improvements");
    }

    this.hasBarnImprovements = hasImprovements;
  }

  changeBarnUpgradeLevel() {
    this.barnSpecializationLevel = Math.floor(this.barnUpgradeLevel / 10);
  }

  changeBarnSpecializationLevel() {
    this.barnUpgradeLevel = this.barnSpecializationLevel * 10;
  }

  viewSpoiler(name: string) {
    if (name === "Attraction Specialization")
      this.seeAttractionSpoiler = true;
    if (name === "Research Center Specialization")
      this.seeResearchCenterSpoiler = true;
    if (name === "Ocean Course Type")
      this.seeOceanCourseTypeSpoiler = true;
    if (name === "Tundra Course Type")
      this.seeTundraCourseTypeSpoiler = true;
    if (name === "Volcanic Course Type")
      this.seeVolcanicCourseTypeSpoiler = true;
    if (name === "Item Set 2")
      this.seeItemSet2Spoiler = true;
  }

  expandAnswer(id: string) {
    var element = document.getElementById(id);
    if (element !== null && element !== undefined) {
      element.classList.toggle("hide");
    }
  }

  toggleHasImprovements() {
    this.hasBarnImprovements = !this.hasBarnImprovements;
  }

  toggleHasOrbInfuser() {
    this.hasOrbInfuser = !this.hasOrbInfuser;
  }

  changeSection(newSection: FaqSectionsEnum) {
    this.currentSection = newSection;
  }

  ngOnDestroy() {
    if (this.calculatorSubscription !== undefined && this.calculatorSubscription !== null)
      this.calculatorSubscription.unsubscribe();
  }
}
