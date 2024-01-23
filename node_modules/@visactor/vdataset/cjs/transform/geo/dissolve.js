"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.dissolve = void 0;

const geojson_dissolve_1 = __importDefault(require("geojson-dissolve")), dissolve = (data, options) => (0, 
geojson_dissolve_1.default)(data);

exports.dissolve = dissolve;
//# sourceMappingURL=dissolve.js.map