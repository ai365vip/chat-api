"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.utcSecondOffset = exports.utcSecondFloor = exports.secondField = exports.secondCount = exports.secondOffset = exports.secondFloor = exports.utcMinuteField = exports.utcMinuteOffset = exports.utcMinuteFloor = exports.minuteField = exports.minuteCount = exports.minuteOffset = exports.minuteFloor = exports.utcHourField = exports.utcHourOffset = exports.utcHourFloor = exports.hourField = exports.hourCount = exports.hourOffset = exports.hourFloor = exports.utcDayField = exports.utcDayCount = exports.utcDayOffset = exports.utcDayFloor = exports.dayField = exports.dayCount = exports.dayOffset = exports.dayFloor = exports.utcMonthField = exports.utcMonthCount = exports.utcMonthOffset = exports.utcMonthFloor = exports.monthField = exports.monthCount = exports.monthOffset = exports.monthFloor = exports.utcYearField = exports.utcYearCount = exports.utcYearOffset = exports.utcYearFloor = exports.yearField = exports.yearCount = exports.yearOffset = exports.yearFloor = exports.YEAR = exports.MONTH = exports.DAY = exports.HOUR = exports.MINUTE = exports.SECOND = void 0, 
exports.getIntervalOptions = exports.generateStepInterval = exports.generateCount = exports.generateCeil = exports.millisecondsCount = exports.millisecondsOffset = exports.millisecondsFloor = exports.utcSecondField = void 0, 
exports.SECOND = 1e3, exports.MINUTE = 60 * exports.SECOND, exports.HOUR = 60 * exports.MINUTE, 
exports.DAY = 24 * exports.HOUR, exports.MONTH = 31 * exports.DAY, exports.YEAR = 365 * exports.DAY;

const yearFloor = date => (date.setMonth(0, 1), date.setHours(0, 0, 0, 0), date);

exports.yearFloor = yearFloor;

const yearOffset = (date, step) => (date.setFullYear(date.getFullYear() + step), 
date);

exports.yearOffset = yearOffset;

const yearCount = (start, end) => end.getFullYear() - start.getFullYear();

exports.yearCount = yearCount;

const yearField = date => date.getFullYear();

exports.yearField = yearField;

const utcYearFloor = date => (date.setUTCMonth(0, 1), date.setUTCHours(0, 0, 0, 0), 
date);

exports.utcYearFloor = utcYearFloor;

const utcYearOffset = (date, step) => (date.setUTCFullYear(date.getUTCFullYear() + step), 
date);

exports.utcYearOffset = utcYearOffset;

const utcYearCount = (start, end) => end.getUTCFullYear() - start.getUTCFullYear();

exports.utcYearCount = utcYearCount;

const utcYearField = date => date.getUTCFullYear();

exports.utcYearField = utcYearField;

const monthFloor = date => (date.setDate(1), date.setHours(0, 0, 0, 0), date);

exports.monthFloor = monthFloor;

const monthOffset = (date, step) => (date.setMonth(date.getMonth() + step), date);

exports.monthOffset = monthOffset;

const monthCount = (start, end) => end.getMonth() - start.getMonth() + 12 * (end.getFullYear() - start.getFullYear());

exports.monthCount = monthCount;

const monthField = date => date.getMonth();

exports.monthField = monthField;

const utcMonthFloor = date => (date.setUTCDate(1), date.setUTCHours(0, 0, 0, 0), 
date);

exports.utcMonthFloor = utcMonthFloor;

const utcMonthOffset = (date, step) => (date.setUTCMonth(date.getUTCMonth() + step), 
date);

exports.utcMonthOffset = utcMonthOffset;

const utcMonthCount = (start, end) => end.getUTCMonth() - start.getUTCMonth() + 12 * (end.getUTCFullYear() - start.getUTCFullYear());

exports.utcMonthCount = utcMonthCount;

const utcMonthField = date => date.getUTCMonth();

exports.utcMonthField = utcMonthField;

const dayFloor = date => (date.setHours(0, 0, 0, 0), date);

exports.dayFloor = dayFloor;

const dayOffset = (date, step) => (date.setDate(date.getDate() + step), date);

exports.dayOffset = dayOffset;

const dayCount = (start, end) => (+end - +start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * exports.MINUTE) / exports.DAY;

exports.dayCount = dayCount;

const dayField = date => date.getDate() - 1;

exports.dayField = dayField;

const utcDayFloor = date => (date.setUTCHours(0, 0, 0, 0), date);

exports.utcDayFloor = utcDayFloor;

const utcDayOffset = (date, step) => (date.setUTCDate(date.getUTCDate() + step), 
date);

exports.utcDayOffset = utcDayOffset;

const utcDayCount = (start, end) => (+end - +start) / exports.DAY;

exports.utcDayCount = utcDayCount;

const utcDayField = date => date.getUTCDate() - 1;

exports.utcDayField = utcDayField;

const hourFloor = date => (date.setTime(+date - date.getMilliseconds() - date.getSeconds() * exports.SECOND - date.getMinutes() * exports.MINUTE), 
date);

exports.hourFloor = hourFloor;

const hourOffset = (date, step) => (date.setHours(date.getHours() + step), date);

exports.hourOffset = hourOffset;

const hourCount = (start, end) => (+end - +start) / exports.HOUR;

exports.hourCount = hourCount;

const hourField = date => date.getHours();

exports.hourField = hourField;

const utcHourFloor = date => (date.setTime(+date - date.getUTCMilliseconds() - date.getUTCSeconds() * exports.SECOND - date.getUTCMinutes() * exports.MINUTE), 
date);

exports.utcHourFloor = utcHourFloor;

const utcHourOffset = (date, step) => (date.setUTCHours(date.getUTCHours() + step), 
date);

