import { Type } from "class-transformer";
import { EventRaceTypeEnum } from "../event-race-type-enum.model";
import { LocalRaceTypeEnum } from "../local-race-type-enum.model";
import { RaceTypeEnum } from "../race-type-enum.model";
import { ResourceValue } from "../resources/resource-value.model";
import { TrackRaceTypeEnum } from "../track-race-type-enum.model";
import { DrawnRaceObject } from "./drawn-race-objects.model";
import { PinnacleConditions } from "./pinnacle-conditions.model";
import { RaceLeg } from "./race-leg.model";
import { RaceUI } from "./race-ui.model";

export class Race {
    @Type(() => RaceLeg)
    raceLegs: RaceLeg[];
    requiredRank: string;
    isCompleted: boolean;
    isCircuitRace: boolean;
    raceType: RaceTypeEnum;
    localRaceType: LocalRaceTypeEnum;
    trackRaceType: TrackRaceTypeEnum;
    eventRaceType: EventRaceTypeEnum;
    timeToComplete: number; //in seconds
    length: number; //in meters
    raceId: number;
    @Type(() => ResourceValue)
    rewards: ResourceValue[];
    @Type(() => RaceUI)
    raceUI: RaceUI;
    circuitIncreaseReward: [string, string];
    @Type(() => DrawnRaceObject)
    drawnObjects: DrawnRaceObject[];
    @Type(() => PinnacleConditions)
    pinnacleConditions: PinnacleConditions;

    constructor(raceLegs: RaceLeg[], requiredRank: string, isCircuitRace: boolean, raceId: number, length: number, timeToComplete: number, rewards?: ResourceValue[], localRaceType?: LocalRaceTypeEnum, trackRaceType?: TrackRaceTypeEnum, raceType?: RaceTypeEnum, eventRaceType?: EventRaceTypeEnum, drawnObjects?: DrawnRaceObject[]) {
        this.raceLegs = raceLegs;
        this.requiredRank = requiredRank;
        this.isCircuitRace = isCircuitRace;
        this.raceId = raceId;
        this.length = length;
        this.timeToComplete = timeToComplete;
        this.raceUI = new RaceUI();
        this.circuitIncreaseReward = ["", ""];

        if (rewards !== undefined && rewards !== null)
            this.rewards = rewards;

        if (localRaceType !== undefined && localRaceType !== null)
            this.localRaceType = localRaceType;

        if (trackRaceType !== undefined && trackRaceType !== null)
            this.trackRaceType = trackRaceType;

        if (raceType !== undefined && raceType !== null)
            this.raceType = raceType;

        if (eventRaceType !== undefined && eventRaceType !== null)
            this.eventRaceType = eventRaceType;

        if (drawnObjects !== undefined && drawnObjects !== null)
            this.drawnObjects = drawnObjects;
    }

    makeCopy(originalRace: Race) {
        var copy = new Race(originalRace.raceLegs, originalRace.requiredRank, originalRace.isCircuitRace, originalRace.raceId, 
            originalRace.length, originalRace.timeToComplete, originalRace.rewards, originalRace.localRaceType, 
            originalRace.trackRaceType, originalRace.raceType, originalRace.eventRaceType, originalRace.drawnObjects);
        
        if (originalRace.raceUI.velocityByFrame.length > 0)
        {
            originalRace.raceUI.velocityByFrame.forEach(item => {
                copy.raceUI.velocityByFrame.push(item);
            });
        }
        
        if (originalRace.raceUI.staminaPercentByFrame.length > 0)
        {
            originalRace.raceUI.staminaPercentByFrame.forEach(item => {
                copy.raceUI.staminaPercentByFrame.push(item);
            });
        }

        return copy;
    }

    reduceExportSize() {
        this.raceUI = new RaceUI();
    }
}
