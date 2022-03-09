import { Animal } from "./animal.model";

export class AnimalDeck {
    name: string;
    selectedAnimals: Animal[];
    isPrimaryDeck: boolean;
    isAvailable: boolean;

    constructor() {
        this.selectedAnimals = [];
    }
}
