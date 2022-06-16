import { RelayEffect } from "../races/relay-effect.model";
import { StumbleSeverityEnum } from "../stumble-severity-enum.model";
import { AnimalStats } from "./animal-stats.model";

export class RaceVariables {
    recoveringStamina: boolean;
    defaultRecoveringStaminaLength: number;
    currentRecoveringStaminaLength: number;
    ranOutOfStamina: boolean;

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
    burstCount: number;

    relayEffects: RelayEffect[];

    icyCurrentDirectionUp: boolean;
    icyCurrentYAmount: number; //when it reaches 100 or -100, hits wall

    //equipment effects
    headbandStumblePreventionCount: number;

    constructor() {
        this.metersSinceLostFocus = 0;
        
        this.recoveringStamina = false;
        this.defaultRecoveringStaminaLength = 150;
        this.currentRecoveringStaminaLength = this.defaultRecoveringStaminaLength;
        this.ranOutOfStamina = false;

        this.lostFocus = false;
        this.defaultLostFocusLength = 60;
        this.currentLostFocusLength = this.defaultLostFocusLength;

        this.stumbled = false;
        this.defaultStumbledLength = 10;
        this.currentStumbledLength = this.defaultStumbledLength;

        this.relayEffects = [];

        this.burstCount = 0;

        this.icyCurrentYAmount = 0;        
        this.icyCurrentDirectionUp = true;

        this.headbandStumblePreventionCount = 0;
    }
}
