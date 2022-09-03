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
        this.xpNeededForLevel = 10000;
    }

    makeCopy() {
        var newOrb = new Orb(this.type);

        newOrb.level = this.level;
        newOrb.maxLevel = this.maxLevel;
        newOrb.xp = this.xp;
        newOrb.xpNeededForLevel = this.xpNeededForLevel;

        return newOrb;
    }
}
