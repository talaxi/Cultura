import { Animal } from "../animals/animal.model";
import { Barn } from "../barns/barn.model";
import { Race } from "../races/race.model";
import { ResourceValue } from "../resources/resource-value.model";
import { TrainingOption } from "../training/training-option.model";
import { StringNumberPair } from "../utility/string-number-pair.model";

//list all of them, need to give everything a 'display' variable or something of the sort
export class GlobalVariables {
    animals: Animal[];
    barns: Barn[];
    trainingOptions: TrainingOption[];
    circuitRaces: Race[];
    circuitRank: string;
    resources: ResourceValue[];    
    modifiers: StringNumberPair[];
}
