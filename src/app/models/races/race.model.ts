import { ResourceValue } from "../resources/resource-value.model";
import { RaceLeg } from "./race-leg.model";

export class Race {
    raceLegs: RaceLeg[];
    requiredRank: string;
    isCompleted: boolean;
    isCircuitRace: boolean;
    raceLength: number; //in seconds
    raceId: number;
    rewards: ResourceValue[];

    constructor(raceLegs: RaceLeg[], requiredRank: string, isCircuitRace: boolean, raceId: number, rewards?: ResourceValue[]) {
        this.raceLegs = raceLegs;
        this.requiredRank = requiredRank;
        this.isCircuitRace = isCircuitRace;
        this.raceId=raceId;

        if (rewards !== undefined && rewards !== null)
            this.rewards = rewards;
    }
}
