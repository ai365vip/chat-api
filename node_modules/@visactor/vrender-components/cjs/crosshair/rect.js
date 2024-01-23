"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.RectCrosshair = void 0;

const vutils_1 = require("@visactor/vutils"), base_1 = require("./base"), register_1 = require("./register");

(0, register_1.loadRectCrosshairComponent)();

class RectCrosshair extends base_1.CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : (0, vutils_1.merge)({}, RectCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {start: start, end: end, rectStyle: rectStyle} = this.attribute;
        return container.createOrUpdateChild("crosshair-rect", Object.assign({
            x: start.x,
            y: start.y,
            width: end.x - start.x,
            height: end.y - start.y
        }, rectStyle), "rect");
    }
    setLocation(region) {
        const {start: start, end: end} = region;
        this.setAttributes({
            start: start,
            end: end
        });
    }
}

exports.RectCrosshair = RectCrosshair, RectCrosshair.defaultAttributes = {
    rectStyle: {
        fill: "#b2bacf",
        opacity: .2
    }
};
//# sourceMappingURL=rect.js.map