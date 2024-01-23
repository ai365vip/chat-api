import { SECOND, MINUTE, toDate, HOUR, DAY, MONTH, YEAR, fullYearSetterName, fullYearGetterName, monthSetterName, hoursSetterName, generateCeil, getIntervalOptions, generateStepInterval, bisect, tickStep } from "@visactor/vutils";

const timeIntervals = [ [ "second", 1, SECOND ], [ "second", 5, 5 * SECOND ], [ "second", 10, 10 * SECOND ], [ "second", 30, 30 * SECOND ], [ "minute", 1, MINUTE ], [ "minute", 5, 5 * MINUTE ], [ "minute", 10, 10 * MINUTE ], [ "minute", 30, 30 * MINUTE ], [ "hour", 1, HOUR ], [ "hour", 3, 3 * HOUR ], [ "hour", 6, 6 * HOUR ], [ "hour", 12, 12 * HOUR ], [ "day", 1, DAY ], [ "day", 2, 2 * DAY ], [ "day", 7, 7 * DAY ], [ "month", 1, MONTH ], [ "month", 3, 3 * MONTH ], [ "month", 6, 6 * MONTH ], [ "year", 1, 365 * DAY ] ];

export function toDateNumber(t) {
    return +toDate(t);
}

export function getTickInterval(min, max, tickCount, isUTC) {
    const target = (+max - +min) / tickCount, idx = bisect(timeIntervals.map((entry => entry[2])), target);
    if (idx === timeIntervals.length) {
        const step = Math.max(tickStep(+min / YEAR, +max / YEAR, tickCount), 1), floor = date => (date[fullYearSetterName(isUTC)](Math.floor(date[fullYearGetterName(isUTC)]() / step) * step), 
        date[monthSetterName(isUTC)](0, 1), date[hoursSetterName(isUTC)](0, 0, 0, 0), date), offset = (date, s) => (date[fullYearSetterName(isUTC)](date[fullYearGetterName(isUTC)]() + s * step), 
        date);
        return {
            floor: floor,
            offset: offset,
            ceil: generateCeil(floor, offset)
        };
    }
    if (0 === idx) {
        const step = Math.max(tickStep(+min, +max, tickCount), 1), floor = date => (date.setTime(Math.floor(+date / step) * step), 
        date), offset = (date, s) => (date.setTime(+date + s * step), date);
        return {
            floor: floor,
            offset: offset,
            ceil: generateCeil(floor, offset)
        };
    }
    const [timeUnit, step] = timeIntervals[target / timeIntervals[idx - 1][2] < timeIntervals[idx][2] / target ? idx - 1 : idx], simpleIntervalOptions = getIntervalOptions(timeUnit, isUTC);
    return generateStepInterval(step, simpleIntervalOptions);
}
//# sourceMappingURL=time.js.map