import { RaceCourseTypeEnum } from "../race-course-type-enum.model";

export class RaceLeg {
    courseType: RaceCourseTypeEnum;
    distance: number;
    legComplete = false;

    constructor(courseType?: RaceCourseTypeEnum, distance?: number) {
        if (courseType !== undefined && courseType !== null)
            this.courseType = courseType;

        if (distance !== undefined && distance != null)
            this.distance = distance;
    }

    getCourseTypeName()
    {
        return RaceCourseTypeEnum[this.courseType];
    }
}
