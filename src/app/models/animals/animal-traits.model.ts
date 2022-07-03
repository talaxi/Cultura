import { AnimalStatEnum } from "../animal-stat-enum.model";
import { AnimalStats } from "./animal-stats.model";

export class AnimalTraits {
    //these impact the gain when calculating the base stats to get the racing stats
    positiveStatGain: AnimalStatEnum;
    negativeStatGain: AnimalStatEnum;
    traitName: string;
    requiredLevel: number;
    researchLevel: number;
    isSelected: boolean; //used for bolding selected option on UI

    constructor(traitName?: string, requiredLevel?: number, researchLevel?: number, positiveStatGain?: AnimalStatEnum, negativeStatGain?: AnimalStatEnum) {
        if (traitName !== undefined)
            this.traitName = traitName;
        if (requiredLevel !== undefined)
            this.requiredLevel = requiredLevel;
        if (researchLevel !== undefined)
            this.researchLevel = researchLevel;
        if (positiveStatGain !== undefined)
            this.positiveStatGain = positiveStatGain;
        if (negativeStatGain !== undefined)
            this.negativeStatGain = negativeStatGain;
    }

    getStatGainDescription(maxNegativePercent: number) {
        var positiveStat = "";
        var negativeStat = "";
        var positivePercent = this.researchLevel;
        var negativePercent = this.researchLevel > maxNegativePercent ? maxNegativePercent : this.researchLevel;

        if (this.positiveStatGain === AnimalStatEnum.acceleration)
            positiveStat = "Acceleration";
        if (this.positiveStatGain === AnimalStatEnum.adaptability)
            positiveStat = "Adaptability";
        if (this.positiveStatGain === AnimalStatEnum.endurance)
            positiveStat = "Endurance";
        if (this.positiveStatGain === AnimalStatEnum.focus)
            positiveStat = "Focus";
        if (this.positiveStatGain === AnimalStatEnum.power)
            positiveStat = "Power";
        if (this.positiveStatGain === AnimalStatEnum.topSpeed)
            positiveStat = "Speed";

        if (this.negativeStatGain === AnimalStatEnum.acceleration)
            negativeStat = "Acceleration";
        if (this.negativeStatGain === AnimalStatEnum.adaptability)
            negativeStat = "Adaptability";
        if (this.negativeStatGain === AnimalStatEnum.endurance)
            negativeStat = "Endurance";
        if (this.negativeStatGain === AnimalStatEnum.focus)
            negativeStat = "Focus";
        if (this.negativeStatGain === AnimalStatEnum.power)
            negativeStat = "Power";
        if (this.negativeStatGain === AnimalStatEnum.topSpeed)
            negativeStat = "Speed";

        return "+" + positivePercent + "% " + positiveStat + ", -" + negativePercent + "% " + negativeStat;
    }
}