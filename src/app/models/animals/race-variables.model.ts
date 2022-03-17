import { StumbleSeverityEnum } from "../stumble-severity-enum.model";

export class RaceVariables {
    recoveringStamina: boolean;
    defaultRecoveringStaminaLength: number;
    currentRecoveringStaminaLength: number;

    lostFocus: boolean;
    defaultLostFocusLength: number;
    currentLostFocusLength: number;
    metersSinceLostFocus: number;

    stumbled: boolean;
    defaultStumbledLength: number;
    currentStumbledLength: number;
    stumbledSeverity: StumbleSeverityEnum; 
    metersSinceStumble: number;

    isBursting: boolean;
    remainingBurstMeters: number;

    constructor() {
        this.recoveringStamina = false;
        this.defaultRecoveringStaminaLength = 3;
        this.currentRecoveringStaminaLength = this.defaultRecoveringStaminaLength;

        this.lostFocus = false;
        this.defaultLostFocusLength = 2;
        this.currentLostFocusLength = this.defaultLostFocusLength;

        this.stumbled = false;
        this.defaultStumbledLength = 1;
        this.currentStumbledLength = this.defaultStumbledLength;
    }
}
