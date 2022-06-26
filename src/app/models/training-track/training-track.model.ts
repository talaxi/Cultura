import { Type } from "class-transformer";
import { ResourceValue } from "../resources/resource-value.model";

export class TrainingTrack {
    totalRewards: number;
    rewardsObtained: number;
    @Type(() => ResourceValue)
    rewards: ResourceValue[];


    constructor() {
        this.totalRewards = 0;
        this.rewardsObtained = 0;
        this.rewards = [];
    }
}
