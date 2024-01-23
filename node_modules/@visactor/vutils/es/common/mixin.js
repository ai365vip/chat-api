export function keys(obj) {
    if (!obj) return [];
    if (Object.keys) return Object.keys(obj);
    const keyList = [];
    for (const key in obj) obj.hasOwnProperty(key) && keyList.push(key);
    return keyList;
}

export function defaults(target, source, overlay) {
    const keysArr = keys(source);
    for (let i = 0; i < keysArr.length; i++) {
        const key = keysArr[i];
        (overlay ? null != source[key] : null == target[key]) && (target[key] = source[key]);
    }
    return target;
}

export function mixin(target, source, override = !0) {
    if (target = "prototype" in target ? target.prototype : target, source = "prototype" in source ? source.prototype : source, 
    Object.getOwnPropertyNames) {
        const keyList = Object.getOwnPropertyNames(source);
        for (let i = 0; i < keyList.length; i++) {
            const key = keyList[i];
            "constructor" !== key && (override ? null != source[key] : null == target[key]) && (target[key] = source[key]);
        }
    } else defaults(target, source, override);
}
//# sourceMappingURL=mixin.js.map
