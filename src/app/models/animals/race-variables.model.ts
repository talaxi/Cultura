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

    constructor() {
        this.recoveringStamina = false;
        this.defaultRecoveringStaminaLength = 3;

        this.lostFocus = false;
        this.defaultLostFocusLength = 1;

        this.stumbled = false;
        this.defaultStumbledLength = 1;
    }
}
