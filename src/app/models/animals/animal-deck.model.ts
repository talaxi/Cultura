import { Type } from "class-transformer";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { Animal } from "./animal.model";

export class AnimalDeck {
    name: string;
    @Type(() => Animal)
    selectedAnimals: Animal[];
    courseTypeOrder: RaceCourseTypeEnum[];
    isCourseOrderActive: boolean;
    isPrimaryDeck: boolean;
    autoRunFreeRace: boolean;
    isEventDeck: boolean;
    deckNumber: number;
    isAvailable: boolean;

    constructor() {
        this.selectedAnimals = [];
        this.courseTypeOrder = [];
        this.isCourseOrderActive = false;
        this.autoRunFreeRace = false;
        this.isEventDeck = false;
    }
}
