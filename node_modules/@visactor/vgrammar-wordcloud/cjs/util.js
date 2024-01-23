"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.functor = exports.randomHslColor = exports.getMinFontSizeOfEnv = exports.isSupported = void 0;

const vutils_1 = require("@visactor/vutils");

function isSupported() {
    const canvas = document.createElement("canvas");
    if (!canvas || !canvas.getContext) return !1;
    const ctx = canvas.getContext("2d");
    return !!ctx && (!!ctx.getImageData && (!!ctx.fillText && (!!Array.prototype.some && !!Array.prototype.push)));
}

function getMinFontSizeOfEnv() {
    const ctx = document.createElement("canvas").getContext("2d");
    let hanWidth, mWidth, size = 20;
    for (;size; ) {
        if (ctx.font = size.toString(10) + "px sans-serif", ctx.measureText("Ｗ").width === hanWidth && ctx.measureText("m").width === mWidth) return size + 1;
        hanWidth = ctx.measureText("Ｗ").width, mWidth = ctx.measureText("m").width, size--;
    }
    return 12;
}

exports.isSupported = isSupported, exports.getMinFontSizeOfEnv = getMinFontSizeOfEnv;

const randomHslColor = (min, max) => "hsl(" + (360 * Math.random()).toFixed() + "," + (30 * Math.random() + 70).toFixed() + "%," + (Math.random() * (max - min) + min).toFixed() + "%)";

function functor(d) {
    return (0, vutils_1.isFunction)(d) ? d : function() {
        return d;
    };
}

exports.randomHslColor = randomHslColor, exports.functor = functor;
//# sourceMappingURL=util.js.map