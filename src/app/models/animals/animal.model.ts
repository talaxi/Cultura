import { AnimalTypeEnum } from "../animal-type-enum.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { TrainingOption } from "../training/training-option.model";
import { Ability } from "./ability.model";
import { AnimalStats } from "./animal-stats.model";
import { RaceVariables } from "./race-variables.model";

export class Animal {
    name!: string;
    type!: AnimalTypeEnum;
    raceCourseType!: RaceCourseTypeEnum;
    currentStats: AnimalStats;
    baseStats: AnimalStats;  //used for breeding calculations
    isAvailable: boolean;
    currentTraining: TrainingOption | null;
    associatedBarnNumber: number;
    ability: Ability;
    raceVariables: RaceVariables;

    viewAbility(): string {
        return "";
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

    increaseStatsFromCurrentTraining(): void {
        if (this.currentTraining === undefined || this.currentTraining === null ||
            this.currentStats === undefined || this.currentStats === null)
            return;

        this.currentStats.topSpeed += this.currentTraining.affectedStatRatios.topSpeed * this.currentTraining.statGain;
        this.currentStats.acceleration += this.currentTraining.affectedStatRatios.acceleration * this.currentTraining.statGain;
        this.currentStats.stamina += this.currentTraining.affectedStatRatios.stamina * this.currentTraining.statGain;
        this.currentStats.endurance += this.currentTraining.affectedStatRatios.endurance * this.currentTraining.statGain;
        this.currentStats.power += this.currentTraining.affectedStatRatios.power * this.currentTraining.statGain;
        this.currentStats.focus += this.currentTraining.affectedStatRatios.focus * this.currentTraining.statGain;
        this.currentStats.adaptability += this.currentTraining.affectedStatRatios.adaptability * this.currentTraining.statGain;

        this.currentStats.stamina = this.currentStats.calculateStamina();
        this.currentStats.maxSpeedMs = this.currentStats.calculateMaxSpeed();
        this.currentStats.accelerationMs = this.currentStats.calculateTrueAcceleration();
        this.currentStats.powerMs = this.currentStats.calculateTruePower();
        this.currentStats.focusMs = this.currentStats.calculateTrueFocus();
        this.currentStats.adaptabilityMs = this.currentStats.calculateTrueAdaptability();
    }
}

export class Horse extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Horse;
        this.raceCourseType = RaceCourseTypeEnum.FlatLand;

        this.ability = new Ability();
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.name = "Pacemaker";
    }

    override viewAbility(): string {
        return "Pacemaker";
    }

    override useAbility(): void {
        this.ability.abilityInUse = true;
        this.ability.remainingLength = this.ability.efficiency * (1 + this.currentStats.powerMs);
    }
}


export class Cheetah extends Animal {
    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Cheetah;
        this.raceCourseType = RaceCourseTypeEnum.FlatLand;

        this.ability = new Ability();
        this.ability.cooldown = 10;
        this.ability.efficiency = 4;
        this.ability.name = "Sprint";      
    }

    override viewAbility(): string {
        return "Sprint";
    }

    override useAbility(): void {
        this.ability.abilityInUse = true;
        this.ability.remainingLength = this.ability.efficiency * (1 + this.currentStats.powerMs);
    }
}

export class Monkey extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Monkey;
        this.raceCourseType = RaceCourseTypeEnum.Rock;

        this.ability = new Ability();
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.name = "Landslide";
    }

    override viewAbility(): string {
        return "Landslide";
    }
}

export class Goat extends Animal {

    constructor() {
        super();
        this.baseStats = new AnimalStats(5, 5, 5, 5, 5, 5);
        this.currentStats = new AnimalStats(5, 5, 5, 5, 5, 5);

        this.type = AnimalTypeEnum.Goat;
        this.raceCourseType = RaceCourseTypeEnum.Rock;

        this.ability = new Ability();
        this.ability.cooldown = 10;
        this.ability.efficiency = 10;
        this.ability.name = "";
    }
}