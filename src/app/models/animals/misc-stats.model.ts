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
}
