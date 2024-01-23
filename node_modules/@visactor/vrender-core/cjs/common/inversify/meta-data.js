"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Metadata = void 0;

const metadata_keys_1 = require("./metadata_keys");

class Metadata {
    constructor(key, value) {
        this.key = key, this.value = value;
    }
    toString() {
        return this.key === metadata_keys_1.NAMED_TAG ? `named: ${String(this.value).toString()} ` : `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
    }
}

exports.Metadata = Metadata;
//# sourceMappingURL=meta-data.js.map
