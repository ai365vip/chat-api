"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.CrosshairBase = void 0;

const base_1 = require("../core/base");

class CrosshairBase extends base_1.AbstractComponent {
    constructor() {
        super(...arguments), this.name = "crosshair";
    }
    render() {
        this.renderCrosshair(this);
    }
}

exports.CrosshairBase = CrosshairBase;
//# sourceMappingURL=base.js.map