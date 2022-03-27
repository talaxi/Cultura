import { Animal } from "./animal.model";

export class AnimalDeck {
    name: string;
    selectedAnimals: Animal[];
    isPrimaryDeck: boolean;
    deckNumber: number;
    isAvailable: boolean;

    constructor() {
        this.selectedAnimals = [];
    }
}
