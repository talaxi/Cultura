import { AnimalTypeEnum } from "../animal-type-enum.model";

export class AnimalStats {
    topSpeed: number;
    acceleration: number;
    endurance: number;
    power: number;
    focus: number;
    adaptability: number;

    //actual racing stat -- in meters or meters per second
    stamina: number;
    maxSpeedMs: number;
    accelerationMs: number;
    powerMs: number;
    focusMs: number;
    adaptabilityMs: number;
    burstChance: number;
    burstDistance: number;

    defaultStaminaModifier = 5;
    defaultMaxSpeedModifier = .3;
    defaultAccelerationModifier = .1;
    defaultPowerModifier = 1;
    defaultFocusModifier = 5;
    defaultAdaptabilityModifier = 5;
    defaultBurstDistanceModifier = 1;

    diminishingReturnsDefaultStatThreshold = 20;

    constructor(topSpeed?: number, acceleration?: number, endurance?: number, power?: number, focus?: number, adaptability?: number) {
        if (topSpeed !== undefined)
            this.topSpeed = topSpeed;
        if (acceleration !== undefined)
            this.acceleration = acceleration;
        if (endurance !== undefined)
            this.endurance = endurance;
        if (power !== undefined)
            this.power = power;
        if (focus !== undefined)
            this.focus = focus;
        if (adaptability !== undefined)
            this.adaptability = adaptability;
    }

    makeCopy(originalStats: AnimalStats) {
        var copyStats = new AnimalStats();

        copyStats.topSpeed = originalStats.topSpeed;
        copyStats.acceleration = originalStats.acceleration;
        copyStats.endurance = originalStats.endurance;
        copyStats.power = originalStats.power;
        copyStats.focus = originalStats.focus;
        copyStats.adaptability = originalStats.adaptability;

        copyStats.stamina = originalStats.stamina;
        copyStats.maxSpeedMs = originalStats.maxSpeedMs;
        copyStats.accelerationMs = originalStats.accelerationMs;
        copyStats.powerMs = originalStats.powerMs;
        copyStats.focusMs = originalStats.focusMs;
        copyStats.adaptabilityMs = originalStats.adaptabilityMs;
        copyStats.burstChance = originalStats.burstChance;
        copyStats.burstDistance = originalStats.burstDistance;

        return copyStats;
    }

