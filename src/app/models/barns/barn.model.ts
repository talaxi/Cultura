import { Animal } from "../animals/animal.model";
import { FacilitySizeEnum } from "../facility-size-enum.model";
import { BarnUpgrades } from "./barn-upgrades.model";

export class Barn {
    barnNumber: number;
    barnUpgrades: BarnUpgrades;
    isLocked: boolean;
    isAvailable: boolean;
    purchasePrice: number;
    size: FacilitySizeEnum;
    facilityUpgradePrice: number;
    upgradePrice: number;

    getSize() {
        return FacilitySizeEnum[this.size];
    }

    constructor() {
        this.barnUpgrades = new BarnUpgrades();
    }
}
