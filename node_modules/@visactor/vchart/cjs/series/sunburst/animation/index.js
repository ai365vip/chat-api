"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerSunburstAnimation = void 0;

const factory_1 = require("../../../core/factory"), enter_1 = require("./enter"), exit_1 = require("./exit"), preset_1 = require("./preset");

__exportStar(require("./preset"), exports), __exportStar(require("./enter"), exports), 
__exportStar(require("./exit"), exports), __exportStar(require("./preset"), exports), 
__exportStar(require("./interface"), exports);

const registerSunburstAnimation = () => {
    factory_1.Factory.registerAnimation("sunburst", ((params, preset) => ({
        appear: (0, preset_1.sunburstPresetAnimation)(params, preset),
        enter: (0, enter_1.sunburstEnter)(params),
        exit: (0, exit_1.sunburstExit)(params),
        disappear: (0, exit_1.sunburstExit)(params)
    })));
};

exports.registerSunburstAnimation = registerSunburstAnimation;
//# sourceMappingURL=index.js.map
