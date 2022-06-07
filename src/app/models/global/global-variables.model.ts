import { Type } from "class-transformer";
import { AnimalDeck } from "../animals/animal-deck.model";
import { Animal } from "../animals/animal.model";
import { Barn } from "../barns/barn.model";
import { Incubator } from "../incubator.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { Race } from "../races/race.model";
import { ResourceValue } from "../resources/resource-value.model";
import { ShopSection } from "../shop/shop-section.model";
import { TrainingOption } from "../training/training-option.model";
import { Settings } from "../utility/settings.model";
import { StringNumberPair } from "../utility/string-number-pair.model";
import { TrackedStats } from "../utility/tracked-stats.model";
import { Unlockables } from "../utility/unlockables.model";

//list all of them, need to give everything a 'display' variable or something of the sort
export class GlobalVariables {
    lastTimeStamp: number;
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
    monoRank: string;
    duoRank: string;
    rainbowRank: string;    
    @Type(() => ResourceValue)
    resources: ResourceValue[];
    @Type(() => StringNumberPair)
    modifiers: StringNumberPair[];
    @Type(() => ShopSection)
    shop: ShopSection[];
    renownLevel: number;
    @Type(() => AnimalDeck)
    animalDecks: AnimalDeck[];
    @Type(() => Settings)
    settings: Settings;
    @Type(() => Unlockables)
    unlockables: Unlockables;
    @Type(() => Incubator)
    incubator: Incubator;
    @Type(() => TrackedStats)
    trackedStats: TrackedStats;
    circuitRankUpRewardDescription: string;
    tutorialCompleted: boolean;
    currentTutorialId: number;
    showTutorial: boolean;
    nationalRaceCountdown: number;
    userIsRacing = false;   
    autoFreeRaceCounter: number;     
    freeRaceCounter: number;
    freeRaceTimePeriodCounter: number;   
    lastMonoRaceCourseType: RaceCourseTypeEnum; 
    currentVersion: number;
    startingVersion: number;

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
            this.incubator = existingVariables.incubator;
            this.trackedStats = existingVariables.trackedStats;
            this.nationalRaceCountdown = 0;
            this.autoFreeRaceCounter = 0;
            this.freeRaceCounter = 0;
            this.freeRaceTimePeriodCounter = 0;
        }
    }
}
