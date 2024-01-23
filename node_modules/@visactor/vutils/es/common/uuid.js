const uuid = (len, radix) => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), uuid = [];
    let i;
    if (radix = radix || chars.length, len) for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]; else {
        let r;
        for (uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-", uuid[14] = "4", i = 0; i < 36; i++) uuid[i] || (r = 0 | 16 * Math.random(), 
        uuid[i] = chars[19 === i ? 3 & r | 8 : r]);
    }
    return uuid.join("");
};

export default uuid;
//# sourceMappingURL=uuid.js.map
