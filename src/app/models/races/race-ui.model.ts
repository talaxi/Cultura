import { RacerEffectEnum } from "../racer-effect-enum.model";

export class RaceUI {
    //TODO: bysecond should be byframe
    distanceCoveredByFrame: number[];
    velocityByFrame: number[];
    timeToCompleteByFrame: number[];
    maxSpeedByFrame: number[];
    staminaPercentByFrame: number[];
    racerEffectByFrame: RacerEffectEnum[];

    constructor() {
        this.distanceCoveredByFrame = [];
        this.velocityByFrame = [];
        this.timeToCompleteByFrame = [];
        this.maxSpeedByFrame = [];
        this.staminaPercentByFrame = [];
        this.racerEffectByFrame = [];
    }
}
