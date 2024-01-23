"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.restrictNumber = exports.niceNumber = exports.nice = exports.polymap = exports.calculateWholeRangeFromRangeFactor = exports.calculateBandwidthFromWholeRangeSize = exports.scaleWholeRangeSize = exports.bandSpace = exports.bimap = exports.normalize = exports.symexp = exports.symlog = exports.logp = exports.powp = exports.pow10 = exports.expNegative = exports.logNegative = exports.exp = exports.log = exports.square = exports.sqrt = exports.generatePow = exports.identity = void 0;

const vutils_1 = require("@visactor/vutils");

function identity(x) {
    return x;
}

exports.identity = identity;

const generatePow = exponent => x => x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);

exports.generatePow = generatePow;

const sqrt = x => x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);

exports.sqrt = sqrt;

const square = x => x < 0 ? -x * x : x * x;

exports.square = square;

const log = x => Math.log(x);

exports.log = log;

const exp = x => Math.exp(x);

exports.exp = exp;

const logNegative = x => -Math.log(-x);

exports.logNegative = logNegative;

const expNegative = x => -Math.exp(-x);

exports.expNegative = expNegative;

const pow10 = x => isFinite(x) ? Math.pow(10, x) : x < 0 ? 0 : x;

exports.pow10 = pow10;

const powp = base => 10 === base ? exports.pow10 : base === Math.E ? Math.exp : x => Math.pow(base, x);

exports.powp = powp;

const logp = base => base === Math.E ? Math.log : 10 === base ? Math.log10 : 2 === base ? Math.log2 : (base = Math.log(base), 
x => Math.log(x) / base);

exports.logp = logp;

const symlog = c => x => Math.sign(x) * Math.log1p(Math.abs(x / c));

exports.symlog = symlog;

const symexp = c => x => Math.sign(x) * Math.expm1(Math.abs(x)) * c;

function normalize(a, b) {
    if (a = Number(a), b = Number(b), b -= a) return x => (x - a) / b;
    const result = Number.isNaN(b) ? NaN : .5;
    return () => result;
}

function bimap(domain, range, interpolate) {
    const d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    let d0Fuc, r0Fuc;
    return d1 < d0 ? (d0Fuc = normalize(d1, d0), r0Fuc = interpolate(r1, r0)) : (d0Fuc = normalize(d0, d1), 
    r0Fuc = interpolate(r0, r1)), x => r0Fuc(d0Fuc(x));
}

function bandSpace(count, paddingInner, paddingOuter) {
    let space;
    return space = 1 === count ? count + 2 * paddingOuter : count - paddingInner + 2 * paddingOuter, 
    count ? space > 0 ? space : 1 : 0;
}

function scaleWholeRangeSize(count, bandwidth, paddingInner, paddingOuter) {
    1 === paddingInner && (paddingInner = 0);
    return bandSpace(count, paddingInner, paddingOuter) * (bandwidth / (1 - paddingInner));
}

function calculateBandwidthFromWholeRangeSize(count, wholeSize, paddingInner, paddingOuter, round) {
    const space = bandSpace(count, paddingInner, paddingOuter);
    let step = wholeSize / Math.max(1, space || 1);
    round && (step = Math.floor(step));
    let bandwidth = step * (1 - paddingInner);
    return round && (bandwidth = Math.round(bandwidth)), bandwidth;
}

function calculateWholeRangeFromRangeFactor(range, rangeFactor) {
    const k = (range[1] - range[0]) / (rangeFactor[1] - rangeFactor[0]), b = range[0] - k * rangeFactor[0];
    return [ b, k + b ];
}

function polymap(domain, range, interpolate) {
    const j = Math.min(domain.length, range.length) - 1, d = new Array(j), r = new Array(j);
    let i = -1;
    for (domain[j] < domain[0] && (domain = domain.slice().reverse(), range = range.slice().reverse()); ++i < j; ) d[i] = normalize(domain[i], domain[i + 1]), 
    r[i] = interpolate(range[i], range[i + 1]);
    return function(x) {
        const i = (0, vutils_1.bisect)(domain, x, 1, j) - 1;
        return r[i](d[i](x));
    };
}

exports.symexp = symexp, exports.normalize = normalize, exports.bimap = bimap, exports.bandSpace = bandSpace, 
exports.scaleWholeRangeSize = scaleWholeRangeSize, exports.calculateBandwidthFromWholeRangeSize = calculateBandwidthFromWholeRangeSize, 
exports.calculateWholeRangeFromRangeFactor = calculateWholeRangeFromRangeFactor, 
exports.polymap = polymap;

const nice = (domain, options) => {
    const newDomain = domain.slice();
    let startIndex = 0, endIndex = newDomain.length - 1, x0 = newDomain[startIndex], x1 = newDomain[endIndex];
    return x1 < x0 && ([startIndex, endIndex] = [ endIndex, startIndex ], [x0, x1] = [ x1, x0 ]), 
    newDomain[startIndex] = options.floor(x0), newDomain[endIndex] = options.ceil(x1), 
    newDomain;
};

exports.nice = nice;

const niceNumber = (value, round = !1) => {
    const exponent = Math.floor(Math.log10(value)), fraction = value / Math.pow(10, exponent);
    let niceFraction;
    return niceFraction = round ? fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10 : fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10, 
    niceFraction * Math.pow(10, exponent);
};

exports.niceNumber = niceNumber;

const restrictNumber = (value, domain) => {
    let min, max;
    return domain[0] < domain[1] ? (min = domain[0], max = domain[1]) : (min = domain[1], 
    max = domain[0]), Math.min(Math.max(value, min), max);
};

exports.restrictNumber = restrictNumber;
//# sourceMappingURL=utils.js.map