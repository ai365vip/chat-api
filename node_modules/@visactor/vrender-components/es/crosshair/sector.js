import { merge, getAngleByPoint, radianToDegree } from "@visactor/vutils";

import { POLAR_END_ANGLE, POLAR_START_ANGLE } from "../constant";

import { CrosshairBase } from "./base";

import { loadSectorCrosshairComponent } from "./register";

loadSectorCrosshairComponent();

export class SectorCrosshair extends CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : merge({}, SectorCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {center: center, radius: radius, innerRadius: innerRadius = 0, sectorStyle: sectorStyle} = this.attribute, {startAngle: startAngle, endAngle: endAngle} = this.attribute;
        return container.createOrUpdateChild("crosshair-sector", Object.assign(Object.assign(Object.assign({}, center), {
            outerRadius: radius,
            innerRadius: innerRadius,
            startAngle: startAngle,
            endAngle: endAngle
        }), sectorStyle), "arc");
    }
    setLocation(point) {
        const {center: center, startAngle: startAngle = POLAR_START_ANGLE, endAngle: endAngle = POLAR_END_ANGLE} = this.attribute, sectorAngle = endAngle - startAngle, pointAngle = radianToDegree(getAngleByPoint(center, point));
        this.setAttributes({
            startAngle: pointAngle - sectorAngle / 2,
            endAngle: pointAngle + sectorAngle / 2
        });
    }
}

SectorCrosshair.defaultAttributes = {
    sectorStyle: {
        fill: "#b2bacf",
        opacity: .2
    }
};
//# sourceMappingURL=sector.js.map