    calculateStamina(animalDefaultModifier?: number, diminishingReturnsValue?: number, orbModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultStaminaModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (orbModifier === null || orbModifier === undefined)
            orbModifier = 1;

        if (this.endurance <= diminishingReturnsValue)
            return this.endurance * animalDefaultModifier * orbModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.endurance - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.endurance - diminishingReturnsValue));
            return (upToThreshold + diminishedValue) * orbModifier;
        }
    }

    calculateMaxSpeed(animalDefaultModifier?: number, diminishingReturnsValue?: number, orbModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultMaxSpeedModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (orbModifier === null || orbModifier === undefined)
            orbModifier = 1;

        if (this.topSpeed <= diminishingReturnsValue)
            return this.topSpeed * animalDefaultModifier * orbModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.topSpeed - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.topSpeed - diminishingReturnsValue));
            return (upToThreshold + diminishedValue) * orbModifier;
        }
    }

    calculateTrueAcceleration(animalDefaultModifier?: number, diminishingReturnsValue?: number, orbModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAccelerationModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (orbModifier === null || orbModifier === undefined)
            orbModifier = 1;

        if (this.acceleration <= diminishingReturnsValue)
            return this.acceleration * animalDefaultModifier * orbModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.acceleration - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.acceleration - diminishingReturnsValue));
            return (upToThreshold + diminishedValue) * orbModifier;
        }
    }

    calculateTruePower(animalDefaultModifier?: number, diminishingReturnsValue?: number, orbModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultPowerModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (orbModifier === null || orbModifier === undefined)
            orbModifier = 1;

        if (this.power <= diminishingReturnsValue)
            return this.power * animalDefaultModifier * orbModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier; //copy below to other stats, fix calculations for other stats everywhere including breed
            var diminishedValue = (this.power - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.power - diminishingReturnsValue));
            return (upToThreshold + diminishedValue) * orbModifier;
        }
    }

    calculateTrueFocus(animalDefaultModifier?: number, diminishingReturnsValue?: number, orbModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultFocusModifier;

        if (orbModifier === null || orbModifier === undefined)
            orbModifier = 1;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (this.focus <= diminishingReturnsValue)
            return this.focus * animalDefaultModifier * orbModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.focus - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.focus - diminishingReturnsValue));
            return (upToThreshold + diminishedValue) * orbModifier;
        }
    }

    calculateTrueAdaptability(animalDefaultModifier?: number, diminishingReturnsValue?: number, orbModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAdaptabilityModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (orbModifier === null || orbModifier === undefined)
            orbModifier = 1;

        if (this.adaptability <= diminishingReturnsValue)
            return this.adaptability * animalDefaultModifier * orbModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.adaptability - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.adaptability - diminishingReturnsValue));
            return (upToThreshold + diminishedValue) * orbModifier;
        }
    }

    calculateBurstChance(breedLevelStatModifier: number, modifiedFocusMs?: number, modifiedAdaptabilityMs?: number): number {
        var focusTotal = this.focus;
        var adaptabilityTotal = this.adaptability;
        if (modifiedFocusMs !== null && modifiedFocusMs !== undefined) {
            var percentChange = modifiedFocusMs / this.focusMs;
            focusTotal *= percentChange;
        }
        if (modifiedAdaptabilityMs !== null && modifiedAdaptabilityMs !== undefined) {
            var percentChange = modifiedAdaptabilityMs / this.adaptabilityMs;
            adaptabilityTotal *= percentChange;
        }

        var statTotal = adaptabilityTotal + focusTotal;

        var offset = 1000;

        return ((statTotal * (1 + breedLevelStatModifier / 4)) / (offset) * 100);
    }

    calculateBurstDistance(breedLevelStatModifier: number, animalDefaultModifier?: number, modifiedPower?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultBurstDistanceModifier;

        var powerTotal = this.power;

        if (modifiedPower !== null && modifiedPower !== undefined) {
            var percentChange = modifiedPower / this.powerMs;
            powerTotal *= percentChange;
        }

        return powerTotal * (1 + breedLevelStatModifier / 4) * animalDefaultModifier;
    }

    topSpeedPopover(modifierAmount: number): string {
        return "Every stat point increases top speed by " + modifierAmount.toFixed(3) + "m/s up to diminishing returns.";
        //include base and all modifiers underneath
    }

    accelerationPopover(modifierAmount: number): string {
        return "Every stat point increases acceleration by " + modifierAmount.toFixed(3) + "m/s up to diminishing returns.";
    }

    endurancePopover(modifierAmount: number): string {
        return "Every stat point increases stamina by " + modifierAmount.toFixed(3) + " up to diminishing returns.";
    }

    powerPopover(modifierAmount: number): string {
        return "Every stat point increases ability efficiency by " + modifierAmount.toFixed(3) + "% up to diminishing returns.";
    }

    focusPopover(modifierAmount: number): string {
        return "Every stat point increases top speed by " + modifierAmount.toFixed(3) + "m/s up to diminishing returns.";
    }

    adaptabilityPopover(modifierAmount: number): string {
        return "Every stat point increases top speed by " + modifierAmount.toFixed(3) + "m/s up to diminishing returns.";
    }

    maxSpeedMsPopover(): string {
        return "This is the max speed this animal can go during a race.";
    }

    accelerationMsPopover(): string {
        return "This is how quickly this animal will gain speed.";
    }

    staminaPopover(): string {
        return "Your animal loses stamina while racing. If its stamina reaches 0, it will slow down for a period of time while its stamina recharges.";
    }

    powerMsPopover(): string {
        return "This increases the efficiency of your animal's ability.";
    }

    focusMsPopover(): string {
        return "This is the average distance your animal can go without losing focus, causing them to stop.";
    }

    adaptabilityMsPopover(): string {
        return "This is the average distance your animal can go without stumbling, causing them to slow down.";
    }

    burstChancePopover(): string {
        return "Every time you enter a path, you have the chance to enter burst mode. This is your chance per 1000 meters that you will burst. Increase by improving Focus and Adaptability.";
    }

    burstDistancePopover(): string {
        return "This is how far you can go while bursting. Increase by improving Power.";
    }

    calculateDiminishingReturns(statValue: number): number {
        var diminishingReturnsExp = .6;
        return 1 / statValue ** diminishingReturnsExp;
    }

    addCurrentRacingStats(statChange: AnimalStats) {
        this.maxSpeedMs += statChange.topSpeed;
        this.accelerationMs += statChange.acceleration;
        this.stamina += statChange.endurance;
        this.powerMs += statChange.power;
        this.focusMs += statChange.focus;
        this.adaptabilityMs += statChange.adaptability;
    }

    subtractCurrentRacingStats(statChange: AnimalStats) {
        this.maxSpeedMs -= statChange.topSpeed;
        this.accelerationMs -= statChange.acceleration;
        this.stamina -= statChange.endurance;
        this.powerMs -= statChange.power;
        this.focusMs -= statChange.focus;
        this.adaptabilityMs -= statChange.adaptability;
    }

    multiplyCurrentRacingStats(statChange: AnimalStats) {
        this.maxSpeedMs *= statChange.topSpeed;
        this.accelerationMs *= statChange.acceleration;
        this.stamina *= statChange.endurance;
        this.powerMs *= statChange.power;
        this.focusMs *= statChange.focus;
        this.adaptabilityMs *= statChange.adaptability;
    }

    divideCurrentRacingStats(statChange: AnimalStats) {
        this.maxSpeedMs /= statChange.topSpeed;
        this.accelerationMs /= statChange.acceleration;
        this.stamina /= statChange.endurance;
        this.powerMs /= statChange.power;
        this.focusMs /= statChange.focus;
        this.adaptabilityMs /= statChange.adaptability;
    }
}
