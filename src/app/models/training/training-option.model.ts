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

    getFacilitySize(): string {
        return FacilitySizeEnum[this.facilitySize];
    }

    //TODO: maybe do <br/> instead of commas?
    getStatGainDescription(): string {
        var statGainDescription = "";

        if (this.affectedStatRatios.topSpeed > 0)
            statGainDescription += this.statGain * this.affectedStatRatios.topSpeed + " top speed, ";
        if (this.affectedStatRatios.acceleration > 0)
            statGainDescription += this.statGain * this.affectedStatRatios.acceleration + " acceleration, ";
        if (this.affectedStatRatios.endurance > 0)
            statGainDescription += this.statGain * this.affectedStatRatios.endurance + " endurance, ";
        if (this.affectedStatRatios.focus > 0)
            statGainDescription += this.statGain * this.affectedStatRatios.focus + " focus, ";
        if (this.affectedStatRatios.power > 0)
            statGainDescription += this.statGain * this.affectedStatRatios.power + " power, ";
            if (this.affectedStatRatios.adaptability > 0)
            statGainDescription += this.statGain * this.affectedStatRatios.adaptability + " adaptability, ";

        if (statGainDescription.length > 0)
        {            
            statGainDescription = statGainDescription.substring(0, statGainDescription.length - 2);
        }
        return statGainDescription;
    }    
}


//example of 1 .5 0 0 0 0 0
//stat gain of 10
//so you gain 10 top speed and 5 acceleration at the end of the training