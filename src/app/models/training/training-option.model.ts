import { Type } from "class-transformer";
import { AnimalStats } from "../animals/animal-stats.model";
import { FacilitySizeEnum } from "../facility-size-enum.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { TrainingOptionsEnum } from "../training-options-enum.model";

export class TrainingOption {
    trainingName: string;
    trainingType: TrainingOptionsEnum;
    trainingCourseType: RaceCourseTypeEnum;
    facilitySize: FacilitySizeEnum;
    timeToComplete: number;
    @Type(() => AnimalStats)
    affectedStatRatios: AnimalStats; //multiply the value here for each stat by statgain to get the value gained
    statGain: number;
    isAvailable: boolean;
    timeTrained: number; //current amount / timetocomplete
    purchasePrice: number;

    constructor() {
        this.timeTrained = 0;
        this.isAvailable = false;
        this.purchasePrice = 50;
    }

    //make copy, make time adjustments to the copy
    makeCopy(originalTrainingOption: TrainingOption)
    {
        var copy = new TrainingOption();
        copy.affectedStatRatios = originalTrainingOption.affectedStatRatios;
        copy.facilitySize = originalTrainingOption.facilitySize;
        copy.isAvailable = originalTrainingOption.isAvailable;
        copy.purchasePrice = originalTrainingOption.purchasePrice;
        copy.statGain = originalTrainingOption.statGain;
        copy.timeToComplete = originalTrainingOption.timeToComplete;
        copy.timeTrained = originalTrainingOption.timeTrained;
        copy.trainingCourseType = originalTrainingOption.trainingCourseType;
        copy.trainingName = originalTrainingOption.trainingName;
        copy.trainingType = originalTrainingOption.trainingType;
        return copy;
    }

    getFacilitySize(): string {
        return FacilitySizeEnum[this.facilitySize];
    }
    
    getStatGainDescription(): string {
        var statGainDescription = "";

        if (this.affectedStatRatios.topSpeed > 0)
            statGainDescription += "+" + this.statGain * this.affectedStatRatios.topSpeed + " Top Speed\n";
        if (this.affectedStatRatios.acceleration > 0)
            statGainDescription += "+" + this.statGain * this.affectedStatRatios.acceleration + " Acceleration\n";
        if (this.affectedStatRatios.endurance > 0)
            statGainDescription += "+" + this.statGain * this.affectedStatRatios.endurance + " Endurance\n";
        if (this.affectedStatRatios.focus > 0)
            statGainDescription += "+" +  this.statGain * this.affectedStatRatios.focus + " Focus\n";
        if (this.affectedStatRatios.power > 0)
            statGainDescription += "+" +  this.statGain * this.affectedStatRatios.power + " Power\n";
            if (this.affectedStatRatios.adaptability > 0)
            statGainDescription += "+" +  this.statGain * this.affectedStatRatios.adaptability + " Adaptability\n";

        return statGainDescription;
    }    
}


//example of 1 .5 0 0 0 0 0
//stat gain of 10
//so you gain 10 top speed and 5 acceleration at the end of the training