import { isFunction } from "@visactor/vutils";

export function isSupported() {
    const canvas = document.createElement("canvas");
    if (!canvas || !canvas.getContext) return !1;
    const ctx = canvas.getContext("2d");
    return !!ctx && (!!ctx.getImageData && (!!ctx.fillText && (!!Array.prototype.some && !!Array.prototype.push)));
}

export function getMinFontSizeOfEnv() {
    const ctx = document.createElement("canvas").getContext("2d");
    let hanWidth, mWidth, size = 20;
    for (;size; ) {
        if (ctx.font = size.toString(10) + "px sans-serif", ctx.measureText("Ｗ").width === hanWidth && ctx.measureText("m").width === mWidth) return size + 1;
        hanWidth = ctx.measureText("Ｗ").width, mWidth = ctx.measureText("m").width, size--;
    }
    return 12;
}

export const randomHslColor = (min, max) => "hsl(" + (360 * Math.random()).toFixed() + "," + (30 * Math.random() + 70).toFixed() + "%," + (Math.random() * (max - min) + min).toFixed() + "%)";

export function functor(d) {
    return isFunction(d) ? d : function() {
        return d;
    };
}
//# sourceMappingURL=util.js.map