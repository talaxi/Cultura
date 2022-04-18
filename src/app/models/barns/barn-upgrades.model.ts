import { AnimalStats } from "../animals/animal-stats.model";
import { BarnSpecializationEnum } from "../barn-specialization-enum.model";
import { ResourceValue } from "../resources/resource-value.model";

export class BarnUpgrades {
    barnLevel: number;
    specialization: BarnSpecializationEnum;
    specializationLevel: number;
    upgradePrice: ResourceValue[];
    upgradedStatGain: AnimalStats;

    constructor() {    
        this.upgradePrice = [];
        this.upgradedStatGain = new AnimalStats(0, 0, 0, 0, 0, 0);
        this.barnLevel = 0;
        this.specializationLevel = 0;
    }
}
