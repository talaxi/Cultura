import { AnimalTypeEnum } from "../animal-type-enum.model";

export class AnimalEventRaceData {
    associatedAnimalType: AnimalTypeEnum;
    exhaustionStatReduction: number;
    morale: number;
    isCurrentlyRacing: boolean;
    isSetToRelay: boolean;

    constructor(type: AnimalTypeEnum) {
        this.exhaustionStatReduction = 1;
        this.morale = 1;
        this.associatedAnimalType = type;
        this.isCurrentlyRacing = false;
        this.isSetToRelay = false;
    }
}
