export class Ability {
    name: string;
    description: string;
    cooldown: number;
    currentCooldown: number;
    efficiency: number;
    oneTimeEffect: boolean;
    abilityUsed: boolean;
    remainingLength: number; //in meters    
    abilityInUse: boolean;
    isAbilityPurchased: boolean;
    purchasePrice: number;
    totalFrames: number; 
    remainingFrames: number; //in frames
}
