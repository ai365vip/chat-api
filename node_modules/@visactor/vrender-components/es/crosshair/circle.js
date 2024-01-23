import { merge, PointService } from "@visactor/vutils";

import { CrosshairBase } from "./base";

import { loadCircleCrosshairComponent } from "./register";

loadCircleCrosshairComponent();

export class CircleCrosshair extends CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : merge({}, CircleCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {center: center, radius: radius, lineStyle: lineStyle} = this.attribute;
        return container.createOrUpdateChild("crosshair-circle", Object.assign(Object.assign(Object.assign(Object.assign({}, center), {
            outerRadius: radius
        }), this.attribute), lineStyle), "arc");
    }
    setLocation(point) {
        const {center: center} = this.attribute, radius = PointService.distancePP(point, center);
        this.setAttribute("radius", radius);
    }
}

CircleCrosshair.defaultAttributes = {
    lineStyle: {
        stroke: [ "#b2bacf", !1, !1, !1 ],
        lineWidth: 1,
        lineDash: [ 2 ]
    }
};
//# sourceMappingURL=circle.js.map