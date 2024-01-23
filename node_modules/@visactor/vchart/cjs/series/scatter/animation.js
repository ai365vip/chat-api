"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerScatterAnimation = exports.scatterPresetAnimation = void 0;

const factory_1 = require("../../core/factory"), config_1 = require("../../animation/config"), scatterPresetAnimation = (_params, preset) => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "scaleIn"
};

exports.scatterPresetAnimation = scatterPresetAnimation;

const registerScatterAnimation = () => {
    factory_1.Factory.registerAnimation("scatter", ((params, preset) => Object.assign({
        appear: (0, exports.scatterPresetAnimation)(params, preset)
    }, config_1.ScaleInOutAnimation)));
};

exports.registerScatterAnimation = registerScatterAnimation;
//# sourceMappingURL=animation.js.map
