import { Type } from "class-transformer";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { TerrainTypeEnum } from "../terrain-type-enum.model";
import { RacePath } from "./race-path.model";
import { Terrain } from "./terrain.model";

export class RaceLeg {
    courseType: RaceCourseTypeEnum;
    distance: number;
    legComplete = false;
    @Type(() => RacePath)
    pathData: RacePath[];
    @Type(() => Terrain)
    terrain: Terrain;
    specialPathCount: number;

    constructor(courseType?: RaceCourseTypeEnum, distance?: number) {
        if (courseType !== undefined && courseType !== null)
            this.courseType = courseType;

        if (distance !== undefined && distance != null)
            this.distance = distance;

        this.pathData = [];
    }

    getCourseTypeName() {
        return RaceCourseTypeEnum[this.courseType];
    }

    getTerrainName() {
        if (this.terrain === undefined || this.terrain === null)
            return "";

        return TerrainTypeEnum[this.terrain.terrainType];
    }
}
