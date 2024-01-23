"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.PolarCoordinate = exports.CartesianCoordinate = exports.Coordinate = void 0;

var base_1 = require("./base");

Object.defineProperty(exports, "Coordinate", {
    enumerable: !0,
    get: function() {
        return base_1.Coordinate;
    }
});

var cartesian_1 = require("./cartesian");

Object.defineProperty(exports, "CartesianCoordinate", {
    enumerable: !0,
    get: function() {
        return cartesian_1.CartesianCoordinate;
    }
});

var polar_1 = require("./polar");

Object.defineProperty(exports, "PolarCoordinate", {
    enumerable: !0,
    get: function() {
        return polar_1.PolarCoordinate;
    }
}), __exportStar(require("./interface"), exports);
//# sourceMappingURL=index.js.map