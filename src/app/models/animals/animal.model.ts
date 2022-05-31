import { Type } from "class-transformer";
import { AnimalTypeEnum } from "../animal-type-enum.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { ResourceValue } from "../resources/resource-value.model";
import { TrainingOption } from "../training/training-option.model";
import { Ability } from "./ability.model";
import { AnimalStats } from "./animal-stats.model";
import { AnimalTraits } from "./animal-traits.model";
import { Equipment } from "./equipment.model";
import { RaceVariables } from "./race-variables.model";

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
    queuedTraining: TrainingOption | null;
    associatedBarnNumber: number;
    @Type(() => Ability)
    ability: Ability;
    @Type(() => RaceVariables)
    raceVariables: RaceVariables;
    @Type(() => ResourceValue)
    equippedItem: ResourceValue | null;
    breedLevel: number;
    breedGaugeXp: number;
    breedGaugeMax: number;
    autoBreedActive: boolean;
    availableAbilities: Ability[];
    trait: AnimalTraits;
    canTrain: boolean;

    constructor() {
        this.breedLevel = 1;
        this.breedGaugeXp = 0;
        this.breedGaugeMax = 100;
        this.canTrain = true;
        this.isAvailable = false;

        this.availableAbilities = [];        
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

    increaseStatsFromCurrentTraining(): void {
        if (this.currentTraining === undefined || this.currentTraining === null ||
            this.currentStats === undefined || this.currentStats === null)
            return;

        this.currentStats.topSpeed += this.currentTraining.affectedStatRatios.topSpeed * this.currentTraining.statGain;
        this.currentStats.acceleration += this.currentTraining.affectedStatRatios.acceleration * this.currentTraining.statGain;
        this.currentStats.endurance += this.currentTraining.affectedStatRatios.endurance  * this.currentTraining.statGain;
        this.currentStats.power += this.currentTraining.affectedStatRatios.power  * this.currentTraining.statGain;
        this.currentStats.focus += this.currentTraining.affectedStatRatios.focus  * this.currentTraining.statGain;
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
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Thoroughbred";
        this.ability.description = "Thoroughbred";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 8;
        ability2.oneTimeEffect = true;
        ability2.name = "Inspiration";
        ability2.description = "Inspiration";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.cooldown = 12;
        ability3.efficiency = 10;
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
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Sprint";
        this.ability.description = "Sprint";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();        
        ability2.efficiency = 8;
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
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.oneTimeEffect = true;
        this.ability.name = "Prey Instinct";
        this.ability.description = "Prey Instinct";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.cooldown = 10;
        ability2.efficiency = 12;
        ability2.oneTimeEffect = false;
        ability2.name = "Awareness";
        ability2.description = "Awareness";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.cooldown = 12;
        ability3.efficiency = 10;
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
        this.ability.cooldown = 7;
        this.ability.efficiency = 5;
        this.ability.oneTimeEffect = true;
        this.ability.name = "Landslide";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();        
        ability2.efficiency = 10;
        ability2.oneTimeEffect = true;
        ability2.name = "Frenzy";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 4;
        ability3.cooldown = 0;
        ability3.oneTimeEffect = true;
        ability3.name = "Leap";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        ability3.totalFrames = 15;
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
        this.ability.efficiency = 3;
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
        ability3.efficiency = 4;        
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
        this.ability.efficiency = 5;        
        this.ability.oneTimeEffect = false;
        this.ability.name = "Sticky";        
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 1;
        ability2.oneTimeEffect = false;
        ability2.name = "Night Vision";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 5;
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
        this.ability.cooldown = 4;
        this.ability.efficiency = 2;
        this.ability.totalFrames = 15;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Breach";        
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.cooldown = 12;
        ability2.efficiency = 15;
        ability2.oneTimeEffect = false;
        ability2.name = "Echolocation";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 8;
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
        this.ability.efficiency = 3;
        this.ability.oneTimeEffect = true;
        this.ability.name = "Apex Predator";        
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 4;
        ability2.oneTimeEffect = true;
        ability2.name = "Feeding Frenzy";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 2;
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
        this.ability.efficiency = 2;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Propulsion";        
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 3;
        ability2.oneTimeEffect = false;
        ability2.name = "Buried Treasure";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 1;
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
        this.ability.efficiency = 3;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Careful Toboggan";        
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 4;
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
        ability2.efficiency = 4;
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
        this.ability.efficiency = 5;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Cold Blooded";        
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.cooldown = 4;
        ability2.efficiency = 2;
        ability2.oneTimeEffect = false;
        ability2.name = "Burrow";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 3;
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
        this.ability.efficiency = 4;
        this.ability.oneTimeEffect = false;
        this.ability.name = "Trickster";        
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();
        ability2.efficiency = 20;
        ability2.oneTimeEffect = false;
        ability2.name = "Fleeting Speed";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 1000;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 3;
        ability3.oneTimeEffect = true;
        ability3.name = "Nine Tails";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 1000;
        this.availableAbilities.push(ability3);
    }
}