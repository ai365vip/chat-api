const e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);

export function tickStep(start, stop, count) {
    const step0 = Math.abs(stop - start) / Math.max(0, count);
    let step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10));
    const error = step0 / step1;
    return error >= e10 ? step1 *= 10 : error >= e5 ? step1 *= 5 : error >= e2 && (step1 *= 2), 
    stop < start ? -step1 : step1;
}
//# sourceMappingURL=tickStep.js.map
