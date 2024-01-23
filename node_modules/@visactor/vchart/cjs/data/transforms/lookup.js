"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.lookup = void 0;

const vutils_1 = require("@visactor/vutils"), lookup = (data, opt) => {
    if (!opt.from || !opt.from()) return data;
    const fields = opt.fields, key = opt.key, values = opt.values, defaultValue = opt.default, as = opt.as || [ fields ], index = opt.from().reduce((function(map, obj) {
        return obj[fields] && map.set(obj[fields], obj), map;
    }), new Map);
    let set;
    if ((0, vutils_1.isFunction)(opt.set)) set = function(d) {
        const v = index.get(d[key]);
        opt.set(d, v);
    }; else if (values) {
        const m = values.length;
        set = function(d) {
            const v = index.get(d[key]);
            if ((0, vutils_1.isNil)(v)) for (let i = 0; i < m; ++i) d[as[i]] = defaultValue; else for (let i = 0; i < m; ++i) d[as[i]] = v[values[i]];
        };
    } else set = function(d) {
        const v = index.get(d[key]);
        d[as[0]] = (0, vutils_1.isValid)(v) ? v : defaultValue;
    };
    return 0 === data.length ? [] : data.map((d => (set(d), d)));
};

exports.lookup = lookup;
//# sourceMappingURL=lookup.js.map
