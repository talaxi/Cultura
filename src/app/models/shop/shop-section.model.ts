import { Type } from "class-transformer";
import { ShopItem } from "./shop-item.model";

export class ShopSection {
    name: string;
    @Type(() => ShopItem)
    itemList: ShopItem[];
}
