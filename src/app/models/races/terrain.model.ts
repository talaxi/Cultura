import { AnimalStats } from "../animals/animal-stats.model";
import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { TerrainTypeEnum } from "../terrain-type-enum.model";

export class Terrain {
    terrainType: TerrainTypeEnum;
    raceCourseType: RaceCourseTypeEnum;
    //these values impact the Ms stats not trainable stats
    maxSpeedModifier: number;
    accelerationModifier: number;
    staminaModifier: number;
    powerModifier: number
    focusModifier: number;
    adaptabilityModifier: number;

    constructor(terrainType?: TerrainTypeEnum) {
        var minorDetriment = .8;
        var majorDetriment = .5;
        var minorImprovement = 1.2;
        var majorImprovement = 1.5;
        var staminaIncrease = 0.04;
        var staminaDecrease = -0.04;

        this.maxSpeedModifier = 1;
        this.accelerationModifier = 1;
        this.powerModifier = 1;
        this.focusModifier = 1;
        this.adaptabilityModifier = 1;    

        if (terrainType !== null)
        {
            this.terrainType = terrainType!;

            //increase stamina loss due to heat
            if (terrainType === TerrainTypeEnum.Sunny)
            {
                this.staminaModifier = majorImprovement;
                this.maxSpeedModifier = minorImprovement;                
            }

            //increase chance of stumbling
            if (terrainType === TerrainTypeEnum.Rainy)
            {
                this.adaptabilityModifier = minorDetriment;
                this.focusModifier = minorImprovement;
            }

            //increase chance of losing focus due to loud thunder
            if (terrainType === TerrainTypeEnum.Stormy)
            {
                this.focusModifier = minorDetriment;
                this.accelerationModifier = minorImprovement;
            }

            if (terrainType === TerrainTypeEnum.Maelstrom)
            {
                this.accelerationModifier = minorDetriment;
                this.maxSpeedModifier = minorDetriment;
                this.adaptabilityModifier = minorImprovement;
            }

            if (terrainType === TerrainTypeEnum.Hailstorm)
            {
                this.focusModifier = minorDetriment;
                this.adaptabilityModifier = minorDetriment;
                this.maxSpeedModifier = minorDetriment;
            }

            if (terrainType === TerrainTypeEnum.Ashfall)
            {
                this.staminaModifier = minorImprovement;
                this.accelerationModifier = minorDetriment;
                this.powerModifier = minorDetriment;
            }

            if (terrainType === TerrainTypeEnum.Snowfall)
            {
                this.staminaModifier = minorDetriment;
                this.maxSpeedModifier = minorDetriment;
                this.accelerationModifier = minorDetriment;
            }

            if (terrainType === TerrainTypeEnum.Torrid)
            {
                this.powerModifier = minorDetriment;
                this.maxSpeedModifier = minorDetriment;
                this.focusModifier = minorImprovement;
            }
        }
    }    

    getTerrainType(): string {
        return TerrainTypeEnum[this.terrainType];
    }
}
