"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vutils_1 = require("@visactor/vutils"), COUNTER_NAME = ":vGrammar_identifier:", transform = (options, upstreamData, params, view) => {
    (0, vutils_1.isNil)(view[COUNTER_NAME]) && (view[COUNTER_NAME] = 0);
    let id = view[COUNTER_NAME];
    const as = options.as;
    return upstreamData.forEach((entry => {
        entry && (0, vutils_1.isNil)(entry[as]) && (id += 1, entry[as] = id);
    })), view[COUNTER_NAME] = id, id;
};

exports.transform = transform;
//# sourceMappingURL=identifier.js.map