exports.utcHourOffset = utcHourOffset;

const utcHourField = date => date.getUTCHours();

exports.utcHourField = utcHourField;

const minuteFloor = date => (date.setTime(+date - date.getMilliseconds() - date.getSeconds() * exports.SECOND), 
date);

exports.minuteFloor = minuteFloor;

const minuteOffset = (date, step) => (date.setMinutes(date.getMinutes() + step), 
date);

exports.minuteOffset = minuteOffset;

const minuteCount = (start, end) => (+end - +start) / exports.MINUTE;

exports.minuteCount = minuteCount;

const minuteField = date => date.getMinutes();

exports.minuteField = minuteField;

const utcMinuteFloor = date => (date.setTime(+date - date.getUTCMilliseconds() - date.getUTCSeconds() * exports.SECOND), 
date);

exports.utcMinuteFloor = utcMinuteFloor;

const utcMinuteOffset = (date, step) => (date.setUTCMinutes(date.getUTCMinutes() + step), 
date);

exports.utcMinuteOffset = utcMinuteOffset;

const utcMinuteField = date => date.getUTCMinutes();

exports.utcMinuteField = utcMinuteField;

const secondFloor = date => (date.setTime(+date - date.getMilliseconds()), date);

exports.secondFloor = secondFloor;

const secondOffset = (date, step) => (date.setSeconds(date.getSeconds() + step), 
date);

exports.secondOffset = secondOffset;

const secondCount = (start, end) => (+end - +start) / exports.SECOND;

exports.secondCount = secondCount;

const secondField = date => date.getSeconds();

exports.secondField = secondField;

const utcSecondFloor = date => (date.setTime(+date - date.getUTCMilliseconds()), 
date);

exports.utcSecondFloor = utcSecondFloor;

const utcSecondOffset = (date, step) => (date.setUTCSeconds(date.getUTCSeconds() + step), 
date);

exports.utcSecondOffset = utcSecondOffset;

const utcSecondField = date => date.getUTCSeconds();

exports.utcSecondField = utcSecondField;

const millisecondsFloor = date => date;

exports.millisecondsFloor = millisecondsFloor;

const millisecondsOffset = (date, step) => (date.setTime(+date + step), date);

exports.millisecondsOffset = millisecondsOffset;

const millisecondsCount = (start, end) => +end - +start;

exports.millisecondsCount = millisecondsCount;

const generateCeil = (floor, offset) => date => {
    const n = new Date(+date - 1);
    return offset(n, 1), floor(n), n;
};

exports.generateCeil = generateCeil;

const generateCount = (floor, count) => (start, end) => {
    const a = new Date, b = new Date;
    return a.setTime(+start), b.setTime(+end), floor(a), floor(b), Math.floor(count(a, b));
};

exports.generateCount = generateCount;

const generateStepInterval = (step, {floor: floor, offset: offset, field: field, count: count}) => {
    const s = Math.floor(step);
    if (!Number.isFinite(s) || s <= 0) return null;
    if (s <= 1) return {
        floor: floor,
        offset: offset,
        ceil: (0, exports.generateCeil)(floor, offset)
    };
    const stepCount = (0, exports.generateCount)(floor, count), testFunc = field ? d => field(d) % s == 0 : d => stepCount(0, d) % s == 0, stepFloor = date => {
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
        ceil: (0, exports.generateCeil)(stepFloor, stepOffset)
    };
};

exports.generateStepInterval = generateStepInterval;

const getIntervalOptions = (type, isUTC) => "year" === type && isUTC ? {
    floor: exports.utcYearFloor,
    offset: exports.utcYearOffset,
    count: exports.utcYearCount,
    field: exports.utcYearField
} : "month" === type && isUTC ? {
    floor: exports.utcMonthFloor,
    offset: exports.utcMonthOffset,
    count: exports.utcMonthCount,
    field: exports.utcMonthField
} : "day" === type && isUTC ? {
    floor: exports.utcDayFloor,
    offset: exports.utcDayOffset,
    count: exports.utcDayCount,
    field: exports.utcDayField
} : "hour" === type && isUTC ? {
    floor: exports.utcHourFloor,
    offset: exports.utcHourOffset,
    count: exports.hourCount,
    field: exports.utcHourField
} : "minute" === type && isUTC ? {
    floor: exports.utcMinuteFloor,
    offset: exports.utcMinuteOffset,
    count: exports.minuteCount,
    field: exports.utcMinuteField
} : "second" === type && isUTC ? {
    floor: exports.utcSecondFloor,
    offset: exports.utcSecondOffset,
    count: exports.secondCount,
    field: exports.utcSecondField
} : "year" === type ? {
    floor: exports.yearFloor,
    offset: exports.yearOffset,
    count: exports.yearCount,
    field: exports.yearField
} : "month" === type ? {
    floor: exports.monthFloor,
    offset: exports.monthOffset,
    count: exports.monthCount,
    field: exports.monthField
} : "day" === type ? {
    floor: exports.dayFloor,
    offset: exports.dayOffset,
    count: exports.dayCount,
    field: exports.dayField
} : "hour" === type ? {
    floor: exports.hourFloor,
    offset: exports.hourOffset,
    count: exports.hourCount,
    field: exports.hourField
} : "minute" === type ? {
    floor: exports.minuteFloor,
    offset: exports.minuteOffset,
    count: exports.minuteCount,
    field: exports.minuteField
} : "second" === type ? {
    floor: exports.secondFloor,
    offset: exports.secondOffset,
    count: exports.secondCount,
    field: exports.secondField
} : {
    floor: exports.millisecondsFloor,
    offset: exports.millisecondsOffset,
    count: exports.millisecondsCount
};

exports.getIntervalOptions = getIntervalOptions;
//# sourceMappingURL=interval.js.map
