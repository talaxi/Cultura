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
    didAnimalLoseFocus = false;
    checkedForBurst = false;
    checkedForMiniBurst = false;
    checkedForNineTails = false; //used for Fox Ability -- Nine Tails
    frequencyOfDrift: number; //used for tundra
    driftAmount: number; //used for tundra
    totalTundraYAmount: number; //used for tundra
    checkedForDrift: boolean; //used for tundra

    constructor(routeDesign?: RaceDesignEnum) {
        if (routeDesign !== undefined && routeDesign !== null) {
            this.setStumbleFields();
        }

        this.driftAmount = 0;
        this.isSpecialPath = false;
    }

    setStumbleFields() {
        this.currentStumbleOpportunity = 0;

        if (this.routeDesign === RaceDesignEnum.Regular) {
            this.stumbleSeverity = StumbleSeverityEnum.None;
            this.frequencyOfStumble = 0;
            this.stumbleOpportunities = 0;
            this.frequencyOfDrift = 400;
        }
        if (this.routeDesign === RaceDesignEnum.S) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.Low;
            this.frequencyOfStumble = 100;
            this.stumbleOpportunities = 4;
        }
        if (this.routeDesign === RaceDesignEnum.Bumps) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 20;
            this.stumbleOpportunities = 8;
        }
        if (this.routeDesign === RaceDesignEnum.Crevasse) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.High;
            this.frequencyOfStumble = 80;
            this.stumbleOpportunities = 6;
        }
        if (this.routeDesign === RaceDesignEnum.Gaps) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 175;
            this.stumbleOpportunities = 4;
        }
        if (this.routeDesign === RaceDesignEnum.Waves) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 50;
            this.stumbleOpportunities = 6;
        }
        if (this.routeDesign === RaceDesignEnum.Dive) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.High;
            this.frequencyOfStumble = 200;
            this.stumbleOpportunities = 2;
        }
        if (this.routeDesign === RaceDesignEnum.Cavern) {
            this.isSpecialPath = true;
            this.frequencyOfStumble = 0;
            this.stumbleOpportunities = 0;
            this.frequencyOfDrift = 400;
        }
        if (this.routeDesign === RaceDesignEnum.Hills) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.High;
            this.frequencyOfStumble = 120;
            this.stumbleOpportunities = 3;
            this.frequencyOfDrift = 250;
        }
        if (this.routeDesign === RaceDesignEnum.FirstRegular || this.routeDesign === RaceDesignEnum.LastRegular) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.Medium;
            this.frequencyOfStumble = 100;
            this.stumbleOpportunities = 4;
        }
        if (this.routeDesign === RaceDesignEnum.SteppingStones) {
            this.isSpecialPath = true;
            this.stumbleSeverity = StumbleSeverityEnum.High;
            this.frequencyOfStumble = 60;
            this.stumbleOpportunities = 10;
        }
    }
}
