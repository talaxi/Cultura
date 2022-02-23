import { Animal } from "../animals/animal.model";
import { Barn } from "../barns/barn.model";
import { TrainingOption } from "../training/training-option.model";

//list all of them, need to give everything a 'display' variable or something of the sort
export class GlobalVariables {
    animals: Animal[];
    barns: Barn[];
    trainingOptions: TrainingOption[];
}
