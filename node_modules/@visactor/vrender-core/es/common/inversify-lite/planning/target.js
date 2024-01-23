import * as METADATA_KEY from "../constants/metadata_keys";

import { id } from "../utils/id";

import { getSymbolDescription } from "../utils/serialization";

import { Metadata } from "./metadata";

import { QueryableString } from "./queryable_string";

class Target {
    constructor(type, identifier, serviceIdentifier, namedOrTagged) {
        this.id = id(), this.type = type, this.serviceIdentifier = serviceIdentifier;
        const queryableName = "symbol" == typeof identifier ? getSymbolDescription(identifier) : identifier;
        this.name = new QueryableString(queryableName || ""), this.identifier = identifier, 
        this.metadata = [];
        let metadataItem = null;
        "string" == typeof namedOrTagged ? metadataItem = new Metadata(METADATA_KEY.NAMED_TAG, namedOrTagged) : namedOrTagged instanceof Metadata && (metadataItem = namedOrTagged), 
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

export { Target };
//# sourceMappingURL=target.js.map
