import { ShopItemTypeEnum } from "../shop-item-type-enum.model";

export class ResourceValue {
    name: string;
    amount: number;
    itemType: ShopItemTypeEnum;
    isSelected: boolean; //purely for UI purposes

    constructor(name: string, amount: number, type?: ShopItemTypeEnum) {
        this.name = name;
        this.amount = amount;

        if (type !== undefined)
            this.itemType = type;
    }

    makeCopy(originalResourceValue: ResourceValue) {
        var copy = new ResourceValue("", 0);       
        copy.name = JSON.parse(JSON.stringify(originalResourceValue.name));
        copy.amount = JSON.parse(JSON.stringify(originalResourceValue.amount));
        copy.itemType = JSON.parse(JSON.stringify(originalResourceValue.itemType));
        return copy;
    }
}
