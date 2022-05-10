import { ResourceValue } from "../resources/resource-value.model";
import { ShopItemTypeEnum } from "../shop-item-type-enum.model";

export class ShopItem {
    name: string;
    shortDescription: string;
    longDescription: string;
    purchasePrice: ResourceValue[];
    amountPurchased: number;
    canHaveMultiples: boolean;
    totalShopQuantity: number;
    infiniteAmount: boolean;
    quantityMultiplier: number; //each additional item has this multiplier
    type: ShopItemTypeEnum;
    additionalIdentifier: string; //totally useless except for abilities, contains abilityName
    isAvailable: boolean;

    constructor() {
        this.isAvailable = true;
        this.amountPurchased = 0;
        this.totalShopQuantity = 1;
        this.quantityMultiplier = 1;
        this.purchasePrice = [];
    }
}
