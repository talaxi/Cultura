import { StringNumberPair } from "../utility/string-number-pair.model";

export class RaceResult {
    wasSuccessful: boolean;
    raceUpdates: StringNumberPair[];
    errorMessage: string; 
    totalFramesPassed: number; //how long it took to finish
    distanceCovered: number;
    beatMoneyMark: boolean;

    constructor() {
        this.raceUpdates = [];
        this.beatMoneyMark = false;
        this.distanceCovered = 0;
    }

    addRaceUpdate(time: number, update: string) {
        var stringNumberPair = new StringNumberPair();
        stringNumberPair.text = update;
        stringNumberPair.value = time;
        this.raceUpdates.push(stringNumberPair);
      }
}
