"use strict";

function getFirstArrayDuplicate(array) {
    const seenValues = new Set;
    for (const entry of array) {
        if (seenValues.has(entry)) return entry;
        seenValues.add(entry);
    }
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getFirstArrayDuplicate = void 0, exports.getFirstArrayDuplicate = getFirstArrayDuplicate;
//# sourceMappingURL=js.js.map
