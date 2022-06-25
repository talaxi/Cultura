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
    defaultBurstDistanceModifier = 3;

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

    calculateStamina(animalDefaultModifier?: number, diminishingReturnsValue?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultStaminaModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (this.endurance <= diminishingReturnsValue)
            return this.endurance * animalDefaultModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.endurance - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.endurance - diminishingReturnsValue));
            return upToThreshold + diminishedValue;
        }
    }

    calculateMaxSpeed(animalDefaultModifier?: number, diminishingReturnsValue?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultMaxSpeedModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (this.topSpeed <= diminishingReturnsValue)
            return this.topSpeed * animalDefaultModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.topSpeed - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.topSpeed - diminishingReturnsValue));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTrueAcceleration(animalDefaultModifier?: number, diminishingReturnsValue?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAccelerationModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (this.acceleration <= diminishingReturnsValue)
            return this.acceleration * animalDefaultModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.acceleration - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.acceleration - diminishingReturnsValue));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTruePower(animalDefaultModifier?: number, diminishingReturnsValue?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultPowerModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (this.power <= diminishingReturnsValue)
            return this.power * animalDefaultModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier; //copy below to other stats, fix calculations for other stats everywhere including breed
            var diminishedValue = (this.power - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.power - diminishingReturnsValue));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTrueFocus(animalDefaultModifier?: number, diminishingReturnsValue?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultFocusModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (this.focus <= diminishingReturnsValue)
            return this.focus * animalDefaultModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.focus - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.focus - diminishingReturnsValue));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTrueAdaptability(animalDefaultModifier?: number, diminishingReturnsValue?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAdaptabilityModifier;

        if (diminishingReturnsValue === null || diminishingReturnsValue === undefined)
            diminishingReturnsValue = this.diminishingReturnsDefaultStatThreshold;

        if (this.adaptability <= diminishingReturnsValue)
            return this.adaptability * animalDefaultModifier;
        else {
            var upToThreshold = diminishingReturnsValue * animalDefaultModifier;
            var diminishedValue = (this.adaptability - diminishingReturnsValue) * (animalDefaultModifier * this.calculateDiminishingReturns(this.adaptability - diminishingReturnsValue));
            return upToThreshold + diminishedValue;
        }
    }

    calculateBurstChance(modifiedFocusMs?: number, modifiedAdaptabilityMs?: number): number {
        var statTotal = this.adaptability + this.focus;
        /*if (modifiedFocusMs !== null && modifiedFocusMs !== undefined &&
            modifiedAdaptabilityMs !== null && modifiedAdaptabilityMs !== undefined)
            statTotal = modifiedAdaptabilityMs + modifiedFocusMs;
*/

        var offset = 1000;


        return (statTotal / (offset) * 100);
    }

    calculateBurstDistance(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultBurstDistanceModifier;

        return this.power * animalDefaultModifier;
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
