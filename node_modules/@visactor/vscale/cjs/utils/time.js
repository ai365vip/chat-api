"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getTickInterval = exports.toDateNumber = void 0;

const vutils_1 = require("@visactor/vutils"), timeIntervals = [ [ "second", 1, vutils_1.SECOND ], [ "second", 5, 5 * vutils_1.SECOND ], [ "second", 10, 10 * vutils_1.SECOND ], [ "second", 30, 30 * vutils_1.SECOND ], [ "minute", 1, vutils_1.MINUTE ], [ "minute", 5, 5 * vutils_1.MINUTE ], [ "minute", 10, 10 * vutils_1.MINUTE ], [ "minute", 30, 30 * vutils_1.MINUTE ], [ "hour", 1, vutils_1.HOUR ], [ "hour", 3, 3 * vutils_1.HOUR ], [ "hour", 6, 6 * vutils_1.HOUR ], [ "hour", 12, 12 * vutils_1.HOUR ], [ "day", 1, vutils_1.DAY ], [ "day", 2, 2 * vutils_1.DAY ], [ "day", 7, 7 * vutils_1.DAY ], [ "month", 1, vutils_1.MONTH ], [ "month", 3, 3 * vutils_1.MONTH ], [ "month", 6, 6 * vutils_1.MONTH ], [ "year", 1, 365 * vutils_1.DAY ] ];

function toDateNumber(t) {
    return +(0, vutils_1.toDate)(t);
}

function getTickInterval(min, max, tickCount, isUTC) {
    const target = (+max - +min) / tickCount, idx = (0, vutils_1.bisect)(timeIntervals.map((entry => entry[2])), target);
    if (idx === timeIntervals.length) {
        const step = Math.max((0, vutils_1.tickStep)(+min / vutils_1.YEAR, +max / vutils_1.YEAR, tickCount), 1), floor = date => (date[(0, 
        vutils_1.fullYearSetterName)(isUTC)](Math.floor(date[(0, vutils_1.fullYearGetterName)(isUTC)]() / step) * step), 
        date[(0, vutils_1.monthSetterName)(isUTC)](0, 1), date[(0, vutils_1.hoursSetterName)(isUTC)](0, 0, 0, 0), 
        date), offset = (date, s) => (date[(0, vutils_1.fullYearSetterName)(isUTC)](date[(0, 
        vutils_1.fullYearGetterName)(isUTC)]() + s * step), date);
        return {
            floor: floor,
            offset: offset,
            ceil: (0, vutils_1.generateCeil)(floor, offset)
        };
    }
    if (0 === idx) {
        const step = Math.max((0, vutils_1.tickStep)(+min, +max, tickCount), 1), floor = date => (date.setTime(Math.floor(+date / step) * step), 
        date), offset = (date, s) => (date.setTime(+date + s * step), date);
        return {
            floor: floor,
            offset: offset,
            ceil: (0, vutils_1.generateCeil)(floor, offset)
        };
    }
    const [timeUnit, step] = timeIntervals[target / timeIntervals[idx - 1][2] < timeIntervals[idx][2] / target ? idx - 1 : idx], simpleIntervalOptions = (0, 
    vutils_1.getIntervalOptions)(timeUnit, isUTC);
    return (0, vutils_1.generateStepInterval)(step, simpleIntervalOptions);
}

exports.toDateNumber = toDateNumber, exports.getTickInterval = getTickInterval;
//# sourceMappingURL=time.js.map