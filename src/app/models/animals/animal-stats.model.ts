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

    defaultStaminaModifier = 10;
    defaultMaxSpeedModifier = .3;
    defaultAccelerationModifier = .1;
    defaultPowerModifier = .05;
    defaultFocusModifier = 5;
    defaultAdaptabilityModifier = 5;
    defaultBurstDistanceModifier = 3;

    diminishingReturnsStatThreshold = 20;

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

    calculateStamina(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultStaminaModifier;
        
        if (this.endurance <= this.diminishingReturnsStatThreshold)
            return this.endurance * animalDefaultModifier;
        else {
            var upToThreshold = this.diminishingReturnsStatThreshold * animalDefaultModifier;
            var diminishedValue = (this.endurance - this.diminishingReturnsStatThreshold) * (animalDefaultModifier * this.calculateDiminishingReturns(this.endurance - this.diminishingReturnsStatThreshold));
            return upToThreshold + diminishedValue;
        }
    }

    calculateMaxSpeed(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultMaxSpeedModifier;

        if (this.topSpeed <= this.diminishingReturnsStatThreshold)
            return this.topSpeed * animalDefaultModifier;
        else {
            var upToThreshold = this.diminishingReturnsStatThreshold * animalDefaultModifier;
            var diminishedValue = (this.topSpeed - this.diminishingReturnsStatThreshold) * (animalDefaultModifier * this.calculateDiminishingReturns(this.topSpeed - this.diminishingReturnsStatThreshold));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTrueAcceleration(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAccelerationModifier;

        if (this.acceleration <= this.diminishingReturnsStatThreshold)
            return this.acceleration * animalDefaultModifier;
        else {
            var upToThreshold = this.diminishingReturnsStatThreshold * animalDefaultModifier;
            var diminishedValue = (this.acceleration - this.diminishingReturnsStatThreshold) * (animalDefaultModifier * this.calculateDiminishingReturns(this.acceleration - this.diminishingReturnsStatThreshold));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTruePower(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultPowerModifier;

        if (this.power <= this.diminishingReturnsStatThreshold)
            return this.power * animalDefaultModifier;
        else {
            var upToThreshold = this.diminishingReturnsStatThreshold * animalDefaultModifier; //copy below to other stats, fix calculations for other stats everywhere including breed
            var diminishedValue = (this.power - this.diminishingReturnsStatThreshold) * (animalDefaultModifier * this.calculateDiminishingReturns(this.power - this.diminishingReturnsStatThreshold));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTrueFocus(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultFocusModifier;  

        if (this.focus <= this.diminishingReturnsStatThreshold)
            return this.focus * animalDefaultModifier;
        else {
            var upToThreshold = this.diminishingReturnsStatThreshold * animalDefaultModifier;
            var diminishedValue = (this.focus - this.diminishingReturnsStatThreshold) * (animalDefaultModifier * this.calculateDiminishingReturns(this.focus - this.diminishingReturnsStatThreshold));
            return upToThreshold + diminishedValue;
        }
    }

    calculateTrueAdaptability(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAdaptabilityModifier;

        if (this.adaptability <= this.diminishingReturnsStatThreshold)
            return this.adaptability * animalDefaultModifier;
        else {
            var upToThreshold = this.diminishingReturnsStatThreshold * animalDefaultModifier;
            var diminishedValue = (this.adaptability - this.diminishingReturnsStatThreshold) * (animalDefaultModifier * this.calculateDiminishingReturns(this.adaptability - this.diminishingReturnsStatThreshold));
            return upToThreshold + diminishedValue;
        }
    }

    calculateBurstChance(): number {
        var statTotal = this.adaptability + this.focus;
        var offset = 100;
        
        return (statTotal/(statTotal + offset) * 100); 
    }

    calculateBurstDistance(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultBurstDistanceModifier;

        //if (this.adaptability <= this.diminishingReturnsStatThreshold)
        return this.power * animalDefaultModifier;
        /*else {
            var upToThreshold = this.diminishingReturnsStatThreshold * animalDefaultModifier;
            var diminishedValue = (this.adaptability - this.diminishingReturnsStatThreshold) * (animalDefaultModifier * this.calculateDiminishingReturns(this.adaptability - this.diminishingReturnsStatThreshold));
            return upToThreshold + diminishedValue;
        }*/
    }

    topSpeedPopover(modifierAmount: number): string {
        return "Every stat point increases top speed by " + modifierAmount.toFixed(3) + "m/s up to diminishing returns.";
    }

    accelerationPopover(modifierAmount: number): string {
        return "Every stat point increases acceleration by " + modifierAmount.toFixed(3) + "m/s up to diminishing returns.";
    }

    endurancePopover(modifierAmount: number): string {
        return "Every stat point increases stamina by " + modifierAmount.toFixed(3) + " up to diminishing returns.";
    }

    powerPopover(modifierAmount: number): string {
        return "Every stat point increases ability efficency by " + modifierAmount.toFixed(3) + "% up to diminishing returns.";
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

    calculateDiminishingReturns(statValue: number): number {
        var diminishingReturnsExp = .6;        
        return 1 / statValue ** diminishingReturnsExp;
    }
}
