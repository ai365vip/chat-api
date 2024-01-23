export class TimeUtil {
    static getInstance() {
        return TimeUtil.instance || (TimeUtil.instance = new TimeUtil), TimeUtil.instance;
    }
    constructor() {
        this.locale_shortWeekdays = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ], 
        this.locale_periods = [ "AM", "PM" ], this.locale_weekdays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ], 
        this.locale_shortMonths = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ], 
        this.numberRe = /^\s*\d+/, this.pads = {
            "-": "",
            _: " ",
            0: "0"
        }, this.requoteRe = /[\\^$*+?|[\]().{}]/g, this.locale_months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ], 
        this.formatShortWeekday = d => this.locale_shortWeekdays[d.getDay()], this.formatWeekday = d => this.locale_weekdays[d.getDay()], 
        this.formatShortMonth = d => this.locale_shortMonths[d.getMonth()], this.formatMonth = d => this.locale_months[d.getMonth()], 
        this.formatDayOfMonth = (d, p) => this.pad(d.getDate(), p, 2), this.formatHour24 = (d, p) => this.pad(d.getHours(), p, 2), 
        this.formatHour12 = (d, p) => this.pad(d.getHours() % 12 || 12, p, 2), this.formatMilliseconds = (d, p) => this.pad(d.getMilliseconds(), p, 3), 
        this.formatMonthNumber = (d, p) => this.pad(d.getMonth() + 1, p, 2), this.formatMinutes = (d, p) => this.pad(d.getMinutes(), p, 2), 
        this.formatPeriod = d => this.locale_periods[+(d.getHours() >= 12)], this.formatSeconds = (d, p) => this.pad(d.getSeconds(), p, 2), 
        this.formatFullYear = (d, p) => this.pad(d.getFullYear() % 1e4, p, 4), this.formatUTCShortWeekday = d => this.locale_shortWeekdays[d.getUTCDay()], 
        this.formatUTCWeekday = d => this.locale_weekdays[d.getUTCDay()], this.formatUTCShortMonth = d => this.locale_shortMonths[d.getUTCMonth()], 
        this.formatUTCMonth = d => this.locale_months[d.getUTCMonth()], this.formatUTCDayOfMonth = (d, p) => this.pad(d.getUTCDate(), p, 2), 
        this.formatUTCHour24 = (d, p) => this.pad(d.getUTCHours(), p, 2), this.formatUTCHour12 = (d, p) => this.pad(d.getUTCHours() % 12 || 12, p, 2), 
        this.formatUTCMilliseconds = (d, p) => this.pad(d.getUTCMilliseconds(), p, 3), this.formatUTCMonthNumber = (d, p) => this.pad(d.getUTCMonth() + 1, p, 2), 
        this.formatUTCMinutes = (d, p) => this.pad(d.getUTCMinutes(), p, 2), this.formatUTCPeriod = d => this.locale_periods[+(d.getUTCHours() >= 12)], 
        this.formatUTCSeconds = (d, p) => this.pad(d.getUTCSeconds(), p, 2), this.formatUTCFullYear = (d, p) => this.pad(d.getUTCFullYear() % 1e4, p, 4), 
        this.formats = {
            a: this.formatShortWeekday,
            A: this.formatWeekday,
            b: this.formatShortMonth,
            B: this.formatMonth,
            d: this.formatDayOfMonth,
            e: this.formatDayOfMonth,
            H: this.formatHour24,
            I: this.formatHour12,
            L: this.formatMilliseconds,
            m: this.formatMonthNumber,
            M: this.formatMinutes,
            p: this.formatPeriod,
            S: this.formatSeconds,
            Y: this.formatFullYear
        }, this.utcFormats = {
            a: this.formatUTCShortWeekday,
            A: this.formatUTCWeekday,
            b: this.formatUTCShortMonth,
            B: this.formatUTCMonth,
            d: this.formatUTCDayOfMonth,
            e: this.formatUTCDayOfMonth,
            H: this.formatUTCHour24,
            I: this.formatUTCHour12,
            L: this.formatUTCMilliseconds,
            m: this.formatUTCMonthNumber,
            M: this.formatUTCMinutes,
            p: this.formatUTCPeriod,
            S: this.formatUTCSeconds,
            Y: this.formatUTCFullYear
        }, this.parseShortWeekday = (d, string, i) => {
            const n = this.shortWeekdayRe.exec(string.slice(i));
            return n ? (d.w = this.shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }, this.parseWeekday = (d, string, i) => {
            const n = this.weekdayRe.exec(string.slice(i));
            return n ? (d.w = this.weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }, this.parseShortMonth = (d, string, i) => {
            const n = this.shortMonthRe.exec(string.slice(i));
            return n ? (d.m = this.shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }, this.parseMonth = (d, string, i) => {
            const n = this.monthRe.exec(string.slice(i));
            return n ? (d.m = this.monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }, this.parseDayOfMonth = (d, string, i) => {
            const n = this.numberRe.exec(string.slice(i, i + 2));
            return n ? (d.d = +n[0], i + n[0].length) : -1;
        }, this.parseHour24 = (d, string, i) => {
            const n = this.numberRe.exec(string.slice(i, i + 2));
            return n ? (d.H = +n[0], i + n[0].length) : -1;
        }, this.parseMilliseconds = (d, string, i) => {
            const n = this.numberRe.exec(string.slice(i, i + 3));
            return n ? (d.L = +n[0], i + n[0].length) : -1;
        }, this.parseMonthNumber = (d, string, i) => {
            const n = this.numberRe.exec(string.slice(i, i + 2));
            return n ? (d.m = n - 1, i + n[0].length) : -1;
        }, this.parseMinutes = (d, string, i) => {
            const n = this.numberRe.exec(string.slice(i, i + 2));
            return n ? (d.M = +n[0], i + n[0].length) : -1;
        }, this.parsePeriod = (d, string, i) => {
            const n = this.periodRe.exec(string.slice(i));
            return n ? (d.p = this.periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }, this.parseSeconds = (d, string, i) => {
            const n = this.numberRe.exec(string.slice(i, i + 2));
            return n ? (d.S = +n[0], i + n[0].length) : -1;
        }, this.parseFullYear = (d, string, i) => {
            const n = this.numberRe.exec(string.slice(i, i + 4));
            return n ? (d.y = +n[0], i + n[0].length) : -1;
        }, this.parses = {
            a: this.parseShortWeekday,
            A: this.parseWeekday,
            b: this.parseShortMonth,
            B: this.parseMonth,
            d: this.parseDayOfMonth,
            e: this.parseDayOfMonth,
            H: this.parseHour24,
            I: this.parseHour24,
            L: this.parseMilliseconds,
            m: this.parseMonthNumber,
            M: this.parseMinutes,
            p: this.parsePeriod,
            S: this.parseSeconds,
            Y: this.parseFullYear
        }, this.timeFormat = (specifier, timeText) => this.newFormat(specifier, this.formats)(new Date(this.getFullTimeStamp(timeText))), 
        this.timeUTCFormat = (specifier, timeText) => this.newFormat(specifier, this.utcFormats)(new Date(this.getFullTimeStamp(timeText))), 
        this.timeParse = (specifier, timeText) => this.newParse(specifier, !1)(timeText + ""), 
        this.requoteF = this.requote.bind(this), this.periodRe = this.formatRe(this.locale_periods), 
        this.periodLookup = this.formatLookup(this.locale_periods), this.weekdayRe = this.formatRe(this.locale_weekdays), 
        this.weekdayLookup = this.formatLookup(this.locale_weekdays), this.shortWeekdayRe = this.formatRe(this.locale_shortWeekdays), 
        this.shortWeekdayLookup = this.formatLookup(this.locale_shortWeekdays), this.monthRe = this.formatRe(this.locale_months), 
        this.monthLookup = this.formatLookup(this.locale_months), this.shortMonthRe = this.formatRe(this.locale_shortMonths), 
        this.shortMonthLookup = this.formatLookup(this.locale_shortMonths);
    }
    requote(s) {
        return s.replace(this.requoteRe, "\\$&");
    }
    localDate(d) {
        if (0 <= d.y && d.y < 100) {
            const date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
            return date.setFullYear(d.y), date;
        }
        return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
    }
    utcDate(d) {
        if (0 <= d.y && d.y < 100) {
            const date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
            return date.setUTCFullYear(d.y), date;
        }
        return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
    }
    newDate(y, m, d) {
        return {
            y: y,
            m: m,
            d: d,
            H: 0,
            M: 0,
            S: 0,
            L: 0
        };
    }
    formatRe(names) {
        return new RegExp("^(?:" + names.map(this.requoteF).join("|") + ")", "i");
    }
    formatLookup(names) {
        return new Map(names.map(((name, i) => [ name.toLowerCase(), i ])));
    }
    pad(value, fill, width) {
        const sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
        return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }
    parseSpecifier(d, specifier, string, j) {
        let i = 0;
        const n = specifier.length, m = string.length;
        let c, parse;
        for (;i < n; ) {
            if (j >= m) return -1;
            if (c = specifier.charCodeAt(i++), 37 === c) {
                if (c = specifier.charAt(i++), parse = this.parses[c in this.pads ? specifier.charAt(i++) : c], 
                !parse || (j = parse(d, string, j)) < 0) return -1;
            } else if (c !== string.charCodeAt(j++)) return -1;
        }
        return j;
    }
    newParse(specifier, Z) {
        const that = this;
        return function(string) {
            const d = that.newDate(1900, void 0, 1);
            return that.parseSpecifier(d, specifier, string += "", 0) !== string.length ? null : "Q" in d ? new Date(d.Q) : "s" in d ? new Date(1e3 * d.s + ("L" in d ? d.L : 0)) : (Z && !("Z" in d) && (d.Z = 0), 
            "p" in d && (d.H = d.H % 12 + 12 * d.p), void 0 === d.m && (d.m = "q" in d ? d.q : 0), 
            "Z" in d ? (d.H += d.Z / 100 | 0, d.M += d.Z % 100, that.utcDate(d)) : that.localDate(d));
        };
    }
    newFormat(specifier, formats) {
        const that = this;
        return function(date) {
            const string = [];
            let i = -1, j = 0;
            const n = specifier.length;
            let c, pad, format;
            for (date instanceof Date || (date = new Date(+date)); ++i < n; ) 37 === specifier.charCodeAt(i) && (string.push(specifier.slice(j, i)), 
            (pad = that.pads[c = specifier.charAt(++i)]) ? c = specifier.charAt(++i) : pad = "e" === c ? " " : "0", 
            format = formats[c], c = format(date, pad), string.push(c), j = i + 1);
            return string.push(specifier.slice(j, i)), string.join("");
        };
    }
    getFullTimeStamp(timeText) {
        const timeOriStamp = parseInt(timeText + "", 10);
        return 10 === String(timeOriStamp).length ? 1e3 * timeOriStamp : timeOriStamp;
    }
}
//# sourceMappingURL=time.js.map
