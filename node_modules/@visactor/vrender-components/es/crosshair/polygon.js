import { merge, polarToCartesian, PointService } from "@visactor/vutils";

import { CrosshairBase } from "./base";

import { loadPolygonCrosshairComponent } from "./register";

loadPolygonCrosshairComponent();

export class PolygonCrosshair extends CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : merge({}, PolygonCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {center: center, radius: radius, sides: sides = 6, lineStyle: lineStyle} = this.attribute, {startAngle: startAngle, endAngle: endAngle} = this.attribute, isClose = (endAngle - startAngle) % (2 * Math.PI) == 0, eachAngle = (endAngle - startAngle) / sides;
        let path;
        for (let index = 0; index <= sides; index++) {
            const point = polarToCartesian(center, radius, startAngle + eachAngle * index);
            0 === index ? path = `M${point.x},${point.y}` : path += `L${point.x},${point.y}`, 
            index === sides && isClose && (path += "Z");
        }
        return container.createOrUpdateChild("crosshair-polygon", Object.assign({
            path: path
        }, lineStyle), "path");
    }
    setLocation(point) {
        const {center: center} = this.attribute, radius = PointService.distancePP(point, center);
        this.setAttribute("radius", radius);
    }
}

PolygonCrosshair.defaultAttributes = {
    lineStyle: {
        stroke: "#b2bacf",
        lineWidth: 1,
        lineDash: [ 2 ]
    }
};
//# sourceMappingURL=polygon.js.map