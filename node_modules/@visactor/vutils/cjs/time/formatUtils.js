"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getTimeFormatter = exports.getFormatFromValue = exports.millisecondsSetterName = exports.secondsSetterName = exports.minutesSetterName = exports.hoursSetterName = exports.dateSetterName = exports.monthSetterName = exports.fullYearSetterName = exports.millisecondsGetterName = exports.secondsGetterName = exports.minutesGetterName = exports.hoursGetterName = exports.dateGetterName = exports.monthGetterName = exports.fullYearGetterName = void 0;

const pad_1 = __importDefault(require("../common/pad")), toDate_1 = require("../common/toDate");

function fullYearGetterName(isUTC) {
    return isUTC ? "getUTCFullYear" : "getFullYear";
}

function monthGetterName(isUTC) {
    return isUTC ? "getUTCMonth" : "getMonth";
}

function dateGetterName(isUTC) {
    return isUTC ? "getUTCDate" : "getDate";
}

function hoursGetterName(isUTC) {
    return isUTC ? "getUTCHours" : "getHours";
}

function minutesGetterName(isUTC) {
    return isUTC ? "getUTCMinutes" : "getMinutes";
}

function secondsGetterName(isUTC) {
    return isUTC ? "getUTCSeconds" : "getSeconds";
}

function millisecondsGetterName(isUTC) {
    return isUTC ? "getUTCMilliseconds" : "getMilliseconds";
}

function fullYearSetterName(isUTC) {
    return isUTC ? "setUTCFullYear" : "setFullYear";
}

function monthSetterName(isUTC) {
    return isUTC ? "setUTCMonth" : "setMonth";
}

function dateSetterName(isUTC) {
    return isUTC ? "setUTCDate" : "setDate";
}

function hoursSetterName(isUTC) {
    return isUTC ? "setUTCHours" : "setHours";
}

function minutesSetterName(isUTC) {
    return isUTC ? "setUTCMinutes" : "setMinutes";
}

function secondsSetterName(isUTC) {
    return isUTC ? "setUTCSeconds" : "setSeconds";
}

function millisecondsSetterName(isUTC) {
    return isUTC ? "setUTCMilliseconds" : "setMilliseconds";
}

function getFormatFromValue(value, isUTC) {
    const date = (0, toDate_1.toDate)(value), M = date[monthGetterName(isUTC)]() + 1, d = date[dateGetterName(isUTC)](), h = date[hoursGetterName(isUTC)](), m = date[minutesGetterName(isUTC)](), s = date[secondsGetterName(isUTC)](), isSecond = 0 === date[millisecondsGetterName(isUTC)](), isMinute = isSecond && 0 === s, isHour = isMinute && 0 === m, isDay = isHour && 0 === h, isMonth = isDay && 1 === d;
    return isMonth && 1 === M ? "YYYY" : isMonth ? "YYYY-MM" : isDay ? "YYYY-MM-DD" : isHour ? "HH" : isMinute ? "HH:mm" : isSecond ? "HH:mm:ss" : "HH:mm:ss SSS";
}

function getTimeFormatter(template, isUTC) {
    return time => {
        const date = (0, toDate_1.toDate)(time), y = date[fullYearGetterName(isUTC)](), M = date[monthGetterName(isUTC)]() + 1, q = Math.floor((M - 1) / 3) + 1, d = date[dateGetterName(isUTC)](), e = date["get" + (isUTC ? "UTC" : "") + "Day"](), H = date[hoursGetterName(isUTC)](), h = (H - 1) % 12 + 1, m = date[minutesGetterName(isUTC)](), s = date[secondsGetterName(isUTC)](), S = date[millisecondsGetterName(isUTC)]();
        return (template || "").replace(/YYYY/g, (0, pad_1.default)(y + "", 4, "0", "left")).replace(/yyyy/g, y + "").replace(/yy/g, y % 100 + "").replace(/Q/g, q + "").replace(/MM/g, (0, 
        pad_1.default)(M, 2, "0", "left")).replace(/M/g, M + "").replace(/dd/g, (0, pad_1.default)(d, 2, "0", "left")).replace(/d/g, d + "").replace(/e/g, e + "").replace(/HH/g, (0, 
        pad_1.default)(H, 2, "0", "left")).replace(/H/g, H + "").replace(/hh/g, (0, pad_1.default)(h + "", 2, "0", "left")).replace(/h/g, h + "").replace(/mm/g, (0, 
        pad_1.default)(m, 2, "0", "left")).replace(/m/g, m + "").replace(/ss/g, (0, pad_1.default)(s, 2, "0", "left")).replace(/s/g, s + "").replace(/SSS/g, (0, 
        pad_1.default)(S, 3, "0", "left")).replace(/S/g, S + "");
    };
}

exports.fullYearGetterName = fullYearGetterName, exports.monthGetterName = monthGetterName, 
exports.dateGetterName = dateGetterName, exports.hoursGetterName = hoursGetterName, 
exports.minutesGetterName = minutesGetterName, exports.secondsGetterName = secondsGetterName, 
exports.millisecondsGetterName = millisecondsGetterName, exports.fullYearSetterName = fullYearSetterName, 
exports.monthSetterName = monthSetterName, exports.dateSetterName = dateSetterName, 
exports.hoursSetterName = hoursSetterName, exports.minutesSetterName = minutesSetterName, 
exports.secondsSetterName = secondsSetterName, exports.millisecondsSetterName = millisecondsSetterName, 
exports.getFormatFromValue = getFormatFromValue, exports.getTimeFormatter = getTimeFormatter;
//# sourceMappingURL=formatUtils.js.map
