import { StringNumberPair } from "../utility/string-number-pair.model";

export class RaceResult {
    wasSuccessful: boolean;
    raceUpdates: StringNumberPair[];
    errorMessage: string; 
    //circuitReward: string;
    totalFramesPassed: number; //how long it took to finish
    beatMoneyMark: boolean;

    constructor() {
        this.raceUpdates = [];
        //this.circuitReward = "";
        this.beatMoneyMark = false;
    }

    addRaceUpdate(time: number, update: string) {
        var stringNumberPair = new StringNumberPair();
        stringNumberPair.text = update;
        stringNumberPair.value = time;
        this.raceUpdates.push(stringNumberPair);
      }
}
