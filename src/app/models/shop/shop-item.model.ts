import { ShopItemTypeEnum } from "../shop-item-type-enum.model";

export class ShopItem {
    name: string;
    description: string;
    longDescription: string;
    purchasePrice: number;
    amountPurchased: number;
    canHaveMultiples: boolean;
    type: ShopItemTypeEnum;
    additionalIdentifier: string; //totally useless except for abilities, contains abilityName

    constructor() {
        this.amountPurchased = 0;
    }
}
