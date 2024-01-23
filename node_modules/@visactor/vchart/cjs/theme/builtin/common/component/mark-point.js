"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.markPoint = void 0, exports.markPoint = {
    itemLine: {
        decorativeLine: {
            visible: !1
        },
        startSymbol: {
            size: 5,
            visible: !0,
            style: {
                fill: {
                    type: "palette",
                    key: "markLineStrokeColor"
                },
                stroke: null,
                lineWidth: 0
            }
        },
        endSymbol: {
            style: {
                fill: {
                    type: "palette",
                    key: "markLineStrokeColor"
                },
                stroke: null,
                lineWidth: 0
            }
        },
        line: {
            style: {
                stroke: {
                    type: "palette",
                    key: "markLineStrokeColor"
                }
            }
        }
    },
    itemContent: {
        offsetY: -50
    }
};
//# sourceMappingURL=mark-point.js.map
