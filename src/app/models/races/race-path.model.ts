import { RaceDesignEnum } from "../race-design-enum.model";
import { StumbleSeverityEnum } from "../stumble-severity-enum.model";

export class RacePath {
    routeDesign: RaceDesignEnum;
    length: number;
    stumbleSeverity: StumbleSeverityEnum;
    frequencyOfStumble: number; // x meters out of 1000 meters by default
    stumbleOpportunities: number; //how many times you might stumble for each path
    currentStumbleOpportunity: number;
    legStartingDistance: number;
    isSpecialPath: boolean;
    didAnimalStumble = false;

    constructor(routeDesign?: RaceDesignEnum) {
        if (routeDesign !== undefined && routeDesign !== null) {
            this.setStumbleFields();
        }

        this.isSpecialPath = false;
    }

    setStumbleFields() {
        this.currentStumbleOpportunity = 0;

        if (this.routeDesign === RaceDesignEnum.Regular) {
            this.stumbleSeverity = StumbleSeverityEnum.None;
            this.frequencyOfStumble = 0;
            this.stumbleOpportunities = 0;
        }
        if (this.routeDesign === RaceDesignEnum.S) {
            this.stumbleSeverity = StumbleSeverityEnum.Low;
            this.frequencyOfStumble = 100;
            this.stumbleOpportunities = 2;
        }
        if (this.routeDesign === RaceDesignEnum.Bumps) {
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 15;
            this.stumbleOpportunities = 8;
        }
        if (this.routeDesign === RaceDesignEnum.Crevasse) {
            this.stumbleSeverity = StumbleSeverityEnum.High;
            this.frequencyOfStumble = 80;
            this.stumbleOpportunities = 3;
        }
        if (this.routeDesign === RaceDesignEnum.Gaps) {
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 150;
            this.stumbleOpportunities = 4;
        }
        if (this.routeDesign === RaceDesignEnum.Waves) {
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 40;
            this.stumbleOpportunities = 3;
        }
        if (this.routeDesign === RaceDesignEnum.Dive) {
            this.stumbleSeverity = StumbleSeverityEnum.High;
            this.frequencyOfStumble = 200;
            this.stumbleOpportunities = 1;
        }
    }
}
