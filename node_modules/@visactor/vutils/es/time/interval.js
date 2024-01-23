export const SECOND = 1e3;

export const MINUTE = 6e4;

export const HOUR = 36e5;

export const DAY = 24 * HOUR;

export const MONTH = 31 * DAY;

export const YEAR = 365 * DAY;

export const yearFloor = date => (date.setMonth(0, 1), date.setHours(0, 0, 0, 0), 
date);

export const yearOffset = (date, step) => (date.setFullYear(date.getFullYear() + step), 
date);

export const yearCount = (start, end) => end.getFullYear() - start.getFullYear();

export const yearField = date => date.getFullYear();

export const utcYearFloor = date => (date.setUTCMonth(0, 1), date.setUTCHours(0, 0, 0, 0), 
date);

export const utcYearOffset = (date, step) => (date.setUTCFullYear(date.getUTCFullYear() + step), 
date);

export const utcYearCount = (start, end) => end.getUTCFullYear() - start.getUTCFullYear();

export const utcYearField = date => date.getUTCFullYear();

export const monthFloor = date => (date.setDate(1), date.setHours(0, 0, 0, 0), date);

export const monthOffset = (date, step) => (date.setMonth(date.getMonth() + step), 
date);

export const monthCount = (start, end) => end.getMonth() - start.getMonth() + 12 * (end.getFullYear() - start.getFullYear());

export const monthField = date => date.getMonth();

export const utcMonthFloor = date => (date.setUTCDate(1), date.setUTCHours(0, 0, 0, 0), 
date);

export const utcMonthOffset = (date, step) => (date.setUTCMonth(date.getUTCMonth() + step), 
date);

export const utcMonthCount = (start, end) => end.getUTCMonth() - start.getUTCMonth() + 12 * (end.getUTCFullYear() - start.getUTCFullYear());

export const utcMonthField = date => date.getUTCMonth();

export const dayFloor = date => (date.setHours(0, 0, 0, 0), date);

export const dayOffset = (date, step) => (date.setDate(date.getDate() + step), date);

export const dayCount = (start, end) => (+end - +start - 6e4 * (end.getTimezoneOffset() - start.getTimezoneOffset())) / DAY;

export const dayField = date => date.getDate() - 1;

export const utcDayFloor = date => (date.setUTCHours(0, 0, 0, 0), date);

export const utcDayOffset = (date, step) => (date.setUTCDate(date.getUTCDate() + step), 
date);

export const utcDayCount = (start, end) => (+end - +start) / DAY;

export const utcDayField = date => date.getUTCDate() - 1;

export const hourFloor = date => (date.setTime(+date - date.getMilliseconds() - 1e3 * date.getSeconds() - 6e4 * date.getMinutes()), 
date);

export const hourOffset = (date, step) => (date.setHours(date.getHours() + step), 
date);

export const hourCount = (start, end) => (+end - +start) / HOUR;

export const hourField = date => date.getHours();

export const utcHourFloor = date => (date.setTime(+date - date.getUTCMilliseconds() - 1e3 * date.getUTCSeconds() - 6e4 * date.getUTCMinutes()), 
date);

export const utcHourOffset = (date, step) => (date.setUTCHours(date.getUTCHours() + step), 
date);

export const utcHourField = date => date.getUTCHours();

export const minuteFloor = date => (date.setTime(+date - date.getMilliseconds() - 1e3 * date.getSeconds()), 
date);

export const minuteOffset = (date, step) => (date.setMinutes(date.getMinutes() + step), 
date);

export const minuteCount = (start, end) => (+end - +start) / 6e4;

export const minuteField = date => date.getMinutes();

export const utcMinuteFloor = date => (date.setTime(+date - date.getUTCMilliseconds() - 1e3 * date.getUTCSeconds()), 
date);

export const utcMinuteOffset = (date, step) => (date.setUTCMinutes(date.getUTCMinutes() + step), 
date);

export const utcMinuteField = date => date.getUTCMinutes();

export const secondFloor = date => (date.setTime(+date - date.getMilliseconds()), 
date);

