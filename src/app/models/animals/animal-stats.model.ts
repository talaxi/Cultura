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

    defaultStaminaModifier = 10;
    defaultMaxSpeedModifier = .3;
    defaultAccelerationModifier = .1;
    defaultPowerModifier = .05;
    defaultFocusModifier = 5;
    defaultAdaptabilityModifier = 5;

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

        this.stamina = this.calculateStamina();
        this.maxSpeedMs = this.calculateMaxSpeed();
        this.accelerationMs = this.calculateTrueAcceleration();
        this.powerMs = this.calculateTruePower();
        this.focusMs = this.calculateTrueFocus();
        this.adaptabilityMs = this.calculateTrueAdaptability();
    }

    calculateStamina(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultStaminaModifier;

        return this.endurance * animalDefaultModifier;
    }

    calculateMaxSpeed(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultMaxSpeedModifier;

        return this.topSpeed * this.defaultMaxSpeedModifier;
    }

    calculateTrueAcceleration(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAccelerationModifier;

        return this.acceleration * this.defaultAccelerationModifier;
    }

    calculateTruePower(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultPowerModifier;

        return this.power * this.defaultPowerModifier;
    }

    calculateTrueFocus(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultFocusModifier;

        return this.focus * this.defaultFocusModifier;
    }

    calculateTrueAdaptability(animalDefaultModifier?: number): number {
        if (animalDefaultModifier === null || animalDefaultModifier === undefined)
            animalDefaultModifier = this.defaultAdaptabilityModifier;

        return this.adaptability * this.defaultAdaptabilityModifier;
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
        var diminishingReturnsExp = .8;
        return 1 / statValue ^ diminishingReturnsExp;
    }
}
