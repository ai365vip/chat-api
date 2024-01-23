"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.configureEnvironment = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

function configureEnvironment(options) {
    options.mode && vrender_core_1.vglobal.setEnv(options.mode, options.modeParams || {});
}

exports.configureEnvironment = configureEnvironment;
//# sourceMappingURL=env.js.map
