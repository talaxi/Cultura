export class TrackedStats {
    totalRaces: number;
    totalBreeds: number;
    totalMetersRaced: number;
    mostUsedAnimal: string;
    mostRacedCourseType: string;

    constructor() {
        this.totalRaces = 0;
        this.totalBreeds = 0;
        this.totalMetersRaced = 0;
        this.mostUsedAnimal = "";
        this.mostRacedCourseType = "";
    }
}
