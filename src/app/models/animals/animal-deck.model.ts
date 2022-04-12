import { Type } from "class-transformer";
import { Animal } from "./animal.model";

export class AnimalDeck {
    name: string;
    @Type(() => Animal)
    selectedAnimals: Animal[];
    isPrimaryDeck: boolean;
    deckNumber: number;
    isAvailable: boolean;

    constructor() {
        this.selectedAnimals = [];
    }
}
