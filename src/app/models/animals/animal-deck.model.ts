import { Type } from "class-transformer";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { Animal } from "./animal.model";

export class AnimalDeck {
    name: string;
    @Type(() => Animal)
    selectedAnimals: Animal[];
    courseTypeOrder: RaceCourseTypeEnum[];
    isPrimaryDeck: boolean;
    deckNumber: number;
    isAvailable: boolean;

    constructor() {
        this.selectedAnimals = [];
        this.courseTypeOrder = [];
    }
}
