import { NAMED_TAG } from "./metadata_keys";

export class Metadata {
    constructor(key, value) {
        this.key = key, this.value = value;
    }
    toString() {
        return this.key === NAMED_TAG ? `named: ${String(this.value).toString()} ` : `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
    }
}
//# sourceMappingURL=meta-data.js.map
