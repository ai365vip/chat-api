"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.compare = exports.ascending = void 0;

const vutils_1 = require("@visactor/vutils"), accessor_1 = require("./accessor"), field_1 = require("./field"), DESCENDING = "desc", ascending = (u, v) => {
    if ((u < v || (0, vutils_1.isNil)(u)) && !(0, vutils_1.isNil)(v)) return -1;
    if ((u > v || (0, vutils_1.isNil)(v)) && !(0, vutils_1.isNil)(u)) return 1;
    const numericV = v instanceof Date ? +v : v, numericU = u instanceof Date ? +u : u;
    return Number.isNaN(numericU) && !Number.isNaN(numericV) ? -1 : Number.isNaN(numericV) && !Number.isNaN(numericU) ? 1 : 0;
};

exports.ascending = ascending;

const compare1 = (fieldGetter, order) => (a, b) => (0, exports.ascending)(fieldGetter(a), fieldGetter(b)) * order, compareN = (fields, orders, n) => (orders.push(0), 
(a, b) => {
    let f, c = 0, i = -1;
    for (;0 === c && i + 1 < n; ) i += 1, f = fields[i], c = (0, exports.ascending)(f(a), f(b));
    return c * orders[i];
}), comparator = (fields, orders) => {
    return 1 === fields.length ? (fieldGetter = fields[0], order = orders[0], (a, b) => (0, 
    exports.ascending)(fieldGetter(a), fieldGetter(b)) * order) : compareN(fields, orders, fields.length);
    var fieldGetter, order;
}, compare = (fields, orders, opt = {}) => {
    const arrayOrders = (0, vutils_1.array)(orders) || [], ord = [], get = [], fmap = {}, gen = opt.comparator || comparator;
    return (0, vutils_1.array)(fields).forEach(((f, i) => {
        if ((0, vutils_1.isNil)(f)) return;
        ord.push("desc" === arrayOrders[i] ? -1 : 1);
        const fieldGetter = (0, vutils_1.isFunction)(f) ? f : (0, field_1.field)(f, null, opt);
        get.push(fieldGetter), ((0, accessor_1.accessorFields)(fieldGetter) || []).forEach((fieldStr => {
            fmap[fieldStr] = 1;
        }));
    })), 0 === get.length ? null : (0, accessor_1.accessor)(gen(get, ord), Object.keys(fmap));
};

exports.compare = compare;
//# sourceMappingURL=compare.js.map