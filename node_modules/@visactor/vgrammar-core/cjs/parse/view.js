"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.normalizeRunningConfig = exports.normalizeMarkTree = exports.normalizePadding = exports.builtInSignals = exports.BuiltInSignalID = void 0;

const vutils_1 = require("@visactor/vutils"), constants_1 = require("../graph/constants"), constants_2 = require("../view/constants");

let markBaseId = -1;

exports.BuiltInSignalID = [ constants_2.SIGNAL_WIDTH, constants_2.SIGNAL_HEIGHT, constants_2.SIGNAL_PADDING, constants_2.SIGNAL_VIEW_WIDTH, constants_2.SIGNAL_VIEW_HEIGHT, constants_2.SIGNAL_VIEW_BOX, constants_2.SIGNAL_AUTOFIT ];

const builtInSignals = (option, config, theme) => {
    var _a, _b, _c, _d, _e;
    return [ {
        id: constants_2.SIGNAL_WIDTH,
        value: null !== (_a = option[constants_2.SIGNAL_WIDTH]) && void 0 !== _a ? _a : 0
    }, {
        id: constants_2.SIGNAL_HEIGHT,
        value: null !== (_b = option[constants_2.SIGNAL_HEIGHT]) && void 0 !== _b ? _b : 0
    }, {
        id: constants_2.SIGNAL_PADDING,
        value: (0, exports.normalizePadding)(null !== (_d = null !== (_c = option[constants_2.SIGNAL_PADDING]) && void 0 !== _c ? _c : config[constants_2.SIGNAL_PADDING]) && void 0 !== _d ? _d : null == theme ? void 0 : theme.padding)
    }, {
        id: constants_2.SIGNAL_VIEW_WIDTH,
        update: {
            callback: (signal, params) => {
                const padding = (0, exports.normalizePadding)(params[constants_2.SIGNAL_PADDING]);
                return params[constants_2.SIGNAL_WIDTH] - padding.left - padding.right;
            },
            dependency: [ constants_2.SIGNAL_WIDTH, constants_2.SIGNAL_PADDING ]
        }
    }, {
        id: constants_2.SIGNAL_VIEW_HEIGHT,
        update: {
            callback: (signal, params) => {
                const padding = (0, exports.normalizePadding)(params[constants_2.SIGNAL_PADDING]);
                return params[constants_2.SIGNAL_HEIGHT] - padding.top - padding.bottom;
            },
            dependency: [ constants_2.SIGNAL_HEIGHT, constants_2.SIGNAL_PADDING ]
        }
    }, {
        id: constants_2.SIGNAL_VIEW_BOX,
        update: {
            callback: (signal, params) => {
                const padding = (0, exports.normalizePadding)(params[constants_2.SIGNAL_PADDING]);
                return (signal || new vutils_1.Bounds).setValue(padding.left, padding.top, padding.left + params[constants_2.SIGNAL_VIEW_WIDTH], padding.top + params[constants_2.SIGNAL_VIEW_HEIGHT]);
            },
            dependency: [ constants_2.SIGNAL_VIEW_WIDTH, constants_2.SIGNAL_VIEW_HEIGHT, constants_2.SIGNAL_PADDING ]
        }
    }, {
        id: constants_2.SIGNAL_AUTOFIT,
        value: null !== (_e = option[constants_2.SIGNAL_AUTOFIT]) && void 0 !== _e ? _e : config[constants_2.SIGNAL_AUTOFIT]
    } ];
};

exports.builtInSignals = builtInSignals;

const normalizePadding = value => {
    var _a, _b, _c, _d;
    return (0, vutils_1.isNumber)(value) ? {
        top: value,
        bottom: value,
        left: value,
        right: value
    } : {
        top: null !== (_a = null == value ? void 0 : value.top) && void 0 !== _a ? _a : 0,
        bottom: null !== (_b = null == value ? void 0 : value.bottom) && void 0 !== _b ? _b : 0,
        left: null !== (_c = null == value ? void 0 : value.left) && void 0 !== _c ? _c : 0,
        right: null !== (_d = null == value ? void 0 : value.right) && void 0 !== _d ? _d : 0
    };
};

exports.normalizePadding = normalizePadding;

const normalizeMarkTree = spec => {
    var _a;
    const traverse = (spec, group) => {
        var _a, _b;
        spec.group = group;
        const id = null !== (_a = spec.id) && void 0 !== _a ? _a : "VGRAMMAR_MARK_" + ++markBaseId;
        spec.id = id, (null !== (_b = spec.marks) && void 0 !== _b ? _b : []).forEach((child => traverse(child, id)));
    };
    return (null !== (_a = spec.marks) && void 0 !== _a ? _a : []).forEach((mark => traverse(mark, "root"))), 
    spec;
};

exports.normalizeMarkTree = normalizeMarkTree;

const normalizeRunningConfig = runningConfig => {
    var _a, _b, _c, _d, _e;
    const {reuse: reuse = constants_1.DefaultReuse, morph: morph = constants_1.DefaultMorph, morphAll: morphAll = constants_1.DefaultMorphAll, animation: animation = {}, enableExitAnimation: enableExitAnimation = constants_1.DefaultEnableExitAnimation} = null != runningConfig ? runningConfig : {};
    return {
        reuse: reuse,
        morph: morph,
        morphAll: morphAll,
        animation: {
            easing: null !== (_a = animation.easing) && void 0 !== _a ? _a : constants_1.DefaultAnimationEasing,
            delay: null !== (_b = animation.delay) && void 0 !== _b ? _b : constants_1.DefaultAnimationDelay,
            duration: null !== (_c = animation.duration) && void 0 !== _c ? _c : constants_1.DefaultAnimationDuration,
            oneByOne: null !== (_d = animation.oneByOne) && void 0 !== _d ? _d : constants_1.DefaultAnimationOneByOne,
            splitPath: null !== (_e = animation.splitPath) && void 0 !== _e ? _e : constants_1.DefaultSplitPath
        },
        enableExitAnimation: enableExitAnimation
    };
};

exports.normalizeRunningConfig = normalizeRunningConfig;
//# sourceMappingURL=view.js.map
