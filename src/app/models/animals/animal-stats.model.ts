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

    calculateStamina(): number {        
        return this.endurance * this.defaultStaminaModifier;
    }

    calculateMaxSpeed(): number {
        return this.topSpeed * this.defaultMaxSpeedModifier;
    }

    calculateTrueAcceleration(): number {
        return this.acceleration * this.defaultAccelerationModifier;
    }

    calculateTruePower(): number {
        return this.power * this.defaultPowerModifier;
    }

    calculateTrueFocus(): number {        
        return this.focus * this.defaultFocusModifier;
    }

    calculateTrueAdaptability(): number {
        return this.adaptability * this.defaultAdaptabilityModifier;
    }

    topSpeedPopover(): string {
        return "Every stat point increases top speed by " + this.defaultMaxSpeedModifier + "m/s up to diminishing returns.";
    }

    accelerationPopover(): string {        
        return "Every stat point increases acceleration by " + this.defaultAccelerationModifier + "m/s up to diminishing returns.";
    }

    endurancePopover(): string {        
        return "Every stat point increases stamina by " + this.defaultStaminaModifier + " up to diminishing returns.";
    }

    powerPopover(): string {
        return "Every stat point increases ability efficency by " + this.defaultPowerModifier + "% up to diminishing returns.";
    }

    focusPopover(): string {        
        return "Every stat point increases top speed by " + this.defaultFocusModifier + "m/s up to diminishing returns.";
    }

    adaptabilityPopover(): string {        
        return "Every stat point increases top speed by " + this.defaultAdaptabilityModifier + "m/s up to diminishing returns.";
    }

    maxSpeedMsPopover(): string {
        return "This is the max speed this animal can go during a race.";
    }

    accelerationMsPopover(): string {        
        return "This is how quickly this animal will gain speed.";
    }

    staminaPopover(): string {        
        return "Your animal loses stamina while racing. If its stamina reaches 0, it will slow down.";
    }

    powerMsPopover(): string {
        return "This increases the efficiency of your animal's ability by " + this.powerMs + ".";
    }

    focusMsPopover(): string {        
        return "Every stat point increases top speed by " + this.defaultFocusModifier + "m/s up to diminishing returns.";
    }

    adaptabilityMsPopover(): string {        
        return "Every stat point increases top speed by " + this.defaultAdaptabilityModifier + "m/s up to diminishing returns.";
    }

    calculateDiminishingReturns(statValue: number): number {
        var diminishingReturnsExp = .8;
        return 1/statValue^diminishingReturnsExp;
    }
}
