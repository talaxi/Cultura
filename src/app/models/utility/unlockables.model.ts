export class Unlockables {
    unlockables: [string, boolean][] = [];

    get(name: string) {
        var existingUnlockable = this.unlockables.find(item => item[0] === name);
        if (existingUnlockable !== undefined && existingUnlockable !== null)
            return existingUnlockable[1];

        return false;
    }

    set(name: string, value: boolean) {
        var existingUnlockable = this.unlockables.find(item => item[0] === name);
        if (existingUnlockable === undefined || existingUnlockable === null)
            this.unlockables.push([name, value]);
        else
            existingUnlockable[1] = value;
    }
}
