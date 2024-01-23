"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.SectorCrosshair = void 0;

const vutils_1 = require("@visactor/vutils"), constant_1 = require("../constant"), base_1 = require("./base"), register_1 = require("./register");

(0, register_1.loadSectorCrosshairComponent)();

class SectorCrosshair extends base_1.CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : (0, vutils_1.merge)({}, SectorCrosshair.defaultAttributes, attributes));
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
        const {center: center, startAngle: startAngle = constant_1.POLAR_START_ANGLE, endAngle: endAngle = constant_1.POLAR_END_ANGLE} = this.attribute, sectorAngle = endAngle - startAngle, pointAngle = (0, 
        vutils_1.radianToDegree)((0, vutils_1.getAngleByPoint)(center, point));
        this.setAttributes({
            startAngle: pointAngle - sectorAngle / 2,
            endAngle: pointAngle + sectorAngle / 2
        });
    }
}

exports.SectorCrosshair = SectorCrosshair, SectorCrosshair.defaultAttributes = {
    sectorStyle: {
        fill: "#b2bacf",
        opacity: .2
    }
};
//# sourceMappingURL=sector.js.map