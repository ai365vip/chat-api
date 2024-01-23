import { isFunction } from "./type";

export function eachSeries(regions, callback, filter) {
    let flag = !1;
    if (callback && isFunction(callback)) for (const r of regions) for (const s of r.getSeries(filter)) if (flag = !!callback.call(null, s), 
    flag) return flag;
    return flag;
}

export function getSeries(regions, filter) {
    const result = [];
    for (const r of regions) for (const s of r.getSeries(filter)) result.push(s);
    return result;
}

export const getFirstSeries = (regions, coordinateType) => {
    for (let i = 0; i < regions.length; i++) {
        const series = regions[i].getSeries();
        for (let j = 0; j < series.length; j++) {
            const s = series[j];
            if (coordinateType && s && s.coordinate === coordinateType) return s;
            if (!coordinateType && s) return s;
        }
    }
    return null;
};
//# sourceMappingURL=model.js.map
