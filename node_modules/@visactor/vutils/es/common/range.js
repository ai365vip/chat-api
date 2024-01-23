import isValid from "./isValid";

export function range(start, stop, step) {
    isValid(stop) || (stop = start, start = 0), isValid(step) || (step = 1);
    let i = -1;
    const n = 0 | Math.max(0, Math.ceil((stop - start) / step)), range = new Array(n);
    for (;++i < n; ) range[i] = start + i * step;
    return range;
}
//# sourceMappingURL=range.js.map
