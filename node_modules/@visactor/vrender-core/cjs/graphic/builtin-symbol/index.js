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
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.builtInSymbolStrMap = exports.builtinSymbolsMap = exports.builtinSymbols = void 0;

const circle_1 = __importDefault(require("./circle")), cross_1 = __importDefault(require("./cross")), diamond_1 = __importDefault(require("./diamond")), square_1 = __importDefault(require("./square")), triangle_1 = __importDefault(require("./triangle")), star_1 = __importDefault(require("./star")), arrow_1 = __importDefault(require("./arrow")), wedge_1 = __importDefault(require("./wedge")), stroke_1 = __importDefault(require("./stroke")), wye_1 = __importDefault(require("./wye")), triangle_left_1 = __importDefault(require("./triangle-left")), triangle_right_1 = __importDefault(require("./triangle-right")), triangle_up_1 = __importDefault(require("./triangle-up")), triangle_down_1 = __importDefault(require("./triangle-down")), thin_triangle_1 = __importDefault(require("./thin-triangle")), arrow2_left_1 = __importDefault(require("./arrow2-left")), arrow2_right_1 = __importDefault(require("./arrow2-right")), arrow2_up_1 = __importDefault(require("./arrow2-up")), arrow2_down_1 = __importDefault(require("./arrow2-down")), line_v_1 = __importDefault(require("./line-v")), line_h_1 = __importDefault(require("./line-h")), close_1 = __importDefault(require("./close")), rect_1 = __importDefault(require("./rect"));

exports.builtinSymbols = [ circle_1.default, cross_1.default, diamond_1.default, square_1.default, thin_triangle_1.default, triangle_1.default, star_1.default, arrow_1.default, wedge_1.default, stroke_1.default, wye_1.default, triangle_left_1.default, triangle_right_1.default, triangle_up_1.default, triangle_down_1.default, arrow2_left_1.default, arrow2_right_1.default, arrow2_up_1.default, arrow2_down_1.default, rect_1.default, line_v_1.default, line_h_1.default, close_1.default ], 
exports.builtinSymbolsMap = {}, exports.builtinSymbols.forEach((symbol => {
    exports.builtinSymbolsMap[symbol.type] = symbol;
})), exports.builtInSymbolStrMap = {
    arrowLeft: "M 0.25 -0.5 L -0.25 0 l 0.5 0.5",
    arrowRight: "M -0.25 -0.5 l 0.5 0.5 l -0.5 0.5",
    rectRound: "M 0.3 -0.5 C 0.41 -0.5 0.5 -0.41 0.5 -0.3 C 0.5 -0.3 0.5 0.3 0.5 0.3 C 0.5 0.41 0.41 0.5 0.3 0.5 C 0.3 0.5 -0.3 0.5 -0.3 0.5 C -0.41 0.5 -0.5 0.41 -0.5 0.3 C -0.5 0.3 -0.5 -0.3 -0.5 -0.3 C -0.5 -0.41 -0.41 -0.5 -0.3 -0.5 C -0.3 -0.5 0.3 -0.5 0.3 -0.5 Z",
    roundLine: "M 1.2392 -0.258 L -1.3432 -0.258 C -1.4784 -0.258 -1.588 -0.1436 -1.588 -0.002 c 0 0.1416 0.1096 0.256 0.2448 0.256 l 2.5824 0 c 0.1352 0 0.2448 -0.1144 0.2448 -0.256 C 1.484 -0.1436 1.3744 -0.258 1.2392 -0.258 z"
}, __exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map
