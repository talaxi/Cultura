import { Terrain } from "./terrain.model";

export class EventRaceData {
    weekStartDay: number;
    weekStartHour: number;
    weekEndDay: number;
    weekEndHour: number;
    weekendStartDay: number;
    weekendStartHour: number;
    weekendEndDay: number;
    weekendEndHour: number;
    eventRaceTimeLength: number;

    rank: string;
    raceTerrain: Terrain;
    totalDistance: number;
    distanceCovered: number;  
    segmentTime: number;
    totalSegments: number;
    segmentsCompleted: number;    
    
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
        this.rank = "Z";
    }
}