import { OrbTypeEnum } from "../orb-type-enum.model";

export class Orb {
    type: OrbTypeEnum;
    level: number;
    maxLevel: number;
    xp: number;
    xpNeededForLevel: number;

    constructor(type: OrbTypeEnum) {
        this.type = type;
        this.level = 1;
        this.maxLevel = 1;
        this.xp = 0;
        this.xpNeededForLevel = 1000;
    }
}
