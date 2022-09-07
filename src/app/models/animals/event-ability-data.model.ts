export class EventAbilityData {
    onTheHuntUseCount: number;
    sureFootedUseCount: number;
    deepBreathingUseCount: number;
    inTheRhythmUseCount: number;
    nightVisionUseCount: number;
    bigBrainUseCount: number;
    quickTobogganUseCount: number;
    herdMentalityUseCount: number;
    specialDeliveryUseCount: number;
    inspirationUseCount: number;
    flowingCurrentUseCount: number;
    navigatorUseCount: number;
    camouflageUseCount: number;
    storingPowerUseCount: number;

    onTheHuntUseCap: number;
    sureFootedUseCap: number;
    deepBreathingUseCap: number;
    nightVisionUseCap: number;
    bigBrainUseCap: number;
    quickTobogganUseCap: number;
    herdMentalityUseCap: number;
    specialDeliveryUseCap: number;
    storingPowerUseCap: number;

    constructor() {
        this.onTheHuntUseCount = 0;
        this.sureFootedUseCount = 0;
        this.deepBreathingUseCount = 0;
        this.inTheRhythmUseCount = 0;
        this.nightVisionUseCount = 0;
        this.bigBrainUseCount = 0;
        this.quickTobogganUseCount = 0;
        this.herdMentalityUseCount = 0;
        this.specialDeliveryUseCount = 0;
        this.inspirationUseCount = 0;
        this.flowingCurrentUseCount = 0;
        this.navigatorUseCount = 0;
        this.camouflageUseCount = 0;
        this.storingPowerUseCount = 0;

        this.onTheHuntUseCap = 25;
        this.sureFootedUseCap = 25;
        this.deepBreathingUseCap = 25;
        this.nightVisionUseCap = 25;
        this.bigBrainUseCap = 5;
        this.quickTobogganUseCap = 25;
        this.herdMentalityUseCap = 1;
        this.specialDeliveryUseCap = 25;
        this.storingPowerUseCap = 25;
    }   
    
    resetUseCounts() {
        this.onTheHuntUseCount = 0;
        this.sureFootedUseCount = 0;
        this.inTheRhythmUseCount = 0;
        this.nightVisionUseCount = 0;
        this.quickTobogganUseCount = 0;
        this.herdMentalityUseCount = 0;
        this.inspirationUseCount = 0;
        this.flowingCurrentUseCount = 0;
        this.navigatorUseCount = 0;
        this.camouflageUseCount = 0;
        this.storingPowerUseCount = 0;
    }
}
