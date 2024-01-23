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
}), exports.Target = void 0;

const METADATA_KEY = __importStar(require("../constants/metadata_keys")), id_1 = require("../utils/id"), serialization_1 = require("../utils/serialization"), metadata_1 = require("./metadata"), queryable_string_1 = require("./queryable_string");

class Target {
    constructor(type, identifier, serviceIdentifier, namedOrTagged) {
        this.id = (0, id_1.id)(), this.type = type, this.serviceIdentifier = serviceIdentifier;
        const queryableName = "symbol" == typeof identifier ? (0, serialization_1.getSymbolDescription)(identifier) : identifier;
        this.name = new queryable_string_1.QueryableString(queryableName || ""), this.identifier = identifier, 
        this.metadata = [];
        let metadataItem = null;
        "string" == typeof namedOrTagged ? metadataItem = new metadata_1.Metadata(METADATA_KEY.NAMED_TAG, namedOrTagged) : namedOrTagged instanceof metadata_1.Metadata && (metadataItem = namedOrTagged), 
        null !== metadataItem && this.metadata.push(metadataItem);
    }
    hasTag(key) {
        for (const m of this.metadata) if (m.key === key) return !0;
        return !1;
    }
    isArray() {
        return this.hasTag(METADATA_KEY.MULTI_INJECT_TAG);
    }
    matchesArray(name) {
        return this.matchesTag(METADATA_KEY.MULTI_INJECT_TAG)(name);
    }
    isNamed() {
        return this.hasTag(METADATA_KEY.NAMED_TAG);
    }
    isTagged() {
        return this.metadata.some((metadata => METADATA_KEY.NON_CUSTOM_TAG_KEYS.every((key => metadata.key !== key))));
    }
    isOptional() {
        return this.matchesTag(METADATA_KEY.OPTIONAL_TAG)(!0);
    }
    getNamedTag() {
        return this.isNamed() ? this.metadata.filter((m => m.key === METADATA_KEY.NAMED_TAG))[0] : null;
    }
    getCustomTags() {
        return this.isTagged() ? this.metadata.filter((metadata => METADATA_KEY.NON_CUSTOM_TAG_KEYS.every((key => metadata.key !== key)))) : null;
    }
    matchesNamedTag(name) {
        return this.matchesTag(METADATA_KEY.NAMED_TAG)(name);
    }
    matchesTag(key) {
        return value => {
            for (const m of this.metadata) if (m.key === key && m.value === value) return !0;
            return !1;
        };
    }
}

exports.Target = Target;
//# sourceMappingURL=target.js.map
