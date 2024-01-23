import { ColorUtil } from "@visactor/vutils";

export function colorLinearGenerator(startColor, endColor, data, field) {
    if (!startColor) return void console.warn("Warn: 颜色 range 未传入 startColor");
    if (!endColor) {
        const colorObj = ColorObjGenerator(startColor);
        return void data.forEach(((item, index) => {
            item.colorObj = colorObj;
        }));
    }
    const {color: startColorObj, opacity: startOpacity} = ColorObjGenerator(startColor), {r: startR, g: startG, b: startB} = startColorObj.color, {color: endColorObj, opacity: endOpacity} = ColorObjGenerator(endColor), {r: endR, g: endG, b: endB} = endColorObj.color, dR = endR - startR, dG = endG - startG, dB = endB - startB, dA = endOpacity - startOpacity, total = data.length;
    if (0 === total) return;
    if (1 === total) return void (data[0].colorObj = {
        color: new ColorUtil.Color(new ColorUtil.RGB(startR, startG, startB).toString()),
        transparent: !0,
        opacity: startOpacity
    });
    if (2 === total) return data[0].colorObj = {
        color: new ColorUtil.Color(new ColorUtil.RGB(startR, startG, startB).toString()),
        transparent: !0,
        opacity: startOpacity
    }, void (data[1].colorObj = {
        color: new ColorUtil.Color(new ColorUtil.RGB(endR, endG, endB).toString()),
        transparent: !0,
        opacity: endOpacity
    });
    const dValue = data[total - 1][field] - data[0][field];
    data.forEach(((item, index) => {
        const step = 0 === dValue ? 0 : (item[field] - data[0][field]) / dValue, colorObj = ColorObjGenerator(`rgba(${Math.floor(255 * (startR + dR * step))},${Math.floor(255 * (startG + dG * step))},${Math.floor(255 * (startB + dB * step))}, ${startOpacity + dA * step})`);
        item.colorObj = colorObj;
    }));
}

export function colorOrdinalGenerator(colorRange, data) {
    if (0 === colorRange.length) return void console.warn("Warn: 颜色 range 未传入 ");
    const step = data.length / colorRange.length, __processColorObjRange = colorRange.map((color => ColorObjGenerator(color)));
    data.forEach(((item, index) => {
        const colorObj = __processColorObjRange[Math.ceil(index / step) - 1];
        item.colorObj = colorObj;
    }));
}

export function ColorObjGenerator(color) {
    let rgbaColor;
    return /^(rgba|RGBA)/.test(color) && (rgbaColor = rgbaStr2RgbaObj(color)), {
        color: new ColorUtil.Color(color),
        transparent: !!rgbaColor,
        opacity: rgbaColor ? rgbaColor.a : 1
    };
}

export function rgbaStr2RgbaObj(color) {
    const colorArr = color.replace(/(?:\(|\)|rgba|RGBA)*/g, "").split(",");
    return {
        r: Number(colorArr[0]),
        g: Number(colorArr[1]),
        b: Number(colorArr[2]),
        a: Number(colorArr[3])
    };
}
//# sourceMappingURL=index.js.map