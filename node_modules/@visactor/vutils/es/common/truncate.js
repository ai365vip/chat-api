import isNil from "./isNil";

const truncate = (str, length, align = "right", ellipsis) => {
    const e = isNil(ellipsis) ? "…" : ellipsis, s = str + "", n = s.length, l = Math.max(0, length - e.length);
    return n <= length ? s : "left" === align ? e + s.slice(n - l) : "center" === align ? s.slice(0, Math.ceil(l / 2)) + e + s.slice(n - Math.floor(l / 2)) : s.slice(0, l) + e;
};

export default truncate;
//# sourceMappingURL=truncate.js.map
