"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.PolygonCrosshair = void 0;

const vutils_1 = require("@visactor/vutils"), base_1 = require("./base"), register_1 = require("./register");

(0, register_1.loadPolygonCrosshairComponent)();

class PolygonCrosshair extends base_1.CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : (0, vutils_1.merge)({}, PolygonCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {center: center, radius: radius, sides: sides = 6, lineStyle: lineStyle} = this.attribute, {startAngle: startAngle, endAngle: endAngle} = this.attribute, isClose = (endAngle - startAngle) % (2 * Math.PI) == 0, eachAngle = (endAngle - startAngle) / sides;
        let path;
        for (let index = 0; index <= sides; index++) {
            const angle = startAngle + eachAngle * index, point = (0, vutils_1.polarToCartesian)(center, radius, angle);
            0 === index ? path = `M${point.x},${point.y}` : path += `L${point.x},${point.y}`, 
            index === sides && isClose && (path += "Z");
        }
        return container.createOrUpdateChild("crosshair-polygon", Object.assign({
            path: path
        }, lineStyle), "path");
    }
    setLocation(point) {
        const {center: center} = this.attribute, radius = vutils_1.PointService.distancePP(point, center);
        this.setAttribute("radius", radius);
    }
}

exports.PolygonCrosshair = PolygonCrosshair, PolygonCrosshair.defaultAttributes = {
    lineStyle: {
        stroke: "#b2bacf",
        lineWidth: 1,
        lineDash: [ 2 ]
    }
};
//# sourceMappingURL=polygon.js.map