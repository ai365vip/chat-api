import isArray from "./isArray";

import isDate from "./isDate";

import isRegExp from "./isRegExp";

function getRegExpFlags(re) {
    let flags = "";
    return re.global && (flags += "g"), re.ignoreCase && (flags += "i"), re.multiline && (flags += "m"), 
    flags;
}

export default function clone(parent, circular = !1, depth = 0, prototype = void 0) {
    const allParents = [], allChildren = [];
    return void 0 === circular && (circular = !0), void 0 === depth && (depth = 1 / 0), 
    function _clone(parent, depth) {
        if (null === parent) return null;
        if (0 === depth) return parent;
        let child;
        if ("object" != typeof parent) return parent;
        if (isArray(parent) ? child = [] : isRegExp(parent) ? (child = new RegExp(parent.source, getRegExpFlags(parent)), 
        parent.lastIndex && (child.lastIndex = parent.lastIndex)) : child = isDate(parent) ? new Date(parent.getTime()) : void 0 === prototype ? Object.create(Object.getPrototypeOf(parent)) : Object.create(prototype), 
        circular) {
            const index = allParents.indexOf(parent);
            if (-1 !== index) return allChildren[index];
            allParents.push(parent), allChildren.push(child);
        }
        for (const i in parent) child[i] = _clone(parent[i], depth - 1);
        return child;
    }(parent, depth);
}
//# sourceMappingURL=clone.js.map