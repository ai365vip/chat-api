import { isNil, array, isFunction } from "@visactor/vutils";

import { accessor, accessorFields } from "./accessor";

import { field } from "./field";

const DESCENDING = "desc";

export const ascending = (u, v) => {
    if ((u < v || isNil(u)) && !isNil(v)) return -1;
    if ((u > v || isNil(v)) && !isNil(u)) return 1;
    const numericV = v instanceof Date ? +v : v, numericU = u instanceof Date ? +u : u;
    return Number.isNaN(numericU) && !Number.isNaN(numericV) ? -1 : Number.isNaN(numericV) && !Number.isNaN(numericU) ? 1 : 0;
};

const compare1 = (fieldGetter, order) => (a, b) => ascending(fieldGetter(a), fieldGetter(b)) * order, compareN = (fields, orders, n) => (orders.push(0), 
(a, b) => {
    let f, c = 0, i = -1;
    for (;0 === c && i + 1 < n; ) i += 1, f = fields[i], c = ascending(f(a), f(b));
    return c * orders[i];
}), comparator = (fields, orders) => {
    return 1 === fields.length ? (fieldGetter = fields[0], order = orders[0], (a, b) => ascending(fieldGetter(a), fieldGetter(b)) * order) : compareN(fields, orders, fields.length);
    var fieldGetter, order;
};

export const compare = (fields, orders, opt = {}) => {
    const arrayOrders = array(orders) || [], ord = [], get = [], fmap = {}, gen = opt.comparator || comparator;
    return array(fields).forEach(((f, i) => {
        if (isNil(f)) return;
        ord.push("desc" === arrayOrders[i] ? -1 : 1);
        const fieldGetter = isFunction(f) ? f : field(f, null, opt);
        get.push(fieldGetter), (accessorFields(fieldGetter) || []).forEach((fieldStr => {
            fmap[fieldStr] = 1;
        }));
    })), 0 === get.length ? null : accessor(gen(get, ord), Object.keys(fmap));
};
//# sourceMappingURL=compare.js.map