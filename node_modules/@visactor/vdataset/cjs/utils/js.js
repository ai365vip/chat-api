"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.mergeDeepImmer = void 0;

const vutils_1 = require("@visactor/vutils"), mergeDeepImmer = function(target, ...sources) {
    return mergeOption((0, vutils_1.cloneDeep)(target), ...sources);
};

function _mergeOptionDeep(target, source, key) {
    const sourceValue = source[key];
    if (void 0 === sourceValue) target[key] = null; else if ((0, vutils_1.isObject)(sourceValue)) {
        (0, vutils_1.isObject)(target[key]) || (target[key] = {});
        for (const _key in sourceValue) _mergeOptionDeep(target[key], sourceValue, _key);
    } else target[key] = sourceValue;
}

function _mergeOptionBase(target, source) {
    if ((0, vutils_1.isObject)(source) && target !== source) for (const key in source) _mergeOptionDeep(target, source, key);
}

function mergeOption(target, ...sources) {
    target || (target = {});
    let sourceIndex = -1;
    const length = sources.length;
    for (;++sourceIndex < length; ) {
        _mergeOptionBase(target, sources[sourceIndex]);
    }
    return target;
}

//# sourceMappingURL=js.js.map
exports.mergeDeepImmer = mergeDeepImmer;