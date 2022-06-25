import { RacerEffectEnum } from "../racer-effect-enum.model";

export class RaceUI {    
    distanceCoveredByFrame: number[];
    velocityByFrame: number[];
    timeToCompleteByFrame: number[];
    maxSpeedByFrame: number[];
    staminaPercentByFrame: number[];
    racerEffectByFrame: RacerEffectEnum[];
    yAdjustmentByFrame: number[]; //specifically used for icy patch in tundra biome
    lavaFallPercentByFrame: number[][];
    racePositionByFrame: number[];

    constructor() {
        this.distanceCoveredByFrame = [];
        this.velocityByFrame = [];
        this.timeToCompleteByFrame = [];
        this.maxSpeedByFrame = [];
        this.staminaPercentByFrame = [];
        this.racerEffectByFrame = [];
        this.yAdjustmentByFrame = [];
        this.lavaFallPercentByFrame = [];
        this.racePositionByFrame = [];
    }
}
