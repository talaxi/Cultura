export class TrackedStats {
    totalRaces: number;
    totalBreeds: number;
    totalMetersRaced: number;
    mostUsedAnimal: string;
    mostRacedCourseType: string;
    highestMaxSpeed: string;
    highestAccelerationRate: string;
    highestStamina: string;
    highestPowerEfficiency: string;
    highestFocusDistance: string;
    highestAdaptabilityDistance: string;

    constructor() {
        this.totalRaces = 0;
        this.totalBreeds = 0;
        this.totalMetersRaced = 0;
        this.mostUsedAnimal = "";
        this.mostRacedCourseType = "";
        this.highestMaxSpeed = "";
        this.highestAccelerationRate = "";
        this.highestStamina = "";
        this.highestPowerEfficiency = "";
        this.highestFocusDistance = "";
        this.highestAdaptabilityDistance = "";
    }
}
