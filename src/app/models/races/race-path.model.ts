import { RaceDesignEnum } from "../race-design-enum.model";
import { StumbleSeverityEnum } from "../stumble-severity-enum.model";

export class RacePath {
    routeDesign: RaceDesignEnum;
    length: number;
    stumbleSeverity: StumbleSeverityEnum;
    frequencyOfStumble: number; // x meters out of 1000 meters by default
    legStartingDistance: number;
    isSpecialPath: boolean;

    constructor(routeDesign?: RaceDesignEnum) {
        if (routeDesign !== undefined && routeDesign !== null) {
            this.setStumbleFields();
        }

        this.isSpecialPath = false;
    }

    setStumbleFields() {
        if (this.routeDesign === RaceDesignEnum.Regular) {
            this.stumbleSeverity = StumbleSeverityEnum.None;
            this.frequencyOfStumble = 0;
        }
        if (this.routeDesign === RaceDesignEnum.S) {
            this.stumbleSeverity = StumbleSeverityEnum.Low;
            this.frequencyOfStumble = 100;
        }
        if (this.routeDesign === RaceDesignEnum.Bumps) {
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 15;
        }
        if (this.routeDesign === RaceDesignEnum.Crevasse) {
            this.stumbleSeverity = StumbleSeverityEnum.High;
            this.frequencyOfStumble = 10;
        }
        if (this.routeDesign === RaceDesignEnum.Gaps) {
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 50;
        }
    }
}
