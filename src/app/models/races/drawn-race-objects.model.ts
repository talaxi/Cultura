import { DrawnRaceObjectEnum } from "../drawn-race-object-enum.model";
import { OrbTypeEnum } from "../orb-type-enum.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";

export class DrawnRaceObject {
    objectType: DrawnRaceObjectEnum;
    xDistance: number;
    changeOnFrame: number; //if something changes when being passed, enter the frame that happens here
    isGoingUp: boolean; //mountain, ocean, and volcanic need to track when you are going up or down
    courseType: RaceCourseTypeEnum; //set the course type

    constructor(objectType?: DrawnRaceObjectEnum, xDistance?: number) {
        if (objectType !== undefined)
            this.objectType = objectType;

        if (xDistance !== undefined)
            this.xDistance = xDistance;

        this.isGoingUp = false;
    }    
}
