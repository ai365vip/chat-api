"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initNodeEnv = exports.initBrowserEnv = exports.initAutoEnv = void 0;

const vrender_kits_1 = require("@visactor/vrender-kits");

Object.defineProperty(exports, "initBrowserEnv", {
    enumerable: !0,
    get: function() {
        return vrender_kits_1.initBrowserEnv;
    }
}), Object.defineProperty(exports, "initNodeEnv", {
    enumerable: !0,
    get: function() {
        return vrender_kits_1.initNodeEnv;
    }
});

const vrender_core_1 = require("@visactor/vrender-core"), initAutoEnv = () => {
    (0, vrender_core_1.isBrowserEnv)() ? (0, vrender_kits_1.initBrowserEnv)() : (0, 
    vrender_core_1.isNodeEnv)() && (0, vrender_kits_1.initNodeEnv)();
};

exports.initAutoEnv = initAutoEnv;