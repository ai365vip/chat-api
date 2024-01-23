import { compare } from "@visactor/vgrammar-util";

import { isFunction } from "@visactor/vutils";

export const transform = (options, upstreamData) => {
    const sort = options.sort;
    if (sort && upstreamData) {
        const sortFn = isFunction(sort) ? sort : compare(sort.field, sort.order);
        upstreamData.sort(((a, b) => sortFn(a, b)));
    }
    return upstreamData;
};
//# sourceMappingURL=sort.js.map
