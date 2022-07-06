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
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Local Races", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Local Races", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Local Races", 1, ShopItemTypeEnum.Other));

        this.intermediateTrack = new TrainingTrack();
        this.intermediateTrack.totalRewards = 12;
        var intermediateCoinAmount = 200;
        this.intermediateTrack.rewards.push(new ResourceValue("Coins", intermediateCoinAmount, ShopItemTypeEnum.Resources));
        this.intermediateTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 2, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Medals", 1, ShopItemTypeEnum.Resources));
        this.intermediateTrack.rewards.push(new ResourceValue("Diminishing Returns per Facility Level", 2, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Circuit Races", 5, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Coins", intermediateCoinAmount, ShopItemTypeEnum.Resources));
        this.intermediateTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Local Races", 1, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Medals", 1, ShopItemTypeEnum.Resources));
        this.intermediateTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 2, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Diminishing Returns per Facility Level", 3, ShopItemTypeEnum.Other));

        this.masterTrack = new TrainingTrack();
        this.masterTrack.totalRewards = 12;
        var masterCoinAmount = 1000;
        this.masterTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Local Races", 5, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Diminishing Returns per Facility Level", 2, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Coins", masterCoinAmount, ShopItemTypeEnum.Resources));
        this.masterTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 3, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Bonus Talents", 2, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Coins", masterCoinAmount, ShopItemTypeEnum.Resources));
        this.masterTrack.rewards.push(new ResourceValue("Orb Necklace", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Diminishing Returns per Facility Level", 3, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Bonus Talents", 3, ShopItemTypeEnum.Other));

    }
}
