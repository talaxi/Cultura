export class MiscStats {    
    bonusBreedXpGainFromTraining: number;
    bonusBreedXpGainFromLocalRaces: number;
    bonusBreedXpGainFromCircuitRaces: number;
    trainingTimeReduction: number;
    diminishingReturnsBonus: number;
    bonusTalents: number;

    bonusTrainingBreedXpCertificateCount: number;
    bonusCircuitBreedXpCertificateCount: number;
    bonusLocalBreedXpCertificateCount: number;
    bonusDiminishingReturnsCertificateCount: number;
    certificateUseCap: number;

    constructor() {        
        this.bonusBreedXpGainFromLocalRaces = 0;
        this.bonusBreedXpGainFromCircuitRaces = 0;
        this.bonusBreedXpGainFromTraining = 0;
        this.trainingTimeReduction = 0;
        this.diminishingReturnsBonus = 0;
        this.bonusTalents = 0;

        this.bonusTrainingBreedXpCertificateCount = 0;
        this.bonusCircuitBreedXpCertificateCount = 0;
        this.bonusLocalBreedXpCertificateCount = 0;
        this.bonusDiminishingReturnsCertificateCount = 0;
        this.certificateUseCap = 30;
    }

    makeCopy(originalStats: MiscStats) {
        var copyStats = new MiscStats();

        copyStats.bonusBreedXpGainFromCircuitRaces = originalStats.bonusBreedXpGainFromCircuitRaces;
        copyStats.bonusBreedXpGainFromLocalRaces = originalStats.bonusBreedXpGainFromLocalRaces;
        copyStats.bonusBreedXpGainFromTraining = originalStats.bonusBreedXpGainFromTraining;
        copyStats.bonusCircuitBreedXpCertificateCount = originalStats.bonusCircuitBreedXpCertificateCount;
        copyStats.bonusDiminishingReturnsCertificateCount = originalStats.bonusDiminishingReturnsCertificateCount;
        copyStats.bonusLocalBreedXpCertificateCount = originalStats.bonusLocalBreedXpCertificateCount;
        copyStats.bonusTalents = originalStats.bonusTalents;
        copyStats.bonusTrainingBreedXpCertificateCount = originalStats.bonusTrainingBreedXpCertificateCount;
        copyStats.certificateUseCap = originalStats.certificateUseCap;
        copyStats.diminishingReturnsBonus = originalStats.diminishingReturnsBonus;
        copyStats.trainingTimeReduction = originalStats.trainingTimeReduction;

        return copyStats;
    }
}
