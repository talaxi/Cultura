import { Type } from "class-transformer";
import { OrbTypeEnum } from "../orb-type-enum.model";
import { Orb } from "./orb.model";

export class OrbStats {
    @Type(() => Orb)
    allOrbs: Orb[];

    constructor() {
        this.allOrbs = [];

        var amberOrb = new Orb(OrbTypeEnum.amber);
        this.allOrbs.push(amberOrb);

        var amethystOrb = new Orb(OrbTypeEnum.amethyst);
        this.allOrbs.push(amethystOrb);

        var rubyOrb = new Orb(OrbTypeEnum.ruby);
        this.allOrbs.push(rubyOrb);

        var sapphireOrb = new Orb(OrbTypeEnum.sapphire);
        this.allOrbs.push(sapphireOrb);

        var topazOrb = new Orb(OrbTypeEnum.topaz);
        this.allOrbs.push(topazOrb);

        var emeraldOrb = new Orb(OrbTypeEnum.emerald);
        this.allOrbs.push(emeraldOrb);
    }

    getMaxSpeedIncrease(holders: number) {
        var increase = 1;

        if (this.allOrbs !== undefined && this.allOrbs.length > 0) {
            var rubyOrb = this.allOrbs.find(item => item.type === OrbTypeEnum.ruby);
            if (rubyOrb !== undefined) {
                increase = rubyOrb.defaultIncrease + ((rubyOrb.level - 1) * rubyOrb.increasePerLevel);
            }
        }
        
        return ((increase - 1) / holders) + 1;
    }

    getAccelerationIncrease(holders: number) {
        var increase = 1;

        if (this.allOrbs !== undefined && this.allOrbs.length > 0) {
            var amberOrb = this.allOrbs.find(item => item.type === OrbTypeEnum.amber);
            if (amberOrb !== undefined) {
                increase = amberOrb.defaultIncrease + ((amberOrb.level - 1) * amberOrb.increasePerLevel);
            }
        }

        return ((increase - 1) / holders) + 1;
    }

    getEnduranceIncrease(holders: number) {
        var increase = 1;
        var increaseLevelModifier = 1.1;

        if (this.allOrbs !== undefined && this.allOrbs.length > 0) {
            var topazOrb = this.allOrbs.find(item => item.type === OrbTypeEnum.topaz);
            if (topazOrb !== undefined) {
                increase = topazOrb.defaultIncrease + ((topazOrb.level - 1) * topazOrb.increasePerLevel);
            }
        }

        return ((increase - 1) / holders) + 1;
    }

    getPowerIncrease(holders: number) {
        var increase = 1;
        var increaseLevelModifier = 1.1;

        if (this.allOrbs !== undefined && this.allOrbs.length > 0) {
            var amethystOrb = this.allOrbs.find(item => item.type === OrbTypeEnum.amethyst);
            if (amethystOrb !== undefined) {
                increase = amethystOrb.defaultIncrease + ((amethystOrb.level - 1) * amethystOrb.increasePerLevel);
            }
        }

        return ((increase - 1) / holders) + 1;
    }

    getAdaptabilityIncrease(holders: number) {
        var increase = 1;
        var increaseLevelModifier = 1.1;

        if (this.allOrbs !== undefined && this.allOrbs.length > 0) {
            var emeraldOrb = this.allOrbs.find(item => item.type === OrbTypeEnum.emerald);
            if (emeraldOrb !== undefined) {
                increase = emeraldOrb.defaultIncrease + ((emeraldOrb.level - 1) * emeraldOrb.increasePerLevel);
            }
        }

        return ((increase - 1) / holders) + 1;
    }

    getFocusIncrease(holders: number) {
        var increase = 1;
        var increaseLevelModifier = 1.1;

        if (this.allOrbs !== undefined && this.allOrbs.length > 0) {
            var sapphireOrb = this.allOrbs.find(item => item.type === OrbTypeEnum.sapphire);
            if (sapphireOrb !== undefined) {
                increase = sapphireOrb.defaultIncrease + ((sapphireOrb.level - 1) * sapphireOrb.increasePerLevel);
            }
        }

        return ((increase - 1) / holders) + 1;
    }

    makeCopy() {
        var newOrbStats = new OrbStats();

        newOrbStats.allOrbs = [];
        this.allOrbs.forEach(orb => {
            newOrbStats.allOrbs.push(orb.makeCopy());
        });
        return newOrbStats;
    }
}
