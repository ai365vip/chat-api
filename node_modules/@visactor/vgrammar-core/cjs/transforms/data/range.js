"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vutils_1 = require("@visactor/vutils"), transform = options => {
    const {start: start, stop: stop, step: step = 1, as: as = "data"} = options;
    return (0, vutils_1.range)(start, stop, step).map((val => ({
        [as]: val
    })));
};

exports.transform = transform;
//# sourceMappingURL=range.js.map
