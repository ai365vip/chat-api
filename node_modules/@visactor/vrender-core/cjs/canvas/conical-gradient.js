"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.createConicalGradient = exports.getConicGradientAt = exports.ColorInterpolate = void 0;

const vutils_1 = require("@visactor/vutils"), application_1 = require("../application"), color_string_1 = require("../color-string");

class ConicalCanvas {
    static GetCanvas() {
        try {
            return ConicalCanvas.canvas || (ConicalCanvas.canvas = application_1.application.global.createCanvas({})), 
            ConicalCanvas.canvas;
        } catch (err) {
            return null;
        }
    }
    static GetCtx() {
        if (!ConicalCanvas.ctx) {
            const conicalCanvas = ConicalCanvas.GetCanvas();
            ConicalCanvas.ctx = conicalCanvas.getContext("2d");
        }
        return ConicalCanvas.ctx;
    }
}

class ColorInterpolate extends vutils_1.LRU {
    static getInstance() {
        return ColorInterpolate._instance || (ColorInterpolate._instance = new ColorInterpolate), 
        ColorInterpolate._instance;
    }
    constructor(stops = [], precision = 100) {
        super(), this.cacheParams = {
            CLEAN_THRESHOLD: 100,
            L_TIME: 1e3
        }, this.dataMap = new Map;
        const canvas = ConicalCanvas.GetCanvas(), conicalCtx = ConicalCanvas.GetCtx();
        if (canvas.width = precision, canvas.height = 1, !conicalCtx) return;
        if (conicalCtx.translate(0, 0), !conicalCtx) throw new Error("获取ctx发生错误");
        const gradient = conicalCtx.createLinearGradient(0, 0, precision, 0);
        stops.forEach((stop => {
            gradient.addColorStop(stop[0], stop[1]);
        })), conicalCtx.fillStyle = gradient, conicalCtx.fillRect(0, 0, precision, 1), this.rgbaSet = conicalCtx.getImageData(0, 0, precision, 1).data;
    }
    getColor(offset) {
        const rgba = this.rgbaSet.slice(4 * offset, 4 * offset + 4);
        return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
    }
    GetOrCreate(x, y, w, h, stops = [], precision = 100) {
        let str = `${x}${y}${w}${h}`;
        stops.forEach((item => str += item.join())), str += precision;
        let colorInter = this.dataMap.get(str);
        if (!colorInter) {
            colorInter = {
                data: new ColorInterpolate(stops, precision),
                timestamp: []
            }, this.addLimitedTimestamp(colorInter, Date.now(), {}), this.dataMap.set(str, colorInter);
        }
        return this.clearCache(this.dataMap, this.cacheParams), colorInter.data;
    }
}

exports.ColorInterpolate = ColorInterpolate;

class ConicalPatternStore {
    static GetSize(minSize) {
        for (let i = 0; i < ConicalPatternStore.ImageSize.length; i++) if (ConicalPatternStore.ImageSize[i] >= minSize) return ConicalPatternStore.ImageSize[i];
        return minSize;
    }
    static Get(stops, x, y, startAngle, endAngle, w, h) {
        const key = ConicalPatternStore.GenKey(stops, x, y, startAngle, endAngle), data = ConicalPatternStore.cache[key];
        if (!data || 0 === data.length) return null;
        for (let i = 0; i < data.length; i++) if (data[i].width >= w && data[i].height >= h) return data[i].pattern;
        return null;
    }
    static Set(stops, x, y, startAngle, endAngle, pattern, w, h) {
        const key = ConicalPatternStore.GenKey(stops, x, y, startAngle, endAngle);
        ConicalPatternStore.cache[key] ? ConicalPatternStore.cache[key].push({
            width: w,
            height: h,
            pattern: pattern
        }) : ConicalPatternStore.cache[key] = [ {
            width: w,
            height: h,
            pattern: pattern
        } ];
    }
    static GenKey(stops, x, y, startAngle, endAngle) {
        return `${x},${y},${startAngle},${endAngle},${stops.join()}`;
    }
}

function getConicGradientAt(x, y, angle, color) {
    const {stops: stops, startAngle: startAngle, endAngle: endAngle} = color;
    for (;angle < 0; ) angle += vutils_1.pi2;
    for (;angle > vutils_1.pi2; ) angle -= vutils_1.pi2;
    if (angle < startAngle) return stops[0].color;
    if (angle > endAngle) return stops[0].color;
    let startStop, endStop, percent = (angle - startAngle) / (endAngle - startAngle);
    for (let i = 0; i < stops.length; i++) if (stops[i].offset >= percent) {
        startStop = stops[i - 1], endStop = stops[i];
        break;
    }
    return percent = (percent - startStop.offset) / (endStop.offset - startStop.offset), 
    (0, color_string_1.interpolateColor)(startStop.color, endStop.color, percent, !1);
}

function createConicalGradient(context, stops, x, y, deltaAngle, startAngle, endAngle, minW, minH) {
    const deltaDeg = Math.floor(180 * deltaAngle / Math.PI), conicalCanvas = ConicalCanvas.GetCanvas(), conicalCtx = ConicalCanvas.GetCtx();
    if (!conicalCtx) return null;
    const width = ConicalPatternStore.GetSize(minW), height = ConicalPatternStore.GetSize(minH);
    let pattern = ConicalPatternStore.Get(stops, x, y, startAngle, endAngle, width, height);
    if (pattern) return pattern;
    const r = Math.sqrt(Math.max(Math.max(Math.pow(x, 2) + Math.pow(y, 2), Math.pow(width - x, 2) + Math.pow(y, 2)), Math.max(Math.pow(width - x, 2) + Math.pow(height - y, 2), Math.pow(x, 2) + Math.pow(height - y, 2)))), stepNum = deltaDeg + 1, step = deltaAngle / Math.max(1, stepNum - 1), colorInter = ColorInterpolate.getInstance().GetOrCreate(x, y, width, height, stops, stepNum), lineWidth = 2 * Math.PI * r / 360;
    conicalCanvas.width = width, conicalCanvas.height = height, conicalCtx.setTransform(1, 0, 0, 1, 0, 0), 
    conicalCtx.clearRect(0, 0, width, height), conicalCtx.translate(x, y), conicalCtx.rotate(startAngle);
    for (let i = 0, len = stepNum - 1; i < len && !(startAngle + i * step > endAngle); i++) {
        const color = colorInter.getColor(i);
        conicalCtx.beginPath(), conicalCtx.rotate(step), conicalCtx.moveTo(0, 0), conicalCtx.lineTo(r, -2 * lineWidth), 
        conicalCtx.lineTo(r, 0), conicalCtx.fillStyle = color, conicalCtx.closePath(), conicalCtx.fill();
    }
    const imageData = conicalCtx.getImageData(0, 0, width, height);
    return conicalCanvas.width = imageData.width, conicalCanvas.height = imageData.height, 
    conicalCtx.putImageData(imageData, 0, 0), pattern = context.createPattern(conicalCanvas, "no-repeat"), 
    pattern && ConicalPatternStore.Set(stops, x, y, startAngle, endAngle, pattern, width, height), 
    pattern;
}

ConicalPatternStore.cache = {}, ConicalPatternStore.ImageSize = [ 20, 40, 80, 160, 320, 640, 1280, 2560 ], 
exports.getConicGradientAt = getConicGradientAt, exports.createConicalGradient = createConicalGradient;
//# sourceMappingURL=conical-gradient.js.map