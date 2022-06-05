import { AnimalTraits } from "./animals/animal-traits.model";
import { Animal } from "./animals/animal.model";

export class Incubator {
    timeToComplete: number;
    assignedAnimal: Animal | null;
    assignedTrait: AnimalTraits | null;
    timeTrained: number;

    constructor()
    {
        this.timeTrained = 0;
        this.timeToComplete = 3;//300;
    }
}
