import { Type } from "class-transformer";
import { AnimalEventRaceData } from "../animals/animal-event-race-data.model";
import { RaceResult } from "./race-result.model";
import { Race } from "./race.model";
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

    rank: string;
    @Type(() => Terrain) 
    raceTerrain: Terrain;
    totalDistance: number;
    distanceCovered: number;  
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
    @Type(() => AnimalEventRaceData)
    animalData: AnimalEventRaceData[];
    isRunning: boolean = false;
    initialSetupComplete: boolean = false;
    animalAlreadyPrepped: boolean = false;
    
    constructor() {
        this.weekStartDay = 2;//tues 9 am to thurs 12 pm (noon)
        this.weekStartHour = 9;
        this.weekEndDay = 4;
        this.weekEndHour = 12;
        
        this.weekendStartDay = 5;//fri 8 pm to sun 11 pm
        this.weekendStartHour = 20;
        this.weekendEndDay = 0;
        this.weekendEndHour = 23;

        this.distanceCovered = 0;
        this.grandPrixTimeLength = 51 * 60 * 60; //51 hours
        this.segmentTime = 180; //each segment is 180 seconds on average
        this.segmentTimeCounter = 0;
        this.overallTimeCounter = 0;
        this.rank = "Z";
        this.animalData = [];
    }
}