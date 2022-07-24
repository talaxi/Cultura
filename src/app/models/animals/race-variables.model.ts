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
    hasLostFocusDuringRace: boolean;

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
    scaryMaskEffectOccurred: boolean;

    //talent effects
    firstAbilityUseEffectApplied: boolean;
    velocityExceedsMaxSpeedDuringBurst: boolean;
    velocityReachesMaxSpeedCount: number;

    constructor() {
        this.remainingBurstMeters = 0;
        this.metersSinceLostFocus = 0;
        
        this.recoveringStamina = false;
        this.defaultRecoveringStaminaLength = 150;
        this.currentRecoveringStaminaLength = this.defaultRecoveringStaminaLength;
        this.ranOutOfStamina = false;

        this.lostFocus = false;
        this.defaultLostFocusLength = 60;
        this.currentLostFocusLength = this.defaultLostFocusLength;
        this.hasLostFocusDuringRace = false;

        this.stumbled = false;
        this.defaultStumbledLength = 10;
        this.currentStumbledLength = this.defaultStumbledLength;

        this.relayEffects = [];

        this.burstCount = 0;

        this.icyCurrentYAmount = 0;        
        this.icyCurrentDirectionUp = true;

        this.headbandStumblePreventionCount = 0;
        this.scaryMaskEffectOccurred = false;   
        
        this.firstAbilityUseEffectApplied = false;
        this.velocityExceedsMaxSpeedDuringBurst = false;
        this.velocityReachesMaxSpeedCount = 0;
    }

    makeCopy() {
        var copy = new RaceVariables();

        copy.remainingBurstMeters = this.remainingBurstMeters;
        copy.metersSinceLostFocus = this.metersSinceLostFocus;
        
        copy.recoveringStamina = this.recoveringStamina;
        copy.defaultRecoveringStaminaLength = this.defaultRecoveringStaminaLength;
        copy.currentRecoveringStaminaLength = this.currentRecoveringStaminaLength;
        copy.ranOutOfStamina = this.ranOutOfStamina;

        copy.lostFocus = this.lostFocus;
        copy.defaultLostFocusLength = this.defaultLostFocusLength;
        copy.currentLostFocusLength = this.currentLostFocusLength;
        copy.hasLostFocusDuringRace = this.hasLostFocusDuringRace;

        copy.stumbled = this.stumbled;
        copy.defaultStumbledLength = this.defaultStumbledLength;
        copy.currentStumbledLength = this.currentStumbledLength;        

        copy.burstCount = this.burstCount;

        copy.icyCurrentYAmount = this.icyCurrentYAmount;        
        copy.icyCurrentDirectionUp = this.icyCurrentDirectionUp;

        copy.headbandStumblePreventionCount = this.headbandStumblePreventionCount;
        copy.scaryMaskEffectOccurred = this.scaryMaskEffectOccurred;   
        
        copy.firstAbilityUseEffectApplied = this.firstAbilityUseEffectApplied;
        copy.velocityExceedsMaxSpeedDuringBurst = this.velocityExceedsMaxSpeedDuringBurst;
        copy.velocityReachesMaxSpeedCount = this.velocityReachesMaxSpeedCount;

        this.relayEffects = [];

        return copy;
    }
}
