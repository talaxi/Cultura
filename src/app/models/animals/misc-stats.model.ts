export class MiscStats {    
    bonusBreedXpGainFromTraining: number;
    bonusBreedXpGainFromLocalRaces: number;
    bonusBreedXpGainFromCircuitRaces: number;
    trainingTimeReduction: number;
    diminishingReturnsBonus: number;
    bonusTalents: number;

    constructor() {        
        this.bonusBreedXpGainFromLocalRaces = 0;
        this.bonusBreedXpGainFromCircuitRaces = 0;
        this.bonusBreedXpGainFromTraining = 0;
        this.trainingTimeReduction = 0;
        this.diminishingReturnsBonus = 0;
        this.bonusTalents = 0;
    }
}
