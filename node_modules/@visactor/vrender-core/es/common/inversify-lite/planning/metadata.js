import * as METADATA_KEY from "../constants/metadata_keys";

class Metadata {
    constructor(key, value) {
        this.key = key, this.value = value;
    }
    toString() {
        return this.key === METADATA_KEY.NAMED_TAG ? `named: ${String(this.value).toString()} ` : `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
    }
}

export { Metadata };
//# sourceMappingURL=metadata.js.map
