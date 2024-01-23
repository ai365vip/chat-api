"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Projection = void 0;

const vgrammar_projection_1 = require("@visactor/vgrammar-projection");

class Projection {
    constructor(projectionSpec) {
        this.projection = (0, vgrammar_projection_1.projection)(projectionSpec.type)();
    }
    fit(start, size, features) {
        const fitData = {
            type: "FeatureCollection",
            features: features
        };
        this.projection.fitExtent([ start, size ], fitData);
    }
    center(center) {
        var _a, _b;
        null === (_b = null === (_a = this.projection) || void 0 === _a ? void 0 : _a.center) || void 0 === _b || _b.call(_a, center);
    }
    project(point) {
        var _a;
        return null === (_a = this.projection) || void 0 === _a ? void 0 : _a.call(this, point);
    }
    shape(data) {
        var _a, _b;
        return null === (_b = null === (_a = this.projection) || void 0 === _a ? void 0 : _a.path) || void 0 === _b ? void 0 : _b.call(_a, data);
    }
    invert(point) {
        var _a, _b;
        return null === (_b = null === (_a = this.projection) || void 0 === _a ? void 0 : _a.invert) || void 0 === _b ? void 0 : _b.call(_a, point);
    }
    scale(scale) {
        var _a;
        if (null === (_a = this.projection) || void 0 === _a ? void 0 : _a.scale) {
            if (void 0 === scale) return this.projection.scale();
            this.projection.scale(scale);
        }
    }
    translate(point) {
        var _a;
        if (null === (_a = this.projection) || void 0 === _a ? void 0 : _a.scale) {
            if (void 0 === point) return this.projection.translate();
            this.projection.translate(point);
        }
    }
    evaluate(start, size, features) {
        const tmp = this.projection.copy();
        return null == tmp ? void 0 : tmp.fitExtent([ start, size ], {
            type: "FeatureCollection",
            features: features
        });
    }
}

exports.Projection = Projection;
//# sourceMappingURL=projection.js.map
