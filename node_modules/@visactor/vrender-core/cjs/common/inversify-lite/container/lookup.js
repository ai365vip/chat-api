"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: !0,
        value: v
    });
} : function(o, v) {
    o.default = v;
}), __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (null != mod) for (var k in mod) "default" !== k && Object.prototype.hasOwnProperty.call(mod, k) && __createBinding(result, mod, k);
    return __setModuleDefault(result, mod), result;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Lookup = void 0;

const ERROR_MSGS = __importStar(require("../constants/error_msgs")), clonable_1 = require("../utils/clonable");

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
            value.forEach((b => copy.add(key, (0, clonable_1.isClonable)(b) ? b.clone() : b)));
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

exports.Lookup = Lookup;
//# sourceMappingURL=lookup.js.map
