import { Type } from "class-transformer";
import { AnimalTypeEnum } from "../animal-type-enum.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { ResourceValue } from "../resources/resource-value.model";
import { AllTrainingTracks } from "../training-track/all-training-tracks.model";
import { TrainingOption } from "../training/training-option.model";
import { Ability } from "./ability.model";
import { AnimalStats } from "./animal-stats.model";
import { AnimalTraits } from "./animal-traits.model";
import { Equipment } from "./equipment.model";
import { IncubatorStatUpgrades } from "./incubator-stat-upgrades.model";
import { MiscStats } from "./misc-stats.model";
import { RaceVariables } from "./race-variables.model";
import { TalentTree } from "./talent-tree.model";
import { TrackedAnimalStats } from "./tracked-animal-stats.model";

export class Animal {
    name: string;
    type: AnimalTypeEnum;
    raceCourseType: RaceCourseTypeEnum;
    @Type(() => AnimalStats)
    currentStats: AnimalStats;
    @Type(() => AnimalStats)
    baseStats: AnimalStats;  //used for breeding calculations
    isAvailable: boolean;
    @Type(() => TrainingOption)
    currentTraining: TrainingOption | null;
    @Type(() => TrainingOption)
    queuedTraining: TrainingOption | null;
    associatedBarnNumber: number;
    @Type(() => Ability)
    ability: Ability;
    @Type(() => RaceVariables)
    raceVariables: RaceVariables;
    @Type(() => ResourceValue)
    equippedItem: ResourceValue | null;
    @Type(() => ResourceValue)
    equippedOrb: ResourceValue | null;
    @Type(() => IncubatorStatUpgrades)
    incubatorStatUpgrades: IncubatorStatUpgrades;
    @Type(() => AllTrainingTracks)
    allTrainingTracks: AllTrainingTracks;
    breedLevel: number;
    breedGaugeXp: number;
    breedGaugeMax: number;
    @Type(() => MiscStats)
    miscStats: MiscStats;
    @Type(() => TrackedAnimalStats)
    trackedAnimalStats: TrackedAnimalStats;
    autoBreedActive: boolean;
    @Type(() => Ability)
    availableAbilities: Ability[];
    @Type(() => AnimalTraits)
    trait: AnimalTraits;
    @Type(() => TalentTree)
    talentTree: TalentTree;
    canTrain: boolean;
    canEquipOrb: boolean;
    totalRacesRun: number; //for tracked stats

    constructor() {
        this.incubatorStatUpgrades = new IncubatorStatUpgrades();
        this.allTrainingTracks = new AllTrainingTracks();
        this.miscStats = new MiscStats();
        this.trackedAnimalStats = new TrackedAnimalStats();
        this.talentTree = new TalentTree();
        this.breedLevel = 1;
        this.breedGaugeXp = 0;
        this.breedGaugeMax = 200;
        this.totalRacesRun = 0;
        this.equippedOrb = null;
        this.canEquipOrb = false;
        this.canTrain = true;
        this.isAvailable = false;

        this.availableAbilities = [];
    }

    makeCopy(originalAnimal: Animal) {
        var copyAnimal = new Animal();
        
        copyAnimal.name = originalAnimal.name;
        copyAnimal.type = originalAnimal.type;
        copyAnimal.raceCourseType = originalAnimal.raceCourseType;
        copyAnimal.currentStats = originalAnimal.currentStats.makeCopy(originalAnimal.currentStats);
        copyAnimal.baseStats = originalAnimal.baseStats.makeCopy(originalAnimal.baseStats);
        copyAnimal.talentTree = originalAnimal.talentTree.makeCopy(originalAnimal.talentTree);
        copyAnimal.isAvailable = originalAnimal.isAvailable;
        copyAnimal.ability = originalAnimal.ability;
        copyAnimal.raceVariables = new RaceVariables();
        copyAnimal.equippedItem = originalAnimal.equippedItem;
        copyAnimal.equippedOrb = originalAnimal.equippedOrb;
        copyAnimal.incubatorStatUpgrades = originalAnimal.incubatorStatUpgrades;
        copyAnimal.breedLevel = originalAnimal.breedLevel;
        copyAnimal.trackedAnimalStats = originalAnimal.trackedAnimalStats;
        copyAnimal.trait = originalAnimal.trait;

        return copyAnimal;
    }

    viewAbility(): string {
        return this.ability.name;
    }

    getAbilityUseUpdateText(animalDisplayName: string, additionalAbilityInfo: string = ""): string {
        return animalDisplayName + " uses " + this.ability.name + additionalAbilityInfo + ".";
    }

