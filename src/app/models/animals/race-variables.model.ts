import { StumbleSeverityEnum } from "../stumble-severity-enum.model";
import { AnimalStats } from "./animal-stats.model";

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

    hasRelayEffect: boolean;
    remainingRelayMeters: number;
    relayAffectedStatRatios: AnimalStats; 

    //equipment effects
    headbandStumblePreventionCount: number;

    constructor() {
        this.metersSinceLostFocus = 0;
        
        this.recoveringStamina = false;
        this.defaultRecoveringStaminaLength = 3;
        this.currentRecoveringStaminaLength = this.defaultRecoveringStaminaLength;

        this.lostFocus = false;
        this.defaultLostFocusLength = 60;
        this.currentLostFocusLength = this.defaultLostFocusLength;

        this.stumbled = false;
        this.defaultStumbledLength = 10;
        this.currentStumbledLength = this.defaultStumbledLength;

        this.headbandStumblePreventionCount = 0;
    }
}