export const secondOffset = (date, step) => (date.setSeconds(date.getSeconds() + step), 
date);

export const secondCount = (start, end) => (+end - +start) / 1e3;

export const secondField = date => date.getSeconds();

export const utcSecondFloor = date => (date.setTime(+date - date.getUTCMilliseconds()), 
date);

export const utcSecondOffset = (date, step) => (date.setUTCSeconds(date.getUTCSeconds() + step), 
date);

export const utcSecondField = date => date.getUTCSeconds();

export const millisecondsFloor = date => date;

export const millisecondsOffset = (date, step) => (date.setTime(+date + step), date);

export const millisecondsCount = (start, end) => +end - +start;

export const generateCeil = (floor, offset) => date => {
    const n = new Date(+date - 1);
    return offset(n, 1), floor(n), n;
};

export const generateCount = (floor, count) => (start, end) => {
    const a = new Date, b = new Date;
    return a.setTime(+start), b.setTime(+end), floor(a), floor(b), Math.floor(count(a, b));
};

export const generateStepInterval = (step, {floor: floor, offset: offset, field: field, count: count}) => {
    const s = Math.floor(step);
    if (!Number.isFinite(s) || s <= 0) return null;
    if (s <= 1) return {
        floor: floor,
        offset: offset,
        ceil: generateCeil(floor, offset)
    };
    const stepCount = generateCount(floor, count), testFunc = field ? d => field(d) % s == 0 : d => stepCount(0, d) % s == 0, stepFloor = date => {
        if (!Number.isNaN(+date)) for (floor(date); !testFunc(date); ) date.setTime(+date - 1), 
        floor(date);
        return date;
    }, stepOffset = (date, stepCount) => {
        if (!Number.isNaN(+date)) if (s < 0) for (;++stepCount <= 0; ) for (offset(date, -1); !testFunc(date); ) offset(date, -1); else for (;--stepCount >= 0; ) for (offset(date, 1); !testFunc(date); ) offset(date, 1);
        return date;
    };
    return {
        floor: stepFloor,
        offset: stepOffset,
        ceil: generateCeil(stepFloor, stepOffset)
    };
};

export const getIntervalOptions = (type, isUTC) => "year" === type && isUTC ? {
    floor: utcYearFloor,
    offset: utcYearOffset,
    count: utcYearCount,
    field: utcYearField
} : "month" === type && isUTC ? {
    floor: utcMonthFloor,
    offset: utcMonthOffset,
    count: utcMonthCount,
    field: utcMonthField
} : "day" === type && isUTC ? {
    floor: utcDayFloor,
    offset: utcDayOffset,
    count: utcDayCount,
    field: utcDayField
} : "hour" === type && isUTC ? {
    floor: utcHourFloor,
    offset: utcHourOffset,
    count: hourCount,
    field: utcHourField
} : "minute" === type && isUTC ? {
    floor: utcMinuteFloor,
    offset: utcMinuteOffset,
    count: minuteCount,
    field: utcMinuteField
} : "second" === type && isUTC ? {
    floor: utcSecondFloor,
    offset: utcSecondOffset,
    count: secondCount,
    field: utcSecondField
} : "year" === type ? {
    floor: yearFloor,
    offset: yearOffset,
    count: yearCount,
    field: yearField
} : "month" === type ? {
    floor: monthFloor,
    offset: monthOffset,
    count: monthCount,
    field: monthField
} : "day" === type ? {
    floor: dayFloor,
    offset: dayOffset,
    count: dayCount,
    field: dayField
} : "hour" === type ? {
    floor: hourFloor,
    offset: hourOffset,
    count: hourCount,
    field: hourField
} : "minute" === type ? {
    floor: minuteFloor,
    offset: minuteOffset,
    count: minuteCount,
    field: minuteField
} : "second" === type ? {
    floor: secondFloor,
    offset: secondOffset,
    count: secondCount,
    field: secondField
} : {
    floor: millisecondsFloor,
    offset: millisecondsOffset,
    count: millisecondsCount
};
//# sourceMappingURL=interval.js.map
