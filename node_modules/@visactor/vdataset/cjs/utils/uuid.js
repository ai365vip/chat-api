"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getUUID = void 0;

let idIndex = 0;

const maxId = 1e8;

function getUUID(prefix = "dataset") {
    return idIndex > maxId && (idIndex = 0), prefix + "_" + idIndex++;
}

exports.getUUID = getUUID;
//# sourceMappingURL=uuid.js.map