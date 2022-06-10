export class Ability {
    name: string;
    description: string;
    cooldown: number;
    currentCooldown: number;
    efficiency: number;
    oneTimeEffect: boolean;
    abilityUsed: boolean;
    totalUseCount: number;
    remainingLength: number; //in meters    
    abilityInUse: boolean;
    isAbilityPurchased: boolean;
    purchasePrice: number;
    totalFrames: number; 
    remainingFrames: number; //in frames

    //specific to Fox ability, maybe make a separate class for ability-specific stuff?
    tricksterStatLoss: string;
    tricksterStatGain: string;

    //ability level related
    abilityLevel: number;
    abilityXp: number;
    abilityMaxXp: number;

    constructor() {
        this.abilityLevel = 1;
        this.abilityXp = 0;
        this.abilityMaxXp = 100;
    }

    increaseAbilityXp() {
        this.abilityXp += 1;
    }
}
