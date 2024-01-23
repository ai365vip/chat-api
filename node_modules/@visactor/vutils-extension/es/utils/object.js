import { get, isArray, isFunction, isNil, isObject } from "@visactor/vutils";

export const includeSpec = (spec, searchSpec) => spec === searchSpec || !isFunction(spec) && !isFunction(searchSpec) && (isArray(spec) && isArray(searchSpec) ? searchSpec.every((searchItem => spec.some((item => includeSpec(item, searchItem))))) : !(!isObject(spec) || !isObject(searchSpec)) && Object.keys(searchSpec).every((key => includeSpec(spec[key], searchSpec[key]))));

export const setProperty = (target, path, value) => {
    if (isNil(path)) return target;
    const key = path[0];
    return isNil(key) ? target : 1 === path.length ? (target[key] = value, target) : (isNil(target[key]) && ("number" == typeof path[1] ? target[key] = [] : target[key] = {}), 
    setProperty(target[key], path.slice(1), value));
};

export const getProperty = (target, path, defaultValue) => {
    if (!isNil(path)) return get(target, path, defaultValue);
};
//# sourceMappingURL=object.js.map