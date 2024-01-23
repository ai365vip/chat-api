import { bisect } from "@visactor/vutils";

export function identity(x) {
    return x;
}

export const generatePow = exponent => x => x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);

export const sqrt = x => x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);

export const square = x => x < 0 ? -x * x : x * x;

export const log = x => Math.log(x);

export const exp = x => Math.exp(x);

export const logNegative = x => -Math.log(-x);

export const expNegative = x => -Math.exp(-x);

export const pow10 = x => isFinite(x) ? Math.pow(10, x) : x < 0 ? 0 : x;

export const powp = base => 10 === base ? pow10 : base === Math.E ? Math.exp : x => Math.pow(base, x);

export const logp = base => base === Math.E ? Math.log : 10 === base ? Math.log10 : 2 === base ? Math.log2 : (base = Math.log(base), 
x => Math.log(x) / base);

export const symlog = c => x => Math.sign(x) * Math.log1p(Math.abs(x / c));

export const symexp = c => x => Math.sign(x) * Math.expm1(Math.abs(x)) * c;

export function normalize(a, b) {
    if (a = Number(a), b = Number(b), b -= a) return x => (x - a) / b;
    const result = Number.isNaN(b) ? NaN : .5;
    return () => result;
}

export function bimap(domain, range, interpolate) {
    const d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    let d0Fuc, r0Fuc;
    return d1 < d0 ? (d0Fuc = normalize(d1, d0), r0Fuc = interpolate(r1, r0)) : (d0Fuc = normalize(d0, d1), 
    r0Fuc = interpolate(r0, r1)), x => r0Fuc(d0Fuc(x));
}

export function bandSpace(count, paddingInner, paddingOuter) {
    let space;
    return space = 1 === count ? count + 2 * paddingOuter : count - paddingInner + 2 * paddingOuter, 
    count ? space > 0 ? space : 1 : 0;
}

export function scaleWholeRangeSize(count, bandwidth, paddingInner, paddingOuter) {
    1 === paddingInner && (paddingInner = 0);
    return bandSpace(count, paddingInner, paddingOuter) * (bandwidth / (1 - paddingInner));
}

export function calculateBandwidthFromWholeRangeSize(count, wholeSize, paddingInner, paddingOuter, round) {
    const space = bandSpace(count, paddingInner, paddingOuter);
    let step = wholeSize / Math.max(1, space || 1);
    round && (step = Math.floor(step));
    let bandwidth = step * (1 - paddingInner);
    return round && (bandwidth = Math.round(bandwidth)), bandwidth;
}

export function calculateWholeRangeFromRangeFactor(range, rangeFactor) {
    const k = (range[1] - range[0]) / (rangeFactor[1] - rangeFactor[0]), b = range[0] - k * rangeFactor[0];
    return [ b, k + b ];
}

export function polymap(domain, range, interpolate) {
    const j = Math.min(domain.length, range.length) - 1, d = new Array(j), r = new Array(j);
    let i = -1;
    for (domain[j] < domain[0] && (domain = domain.slice().reverse(), range = range.slice().reverse()); ++i < j; ) d[i] = normalize(domain[i], domain[i + 1]), 
    r[i] = interpolate(range[i], range[i + 1]);
    return function(x) {
        const i = bisect(domain, x, 1, j) - 1;
        return r[i](d[i](x));
    };
}

export const nice = (domain, options) => {
    const newDomain = domain.slice();
    let startIndex = 0, endIndex = newDomain.length - 1, x0 = newDomain[startIndex], x1 = newDomain[endIndex];
    return x1 < x0 && ([startIndex, endIndex] = [ endIndex, startIndex ], [x0, x1] = [ x1, x0 ]), 
    newDomain[startIndex] = options.floor(x0), newDomain[endIndex] = options.ceil(x1), 
    newDomain;
};

export const niceNumber = (value, round = !1) => {
    const exponent = Math.floor(Math.log10(value)), fraction = value / Math.pow(10, exponent);
    let niceFraction;
    return niceFraction = round ? fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10 : fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10, 
    niceFraction * Math.pow(10, exponent);
};

export const restrictNumber = (value, domain) => {
    let min, max;
    return domain[0] < domain[1] ? (min = domain[0], max = domain[1]) : (min = domain[1], 
    max = domain[0]), Math.min(Math.max(value, min), max);
};
//# sourceMappingURL=utils.js.map