const DEFAULT_ABSOLUTE_TOLERATE = 1e-10, DEFAULT_RELATIVE_TOLERATE = 1e-10;

export function isNumberClose(a, b, relTol = DEFAULT_RELATIVE_TOLERATE, absTol = DEFAULT_ABSOLUTE_TOLERATE) {
    const abs = absTol, rel = relTol * Math.max(a, b);
    return Math.abs(a - b) <= Math.max(abs, rel);
}

export function isGreater(a, b, relTol, absTol) {
    return a > b && !isNumberClose(a, b, relTol, absTol);
}

export function isLess(a, b, relTol, absTol) {
    return a < b && !isNumberClose(a, b, relTol, absTol);
}
//# sourceMappingURL=number.js.map
