"use strict";

function registerDataSetInstanceTransform(dataSet, name, transform) {
    dataSet.getTransform(name) || dataSet.registerTransform(name, transform);
}

function registerDataSetInstanceParser(dataSet, name, parse) {
    dataSet.getParser(name) || dataSet.registerParser(name, parse);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerDataSetInstanceParser = exports.registerDataSetInstanceTransform = void 0, 
exports.registerDataSetInstanceTransform = registerDataSetInstanceTransform, exports.registerDataSetInstanceParser = registerDataSetInstanceParser;
//# sourceMappingURL=register.js.map