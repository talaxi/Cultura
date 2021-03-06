import { Type } from "class-transformer";
import { AnimalEventRaceData } from "../animals/animal-event-race-data.model";
import { ResourceValue } from "../resources/resource-value.model";
import { WeatherEnum } from "../weather-enum.model";
import { EventSegmentCarryOverData } from "./event-segment-carry-over-data.model";
import { RaceResult } from "./race-result.model";
import { Race } from "./race.model";
import { RelayEffect } from "./relay-effect.model";
import { Terrain } from "./terrain.model";

export class GrandPrixData {
    weekStartDay: number;
    weekStartHour: number;
    weekEndDay: number;
    weekEndHour: number;
    weekendStartDay: number;
    weekendStartHour: number;
    weekendEndDay: number;
    weekendEndHour: number;
    grandPrixTimeLength: number;
    totalDistance: number;
    bonusTime: number; //added by effects that increase race time like landslide etc

    rank: string;
    @Type(() => Terrain) 
    raceTerrain: Terrain;    
    weatherCluster: WeatherEnum;
    distanceCovered: number;  
    remainingRewards: number;
    totalRewards: number;
    coinRewardsObtained: number;
    renownRewardsObtained: number;
    tokenRewardsObtained: number;    
    segmentTime: number;
    segmentTimeCounter: number;
    overallTimeCounter: number;
    totalSegments: number;
    segmentsCompleted: number;
    currentRaceSegmentCount: number;     
    @Type(() => Race)
    currentRaceSegment: Race; 
    @Type(() => RaceResult)
    currentRaceSegmentResult: RaceResult; 
    @Type(() => Race)
    nextRaceSegment: Race; 
    @Type(() => Race)
    previousRaceSegment: Race;
    @Type(() => EventSegmentCarryOverData)
    previousRaceSegmentData: EventSegmentCarryOverData;
    @Type(() => AnimalEventRaceData)
    animalData: AnimalEventRaceData[];
    isRunning: boolean = false;
    initialSetupComplete: boolean = false;
    animalAlreadyPrepped: boolean = false;
    mountainEndingY: number = 0;
    mountainClimbPercent: number = 0;
    exhaustionMoraleUpdateCounter: number = 0;
    weatherClusterUpdateCounter: number = 0;
    @Type(() => RelayEffect)
    queuedRelayEffects: RelayEffect[];
    
    constructor() {
        this.weekStartDay = 2;// TODO: set this back to 2 //tues 9 am to thurs 12 pm (noon)
        this.weekStartHour = 9; //TODO: set this back to 9
        this.weekEndDay = 4; //TODO: set this back to 4
        this.weekEndHour = 12; //TODO: set this back to 12
        
        this.weekendStartDay = 5; //TODO: set back to 5 //fri 8 pm to sun 11 pm
        this.weekendStartHour = 20; //TODO: set back to 20
        this.weekendEndDay = 0;
        this.weekendEndHour = 23;

        this.distanceCovered = 0;
        this.grandPrixTimeLength = 51 * 60 * 60; //51 hours
        this.segmentTime = 20; //each segment is 20 seconds on average
        this.segmentTimeCounter = 0;
        this.overallTimeCounter = 0;
        this.rank = "Z";
        this.animalData = [];
        this.queuedRelayEffects = [];
        this.bonusTime = 0;

        this.remainingRewards = 0;
        this.totalRewards = 0;
        this.coinRewardsObtained = 0;
        this.renownRewardsObtained = 0;
        this.tokenRewardsObtained = 0;
    }
}