"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.randomLCG = void 0;

const a = 1664525, c = 1013904223, m = 4294967296;

function randomLCG(initS = 1) {
    let s = initS;
    return () => (s = (a * s + c) % m) / m;
}

exports.randomLCG = randomLCG;
//# sourceMappingURL=lcg.js.map