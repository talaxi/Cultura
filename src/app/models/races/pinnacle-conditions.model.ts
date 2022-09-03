import { EasyPinnacleConditionsEnum, HardPinnacleConditionsEnum, MediumPinnacleConditionsEnum } from "../pinnacle-conditions-enum.model";

export class PinnacleConditions {
    easyConditions: EasyPinnacleConditionsEnum[];
    mediumConditions: MediumPinnacleConditionsEnum[];
    hardConditions: HardPinnacleConditionsEnum[];

    constructor() {
        this.easyConditions = [];
        this.mediumConditions = [];
        this.hardConditions = [];
    }

    containsCondition(condition: string) {
        var doesContainCondition = false;

        if (this.easyConditions.length > 0) {
            if (this.easyConditions.some(item => EasyPinnacleConditionsEnum[item] === condition))
                doesContainCondition = true;
        }

        if (this.mediumConditions.length > 0) {
            if (this.mediumConditions.some(item => MediumPinnacleConditionsEnum[item] === condition))
                doesContainCondition = true;
        }

        if (this.hardConditions.length > 0) {
            if (this.hardConditions.some(item => HardPinnacleConditionsEnum[item] === condition))
                doesContainCondition = true;
        }

        return doesContainCondition;
    }    
}
