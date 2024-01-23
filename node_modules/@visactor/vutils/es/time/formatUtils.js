import pad from "../common/pad";

import { toDate } from "../common/toDate";

export function fullYearGetterName(isUTC) {
    return isUTC ? "getUTCFullYear" : "getFullYear";
}

export function monthGetterName(isUTC) {
    return isUTC ? "getUTCMonth" : "getMonth";
}

export function dateGetterName(isUTC) {
    return isUTC ? "getUTCDate" : "getDate";
}

export function hoursGetterName(isUTC) {
    return isUTC ? "getUTCHours" : "getHours";
}

export function minutesGetterName(isUTC) {
    return isUTC ? "getUTCMinutes" : "getMinutes";
}

export function secondsGetterName(isUTC) {
    return isUTC ? "getUTCSeconds" : "getSeconds";
}

export function millisecondsGetterName(isUTC) {
    return isUTC ? "getUTCMilliseconds" : "getMilliseconds";
}

export function fullYearSetterName(isUTC) {
    return isUTC ? "setUTCFullYear" : "setFullYear";
}

export function monthSetterName(isUTC) {
    return isUTC ? "setUTCMonth" : "setMonth";
}

export function dateSetterName(isUTC) {
    return isUTC ? "setUTCDate" : "setDate";
}

export function hoursSetterName(isUTC) {
    return isUTC ? "setUTCHours" : "setHours";
}

export function minutesSetterName(isUTC) {
    return isUTC ? "setUTCMinutes" : "setMinutes";
}

export function secondsSetterName(isUTC) {
    return isUTC ? "setUTCSeconds" : "setSeconds";
}

export function millisecondsSetterName(isUTC) {
    return isUTC ? "setUTCMilliseconds" : "setMilliseconds";
}

export function getFormatFromValue(value, isUTC) {
    const date = toDate(value), M = date[monthGetterName(isUTC)]() + 1, d = date[dateGetterName(isUTC)](), h = date[hoursGetterName(isUTC)](), m = date[minutesGetterName(isUTC)](), s = date[secondsGetterName(isUTC)](), isSecond = 0 === date[millisecondsGetterName(isUTC)](), isMinute = isSecond && 0 === s, isHour = isMinute && 0 === m, isDay = isHour && 0 === h, isMonth = isDay && 1 === d;
    return isMonth && 1 === M ? "YYYY" : isMonth ? "YYYY-MM" : isDay ? "YYYY-MM-DD" : isHour ? "HH" : isMinute ? "HH:mm" : isSecond ? "HH:mm:ss" : "HH:mm:ss SSS";
}

export function getTimeFormatter(template, isUTC) {
    return time => {
        const date = toDate(time), y = date[fullYearGetterName(isUTC)](), M = date[monthGetterName(isUTC)]() + 1, q = Math.floor((M - 1) / 3) + 1, d = date[dateGetterName(isUTC)](), e = date["get" + (isUTC ? "UTC" : "") + "Day"](), H = date[hoursGetterName(isUTC)](), h = (H - 1) % 12 + 1, m = date[minutesGetterName(isUTC)](), s = date[secondsGetterName(isUTC)](), S = date[millisecondsGetterName(isUTC)]();
        return (template || "").replace(/YYYY/g, pad(y + "", 4, "0", "left")).replace(/yyyy/g, y + "").replace(/yy/g, y % 100 + "").replace(/Q/g, q + "").replace(/MM/g, pad(M, 2, "0", "left")).replace(/M/g, M + "").replace(/dd/g, pad(d, 2, "0", "left")).replace(/d/g, d + "").replace(/e/g, e + "").replace(/HH/g, pad(H, 2, "0", "left")).replace(/H/g, H + "").replace(/hh/g, pad(h + "", 2, "0", "left")).replace(/h/g, h + "").replace(/mm/g, pad(m, 2, "0", "left")).replace(/m/g, m + "").replace(/ss/g, pad(s, 2, "0", "left")).replace(/s/g, s + "").replace(/SSS/g, pad(S, 3, "0", "left")).replace(/S/g, S + "");
    };
}
//# sourceMappingURL=formatUtils.js.map