    useAbility(): void {

    }

    getAnimalType(): string {
        return AnimalTypeEnum[this.type];
    }

    getRaceCourseType(): string {
        return RaceCourseTypeEnum[this.raceCourseType];
    }

    getTraitName(): string {
        if (this.trait === undefined || this.trait === null || this.trait.traitName === "")
            return "None";

        return this.trait.traitName;
    }

    getEquippedItemName() {
        if (this.equippedItem !== undefined && this.equippedItem !== null)
            return this.equippedItem.name;

        return undefined;
    }

    getCourseTypeClass() {
        if (this.raceCourseType === RaceCourseTypeEnum.Flatland)
            return "flatlandColor";
        if (this.raceCourseType === RaceCourseTypeEnum.Mountain)
            return "mountainColor";
        if (this.raceCourseType === RaceCourseTypeEnum.Ocean)
            return "waterColor";
        if (this.raceCourseType === RaceCourseTypeEnum.Tundra)
            return "tundraColor";
        if (this.raceCourseType === RaceCourseTypeEnum.Volcanic)
            return "volcanicColor";

        return "";
    }

    increaseStatsFromCurrentTraining(): void {
        if (this.currentTraining === undefined || this.currentTraining === null ||
            this.currentStats === undefined || this.currentStats === null)
            return;

        this.currentStats.topSpeed += this.currentTraining.affectedStatRatios.topSpeed * this.currentTraining.statGain;
        this.currentStats.acceleration += this.currentTraining.affectedStatRatios.acceleration * this.currentTraining.statGain;
        this.currentStats.endurance += this.currentTraining.affectedStatRatios.endurance * this.currentTraining.statGain;
        this.currentStats.power += this.currentTraining.affectedStatRatios.power * this.currentTraining.statGain;
        this.currentStats.focus += this.currentTraining.affectedStatRatios.focus * this.currentTraining.statGain;
        this.currentStats.adaptability += this.currentTraining.affectedStatRatios.adaptability * this.currentTraining.statGain;
    }

    increaseStats(increaseStatAmount: AnimalStats): void {
        if (increaseStatAmount === undefined || increaseStatAmount === null ||
            this.currentStats === undefined || this.currentStats === null)
            return;

        this.currentStats.topSpeed += Number(increaseStatAmount.topSpeed);
        this.currentStats.acceleration += Number(increaseStatAmount.acceleration);
        this.currentStats.stamina += Number(increaseStatAmount.stamina);
        this.currentStats.endurance += Number(increaseStatAmount.endurance);
        this.currentStats.power += Number(increaseStatAmount.power);
        this.currentStats.focus += Number(increaseStatAmount.focus);
        this.currentStats.adaptability += Number(increaseStatAmount.adaptability);
    }
}




export class Horse extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Horse;
        this.raceCourseType = RaceCourseTypeEnum.Flatland;

        this.ability = new Ability();
        this.ability.cooldown = 7;
        this.ability.efficiency = 45;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Second Wind";
        this.ability.description = "Second Wind";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 60;
        ability2.oneTimeEffect = true;
        ability2.name = "Inspiration";
        ability2.description = "Inspiration";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.cooldown = 5;
        ability3.efficiency = 27;
        ability3.oneTimeEffect = false;
        ability3.name = "Pacemaker";
        ability3.description = "Pacemaker";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}


export class Cheetah extends Animal {
    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Cheetah;
        this.raceCourseType = RaceCourseTypeEnum.Flatland;

        this.ability = new Ability();
        this.ability.cooldown = 6;
        this.ability.efficiency = 35;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Sprint";
        this.ability.description = "Sprint";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 4;
        ability2.oneTimeEffect = false;
        ability2.name = "Giving Chase";
        ability2.description = "Giving Chase";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 1;
        ability3.oneTimeEffect = false;
        ability3.name = "On The Hunt";
        ability3.description = "On The Hunt";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Hare extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Hare;
        this.raceCourseType = RaceCourseTypeEnum.Flatland;

        this.ability = new Ability();
        this.ability.efficiency = 45;
        this.ability.oneTimeEffect = true;
        this.ability.name = "Prey Instinct";
        this.ability.description = "Prey Instinct";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.cooldown = 5;
        ability2.efficiency = 40;
        ability2.oneTimeEffect = false;
        ability2.name = "Awareness";
        ability2.description = "Awareness";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 130;
        ability3.oneTimeEffect = true;
        ability3.name = "Nap";
        ability3.description = "Nap";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Monkey extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Monkey;
        this.raceCourseType = RaceCourseTypeEnum.Mountain;

