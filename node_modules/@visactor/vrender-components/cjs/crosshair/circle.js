"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.CircleCrosshair = void 0;

const vutils_1 = require("@visactor/vutils"), base_1 = require("./base"), register_1 = require("./register");

(0, register_1.loadCircleCrosshairComponent)();

class CircleCrosshair extends base_1.CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : (0, vutils_1.merge)({}, CircleCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {center: center, radius: radius, lineStyle: lineStyle} = this.attribute;
        return container.createOrUpdateChild("crosshair-circle", Object.assign(Object.assign(Object.assign(Object.assign({}, center), {
            outerRadius: radius
        }), this.attribute), lineStyle), "arc");
    }
    setLocation(point) {
        const {center: center} = this.attribute, radius = vutils_1.PointService.distancePP(point, center);
        this.setAttribute("radius", radius);
    }
}

exports.CircleCrosshair = CircleCrosshair, CircleCrosshair.defaultAttributes = {
    lineStyle: {
        stroke: [ "#b2bacf", !1, !1, !1 ],
        lineWidth: 1,
        lineDash: [ 2 ]
    }
};
//# sourceMappingURL=circle.js.map