import { Type } from "class-transformer";
import { AnimalDeck } from "../animals/animal-deck.model";
import { Animal } from "../animals/animal.model";
import { Barn } from "../barns/barn.model";
import { Race } from "../races/race.model";
import { ResourceValue } from "../resources/resource-value.model";
import { ShopSection } from "../shop/shop-section.model";
import { TrainingOption } from "../training/training-option.model";
import { StringNumberPair } from "../utility/string-number-pair.model";

//list all of them, need to give everything a 'display' variable or something of the sort
export class GlobalVariables {
    @Type(() => Animal)
    animals: Animal[];
    @Type(() => Barn)
    barns: Barn[];
    @Type(() => TrainingOption)
    trainingOptions: TrainingOption[];
    @Type(() => Race)
    circuitRaces: Race[];
    circuitRank: string;
    @Type(() => Race)
    localRaces: Race[];
    @Type(() => ResourceValue)
    resources: ResourceValue[];
    @Type(() => StringNumberPair)
    modifiers: StringNumberPair[];
    @Type(() => ShopSection)
    shop: ShopSection[];
    renownLevel: number;
    @Type(() => AnimalDeck)
    animalDecks: AnimalDeck[];
    @Type(() => Map)
    settings: Map<string, boolean>;
    @Type(() => Map)
    unlockables: Map<string, boolean>;
    circuitRankUpRewardDescription: string;
    tutorialCompleted: boolean;
    currentTutorialId: number;
    nationalRaceCountdown: number;
    userIsRacing = false;    

    constructor(existingVariables?: GlobalVariables) {
        if (existingVariables !== undefined && existingVariables !== null) {            
            this.animals = existingVariables.animals;      
            this.barns = existingVariables.barns;
            this.trainingOptions = existingVariables.trainingOptions;
            this.circuitRaces = existingVariables.circuitRaces;
            this.circuitRank = existingVariables.circuitRank;
            this.localRaces = existingVariables.localRaces;
            this.resources = existingVariables.resources;
            this.modifiers = existingVariables.modifiers;
            this.shop = existingVariables.shop;
            this.animalDecks = existingVariables.animalDecks;
            this.nationalRaceCountdown = 0;
        }
    }
}
