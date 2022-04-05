export class RaceUI {
    //TODO: bysecond should be byframe
    distanceCoveredBySecond: number[];
    velocityBySecond: number[];
    timeToCompleteByFrame: number[];

    constructor() {
        this.distanceCoveredBySecond = [];
        this.velocityBySecond = [];
        this.timeToCompleteByFrame = [];
    }
}
