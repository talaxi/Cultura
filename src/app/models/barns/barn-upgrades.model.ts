import { AnimalStats } from "../animals/animal-stats.model";
import { BarnSpecializationEnum } from "../barn-specialization-enum.model";
import { ResourceValue } from "../resources/resource-value.model";

export class BarnUpgrades {
    barnLevel: number;
    specialization: BarnSpecializationEnum;
    specializationLevel: number;
    upgradePrice: ResourceValue[];
    upgradedStatGain: AnimalStats;
    currentDeltaTime: number; //for attraction timer or any other future timers

    constructor() {    
        this.upgradePrice = [];
        this.upgradedStatGain = new AnimalStats(1, 1, 1, 1, 1, 1);
        this.barnLevel = 0;
        this.specializationLevel = 0;
        this.currentDeltaTime = 0;
    }
}
