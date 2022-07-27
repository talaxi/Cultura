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
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Free Races", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Free Races", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 1, ShopItemTypeEnum.Other));
        this.noviceTrack.rewards.push(new ResourceValue("Coins", noviceCoinAmount, ShopItemTypeEnum.Resources));
        this.noviceTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Free Races", 1, ShopItemTypeEnum.Other));

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
        this.intermediateTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Free Races", 1, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Medals", 1, ShopItemTypeEnum.Resources));
        this.intermediateTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 2, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.intermediateTrack.rewards.push(new ResourceValue("Diminishing Returns per Facility Level", 3, ShopItemTypeEnum.Other));

        this.masterTrack = new TrainingTrack();
        this.masterTrack.totalRewards = 12;
        var masterCoinAmount = 1000;
        this.masterTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Free Races", 5, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Diminishing Returns per Facility Level", 2, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Coins", masterCoinAmount, ShopItemTypeEnum.Resources));
        this.masterTrack.rewards.push(new ResourceValue("Bonus Breed XP Gain From Training", 3, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Bonus Talents", 2, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Coins", masterCoinAmount, ShopItemTypeEnum.Resources));
        this.masterTrack.rewards.push(new ResourceValue("Orb Pendant", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Diminishing Returns per Facility Level", 3, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Training Time Reduction", 1, ShopItemTypeEnum.Other));
        this.masterTrack.rewards.push(new ResourceValue("Bonus Talents", 3, ShopItemTypeEnum.Other));
    }

    getTotalRewardCount() {
        return this.noviceTrack.totalRewards + this.intermediateTrack.totalRewards + this.masterTrack.totalRewards;
    }

    getTotalRewardsObtained() {
        return this.noviceTrack.rewardsObtained - this.intermediateTrack.rewardsObtained - this.masterTrack.rewardsObtained;
    }

    getTotalRewardsRemaining() {
        return this.getTotalRewardCount() - this.noviceTrack.rewardsObtained - this.intermediateTrack.rewardsObtained - this.masterTrack.rewardsObtained;
    }

    getTotalTrainingTrackBonusBreedXpFromFreeRaces() {
        var bonusXp = 0;

        if (this.noviceTrack.rewards.length === 0 || this.intermediateTrack.rewards.length === 0 || this.masterTrack.rewards.length === 0)
            return 0;

        if (this.noviceTrack.rewardsObtained >= 4)
            bonusXp += this.noviceTrack.rewards[3].amount;
        if (this.noviceTrack.rewardsObtained >= 8)
            bonusXp += this.noviceTrack.rewards[7].amount;
        if (this.noviceTrack.rewardsObtained >= 12)
            bonusXp += this.noviceTrack.rewards[11].amount;

        if (this.intermediateTrack.rewardsObtained >= 8)
            bonusXp += this.intermediateTrack.rewards[7].amount;

        if (this.masterTrack.rewardsObtained >= 1)
            bonusXp += this.masterTrack.rewards[0].amount;

        return bonusXp;
    }

    getTotalTrainingTrackBonusBreedXpFromCircuitRaces() {
        var bonusXp = 0;

        if (this.noviceTrack.rewards.length === 0 || this.intermediateTrack.rewards.length === 0 || this.masterTrack.rewards.length === 0)
            return 0;

        if (this.intermediateTrack.rewardsObtained >= 6)
            bonusXp += this.intermediateTrack.rewards[5].amount;

        return bonusXp;
    }

    getTotalTrainingTrackBonusBreedXpFromTraining() {
        var bonusXp = 0;

        if (this.noviceTrack.rewards.length === 0 || this.intermediateTrack.rewards.length === 0 || this.masterTrack.rewards.length === 0)
            return 0;

        if (this.noviceTrack.rewardsObtained >= 2)
            bonusXp += this.noviceTrack.rewards[1].amount;
        if (this.noviceTrack.rewardsObtained >= 6)
            bonusXp += this.noviceTrack.rewards[5].amount;
        if (this.noviceTrack.rewardsObtained >= 10)
            bonusXp += this.noviceTrack.rewards[9].amount;

        if (this.intermediateTrack.rewardsObtained >= 2)
            bonusXp += this.intermediateTrack.rewards[1].amount;
        if (this.intermediateTrack.rewardsObtained >= 10)
            bonusXp += this.intermediateTrack.rewards[9].amount;

        if (this.masterTrack.rewardsObtained >= 5)
            bonusXp += this.masterTrack.rewards[4].amount;

        return bonusXp;
    }

    getTotalTrainingTrackBonusDiminishingReturnsPerFacilityLevel() {
        var bonusXp = 0;

        if (this.noviceTrack.rewards.length === 0 || this.intermediateTrack.rewards.length === 0 || this.masterTrack.rewards.length === 0)
            return 0;

        if (this.intermediateTrack.rewardsObtained >= 4)
            bonusXp += this.intermediateTrack.rewards[3].amount;
        if (this.intermediateTrack.rewardsObtained >= 12)
            bonusXp += this.intermediateTrack.rewards[11].amount;

        if (this.masterTrack.rewardsObtained >= 2)
            bonusXp += this.masterTrack.rewards[1].amount;
        if (this.masterTrack.rewardsObtained >= 10)
            bonusXp += this.masterTrack.rewards[9].amount;

        return bonusXp;
    }

    getTotalTrainingTrackBonusTrainingTimeReduction() {
        var bonusXp = 0;

        if (this.noviceTrack.rewards.length === 0 || this.intermediateTrack.rewards.length === 0 || this.masterTrack.rewards.length === 0)
            return 0;

        if (this.intermediateTrack.rewardsObtained >= 5)
            bonusXp += this.intermediateTrack.rewards[4].amount;
        if (this.intermediateTrack.rewardsObtained >= 11)
            bonusXp += this.intermediateTrack.rewards[10].amount;

        if (this.masterTrack.rewardsObtained >= 3)
            bonusXp += this.masterTrack.rewards[2].amount;
        if (this.masterTrack.rewardsObtained >= 7)
            bonusXp += this.masterTrack.rewards[6].amount;
        if (this.masterTrack.rewardsObtained >= 11)
            bonusXp += this.masterTrack.rewards[10].amount;

        return bonusXp;
    }

    getTotalTrainingTrackBonusTalents() {
        var bonusXp = 0;

        if (this.noviceTrack.rewards.length === 0 || this.intermediateTrack.rewards.length === 0 || this.masterTrack.rewards.length === 0)
            return 0;

        if (this.masterTrack.rewardsObtained >= 6)
            bonusXp += this.masterTrack.rewards[5].amount;
        if (this.masterTrack.rewardsObtained >= 12)
            bonusXp += this.masterTrack.rewards[11].amount;        

        return bonusXp;
    }
}
