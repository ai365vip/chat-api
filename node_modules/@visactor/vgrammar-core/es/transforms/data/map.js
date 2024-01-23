import { isNil } from "@visactor/vutils";

export const transform = (options, upstreamData, params) => {
    const func = options.callback, as = options.as;
    if (!options.all) return upstreamData.forEach((entry => {
        const data = func(entry, params);
        if (!isNil(as)) {
            if (isNil(entry)) return;
            entry[as] = data;
        }
        return data;
    })), upstreamData;
    const data = func(upstreamData, params);
    return isNil(as) || isNil(upstreamData) ? data : (upstreamData[as] = data, upstreamData);
};
//# sourceMappingURL=map.js.map
