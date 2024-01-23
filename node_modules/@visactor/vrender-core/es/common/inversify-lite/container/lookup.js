import * as ERROR_MSGS from "../constants/error_msgs";

import { isClonable } from "../utils/clonable";

class Lookup {
    constructor() {
        this._map = new Map;
    }
    getMap() {
        return this._map;
    }
    add(serviceIdentifier, value) {
        if (null == serviceIdentifier) throw new Error(ERROR_MSGS.NULL_ARGUMENT);
        if (null == value) throw new Error(ERROR_MSGS.NULL_ARGUMENT);
        const entry = this._map.get(serviceIdentifier);
        void 0 !== entry ? entry.push(value) : this._map.set(serviceIdentifier, [ value ]);
    }
    get(serviceIdentifier) {
        if (null == serviceIdentifier) throw new Error(ERROR_MSGS.NULL_ARGUMENT);
        const entry = this._map.get(serviceIdentifier);
        if (void 0 !== entry) return entry;
        throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
    }
    remove(serviceIdentifier) {
        if (null == serviceIdentifier) throw new Error(ERROR_MSGS.NULL_ARGUMENT);
        if (!this._map.delete(serviceIdentifier)) throw new Error(ERROR_MSGS.KEY_NOT_FOUND);
    }
    removeIntersection(lookup) {
        this.traverse(((serviceIdentifier, value) => {
            const lookupActivations = lookup.hasKey(serviceIdentifier) ? lookup.get(serviceIdentifier) : void 0;
            if (void 0 !== lookupActivations) {
                const filteredValues = value.filter((lookupValue => !lookupActivations.some((moduleActivation => lookupValue === moduleActivation))));
                this._setValue(serviceIdentifier, filteredValues);
            }
        }));
    }
    removeByCondition(condition) {
        const removals = [];
        return this._map.forEach(((entries, key) => {
            const updatedEntries = [];
            for (const entry of entries) {
                condition(entry) ? removals.push(entry) : updatedEntries.push(entry);
            }
            this._setValue(key, updatedEntries);
        })), removals;
    }
    hasKey(serviceIdentifier) {
        if (null == serviceIdentifier) throw new Error(ERROR_MSGS.NULL_ARGUMENT);
        return this._map.has(serviceIdentifier);
    }
    clone() {
        const copy = new Lookup;
        return this._map.forEach(((value, key) => {
            value.forEach((b => copy.add(key, isClonable(b) ? b.clone() : b)));
        })), copy;
    }
    traverse(func) {
        this._map.forEach(((value, key) => {
            func(key, value);
        }));
    }
    _setValue(serviceIdentifier, value) {
        value.length > 0 ? this._map.set(serviceIdentifier, value) : this._map.delete(serviceIdentifier);
    }
}

export { Lookup };
//# sourceMappingURL=lookup.js.map
