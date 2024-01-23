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
}), exports.Metadata = void 0;

const METADATA_KEY = __importStar(require("../constants/metadata_keys"));

class Metadata {
    constructor(key, value) {
        this.key = key, this.value = value;
    }
    toString() {
        return this.key === METADATA_KEY.NAMED_TAG ? `named: ${String(this.value).toString()} ` : `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
    }
}

exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map
