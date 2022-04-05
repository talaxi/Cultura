import { ShopItemTypeEnum } from "../shop-item-type-enum.model";

export class ResourceValue {
    name: string;
    amount: number;
    itemType: ShopItemTypeEnum;

    constructor(name: string, amount: number, type?: ShopItemTypeEnum) {
        this.name = name;
        this.amount = amount;

        if (type !== undefined)
            this.itemType = type;
    }
}
