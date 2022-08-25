import { DrawnRaceObjectEnum } from "../drawn-race-object-enum.model";
import { OrbTypeEnum } from "../orb-type-enum.model";

export class DrawnRaceObject {
    objectType: DrawnRaceObjectEnum;
    xDistance: number;
    changeOnFrame: number; //if something changes when being passed, enter the frame that happens here

    constructor(objectType?: DrawnRaceObjectEnum, xDistance?: number) {
        if (objectType !== undefined)
            this.objectType = objectType;

        if (xDistance !== undefined)
            this.xDistance = xDistance;
    }    
}