        this.ability = new Ability();
        this.ability.cooldown = 11;
        this.ability.efficiency = 6;
        this.ability.name = "Landslide";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 60;
        ability2.oneTimeEffect = true;
        ability2.name = "Frenzy";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 70;
        ability3.cooldown = 0;
        ability3.oneTimeEffect = true;
        ability3.name = "Leap";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        ability3.totalFrames = 30;
        this.availableAbilities.push(ability3);
    }
}

export class Goat extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Goat;
        this.raceCourseType = RaceCourseTypeEnum.Mountain;


        this.ability = new Ability();
        this.ability.efficiency = 2;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Sure-footed";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 5;
        ability2.oneTimeEffect = false;
        ability2.name = "Deep Breathing";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 1;
        ability3.oneTimeEffect = false;
        ability3.name = "In The Rhythm";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        ability3.totalFrames = 15;
        this.availableAbilities.push(ability3);
    }
}

export class Gecko extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Gecko;
        this.raceCourseType = RaceCourseTypeEnum.Mountain;

        this.ability = new Ability();
        this.ability.cooldown = 5;
        this.ability.efficiency = 55;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Sticky";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 2;
        ability2.oneTimeEffect = false;
        ability2.name = "Night Vision";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 38;
        ability3.oneTimeEffect = true;
        ability3.name = "Camouflage";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Dolphin extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Dolphin;
        this.raceCourseType = RaceCourseTypeEnum.Ocean;

        this.ability = new Ability();
        this.ability.cooldown = 6;
        this.ability.efficiency = 84;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Echolocation";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 50;
        ability2.oneTimeEffect = true;
        ability2.name = "Navigator";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 70;
        ability3.oneTimeEffect = true;
        ability3.name = "Flowing Current";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Shark extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Shark;
        this.raceCourseType = RaceCourseTypeEnum.Ocean;

        this.ability = new Ability();
        this.ability.efficiency = 60;
        this.ability.oneTimeEffect = true;
        this.ability.name = "Apex Predator";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 35;
        ability2.oneTimeEffect = true;
        ability2.name = "Feeding Frenzy";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 1;
        ability3.oneTimeEffect = true;
        ability3.name = "Blood In The Water";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Octopus extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Octopus;
        this.raceCourseType = RaceCourseTypeEnum.Ocean;

        this.ability = new Ability();
        this.ability.cooldown = 5;
        this.ability.efficiency = 17;
        this.ability.totalFrames = 15;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Propulsion";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 4;
        ability2.oneTimeEffect = false;
        ability2.name = "Buried Treasure";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 3;
        ability3.oneTimeEffect = true;
        ability3.name = "Big Brain";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Penguin extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Penguin;
        this.raceCourseType = RaceCourseTypeEnum.Tundra;

        this.ability = new Ability();
        this.ability.efficiency = 65;
        this.ability.cooldown = 8;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Careful Toboggan";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 7;
        ability2.oneTimeEffect = false;
        ability2.name = "Wild Toboggan";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 1;
        ability3.oneTimeEffect = false;
        ability3.name = "Quick Toboggan";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Caribou extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Caribou;
        this.raceCourseType = RaceCourseTypeEnum.Tundra;

        this.ability = new Ability();
        this.ability.efficiency = 4;
        this.ability.oneTimeEffect = true;
        this.ability.name = "Herd Mentality";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 50;
        ability2.cooldown = 7;
        ability2.oneTimeEffect = false;
        ability2.name = "Great Migration";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 2;
        ability3.oneTimeEffect = true;
        ability3.name = "Special Delivery";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Salamander extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Salamander;
        this.raceCourseType = RaceCourseTypeEnum.Volcanic;

        this.ability = new Ability();
        this.ability.cooldown = 7;
        this.ability.efficiency = 70;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Cold Blooded";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.cooldown = 6;
        ability2.efficiency = 50;
        ability2.oneTimeEffect = false;
        ability2.name = "Burrow";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.cooldown = 10;
        ability3.efficiency = 25;
        ability3.oneTimeEffect = false;
        ability3.name = "Heat Up";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}

export class Fox extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Fox;
        this.raceCourseType = RaceCourseTypeEnum.Volcanic;

        this.ability = new Ability();
        this.ability.cooldown = 5;
        this.ability.efficiency = 60;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Trickster";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 6;
        ability2.oneTimeEffect = false;
        ability2.name = "Fleeting Speed";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 65;
        ability3.oneTimeEffect = true;
        ability3.name = "Nine Tails";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}