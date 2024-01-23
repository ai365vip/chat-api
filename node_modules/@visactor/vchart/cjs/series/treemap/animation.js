"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerTreemapAnimation = exports.treemapPresetAnimation = void 0;

const factory_1 = require("../../core/factory"), treemapPresetAnimation = preset => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "growCenterIn"
};

exports.treemapPresetAnimation = treemapPresetAnimation;

const registerTreemapAnimation = () => {
    factory_1.Factory.registerAnimation("treemap", ((params, preset) => ({
        appear: (0, exports.treemapPresetAnimation)(preset),
        enter: {
            type: "growCenterIn"
        },
        exit: {
            type: "growCenterOut"
        },
        disappear: {
            type: "growCenterOut"
        }
    })));
};

exports.registerTreemapAnimation = registerTreemapAnimation;
//# sourceMappingURL=animation.js.map
