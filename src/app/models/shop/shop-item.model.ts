import { ShopItemTypeEnum } from "../shop-item-type-enum.model";

export class ShopItem {
    name: string;
    description: string;
    purchasePrice: number;
    amountPurchased: number;
    canHaveMultiples: boolean;
    type: ShopItemTypeEnum;

    constructor() {
        this.amountPurchased = 0;
    }
}
