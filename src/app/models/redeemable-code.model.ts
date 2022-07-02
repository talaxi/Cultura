import { Type } from "class-transformer";
import { ResourceValue } from "./resources/resource-value.model";
import { TrainingOption } from "./training/training-option.model";

export class RedeemableCode {
    @Type(() => Date)
    expirationDate: Date;
    codeValue: string;
    @Type(() => TrainingOption)
    rewards: ResourceValue[];

    constructor() {
        this.rewards = [];
    }
}
