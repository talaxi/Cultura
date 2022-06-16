import { AnimalStats } from "../animals/animal-stats.model";

export class RelayEffect {
    isMultiplicative: boolean; //false = additive
    remainingRelayMeters: number;
    relayAffectedStatRatios: AnimalStats; 
}
