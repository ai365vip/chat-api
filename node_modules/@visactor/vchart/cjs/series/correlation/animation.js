"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerCorrelationAnimation = exports.correlationPresetAnimation = void 0;

const factory_1 = require("../../core/factory"), config_1 = require("../../animation/config"), correlationPresetAnimation = (_params, preset) => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "scaleIn"
};

exports.correlationPresetAnimation = correlationPresetAnimation;

const registerCorrelationAnimation = () => {
    factory_1.Factory.registerAnimation("correlation", ((params, preset) => Object.assign({
        appear: (0, exports.correlationPresetAnimation)(params, preset)
    }, config_1.ScaleInOutAnimation)));
};

exports.registerCorrelationAnimation = registerCorrelationAnimation;
//# sourceMappingURL=animation.js.map
