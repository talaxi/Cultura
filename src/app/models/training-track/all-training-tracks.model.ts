import { Type } from "class-transformer";
import { ResourceValue } from "../resources/resource-value.model";
import { ShopItemTypeEnum } from "../shop-item-type-enum.model";
import { TrainingTrack } from "./training-track.model";

export class AllTrainingTracks {
    @Type(() => TrainingTrack)
    noviceTrack: TrainingTrack;
    @Type(() => TrainingTrack)
    intermediateTrack: TrainingTrack;
    @Type(() => TrainingTrack)
    masterTrack: TrainingTrack;
    intermediateTrackAvailable: boolean;
    masterTrackAvailable: boolean;

    constructor() {
        this.intermediateTrackAvailable = false;
        this.masterTrackAvailable = false;

        this.noviceTrack = new TrainingTrack();
        this.noviceTrack.totalRewards = 12;

        var noviceCoinAmount = 50;
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP gain from Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP gain from Local Races", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP gain from Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP gain from Local Races", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP gain from Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP gain from Local Races", 1, ShopItemTypeEnum.Other));

        this.intermediateTrack = new TrainingTrack();
        this.intermediateTrack.totalRewards = 12;

        this.masterTrack = new TrainingTrack();
        this.masterTrack.totalRewards = 12;
    }
}
