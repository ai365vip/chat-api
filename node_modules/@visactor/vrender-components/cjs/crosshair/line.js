"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LineCrosshair = void 0;

const vutils_1 = require("@visactor/vutils"), base_1 = require("./base"), register_1 = require("./register");

(0, register_1.loadLineCrosshairComponent)();

class LineCrosshair extends base_1.CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : (0, vutils_1.merge)({}, LineCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {start: start, end: end, lineStyle: lineStyle} = this.attribute;
        return container.createOrUpdateChild("crosshair-line", Object.assign({
            points: [ start, end ]
        }, lineStyle), "line");
    }
    setLocation(region) {
        const {start: start, end: end} = region;
        this.setAttributes({
            start: start,
            end: end
        });
    }
}

exports.LineCrosshair = LineCrosshair, LineCrosshair.defaultAttributes = {
    lineStyle: {
        stroke: "#b2bacf",
        lineWidth: 1,
        lineDash: [ 2 ]
    }
};
//# sourceMappingURL=line.js.map