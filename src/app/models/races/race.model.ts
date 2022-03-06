import { ResourceValue } from "../resources/resource-value.model";
import { RaceLeg } from "./race-leg.model";
import { RaceUI } from "./race-ui.model";

export class Race {
    raceLegs: RaceLeg[];
    requiredRank: string;
    isCompleted: boolean;
    isCircuitRace: boolean;
    timeToComplete: number; //in seconds
    length: number; //in meters
    raceId: number;
    rewards: ResourceValue[];
    raceUI: RaceUI;

    constructor(raceLegs: RaceLeg[], requiredRank: string, isCircuitRace: boolean, raceId: number, length: number, rewards?: ResourceValue[]) {
        this.raceLegs = raceLegs;
        this.requiredRank = requiredRank;
        this.isCircuitRace = isCircuitRace;
        this.raceId=raceId;
        this.length = length;
        this.raceUI = new RaceUI();

        if (rewards !== undefined && rewards !== null)
            this.rewards = rewards;
    }
}
