import { StringNumberPair } from "../utility/string-number-pair.model";

export class RaceResult {
    wasSuccessful: boolean;
    raceUpdates: StringNumberPair[];

    constructor() {
        this.raceUpdates = [];
    }
}
