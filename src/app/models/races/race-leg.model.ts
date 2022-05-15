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

    getCourseTypeClass() {
        if (this.courseType === RaceCourseTypeEnum.Flatland)
            return "flatlandColor";
        if (this.courseType === RaceCourseTypeEnum.Mountain)
            return "mountainColor";
        if (this.courseType === RaceCourseTypeEnum.Water)
            return "waterColor";
        if (this.courseType === RaceCourseTypeEnum.Tundra)
            return "tundraColor";
        if (this.courseType === RaceCourseTypeEnum.Volcanic)
            return "volcanicColor";

        return "";
    }

    getTerrainName() {
        if (this.terrain === undefined || this.terrain === null)
            return "";

        return TerrainTypeEnum[this.terrain.terrainType];
    }
}
