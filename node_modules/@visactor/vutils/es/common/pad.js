const repeat = (str, repeatCount = 0) => {
    let s = "", i = repeatCount - 1;
    for (;i >= 0; ) s = `${s}${str}`, i -= 1;
    return s;
}, pad = (str, length, padChar = " ", align = "right") => {
    const c = padChar, s = str + "", n = length - s.length;
    return n <= 0 ? s : "left" === align ? repeat(c, n) + s : "center" === align ? repeat(c, Math.floor(n / 2)) + s + repeat(c, Math.ceil(n / 2)) : s + repeat(c, n);
};

export default pad;
//# sourceMappingURL=pad.js.map
