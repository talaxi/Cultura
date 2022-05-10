import { Type } from "class-transformer";
import { AnimalTypeEnum } from "../animal-type-enum.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { ResourceValue } from "../resources/resource-value.model";
import { TrainingOption } from "../training/training-option.model";
import { Ability } from "./ability.model";
import { AnimalStats } from "./animal-stats.model";
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
    equippedItem: ResourceValue;
    breedLevel: number;
    breedGaugeXp: number;
    breedGaugeMax: number;
    autoBreedActive: boolean;
    availableAbilities: Ability[];


    constructor() {
        this.breedLevel = 1;
        this.breedGaugeXp = 0;
        this.breedGaugeMax = 50;

        this.availableAbilities = [];        
    }

    viewAbility(): string {
        return this.ability.name;
    }

    getAbilityUseUpdateText(): string {
        return this.name + " uses " + this.ability.name + ".";
    }

    useAbility(): void {

    }

    getAnimalType(): string {
        return AnimalTypeEnum[this.type];
    }

    getRaceCourseType(): string {
        return RaceCourseTypeEnum[this.raceCourseType];
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
        this.baseStats = new AnimalStats(10, 10, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(10, 10, 5, 5, 5, 5);

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
        ability2.cooldown = 10;
        ability2.efficiency = 8;
        ability2.oneTimeEffect = true;
        ability2.name = "Inspiration";
        ability2.description = "Inspiration";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 500;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.cooldown = 12;
        ability3.efficiency = 10;
        ability3.oneTimeEffect = false;
        ability3.name = "Pacemaker";
        ability3.description = "Pacemaker";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 500;
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
        ability2.purchasePrice = 500;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();        
        ability3.efficiency = 1;
        ability3.oneTimeEffect = false;
        ability3.name = "On The Hunt";
        ability3.description = "On The Hunt";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 500;
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
        ability2.efficiency = 8;
        ability2.oneTimeEffect = false;
        ability2.name = "Awareness";
        ability2.description = "Awareness";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 500;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.cooldown = 12;
        ability3.efficiency = 10;
        ability3.oneTimeEffect = true;
        ability3.name = "Nap";
        ability3.description = "Nap";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 500;
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
        this.ability.cooldown = 15;
        this.ability.efficiency = 3;
        this.ability.oneTimeEffect = true;
        this.ability.name = "Landslide";
        this.ability.isAbilityPurchased = true;
        this.availableAbilities.push(this.ability);

        var ability2 = new Ability();        
        ability2.efficiency = 10;
        ability2.oneTimeEffect = true;
        ability2.name = "Frenzy";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 500;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 5;
        ability3.cooldown = 0;
        ability3.oneTimeEffect = true;
        ability3.name = "Leap";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 500;
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
        ability2.efficiency = 4;
        ability2.oneTimeEffect = false;
        ability2.name = "Deep Breathing";
        ability2.isAbilityPurchased = false;
        ability2.purchasePrice = 500;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 5;        
        ability3.oneTimeEffect = false;
        ability3.name = "In The Rhythm";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 500;
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
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.name = "";        
    }
}

export class Dolphin extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Dolphin;
        this.raceCourseType = RaceCourseTypeEnum.Water;

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
        ability2.purchasePrice = 500;
        this.availableAbilities.push(ability2);

        var ability3 = new Ability();
        ability3.efficiency = 5;
        ability3.oneTimeEffect = true;
        ability3.name = "Flowing Current";
        ability3.isAbilityPurchased = false;
        ability3.purchasePrice = 500;
        this.availableAbilities.push(ability3);
    }
}

export class Shark extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Shark;
        this.raceCourseType = RaceCourseTypeEnum.Water;

        this.ability = new Ability();
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.name = "";
    }
}