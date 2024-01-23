"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.simplify = void 0;

const simplify_geojson_1 = __importDefault(require("simplify-geojson")), js_1 = require("../../utils/js"), DEFAULT_SIMPLIFY_OPTIONS = {
    tolerance: .01
}, simplify = (data, options) => {
    const mergeOptions = (0, js_1.mergeDeepImmer)(DEFAULT_SIMPLIFY_OPTIONS, options), {tolerance: tolerance} = mergeOptions;
    return (0, simplify_geojson_1.default)(data, tolerance);
};

exports.simplify = simplify;
//# sourceMappingURL=simplify.js.map