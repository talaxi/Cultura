export class Ability {
    name: string;
    description: string;
    cooldown: number;
    currentCooldown: number;
    efficiency: number;
    oneTimeEffect: boolean;
    remainingLength: number;
    abilityInUse: boolean;
    isAbilityPurchased: boolean;
    purchasePrice: number;
}
