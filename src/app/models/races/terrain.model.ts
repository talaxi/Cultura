import { RaceCourseTypeEnum } from "../race-course-type-enum.model";
import { TerrainTypeEnum } from "../terrain-type-enum.model";

export class Terrain {
    terrainType: TerrainTypeEnum;
    raceCourseType: RaceCourseTypeEnum;
    staminaModifier: number;

    constructor(terrainType?: TerrainTypeEnum) {
        if (terrainType !== null)
        {
            //increase stamina loss due to heat
            if (terrainType === TerrainTypeEnum.Sunny)
            {
                this.staminaModifier = 0.2;
            }

            //increase chance of stumbling
            if (terrainType === TerrainTypeEnum.Rainy)
            {

            }

            //increase chance of losing focus due to loud thunder
            if (terrainType === TerrainTypeEnum.Storms)
            {

            }
        }
    }
}
