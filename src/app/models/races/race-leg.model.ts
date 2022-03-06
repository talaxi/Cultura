import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { RacePath } from "./race-path.model";

export class RaceLeg {
    courseType: RaceCourseTypeEnum;
    distance: number;
    legComplete = false;
    pathData: RacePath[];

    constructor(courseType?: RaceCourseTypeEnum, distance?: number) {
        if (courseType !== undefined && courseType !== null)
            this.courseType = courseType;

        if (distance !== undefined && distance != null)
            this.distance = distance;

        this.pathData = [];
    }

    getCourseTypeName()
    {
        return RaceCourseTypeEnum[this.courseType];
    }
}
