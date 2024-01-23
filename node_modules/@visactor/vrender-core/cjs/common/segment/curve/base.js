"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Curve = void 0;

class Curve {
    getLength(direction) {
        return null != direction ? this.calcProjLength(direction) : (Number.isFinite(this.length) || (this.length = this.calcLength()), 
        this.length);
    }
}

exports.Curve = Curve;
//# sourceMappingURL=base.js.map
