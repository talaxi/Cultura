import { Type } from "class-transformer";
import { AnimalTraits } from "./animals/animal-traits.model";
import { Animal } from "./animals/animal.model";

export class Incubator {
    timeToComplete: number;
    @Type(() => Animal)
    assignedAnimal: Animal | null;
    @Type(() => AnimalTraits)
    assignedTrait: AnimalTraits | null;
    timeTrained: number;

    constructor()
    {
        this.timeTrained = 0;
        this.timeToComplete = 120;
    }
}
