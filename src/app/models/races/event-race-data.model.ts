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
    timeRemaining: string; 
    totalDistance: number;
    remainingDistance: number;  
    
    constructor() {
        this.weekStartDay = 2;//tues 9 am to thurs 12 pm (noon)
        this.weekStartHour = 9;
        this.weekEndDay = 4;
        this.weekEndHour = 12;
        
        this.weekStartDay = 5;//fri 8 pm to sun 11 pm
        this.weekStartHour = 20;
        this.weekEndDay = 0;
        this.weekEndHour = 23;
    }
}