import { Type } from "class-transformer";
import { LocalRaceTypeEnum } from "../local-race-type-enum.model";
import { ResourceValue } from "../resources/resource-value.model";
import { RaceLeg } from "./race-leg.model";
import { RaceUI } from "./race-ui.model";

export class Race {
    @Type(() => RaceLeg)
    raceLegs: RaceLeg[];
    requiredRank: string;
    isCompleted: boolean;
    isCircuitRace: boolean;
    localRaceType: LocalRaceTypeEnum;
    timeToComplete: number; //in seconds
    length: number; //in meters
    raceId: number;
    @Type(() => ResourceValue)
    rewards: ResourceValue[];
    @Type(() => RaceUI)
    raceUI: RaceUI;
    circuitIncreaseReward: [string, string];

    constructor(raceLegs: RaceLeg[], requiredRank: string, isCircuitRace: boolean, raceId: number, length: number, timeToComplete: number, rewards?: ResourceValue[], localRaceType?: LocalRaceTypeEnum) {
        this.raceLegs = raceLegs;
        this.requiredRank = requiredRank;
        this.isCircuitRace = isCircuitRace;
        this.raceId = raceId;
        this.length = length;
        this.timeToComplete = timeToComplete;
        this.raceUI = new RaceUI();
        this.circuitIncreaseReward = ["",""];

        if (rewards !== undefined && rewards !== null)
            this.rewards = rewards;

        if (localRaceType !== undefined && localRaceType !== null)
            this.localRaceType = localRaceType;
    }
}
