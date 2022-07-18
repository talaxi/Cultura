import { AnimalStats } from "../animals/animal-stats.model";
import { RelayEffectEnum } from "../relay-effect-enum.model";

export class RelayEffect {
    isMultiplicative: boolean; //false = additive
    remainingRelayMeters: number;
    relayAffectedStatRatios: AnimalStats;
    effectType: RelayEffectEnum;
    additionalValue: number | undefined; //if something is changing outside of stats
    affectsAllRacers: boolean = false; 

    makeCopy() {
        var copy = new RelayEffect();

        copy.isMultiplicative = this.isMultiplicative;
        copy.remainingRelayMeters = this.remainingRelayMeters;
        copy.relayAffectedStatRatios = new AnimalStats(this.relayAffectedStatRatios.topSpeed, this.relayAffectedStatRatios.acceleration,
            this.relayAffectedStatRatios.endurance, this.relayAffectedStatRatios.power, this.relayAffectedStatRatios.focus,
            this.relayAffectedStatRatios.adaptability);
        copy.effectType = this.effectType;
        copy.additionalValue = this.additionalValue;
        copy.affectsAllRacers = this.affectsAllRacers;

        return copy;
    }
}
