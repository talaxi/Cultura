import { Animal } from "../animals/animal.model";
import { FacilitySizeEnum } from "../facility-size-enum.model";

export class Barn {
    barnNumber: number;
    isLocked: boolean;
    isAvailable: boolean;
    purchasePrice: number;
    size: FacilitySizeEnum;
    facilityUpgradePrice: number;
    upgradePrice: number;

    getSize() {
        return FacilitySizeEnum[this.size];
    }
}
