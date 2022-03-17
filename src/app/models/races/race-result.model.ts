import { StringNumberPair } from "../utility/string-number-pair.model";

export class RaceResult {
    wasSuccessful: boolean;
    raceUpdates: StringNumberPair[];
    errorMessage: string; 

    constructor() {
        this.raceUpdates = [];
    }

    addRaceUpdate(time: number, update: string) {
        var stringNumberPair = new StringNumberPair();
        stringNumberPair.text = update;
        stringNumberPair.value = time;
        this.raceUpdates.push(stringNumberPair);
      }
}
