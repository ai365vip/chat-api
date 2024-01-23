import { cloneDeep, isObject } from "@visactor/vutils";

export const mergeDeepImmer = function(target, ...sources) {
    return mergeOption(cloneDeep(target), ...sources);
};

function _mergeOptionDeep(target, source, key) {
    const sourceValue = source[key];
    if (void 0 === sourceValue) target[key] = null; else if (isObject(sourceValue)) {
        isObject(target[key]) || (target[key] = {});
        for (const _key in sourceValue) _mergeOptionDeep(target[key], sourceValue, _key);
    } else target[key] = sourceValue;
}

function _mergeOptionBase(target, source) {
    if (isObject(source) && target !== source) for (const key in source) _mergeOptionDeep(target, source, key);
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