"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.generateSquarify = exports.squarifyRatio = void 0;

const dice_1 = __importDefault(require("./dice")), slice_1 = __importDefault(require("./slice"));

function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
    const rows = [], nodes = parent.children;
    let row, nodeValue, i0 = 0, i1 = 0;
    const n = nodes.length;
    let dx, dy, sumValue, minValue, maxValue, newRatio, minRatio, alpha, beta, value = parent.value;
    for (;i0 < n; ) {
        dx = x1 - x0, dy = y1 - y0;
        do {
            sumValue = nodes[i1++].value;
        } while (!sumValue && i1 < n);
        for (minValue = sumValue, maxValue = sumValue, alpha = Math.max(dy / dx, dx / dy) / (value * ratio), 
        beta = sumValue * sumValue * alpha, minRatio = Math.max(maxValue / beta, beta / minValue); i1 < n; ++i1) {
            if (nodeValue = nodes[i1].value, sumValue += nodeValue, nodeValue < minValue && (minValue = nodeValue), 
            nodeValue > maxValue && (maxValue = nodeValue), beta = sumValue * sumValue * alpha, 
            newRatio = Math.max(maxValue / beta, beta / minValue), newRatio > minRatio) {
                sumValue -= nodeValue;
                break;
            }
            minRatio = newRatio;
        }
        row = Object.assign({}, parent, {
            value: sumValue,
            children: nodes.slice(i0, i1)
        }), rows.push(row), dx < dy ? (0, dice_1.default)(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1) : (0, 
        slice_1.default)(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1), value -= sumValue, 
        i0 = i1;
    }
    return rows;
}

exports.squarifyRatio = squarifyRatio;

const generateSquarify = ratio => (parent, x0, y0, x1, y1) => {
    squarifyRatio(ratio, parent, x0, y0, x1, y1);
};

exports.generateSquarify = generateSquarify;
//# sourceMappingURL=squarify.js.map